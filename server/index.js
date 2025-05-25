const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const Category = require('../models/Category'); // カテゴリモデルをインポート

// ミドルウェアの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // ReactアプリのURL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// MongoDBの接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modern-5ch', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const Thread = require('../models/Thread'); // スレッドモデルをインポート
const Post = require('../models/Post'); // レスモデルをインポート


const initializeCategories = async () => {
  const initialCategories = [
    { name: 'general', description: '一般的な話題' },
    { name: 'news', description: 'ニュース関連' },
    { name: 'AI', description: '人工知能に関する話題' },
    { name: 'テクノロジー', description: '技術関連' },
    { name: 'ハッキング', description: 'ハッキングやセキュリティ' },
    { name: 'ゲーム', description: 'ゲームに関する話題' },
    { name: 'アニメ', description: 'アニメ関連' },
    { name: '漫画', description: '漫画関連' },
    { name: '映画', description: '映画に関する話題' },
    { name: '音楽', description: '音楽関連' },
    { name: 'スポーツ', description: 'スポーツに関する話題' },
    { name: '料理', description: '料理やレシピ' },
    { name: '旅行', description: '旅行や観光' },
    { name: '趣味', description: '趣味全般' },
    { name: 'ビジネス', description: 'ビジネスや経済' },
    { name: 'ライフスタイル', description: '生活やライフスタイル' },
    { name: '宇宙', description: '宇宙や天文学' },
    { name: 'その他', description: 'その他の話題' },
    { name: '歴史', description: '歴史に関する話題' },
    { name: '過激な話題', description: '過激な話題や議論' },
  ];

  for (const category of initialCategories) {
    const exists = await Category.findOne({ name: category.name });
    if (!exists) {
      await new Category(category).save();
    }
  }
};

initializeCategories().catch((error) => console.error(error));


// ルートの設定

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

app.get('/api/categories/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    console.log(category)
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

app.get('/api/categories/:categoryId/threads', async (req, res) => {
  try {
    const threads = await Thread.find({ category: req.params.categoryId });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// カテゴリを取得
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 