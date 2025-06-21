const mongoose = require('mongoose');
const { Schema } = mongoose;

// レスのスキーマ
const postSchema = new Schema({
  threadId: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
  number: { type: Number, required: true ,index: true},
  content: { type: String, required: true },
  name: { type: String, default: '名無しさん' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // 追記: 投稿者のユーザーID
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: null },
  imagePath: { type: String, default: null },
  likes: { type: Number, default: 0 } // いいね数を追加
});

module.exports = mongoose.model('Post', postSchema);