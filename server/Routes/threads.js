const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const Category = require('../models/Category');
const {postLimiter} = require('../middleware/rateLimiter');
const Ng = require('../middleware/Ng');
const {auth, fileSizeLimiter} = require('../middleware/auth');
const AppError = require('../utils/Error');
const cloudinary = require('cloudinary').v2; // Cloudinaryをインポート
router.get('/', async (req, res, next) => {
    try {
      const threads = await Thread.find().sort({ lastPostAt: -1 });
      res.json(threads);
    } catch (err) {
      return next(AppError(err.message || 'スレッドの取得に失敗しました', 500));
    }
  });
  
  // 新しいスレッドを作成
router.post('/', postLimiter, async (req, res, next) => {
    console.log("スレッド作成リクエスト:", req.body);
    try {
        let imageUrl = null;
        // 画像がアップロードされている場合はCloudinaryにアップロード
        if (req.file) {
            try {
                const uploadToCloudinary = (fileBuffer) => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream({
                            resource_type: 'image',
                            folder: 'threads',
                        }, (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        });
                        stream.end(fileBuffer);
                    });
                };

                const result = await uploadToCloudinary(req.file.buffer);
                console.log('Cloudinary upload success:', result.secure_url);
                imageUrl = result.secure_url;
            } catch (err) {
                console.error("画像アップロードエラー:", err);
                return next(new AppError('画像のアップロードに失敗しました', 400));
            }
        }

        const thread = new Thread({
            title: req.body.title,
            category: req.body.category || 'general',
            createdAt: new Date(),
            lastPostAt: new Date(),
            imageUrl: imageUrl // 画像URLを保存
        });
        const newThread = await thread.save();

        // カテゴリのスレッド数をインクリメント
        await Category.findOneAndUpdate(
            { name: newThread.category },
            { $inc: { threadCount: 1 } },
        );

        const post = new Post({
          threadId: newThread._id,
          number: 1,
          content: req.body.content,
          name: req.body.name || '名無しさん'
        });
        await post.save();
  
      res.status(201).json(newThread);
    } catch (err) {
      return next(new AppError(err.message || 'スレッドの作成に失敗しました', 400));    
    }
  });
  
  // スレッドの投稿を取得
router.get('/:threadId/posts', async (req, res, next) => {
    try {
      const posts = await Post.find({ threadId: req.params.threadId }).sort('number');
      res.json(posts);
    } catch (err) {
      return next(new AppError(err.message || '投稿の取得に失敗しました', 500));
    }
  });
  // 修正案
router.post('/:threadId/posts',
    postLimiter,
    auth,
    fileSizeLimiter, // Multerを適用
    async (req, res, next) => {
        try {
            let imageUrl = null;
            console.log("投稿リクエスト:", req.body);
            console.log("アップロードされたファイル:", req.file); // req.fileの内容をログに出力

            if (req.file) {
                try {
                    const uploadToCloudinary = (fileBuffer) => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream({
                                resource_type: 'image',
                                folder: 'posts',
                            }, (error, result) => {
                                if (error) {
                                    return reject(error);
                                }
                                resolve(result);
                            });
                            stream.end(fileBuffer);
                        });
                    };

                    const result = await uploadToCloudinary(req.file.buffer);
                    imageUrl = result.secure_url;
                    console.log('Cloudinary upload success:', imageUrl);
                } catch (err) {
                    console.error('Cloudinary upload error:', err);
                    return next(new AppError('画像のアップロードに失敗しました', 400));
                }
            }

            const thread = await Thread.findById(req.params.threadId);
            if (!thread) {
                return next(new AppError('スレッドが見つかりません', 404));
            }

            const postsCount = await Post.countDocuments({ threadId: req.params.threadId });
            const post = new Post({
                threadId: req.params.threadId,
                number: postsCount + 1,
                content: req.body.content,
                name: req.body.name || '名無しさん',
                imageUrl: imageUrl || null,
            });

            const newPost = await post.save();

            await Thread.findByIdAndUpdate(
                req.params.threadId,
                { $inc: { postCount: 1 } },
                { new: true }
            );

            thread.lastPostAt = new Date();
            await thread.save();

            res.status(201).json(newPost);
        } catch (err) {
            console.error(err);
            return next(new AppError(err.message || '投稿の作成中にエラーが発生しました', 500));
        }
    }
);

router.post('/:threadId/posts/:postId/report', postLimiter, Ng, async (req, res, next) => {
    const { threadId, postId } = req.params;

    try {
        const post = await Post.findOne({ threadId, _id: postId });
        if (!post) {
            return next(new AppError('投稿が見つかりません', 404));
        }
        // NGワードが含まれている場合は削除
        await Post.deleteOne({ _id: postId });
        res.status(200).json({ message: '投稿が削除されました' });
    } catch (error) {
        console.error(error);
        return next(new AppError('報告処理中にエラーが発生しました', 500));
    }
});

// スレッド削除時にカテゴリのスレッド数を更新
router.delete('/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return next(new AppError('スレッドが見つかりません', 404));
        }

        await Thread.deleteOne({ _id: req.params.threadId });

        // カテゴリのスレッド数をデクリメント
        await Category.findOneAndUpdate(
            { name: thread.category },
            { $inc: { threadCount: -1 } }
        );

        res.status(200).json({ message: 'スレッドが削除されました' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 投稿削除
router.delete('/:threadId/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: '投稿が見つかりません' });
        }

        await Post.deleteOne({ _id: req.params.postId });
        // 投稿削除時にpostCountをデクリメント
        await Thread.findByIdAndUpdate(
            req.params.threadId,
            { $inc: { postCount: -1 } }
        );

        res.status(200).json({ message: '投稿が削除されました' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// いいね機能
router.post('/:threadId/like', async (req, res, next) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return next(new AppError('スレッドが見つかりません', 404));
        }

        thread.likes += 1; // いいね数を増加
        await thread.save();

        res.status(200).json({ message: 'いいねしました', likes: thread.likes });
    } catch (err) {
        console.error(err);
        return next(new AppError('いいね処理中にエラーが発生しました', 500));
    }
});

module.exports = router;