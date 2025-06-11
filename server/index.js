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
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const Post = require('./models/Post');
const Thread = require('./models/Thread');
const User = require('./models/User');


// Cloudinaryの設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'default_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'default_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'default_api_secret',
  secure: true // HTTPSを使用する場合はtrue
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinaryの環境変数が設定されていません。画像アップロード機能は無効になります。');
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
  'http://localhost:3000',
  "https://www.oira.ninja"
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
app.use(helmet(
  {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", ...allowedOrigins], // APIのドメインを追加
      },
    },
  }
));
app.set('trust proxy', 1); // リバースプロキシを信頼

// MongoDBの接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modern-5ch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  keepAlive: true,
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
    const exists = await Category.findOne({ name: category.name });
    if (!exists) {
      return new Category(category).save();
    }
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



// Socket.IOの設定

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const { customJoi } = require('./middleware/validate');
// Socket.IO用の投稿バリデーションスキーマ
const socketPostSchema = Joi.object({
  threadId: Joi.string().trim().required(),
  content: customJoi.string().trim().min(1).required(),
  name: customJoi.string().trim().optional(),
  image: Joi.string().optional(),
  token: Joi.string().optional(),
});

// Socket.IO用の簡易レートリミット（IPごとに15分50回）
const socketPostRateMap = new Map();
const SOCKET_POST_LIMIT = 50;
const SOCKET_POST_WINDOW = 15 * 60 * 1000;

function checkSocketPostLimit(socket) {
  const now = Date.now();
  const ip = socket.handshake.address;
  let info = socketPostRateMap.get(ip);
  if (!info || now - info.start > SOCKET_POST_WINDOW) {
    info = { count: 1, start: now };
  } else {
    info.count++;
  }
  socketPostRateMap.set(ip, info);
  return info.count <= SOCKET_POST_LIMIT;
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('joinThread', (threadId) => {
    socket.join(`thread_${threadId}`);
  });
  socket.on('newPost', async (data) => {
    // Joi+sanitize-htmlバリデーション
    const { error, value } = socketPostSchema.validate(data);
    if (error) {
      socket.emit('postError', error.details[0].message);
      return;
    }
    // レートリミット
    if (!checkSocketPostLimit(socket)) {
      socket.emit('postError', '投稿が多すぎます。しばらく時間をおいてから再試行してください。');
      return;
    }
    try {
      let imageUrl = null;
      if (value.image) {
        if (!value.token) {
          socket.emit('postError', '画像投稿にはログインが必要です');
          return;
        }
        let decoded, user;
        try {
          decoded = jwt.verify(value.token, process.env.JWT_SECRET);
          user = await User.findById(decoded.id);
          if (!user) throw new Error('ユーザーが見つかりません');
          if (!user.isTokenValid(value.token)) throw new Error('トークンの有効期限が切れています');
        } catch (err) {
          socket.emit('postError', '認証エラー: 画像投稿にはログインが必要です');
          return;
        }
        const uploadToCloudinary = (base64) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(base64, {
              resource_type: 'image',
              folder: 'posts',
            }, (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            });
          });
        };
        try {
          imageUrl = await uploadToCloudinary(value.image);
        } catch (err) {
          socket.emit('postError', '画像のアップロードに失敗しました');
          return;
        }
      }
      const postsCount = await Post.countDocuments({ threadId: value.threadId });
      const post = new Post({
        threadId: value.threadId,
        number: postsCount + 1,
        content: value.content, // サニタイズ済み
        name: value.name || '名無しさん',
        imageUrl: imageUrl,
        createdAt: new Date(),
      });
      const newPost = await post.save();
      await Thread.findByIdAndUpdate(
        value.threadId,
        { $inc: { postCount: 1 }, lastPostAt: new Date() },
        { new: true }
      );
      io.to(`thread_${value.threadId}`).emit('newPost', newPost);
    } catch (err) {
      socket.emit('postError', err.message || '投稿の作成中にエラーが発生しました');
    }
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));