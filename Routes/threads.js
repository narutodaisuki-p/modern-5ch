const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
router.get('/', async (req, res) => {
    try {
      const threads = await Thread.find().sort({ lastPostAt: -1 });
      res.json(threads);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // 新しいスレッドを作成
router.post('/', async (req, res) => {
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
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // スレッドに投稿
router.post('/:threadId/posts', async (req, res) => {
    try {
      const thread = await Thread.findById(req.params.threadId);
      if (!thread) {
        console.error('Thread not found:', req.params.threadId);
        return res.status(404).json({ message: 'Thread not found' });
      }
  
      const postsCount = await Post.countDocuments({ threadId: req.params.threadId });
      const post = new Post({
        threadId: req.params.threadId,
        number: postsCount + 1,
        content: req.body.content,
        name: req.body.name || '名無しさん'
      });
  
      const newPost = await post.save();
      
      // スレッドの最終投稿時間を更新
      thread.lastPostAt = new Date();
      await thread.save();
  
      res.status(201).json(newPost);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
module.exports = router;
