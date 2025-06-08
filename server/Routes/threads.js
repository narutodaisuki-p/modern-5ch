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
const {validate,customJoi} = require('../middleware/validate');
const Joi = require('joi');

const threadSchema = Joi.object({
  title: customJoi.string().trim().min(3).max(100).required(),
  category: customJoi.string().trim().optional(),
  content: customJoi.string().trim().min(1).required(),
  name: customJoi.string().trim().optional(),
});

const postSchema = Joi.object({
  content: customJoi.string().trim().min(1).required(),
  name: customJoi.string().trim().optional(),
});

const threadIdSchema = Joi.object({
  threadId: Joi.string().trim().required(),
});

const postIdSchema = Joi.object({
  threadId: Joi.string().trim().required(),
  postId: Joi.string().trim().required(),
});


router.get('/', async (req, res, next) => {
    try {
      const threads = await Thread.find().sort({ lastPostAt: -1 });
      res.json(threads);
    } catch (err) {
      return next(new AppError(err.message || 'スレッドの取得に失敗しました', 500));
    }
  });
  
  // 新しいスレッドを作成
router.post('/', postLimiter, validate(threadSchema), async (req, res, next) => {
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
  // 修正案: req.paramsの保持とエラーハンドリングの改善
router.post('/:threadId/posts',
    postLimiter,
    validate(postSchema),
    async (req, res, next) => {
        try {
            // 画像がある場合のみ認証必須
            if (req.file) {
                if (!req.headers.authorization) {
                    return res.status(401).json({ message: '画像投稿にはログインが必要です' });
                }
                let authError = null;
                await auth(req, res, (err) => { if (err) authError = err; });
                if (authError) {
                    return res.status(401).json({ message: '認証エラー: 画像投稿にはログインが必要です' });
                }
            }
            console.log('リクエスト開始時のreq.params:', req.params);
            console.log('リクエスト開始時のreq.body:', req.body);
            console.log('リクエスト開始時のreq.file:', req.file);

            const originalParams = { ...req.params }; // req.paramsを保持
            let imageUrl = null;

            if (req.file) {
                try {
                    console.log("認証前 req.params:", req.params);
                
                    console.log("認証後 req.params:", req.params);
                    req.params = { ...originalParams }; // 認証後にreq.paramsを復元

                    const uploadToCloudinary = (fileBuffer) => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream({
                                resource_type: 'image',
                                folder: 'posts',
                                invalidate: true, // キャッシュを無効化
                            }, (error, result) => {
                                if (error) {
                                    console.error("Cloudinaryエラー詳細:", error);
                                    reject(new AppError('Cloudinaryアップロードエラー', 500));
                                    return;
                                }
                                resolve(result);
                            });
                            stream.end(fileBuffer);
                        });
                    };

                    try {
                        console.log("Cloudinaryアップロード前 req.params:", req.params);
                        const result = await uploadToCloudinary(req.file.buffer);
                        console.log("Cloudinaryアップロード後 req.params:", req.params);
                        req.params = { ...originalParams }; // Cloudinaryアップロード後にreq.paramsを復元
                        imageUrl = result.secure_url;
                        console.log('Cloudinary upload success:', imageUrl);
                    } catch (err) {
                        console.error('Cloudinary upload error:', err);
                        if (!res.headersSent) {
                            next(new AppError('画像のアップロードに失敗しました', 500));
                        }
                        return; // next()後は必ずreturn
                    }
                } catch (err) {
                    console.error('Cloudinary upload error:', err);
                    if (!res.headersSent) {
                        next(err);
                    }
                    return; // next()後は必ずreturn
                }
            } else {
                console.log("ファイルがアップロードされていなかったため、認証をスキップします。");
            }

            const thread = await Thread.findById(req.params.threadId);
            if (!thread) {
                if (!res.headersSent) {
                    next(new AppError('スレッドが見つかりません', 404));
                }
                return; // next()後は必ずreturn
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
            return; // レスポンス送信後はreturn
        } catch (err) {
            console.error("エラー発生時のreq.params:", req.params);
            console.error(err);
            if (!res.headersSent) {
                next(new AppError(err.message || '投稿の作成中にエラーが発生しました', 500));
            }
            return; // next()後は必ずreturn
        }
    }
);

router.post('/:threadId/posts/:postId/report', postLimiter, Ng, async (req, res, next) => {
    console.log("リクエスト開始時のreq.params:", req.params);
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
        console.error("エラー発生時のreq.params:", req.params);
        console.error(error);
        return next(new AppError('報告処理中にエラーが発生しました', 500));
    }
});

// スレッド削除時にカテゴリのスレッド数を更新
router.delete('/:threadId', validate(threadIdSchema), async (req, res, next) => {
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
        console.error("エラー発生時のreq.params:", req.params);
        console.error(err);
        if (res.headersSent) {
            console.error("レスポンスがすでに送信されています。エラーハンドリングをスキップします。");
            return;
        }
        next(new AppError(err.message || 'スレッド削除中にエラーが発生しました', 500));
    }
});

// 投稿削除
router.delete('/:threadId/posts/:postId', validate(postIdSchema), async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return next(new AppError('投稿が見つかりません', 404));
        }

        await Post.deleteOne({ _id: req.params.postId });
        // 投稿削除時にpostCountをデクリメント
        await Thread.findByIdAndUpdate(
            req.params.threadId,
            { $inc: { postCount: -1 } }
        );

        res.status(200).json({ message: '投稿が削除されました' });
    } catch (err) {
        console.error("エラー発生時のreq.params:", req.params);
        console.error(err);
        if (res.headersSent) {
            console.error("レスポンスがすでに送信されています。エラーハンドリングをスキップします。");
            return;
        }
        next(new AppError(err.message || '投稿削除中にエラーが発生しました', 500));
    }
});

// いいね機能
router.post('/:threadId/like', auth, async (req, res, next) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return next(new AppError('スレッドが見つかりません', 404));
        }

        // ユーザーがすでにいいねしているか確認
        if (thread.likesBy.includes(req.user.id)) {
            return res.status(400).json({ message: 'すでにいいねしています' });
        }

        thread.likes += 1; // いいね数を増加
        thread.likesBy.push(req.user.id); // ユーザーIDをlikesByに追加
        await thread.save();

        res.status(200).json({ message: 'いいねしました', likes: thread.likes });
    } catch (err) {
        console.error(err);
        return next(new AppError('いいね処理中にエラーが発生しました', 500));
    }
});

module.exports = router;