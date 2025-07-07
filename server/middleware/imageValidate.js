const AppError = require('../utils/Error');

// 許可する画像のMIMEタイプ
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// 画像のバリデーション
const validateImage = (req, res, next) => {
  // ファイルがアップロードされていない場合はスキップ
  if (!req.file) {
    return next();
  }

  // MIMEタイプのチェック
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return next(new AppError('サポートされていない画像形式です。JPEG, PNG, GIF, WebPのみ許可されています。', 415));
  }

  // ファイルの内容が実際に画像かどうかのチェックもできますが、
  // それにはfile-typeなどのパッケージを使うと良いでしょう
  
  next();
};

// Socket.IO用の画像バリデーション
const validateBase64Image = (base64String) => {
  if (!base64String) {
    return true; // 画像がない場合は検証パス
  }

  console.log('Base64 Image Validation:', base64String);
  // Base64形式のチェック
  const base64Pattern = /^data:image\/(jpeg|png|gif|webp);base64,/;
  if (!base64Pattern.test(base64String)) {
    return {
      valid: false,
      message: 'サポートされていない画像形式です。JPEG, PNG, GIF, WebPのみ許可されています。'
    };
  }

  // ここでBase64データのサイズチェックもできます
  const base64Data = base64String.split(',')[1];
  const fileSize = Buffer.from(base64Data, 'base64').length;
  const maxSize = 15 * 1024 * 1024; // 15MB
  // 実際は、Base64エンコードされたデータは元のサイズの約1.33倍になるため、ここでは15MBを超えるときは20MBを超えることになります。
  if (fileSize > maxSize) {
    return {
      valid: false,
      message: '画像サイズが大きすぎます。最大15MBまでです。'
    };
  }

  return {
    valid: true
  };
};

module.exports = {
  validateImage,
  validateBase64Image
};