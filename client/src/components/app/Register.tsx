import React from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import ErrorTag from '../common/Error'
import Success from '../common/Success'
const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'



interface RegisterGoogleResponse {
  message: string
  token?: string
}

const Register = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Google registration successful:', credentialResponse)
    // 必要に応じてトークンをバックエンドに送信

  }

  const handleGoogleError = () => {
    console.error('Google registration failed')
  }

  return (
    <Box sx={{ maxWidth: '400px', mx: 'auto', mt: 4 }}>
      {error && <ErrorTag message={error} />}
      {successMessage && <Success message={successMessage} />}
      <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = {
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password')
        }
        if (!data.username || !data.email || !data.password) {
          setError('All fields are required')
          return
        }
        fetch(`${URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Registration failed');
            }
            return response.json() as Promise<RegisterGoogleResponse>; // 型を指定
          })
          .then((data) => {
            setSuccessMessage(data.message || 'Registration successful');
            setError(null); // エラーをクリア
            // ローカルに保存jwtを
            localStorage.setItem('jwt', data.token || '');
          })
          .catch((error) => {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed');
          });
      }}>
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
        <a href="/terms">利用規約</a> と <a href="/privacy">プライバシーポリシー</a> に同意する必要があります。
      </Typography>
    </Box>
  )
}

export default Register