const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const auth = require('./Routes/auth'); // 認証関連のルートをインポート

dotenv.config();

const app = express();
const Category = require('./models/Category'); // カテゴリモデルをインポート
const CategoryRoutes = require('./Routes/categories');
const ThreadRoutes = require('./Routes/threads');
// const ShopRoutes = require('./Routes/shop'); // ショップ関連のルートをインポート
const { postLimiter, globalLimiter } = require('./middleware/rateLimiter'); // レートリミッターをインポート

app.use('/uploads', express.static('uploads'));



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
    { name : "受験勉強", description: "受験勉強に関する話題" },
  ];
  const promise = initialCategories.map( async (category) => {
    Category.findOne({ name: category.name }).then((exists) => {

    if (!exists) {
      return new Category(category).save();
    }
  });
  });
  await Promise.all(promise);
};

initializeCategories().catch((error) => console.error(error));

app.use(globalLimiter); // グローバルなレートリミッターを適用


// ルートの設定
app.use('/auth', auth); // 認証関連のルートを使用
app.use('/api/categories', CategoryRoutes);
app.use('/api/threads', ThreadRoutes); // スレッド関連のルートを使用
// app.use('/api/shop', ShopRoutes); // ショップ関連のルートを使用

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 