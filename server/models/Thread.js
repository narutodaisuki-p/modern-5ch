const {Schema} = require('mongoose');
const mongoose = require('mongoose');


// スレッドのスキーマ
const threadSchema = new Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastPostAt: { type: Date, default: Date.now, index: true },
  category: { type: String, default: 'general' }, // カテゴリを追加
  likes: { type: Number, default: 0, index: true }, // いいね数を追加
  postCount: { type: Number, default: 0 }, // 投稿数を追加
  imageUrl: { type: String, default: null }, // 画像URLを追加
});

module.exports = mongoose.model('Thread', threadSchema);