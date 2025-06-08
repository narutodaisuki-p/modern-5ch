const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const auth = require('./Routes/auth'); // 認証関連のルートをインポート
dotenv.config(); // 環境変数を読み込む
const cloudinary = require('cloudinary').v2;
if (process.env.NODE_ENV !== 'production') {
  console.log("process.env.NODE_ENV is not production, loading .env file");
}
const multer = require('multer');
const helmet = require('helmet');
const Joi = require('joi');


// Cloudinaryの設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'default_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'default_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'default_api_secret',
  secure: true // HTTPSを使用する場合はtrue
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinaryの環境変数が正しく設定されていません。\nCLOUDINARY_CLOUD_NAME: ", process.env.CLOUDINARY_CLOUD_NAME, "\nCLOUDINARY_API_KEY: ", process.env.CLOUDINARY_API_KEY, "\nCLOUDINARY_API_SECRET: ", process.env.CLOUDINARY_API_SECRET);
}


const app = express();
const Category = require('./models/Category'); // カテゴリモデルをインポート
const CategoryRoutes = require('./Routes/categories');
const ThreadRoutes = require('./Routes/threads');
// const ShopRoutes = require('./Routes/shop'); // ショップ関連のルートをインポート
const { postLimiter, globalLimiter } = require('./middleware/rateLimiter'); // レートリミッターをインポート


const allowedOrigins = [
  'https://jappan.vercel.app',                 // 本番用
  'https://modern-5ch-z6g6.vercel.app',            // プレビューや新URL用
  'http://localhost:3000'
];


// multerの設定
const upload = multer({
  storage: multer.memoryStorage(),
});


// ミドルウェアの設定
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(upload.single('image')); // 画像アップロード用のフィールド名を指定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.set('trust proxy', 1); // リバースプロキシを信頼

// MongoDBの接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modern-5ch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
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

  if (res.headersSent) {
    return next(err); // すでに送信されてたらスルーする
  }

  if (err.isJoi) {
    return res.status(400).json({ message: err.details[0].message });
  }

  console.error("Error in middleware:", err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));