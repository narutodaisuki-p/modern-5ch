const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // 環境変数の読み込み

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { 
    type: String,
    required: function() {
      return !this.google; // Google認証を使用していない場合は必須
    }
  },
  google : { type: Boolean, default: false }, // Google認証を使用しているかどうか
  picture: { type: String }, // プロフィール画像のURL
  createdAt: { type: Date, default: Date.now },
  rank: { type: String, default: '下忍' , enum: ['下忍', '中忍', '上忍'] }, // ユーザーのランク
});

// パスワードを検証するメソッド
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWTを生成するメソッド
userSchema.methods.generateAuthToken = function () {
  const expiresIn = process.env.JWT_EXPIRES_IN || '300h';
  const token = jwt.sign(
    { 
      id: this._id,
      exp: Math.floor(Date.now() / 1000) + (parseInt(expiresIn) * 3600) // 時間を秒に変換
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256'
    }
  );
  return token;
};

// トークンの有効期限を確認するメソッド
userSchema.methods.isTokenValid = function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.exp > Math.floor(Date.now() / 1000);
    
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);