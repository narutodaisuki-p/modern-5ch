const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/Error');


const fileSize = 1024 * 1024 * 5; // 5MB
// ファイルサイズ制限のミドルウェア
const fileSizeLimiter = (req, res, next) => {
  if (req.file && req.file.size > fileSize) {
    return AppError('ファイルサイズが大きすぎます。最大5MBまでです。', 413);
  }
  next();
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AppError('認証トークンが必要です', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('ユーザーが見つかりません', 404);
    }

    // トークンの有効期限をチェック
    if (!user.isTokenValid(token)) {
      throw new AppError('トークンの有効期限が切れています', 401);
    }

    req.user = user;
    req.token = token;
    return next();
    
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'トークンの有効期限が切れています',
        isExpired: true 
      });
    }
    console.error('認証エラー:', err);
    res.status(err.statusCode || 401).json({ 
      error: err.message || '認証に失敗しました',
      isExpired: false
    });
  }
};

module.exports = {
  auth,
  fileSizeLimiter
};