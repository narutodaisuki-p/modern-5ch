# アプリケーション最適化ガイド

このドキュメントでは、Modern-5chアプリケーションのパフォーマンスと安全性を向上させるための最適化について説明します。

## 1. 画像アップロードの最適化

### 1.1 Base64からマルチパートへの移行

現在、アプリケーションでは画像をBase64エンコードして送信しています。これはシンプルですが、いくつかの欠点があります：

- **データサイズの増加**: Base64エンコーディングはバイナリデータのサイズを約33%増加させます
- **メモリ使用量**: 大きな画像はクライアントとサーバーの両方でメモリを圧迫します
- **パフォーマンス**: デコードのためにCPUリソースを使用します

**推奨改善策**:

```javascript
// クライアント側
const handleImageUpload = async (event) => {
  const formData = new FormData();
  formData.append('image', event.target.files[0]);
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // アップロードした画像のURLを使用
    setImageUrl(response.data.imageUrl);
  } catch (error) {
    console.error('画像アップロードエラー:', error);
  }
};
```

### 1.2 Cloudinaryの活用

環境変数に`CLOUDINARY`の設定があることから、Cloudinaryを使用していると思われます。Cloudinaryを最大限に活用してください：

- 画像の自動最適化
- レスポンシブ画像の生成
- 画像の変換と圧縮

**サーバー側での実装例**:

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'modern-5ch',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });
```

## 2. Reactコンポーネントの最適化

### 2.1 メモ化の活用

不必要な再レンダリングを防ぐために、`React.memo`、`useMemo`、`useCallback`を適切に使用してください。

```javascript
// 最適化前
const handleSubmit = () => {
  // 処理ロジック
};

// 最適化後
const handleSubmit = useCallback(() => {
  // 処理ロジック
}, [依存配列]);
```

### 2.2 状態管理の最適化

複数のコンポーネントで共有される状態には、グローバルな状態管理ライブラリ（ReduxやContext API）を使用してください。

```javascript
// Contextの作成例
const ThreadContext = createContext();

export const ThreadProvider = ({ children }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/threads');
      setThreads(response.data);
    } catch (error) {
      console.error('スレッド取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ThreadContext.Provider value={{ threads, loading, fetchThreads }}>
      {children}
    </ThreadContext.Provider>
  );
};
```

## 3. Socket.IOの最適化

### 3.1 接続の効率化

```javascript
// サーバー側
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN.split(' '),
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000, // 接続タイムアウトの設定
  transports: ['websocket', 'polling'] // WebSocketを優先
});
```

### 3.2 イベントの最適化

- 不必要なイベント発行を避ける
- 大きなデータの送信を避ける（特に画像データ）
- 部屋（room）機能を使用して、必要なクライアントにのみデータを送信する

```javascript
// 特定のスレッドルームにのみメッセージを送信
io.to(`thread_${threadId}`).emit('new_message', messageData);
```

## 4. セキュリティの強化

### 4.1 環境変数の管理

- 本番環境では `.env` ファイルを使用せず、環境変数を直接設定する
- Dockerのシークレット機能を活用する

**docker-compose.yml の例**:

```yaml
services:
  server:
    # ...その他の設定...
    secrets:
      - db_password
      - jwt_secret
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### 4.2 APIレート制限の強化

すでにrate-limiterを使用しているようですが、より細かい設定を検討してください：

```javascript
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分間
  max: 100, // IPごとに100リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  // ユーザーごとの制限も考慮
  keyGenerator: (req) => req.user?.id || req.ip
});

// 特に認証関連のエンドポイントには厳しい制限を設ける
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // 10回の試行
  message: '試行回数が多すぎます。1時間後に再試行してください。'
});

app.use('/api/auth/login', authLimiter);
```

## 5. データベースの最適化

### 5.1 インデックスの活用

頻繁にクエリされるフィールドにはインデックスを設定してください：

```javascript
// Mongoose Schema例
const ThreadSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
});
```

### 5.2 クエリの最適化

- 必要なフィールドのみを取得する
- ページネーションを実装する
- 適切なプロジェクション（選択）を使用する

```javascript
// 最適化前
const threads = await Thread.find({}).populate('author');

// 最適化後
const threads = await Thread.find({})
  .select('title content createdAt')
  .populate('author', 'username avatar')
  .sort({ createdAt: -1 })
  .limit(20)
  .skip(page * 20);
```

## 6. フロントエンドのパフォーマンス

### 6.1 コード分割

React.lazyとSuspenseを使用して、必要なコンポーネントのみをロードします：

```javascript
const Thread = React.lazy(() => import('./components/threads/Thread'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Thread />
    </Suspense>
  );
}
```

### 6.2 画像の最適化

- 画像のプリロード
- 遅延読み込み（Lazy Loading）
- WebPなどの最適化された画像フォーマットの使用

```jsx
<img 
  src={imageUrl} 
  alt="Thread image" 
  loading="lazy" 
  width="600" 
  height="400" 
/>
```

## 7. キャッシュ戦略

### 7.1 サーバーサイドキャッシュ

頻繁に変更されないデータには、Redis や Node.js の in-memory キャッシュを使用してください：

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10分間キャッシュ

app.get('/api/popular-threads', async (req, res) => {
  const cacheKey = 'popular-threads';
  
  // キャッシュをチェック
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  
  // データベースからデータを取得
  const threads = await Thread.find({})
    .sort({ views: -1 })
    .limit(10);
  
  // キャッシュに保存
  cache.set(cacheKey, threads);
  
  res.json(threads);
});
```

### 7.2 クライアントサイドキャッシュ

Service WorkerやBrowser Cacheを活用してください：

```javascript
// public/service-worker.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
        return caches.open('v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
```
