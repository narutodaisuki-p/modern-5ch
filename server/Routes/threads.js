const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {postLimiter} = require('../middleware/rateLimiter');
const Ng = require('../middleware/Ng');

// 画像の保存先とファイル名の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
    try {
      const threads = await Thread.find().sort({ lastPostAt: -1 });
      res.json(threads);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // 新しいスレッドを作成
router.post('/',postLimiter ,async (req, res) => {
    try {
      const thread = new Thread({
        title: req.body.title,
        category: req.body.category || 'general', // カテゴリを指定、デフォルトは 'general'
        createdAt: new Date(),
        lastPostAt: new Date()
      });
      const newThread = await thread.save();
  
      // 最初の投稿も同時に作成
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
      console.log("posts",posts);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // スレッドに投稿
router.post('/:threadId/posts', postLimiter, upload.single('image'), async (req, res) => {
    try {
      const thread = await Thread.findById(req.params.threadId);
      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }
  
      const postsCount = await Post.countDocuments({ threadId: req.params.threadId });
  
      const post = new Post({
        threadId: req.params.threadId,
        number: postsCount + 1,
        content: req.body.content,
        name: req.body.name || '名無しさん',
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      });
      console.log("req.file",req.file);
  
      const newPost = await post.save();
      
      // スレッドの最終投稿時間を更新
      thread.lastPostAt = new Date();
      await thread.save();
  
      res.status(201).json(newPost);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

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
module.exports = router;