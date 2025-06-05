const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const Category = require('../models/Category');
const {postLimiter} = require('../middleware/rateLimiter');
const Ng = require('../middleware/Ng');
const {auth, fileSizeLimiter} = require('../middleware/auth');
const cloudinary = require('cloudinary').v2; // Cloudinaryをインポート


router.get('/', async (req, res) => {
    try {
      const threads = await Thread.find().sort({ lastPostAt: -1 });
      res.json(threads);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // 新しいスレッドを作成
router.post('/', postLimiter, async (req, res) => {
    try {
        const thread = new Thread({
            title: req.body.title,
            category: req.body.category || 'general',
            createdAt: new Date(),
            lastPostAt: new Date()
        });
        const newThread = await thread.save();

        // カテゴリのスレッド数をインクリメント
        await Category.findOneAndUpdate(
            { name: newThread.category },
            { $inc: { threadCount: 1 } },
            { new: true, upsert: true } // カテゴリが存在しない場合は作成
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
      res.status(400).json({ message: err.message });
    }
  });
  
  // スレッドの投稿を取得
router.get('/:threadId/posts', async (req, res) => {
    try {
      const posts = await Post.find({ threadId: req.params.threadId }).sort('number');
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  // 修正案
router.post('/:threadId/posts',
    postLimiter, // 最初のミドルウェアとして postLimiter を直接置く
    // 以前の req.params をコピーしていたミドルウェアを削除
    // 以前の console.log("ミドルウェア後のリクエストパラメータ:", req.params); のミドルウェアも削除（または必要に応じて残す）
    auth, // auth ミドルウェアをここに直接追加
    fileSizeLimiter, // fileSizeLimiter ミドルウェアをここに直接追加
    async (req, res, next) => {
        try {
            console.log("最終ハンドラ開始時のreq.params:", req.params); // デバッグ用
            // req.body.image のチェックと Cloudinary アップロードはそのまま
            if (req.body.image) {
                console.log("画像が含まれています");
                try {
                    // auth と fileSizeLimiter はここで呼び出す必要はありません。
                    // ルート定義の引数として渡しているので、既に実行済みです。
                    const result = await cloudinary.uploader.upload(req.body.image, {
                        upload_preset: 'ml_default',
                    });
                    req.body.imageUrl = result.secure_url;
                    console.log("画像アップロード成功:", req.body.imageUrl);
                } catch (err) {
                    console.error("画像アップロードエラー:", err);
                    return next(err);
                }
            }
            const thread = await Thread.findById(req.params.threadId);
            if (!thread) {
                return res.status(404).json({ message: 'Thread not found' });
            }

            const postsCount = await Post.countDocuments({ threadId: req.params.threadId });
            console.log(req.body.imageUrl);
            const post = new Post({
                threadId: req.params.threadId,
                number: postsCount + 1,
                content: req.body.content,
                name: req.body.name || '名無しさん',
                imageUrl: req.body.imageUrl || null,
            });

            const newPost = await post.save();

            // 投稿作成時にpostCountをインクリメント
            // ここでの params.threadId は req.params.threadId と同じになるはず
            await Thread.findByIdAndUpdate(
                req.params.threadId, // ここも req.params.threadId に変更
                { $inc: { postCount: 1 } }
            );

            thread.lastPostAt = new Date();
            await thread.save();

            res.status(201).json(newPost);
        } catch (err) {
            console.error(err);
            AppError(err, 500, '投稿の作成中にエラーが発生しました');
        }
    }
);

router.post('/:threadId/posts/:postId/report',postLimiter, Ng, async (req, res) => {
    const { threadId, postId } = req.params;

    try {
        const post = await Post.findOne({ threadId, _id: postId });
        if (!post) {
            return res.status(404).json({ message: '投稿が見つかりません' });
        }
        // NGワードが含まれている場合は削除
        await Post.deleteOne({ _id: postId });
        res.status(200).json({ message: '投稿が削除されました' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '報告処理中にエラーが発生しました' });
    }
});

// スレッド削除時にカテゴリのスレッド数を更新
router.delete('/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'スレッドが見つかりません' });
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

module.exports = router;