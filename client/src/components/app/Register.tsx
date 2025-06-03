import React from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import ErrorTag from '../common/Error'
import Success from '../common/Success'
import { useAppContext } from '../../context/Appcontext'
import { useNavigate } from 'react-router-dom'
const URL = process.env.REACT_APP_API_URL;

interface RegisterGoogleResponse {
  message: string
  token?: string
}

const Register = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const { setIsLoggedIn } = useAppContext();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      // Send the credential to your backend
      const res = await fetch(`${URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Google registration failed");
      }

      const data: RegisterGoogleResponse = await res.json()
      setSuccessMessage(data.message || "Google registration successful")
      if (data.token) localStorage.setItem("jwt", data.token)
      setIsLoggedIn(true);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Google registration failed")
    }
  }

  const handleGoogleError = () => {
    setError('Google registration failed')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toString() || "";
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    if (!username || !email || !password) {
      setError('全てのフィールドを入力してください');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    try {
      const res = await fetch(`${URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "登録に失敗しました");
      }
      const data: RegisterGoogleResponse = await res.json()
      setSuccessMessage(data.message || "登録成功")
      if (data.token) localStorage.setItem("jwt", data.token)
      setIsLoggedIn(true);
    
    } catch (err: any) {
      setError(err.message || "登録に失敗しました")
    }
  }

  return (
    <Box sx={{ maxWidth: '400px', mx: 'auto', mt: 4 }}>
      {error && <ErrorTag message={error} />}
      {successMessage && <Success message={successMessage} />}
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
          新規登録
        </Typography>
        <TextField
          label="ユーザー名"
          variant="outlined"
          fullWidth
          margin="normal"
          name='username'
          required
        />
        <TextField
          label="メールアドレス"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          name='email'
          required
        />
        <TextField
          label="パスワード"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          name='password'
          required
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          sx={{ mt: 2 }}
        >
          登録
        </Button>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          既にアカウントをお持ちですか？ <a href="/login">ログイン</a>
        </Typography>
      </form>

      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        またはGoogleで登録
      </Typography>
      <GoogleOAuthProvider clientId="57851313624-4b5pejr838a4s33tttab7ac2td2gn5q0.apps.googleusercontent.com">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </Box>
      </GoogleOAuthProvider>

      <Typography variant="body2" align="center" sx={{ mt: 4 }}>
        <a href="/terms">利用規約</a>に同意する必要があります。
      </Typography>
    </Box>
  )
}

export default Register