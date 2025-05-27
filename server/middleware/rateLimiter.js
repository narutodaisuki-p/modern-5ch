const rateLimit = require('express-rate-limit');

// 投稿専用のレートリミッター
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 20, // 投稿は15分間に最大20回まで
  message: {
    error: '投稿が多すぎます。しばらく時間をおいてから再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// グローバルなレートリミッター（他のエンドポイント用）
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 全体で15分間に最大100リクエスト
  message: {
    error: 'リクエストが多すぎます。しばらく時間をおいてから再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { postLimiter, globalLimiter };