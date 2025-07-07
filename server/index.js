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
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Post = require('./models/Post');
const Thread = require('./models/Thread');
const User = require('./models/User');

// セキュリティ設定をインポート
const { getHelmetConfig} = require('./config/security');

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
const { globalLimiter } = require('./middleware/rateLimiter'); // レートリミッターをインポート


const allowedOrigins = [
  'https://jappan.vercel.app',                 // 本番用
  'https://modern-5ch-z6g6.vercel.app',            // プレビューや新URL用
  'http://localhost:3000',
  "https://www.oira.ninja"
];


// multerの設定
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // 許可する画像のMIMEタイプ
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new AppError('サポートされていない画像形式です。JPEG, PNG, GIF, WebPのみ許可されています。', 415), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// cookie-parser をインポート
const cookieParser = require('cookie-parser');

// ミドルウェアの設定
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // クッキーを許可
}));

app.use(upload.single('image')); // 画像アップロード用のフィールド名を指定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'modern-5ch-cookie-secret')); // クッキーパーサーを追加
// Helmetセキュリティ設定を適用
app.use(helmet(getHelmetConfig(allowedOrigins)));
app.set('trust proxy', "loopback"); // リバースプロキシを信頼

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
  await Promise.all(promise)
  .then(() => console.log('Categories initialized'))
  .catch(err => console.error('Error initializing categories:', err));
};

initializeCategories().catch((error) => console.error(error));

app.use(globalLimiter); // グローバルなレートリミッターを適用


// 実際のクライアントIP取得のヘルパー関数
function getRealClientIP(req) {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] || 
         req.headers['cf-connecting-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         'unknown';
}

// Socket.IO用のIP取得関数
function getSocketClientIP(socket) {
  return socket.handshake.headers['x-forwarded-for'] ||
          socket.handshake.headers['x-real-ip'] || 
          socket.handshake.headers['cf-connecting-ip'] ||
          socket.handshake.address ||
          'unknown';
}

// ルートの設定
app.use('/auth', auth); // 認証関連のルートを使用
app.use('/auth/refresh', require('./Routes/refreshToken')); // リフレッシュトークンルートを追加
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
  },
  cookie: {
    httpOnly: true,
    secure: false, // Nginxリバースプロキシ環境ではfalse
    sameSite: 'strict'
  }
});

const { customJoi } = require('./middleware/validate');
const { validateBase64Image } = require('./middleware/imageValidate');

// Socket.IO用の投稿バリデーションスキーマ
const socketPostSchema = customJoi.object({
  threadId: customJoi.string().escapeHTML().trim().required(),
  content: customJoi.string().escapeHTML().trim().min(1).required(),
  image: customJoi.string().optional(),
  token: customJoi.optional(), // トークンはオプション
  name: customJoi.string().escapeHTML().trim().max(50).optional(),
  userId: customJoi.string().optional(), // userIdはオプション
});

// Socket.IO用の簡易レートリミット（IPごとに15分50回）
const socketPostRateMap = new Map();
const SOCKET_POST_LIMIT = 50; // 15分あたりの投稿数制限
const SOCKET_POST_WINDOW = 15 * 60 * 1000; // 15分

function checkSocketPostLimit(socket) {
  const now = Date.now();
  // 実際のクライアントIPを取得
  const ip = getSocketClientIP(socket);
  if (!ip) {
    console.warn('Socket connection without a valid IP address');
    return false; // IPが取得できない場合は制限をかけない
  }
  let info = socketPostRateMap.get(ip);
  console.log(`Checking post limit for IP: ${ip}, current info:`, info);
  if (!info || now - info.start > SOCKET_POST_WINDOW) {
    info = { count: 1, start: now };
  } else {
    info.count++;
  }
  socketPostRateMap.set(ip, info);
  return info.count <= SOCKET_POST_LIMIT;
}

io.on('connection', (socket) => {
  const clientIP = getSocketClientIP(socket);
  console.log('Socket connected:', {
    socketId: socket.id,
    detectedIP: clientIP,
    rawAddress: socket.handshake.address,
    headers: {
      'x-forwarded-for': socket.handshake.headers['x-forwarded-for'],
      'x-real-ip': socket.handshake.headers['x-real-ip'],
      'user-agent': socket.handshake.headers['user-agent']
    }
  });
  socket.on('joinThread', ({ threadId, name }) => {
    socket.join(`thread_${threadId}`);
    console.log(`User '${name || '名無しさん'}' joined thread ${threadId}`);
  });
  socket.on('newPost', async (data) => {
    // Joi+sanitize-htmlバリデーション
    const { error, value } = socketPostSchema.validate(data);
    if (error) {
      socket.emit('postError', error.details[0].message);
      return;
    }
    
    // 画像バリデーション
    if (value.image) {
      const imageValidation = validateBase64Image(value.image);
      if (!imageValidation.valid) {
        socket.emit('postError', imageValidation.message);
        return;
      }
    }
    
    // レートリミット
    if (!checkSocketPostLimit(socket)) {
      socket.emit('postError', '投稿が多すぎます。しばらく時間をおいてから再試行してください。');
      return;
    }
    try {
      let imageUrl = null;
      let userId = null; // userId を初期化

      // トークンがあればユーザー情報を取得し、userIdを設定
      if (value.token) {
        try {
          const decoded = jwt.verify(value.token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id);
          if (!user) throw new Error('ユーザーが見つかりません');
          if (!user.isTokenValid(value.token)) throw new Error('トークンの有効期限が切れています');
          userId = user._id; // 認証されたユーザーのIDを取得
          console.log(`Authenticated user ID: ${userId}`);

          // 画像投稿処理 (ユーザー認証後に行う)
          if (value.image) {
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
        } catch (err) {
          // トークンが無効または画像投稿以外のケースでトークンエラーが発生した場合
          // userId は null のままとなり、匿名投稿として扱われる
          // 画像投稿を試みていた場合はエラーを返す
          if (value.image) {
            socket.emit('postError', '認証エラー: 画像投稿にはログインが必要です');
            return;
          }
          console.log("Token validation failed or user not found, proceeding as anonymous post:", err.message);
        }
      } else if (value.image) {
        // トークンなしで画像投稿を試みた場合
        socket.emit('postError', '画像投稿にはログインが必要です');
        return;
      }

      const postsCount = await Post.countDocuments({ threadId: value.threadId });
      const post = new Post({
        threadId: value.threadId,
        number: postsCount + 1,
        content: value.content, // サニタイズ済み
        name: value.name || '名無しさん',
        userId: userId, // 取得した userId を設定 (認証されていなければ null)
        imageUrl: imageUrl,
        createdAt: new Date(),
      });
      const newPost = await post.save();

      // 投稿者のニックネームをスレッドのuserNicknames配列に保存 (重複しないように)
      if (value.threadId && value.name && typeof value.name === 'string') {
        const nicknameToSave = value.name.trim();
        if (nicknameToSave !== '' && nicknameToSave !== '名無しさん') { // 名無しさんは保存・チェックの対象外とする
          try {
            const thread = await Thread.findById(value.threadId);
            if (!thread) {
              socket.emit('postError', 'スレッドが見つかりません');
              return;
            }
            if (thread && thread.userNicknames && !thread.userNicknames.includes(nicknameToSave)) {
              thread.userNicknames.push(nicknameToSave);
              await thread.save();
              console.log(`Nickname '${nicknameToSave}' added to thread ${value.threadId}`);
            }
          } catch (err) {
            console.error('Error saving nickname to thread:', err);
            socket.emit('postError', 'ニックネームの保存中にエラーが発生しました');
            return;
          }
        }
      }

      // スレッドの投稿数と最終投稿日時を更新
      if (value.threadId) { 
        await Thread.findByIdAndUpdate(
          value.threadId,
          { $inc: { postCount: 1 }, lastPostAt: new Date() },
          { new: true }
        );
      }

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

// CSPレポートエンドポイント
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation Report:', JSON.stringify(req.body, null, 2));
  
  // 本番環境では適切なログシステムに送信
  if (isProduction) {
    // TODO: ログシステム（Sentry、CloudWatch など）に送信
    // 例: Sentry.captureException(new Error('CSP Violation'), { extra: req.body });
    
  }
  
  res.status(204).send();
});

// セキュリティヘッダーのテスト用エンドポイント
app.get('/security-test', (req, res) => {
  res.json({
    message: 'セキュリティヘッダーのテストエンドポイント',
    headers: req.headers,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// セキュリティヘッダーのテスト用URLを提供
app.get('/security-test-urls', (req, res) => {

  const hedar = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  res.json({
    mozilla: 'https://observatory.mozilla.org/',
    securityheaders: 'https://securityheaders.com/',
    cspEvaluator: 'https://csp-evaluator.withgoogle.com/',
    clientIP: getRealClientIP(req),
    userAgent: userAgent,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});