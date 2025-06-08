const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/Error');


const fileSize = 1024 * 1024 * 10; // 10MB
// ファイルサイズ制限のミドルウェア
const fileSizeLimiter = (req, res, next) => {
  if (req.file && req.file.size > fileSize) {
    return next(new AppError('ファイルサイズが大きすぎます。最大10MBまでです。', 413));
  }
  next();
};

const auth = async (req, res, next) => {
  try {
    console.log("authミドルウェア開始時のreq.params:", req.params);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("authミドルウェア内のトークン:", token);
    if (!token) {
      return next(new AppError('認証トークンが必要です', 401));
    }

    // トークン形式を事前にチェック
    if (!/^([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)$/.test(token)) {
      return next(new AppError('不正なトークン形式です', 400));
    }

    // JWT_SECRETが存在しない場合のエラーハンドリング
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRETが設定されていません。環境変数を確認してください。");
      return next(new AppError('サーバーエラー: JWT_SECRETが設定されていません', 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.error("ユーザーが見つかりません。トークンのID:", decoded.id);
      return next(new AppError('ユーザーが見つかりません', 404));
    }

    // トークンの有効期限をチェック
    if (!user.isTokenValid(token)) {
      return next(new AppError('トークンの有効期限が切れています', 401));
    }

    req.user = user;
    req.token = token;
    console.log("authミドルウェア終了時のreq.params:", req.params);
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('トークンの検証に失敗しました', 401));
    }
    next(error);
  }
};

module.exports = {
  auth,
  fileSizeLimiter
};