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
  lastLogin: { type: Date }, // 最終ログイン日時
  threadNicknames: { type: Map, of: String, default: {} }, // スレッドごとのニックネームを追加
  invalidTokens: { type: [String], default: [] }, // 無効化されたトークンのリスト
  tokenVersion: { type: Number, default: 0 }, // トークンバージョン管理用
});

// パスワードを検証するメソッド
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWTを生成するメソッド
userSchema.methods.generateAuthToken = function () {
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h'; // アクセストークンの有効期限を短くする
  const token = jwt.sign(
    { 
      id: this._id,
      exp: Math.floor(Date.now() / 1000) + (parseInt(expiresIn) * 3600), // 時間を秒に変換
      version: this.tokenVersion // トークンバージョンを含める
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
    // 無効リストチェック
    if (this.invalidTokens && this.invalidTokens.includes(token)) {
      return false;
    }
    
    console.log(this.invalidTokens, "無効化されたトークンのリスト");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // トークンバージョンチェック - パスワード変更などで古いトークンを無効化
    if (decoded.version !== undefined && decoded.version !== this.tokenVersion) {
      return false;
    }
    
    return decoded.exp > Math.floor(Date.now() / 1000);
    
  } catch (err) {
    return false;
  }
};

// トークンを無効化するメソッド
userSchema.methods.invalidateToken = function (token) {
  // 無効リストに追加（最大10個まで保存。古いものから削除）
  if (!this.invalidTokens) {
    this.invalidTokens = [];
  }
  
  // 同じトークンが既に無効リストにある場合は追加しない
  if (!this.invalidTokens.includes(token)) {
    this.invalidTokens.push(token);
  }
  
  // リストが大きくなりすぎないよう制限
  if (this.invalidTokens.length > 10) {
    this.invalidTokens.shift(); // 最も古いトークンを削除
  }
  
  return this.save();
};

// すべてのトークンを無効化するメソッド（パスワード変更時など）
userSchema.methods.invalidateAllTokens = function () {
  this.tokenVersion += 1; // トークンバージョンを増やすことで古いトークンを無効化
  this.invalidTokens = []; // 個別の無効リストはクリア
  return this.save();
};


module.exports = mongoose.model('User', userSchema);