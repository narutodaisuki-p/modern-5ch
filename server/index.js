const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// MongoDBの接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modern-5ch', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// スレッドのスキーマ
const threadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastPostAt: { type: Date, default: Date.now }
});

// レスのスキーマ
const postSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  number: { type: Number, required: true },
  content: { type: String, required: true },
  name: { type: String, default: '名無しさん' },
  createdAt: { type: Date, default: Date.now }
});

const Thread = mongoose.model('Thread', threadSchema);
const Post = mongoose.model('Post', postSchema);

// スレッド一覧を取得
app.get('/api/threads', async (req, res) => {
  try {
    const threads = await Thread.find().sort({ lastPostAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 新しいスレッドを作成
app.post('/api/threads', async (req, res) => {
  try {
    const thread = new Thread({
      title: req.body.title
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
app.get('/api/threads/:threadId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ threadId: req.params.threadId }).sort('number');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// スレッドに投稿
app.post('/api/threads/:threadId/posts', async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 