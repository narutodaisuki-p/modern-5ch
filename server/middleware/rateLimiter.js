const rateLimit = require('express-rate-limit'); // 修正済み

// rateLimitの設定
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大リクエスト数
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // レート制限情報を標準ヘッダーに追加
  legacyHeaders: false, // レガシーヘッダーを無効化
});

module.exports = limiter;