const {Schema} = require('mongoose');
const mongoose = require('mongoose');


// スレッドのスキーマ
const threadSchema = new Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastPostAt: { type: Date, default: Date.now, index: true },
  category: { type: String, default: 'general' }, // カテゴリを追加
  
});

module.exports = mongoose.model('Thread', threadSchema);