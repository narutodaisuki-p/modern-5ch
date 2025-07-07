const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, customJoi } = require('../middleware/validate');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// バリデーションスキーマ
const loginSchema = customJoi.object({
  email: customJoi.string().email().required().escapeHTML(),
  password: customJoi.string().min(6).required().escapeHTML()
});

const registerSchema = customJoi.object({
  username: customJoi.string().min(2).max(50).required().escapeHTML(),
  email: customJoi.string().email().required().escapeHTML(),
  password: customJoi.string().min(6).required()
});

const profileUpdateSchema = customJoi.object({
  name: customJoi.string().min(2).max(50).required().escapeHTML()
});

const passwordChangeSchema = customJoi.object({
  currentPassword: customJoi.string().min(6).required(),
  newPassword: customJoi.string().min(6).required()
});

// セキュアなクッキーを設定するヘルパー関数
// アクセストークンの有効期限を延長
const setTokenCookies = (res, accessToken) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true, // JavaScriptからアクセス不可
    secure: false, // Nginxリバースプロキシ環境ではfalse
    sameSite: 'strict', // CSRF保護
    maxAge: 3 * 24 * 60 * 60 * 1000, // ３日
  });
};

// 新規登録エンドポイント
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;

  // 入力値の型チェック（NoSQLインジェクション対策）
  if (!username || !email || !password || 
      typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'すべてのフィールドを文字列で入力してください。' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      google: false, // Google認証を使用していないことを示すフラグ
    });

    const accessToken = newUser.generateAuthToken();
    await newUser.save();

    setTokenCookies(res, accessToken);

    res.status(201).json({ 
      message: '登録が成功しました。', 
      accessToken
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'このメールアドレスはすでに使用されています。' });
    }
    res.status(500).json({ message: '登録中にエラーが発生しました。' });
  }
});

// ログインエンドポイント
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  console.log('ログインリクエスト:', { email });
  
  // 入力値の型チェック（NoSQLインジェクション対策）
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'メールアドレスとパスワードは文字列で入力してください。' });
  }
  
  try {
    // ユーザーを検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
    }
    
    // パスワード検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
    }
    
    // 既存のトークンを無効化（オプション）
    const oldTokens = user.invalidTokens || [];
    if (oldTokens.length > 8) { // 無効リストが大きくなりすぎないようにする
      user.invalidTokens = oldTokens.slice(-8); // 最新の8つだけ保持
    }
    
    // 新しいトークンを発行
    const accessToken = user.generateAuthToken();
    
    // 最終ログイン日時を更新
    user.lastLogin = new Date();
    await user.save();
    
    // クッキーにトークンを設定
    setTokenCookies(res, accessToken);
    
    // レスポンス
    res.status(200).json({
      message: 'ログインに成功しました。',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        rank: user.rank
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'ログイン処理中にエラーが発生しました。' });
  }
});

router.post("/verify", async (req, res) => {
  console.log(req.cookies, "クッキーの内容");
  // クッキーからトークンを取得、なければリクエストボディから
  const token = req.cookies.access_token || req.body.token;

  if (!token) {
    return res.status(400).json({ message: 'トークンが必要です。' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    // トークンバージョンチェックを追加
    if (decoded.version !== undefined && decoded.version !== user.tokenVersion) {
      return res.status(401).json({ message: 'トークンは無効になりました。再ログインしてください。' });
    }
    

    // 無効リストをチェック
    if (user.invalidTokens && user.invalidTokens.includes(token)) {
      return res.status(401).json({ message: 'このトークンは無効化されています。再ログインしてください。' });
    }

    if (user.isTokenValid(token)) {
      const newToken = user.generateAuthToken();
      res.status(200).json({ 
        message: 'トークンは有効です。', 
        token: newToken, 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          rank: user.rank
        } 
      });
    } else {
      res.status(401).json({ message: 'トークンの有効期限が切れています。' });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'トークンが無効です。' });
    }
    res.status(500).json({ message: 'トークンの検証中にエラーが発生しました。' });
  }
});

// Google認証エンドポイント
router.post('/google', authLimiter, async (req, res) => {
  const { credential } = req.body;
  console.log('Google認証リクエスト:', { credential });
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
        picture: payload.picture // Googleからのプロフィール画像URL
      });
      await user.save();
    } else {
      // 既存ユーザーの場合、プロフィール画像を更新
      if (payload.picture && (!user.picture || user.google)) {
        user.picture = payload.picture;
        await user.save();
      }
    }

    // 既存のトークンを無効化（オプション）
    const oldTokens = user.invalidTokens || [];
    if (oldTokens.length > 8) {
      user.invalidTokens = oldTokens.slice(-8); // 最新の8つだけ保持
    }

    const accessToken = user.generateAuthToken();
    
    // 最終ログイン日時を更新
    user.lastLogin = new Date();
    await user.save();

    // クッキーにトークンを設定
    setTokenCookies(res, accessToken);

    res.status(200).json({ 
      message: 'Google認証成功', 
      accessToken, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || payload.picture,
        rank: user.rank
      } 
    });
  } catch (error) {
    console.error('Google認証エラー:', error);
    res.status(500).json({ message: 'Google認証中にエラーが発生しました' });
  }
});
router.get("/profile", async (req, res) => {
  // クッキーからトークンを取得、なければヘッダーから
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];

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
router.put("/profile", validate(profileUpdateSchema), async (req, res) => {
  // クッキーからトークンを取得、なければヘッダーから
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
  const { name } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'トークンが必要です' });
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: '新しいユーザー名を文字列で入力してください' });
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

// パスワード変更エンドポイント
router.put("/change-password", validate(passwordChangeSchema), async (req, res) => {
  // クッキーからトークンを取得、なければヘッダーから
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
  const { currentPassword, newPassword } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'トークンが必要です' });
  }

  if (!currentPassword || !newPassword || 
      typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ message: '現在のパスワードと新しいパスワードを文字列で入力してください' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // Google認証ユーザーのチェック
    if (user.google && !user.password) {
      return res.status(400).json({ message: 'Googleアカウントで認証しているユーザーはパスワードを変更できません' });
    }

    // 現在のパスワードを確認
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: '現在のパスワードが正しくありません' });
    }

    // 新しいパスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // すべてのトークンを無効化
    await user.invalidateAllTokens();

    // 新しいトークンを生成して返す
    const accessToken = user.generateAuthToken();
    await user.save();

    // クッキーにトークンを設定
    setTokenCookies(res, accessToken);

    res.status(200).json({
      message: 'パスワードが更新されました。すべてのセッションがログアウトされました。',
      accessToken
    });
  } catch (error) {
    console.error('パスワード更新エラー:', error);
    res.status(500).json({ message: 'パスワードの更新中にエラーが発生しました' });
  }
});

// ログアウトエンドポイント
router.post("/logout", async (req, res) => {
  res.clearCookie('access_token');
  res.status(200).json({ message: 'ログアウトしました' });
});

module.exports = router;