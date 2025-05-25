const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }, // カテゴリの説明（オプション）
});

module.exports = mongoose.model('Category', categorySchema);