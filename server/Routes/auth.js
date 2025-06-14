const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const AppError = require('../utils/Error');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 新規登録エンドポイント
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'すべてのフィールドを入力してください。' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      google: false, // Google認証を使用していないことを示すフラグ
    });

    console.log('新規ユーザーの登録:', {
      name: newUser.name,
      email: newUser.email,
      google: newUser.google,
    });

    await newUser.save();
    const token = newUser.generateAuthToken();

    res.status(201).json({ message: '登録が成功しました。', token });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'このメールアドレスはすでに使用されています。' });
    }
    res.status(500).json({ message: '登録中にエラーが発生しました。' });
  }
});

router.post("/verify", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'トークンが必要です。' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);


    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    if (user.isTokenValid(token)) {
      const newToken = user.generateAuthToken();
      res.status(200).json({ message: 'トークンは有効です。', token: newToken, user });
   
    } else {
      res.status(401).json({ message: 'トークンは無効です。' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'トークンの検証中にエラーが発生しました。' });
  }
});

// Google認証エンドポイント
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google認証情報が必要です' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: null, // 
        google: true, // Google認証を使用していることを示すフラグ
      });
      await user.save();
    }

    const token = user.generateAuthToken();
    res.status(200).json({ message: 'Google認証成功', token, user: {
      name: user.name,
      email: user.email,
      picture: payload.picture, // Googleからのプロフィール画像URL
      _id: user._id,
    } });
  } catch (error) {
    console.error(error);
    AppError('Google認証中にエラーが発生しました', 500);
  }
});
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'トークンが必要です' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    console.error('プロフィール情報取得エラー:', error);
    res.status(500).json({ message: 'プロフィール情報の取得中にエラーが発生しました' });
  }
});

// プロフィール更新エンドポイント
router.put("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { name } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'トークンが必要です' });
  }

  if (!name) {
    return res.status(400).json({ message: '新しいユーザー名が必要です' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    user.name = name;
    await user.save();

    res.status(200).json({
      message: 'ユーザー名が更新されました。',
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture,
      }
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({ message: 'プロフィールの更新中にエラーが発生しました' });
  }
});

module.exports = router;