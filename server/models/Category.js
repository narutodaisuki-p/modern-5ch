const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }, // カテゴリの説明（オプション）
  threadCount: { type: Number, default: 0 }, // スレッド数を保存
});

module.exports = mongoose.model('Category', categorySchema);