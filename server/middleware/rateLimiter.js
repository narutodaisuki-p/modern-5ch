const rateLimit = require('express-rate-limit');

// 投稿専用のレートリミッター
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 50, // 投稿は15分間に最大50回まで
  message: {
    error: '投稿が多すぎます。しばらく時間をおいてから再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// グローバルなレートリミッター（他のエンドポイント用）
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 600, // 全体で15分間に最大600リクエスト
  message: {
    error: 'リクエストが多すぎます。しばらく時間をおいてから再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 認証関連のレートリミッター (ログイン/登録)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // 1時間あたり10回まで
  message: {
    error: '認証試行回数が多すぎます。1時間後に再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// リフレッシュトークン用のレートリミッター
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 30, // 15分間に最大30回まで
  message: {
    error: 'リフレッシュトークンの使用回数が多すぎます。しばらく時間をおいてから再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { postLimiter, globalLimiter, authLimiter, refreshLimiter };