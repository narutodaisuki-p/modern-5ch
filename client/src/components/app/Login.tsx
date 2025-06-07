import React, { useEffect, useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Box } from '@mui/material';
import { TextField, Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';
import { set } from 'date-fns';
import ErrorIs from '../common/Error';
const URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setIsLoggedIn } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');

    if (jwt) {
      fetch(`${URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: jwt })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('認証に失敗しました');
          }
          return response.json();
        })
        .then((data) => {
          console.log('認証成功:', data);
          setIsAuthenticated(true); // 認証成功
          setIsLoggedIn(true); // グローバルステートも更新
        })
        .catch((error) => {
          console.error('認証エラー:', error);
          setError(error.message);
          setIsAuthenticated(false); // 認証失敗
        });
    }
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      alert('メールアドレスとパスワードは必須です');
      return;
    }

    fetch(`${URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('ログインに失敗しました');
        }
        return response.json();
      })
      .then((data) => {
        console.log('ログイン成功:', data);
        localStorage.setItem('jwt', data.token); // JWTを保存
        setIsAuthenticated(true); // 認証状態を更新
      })
      .catch((error) => {
        console.error('ログインエラー:', error);
        alert(error.message);
      });

    event.currentTarget.reset(); // フォームをリセット
  };

  const handleGoogleLogin = (credentialResponse: any) => {
    console.log('Googleログイン成功:', credentialResponse.credential);
    fetch(`${URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Googleログインに失敗しました');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Googleログイン成功:', data);
        localStorage.setItem('jwt', data.token); // JWTを保存
        setIsAuthenticated(true); // 認証状態を更新
        setIsLoggedIn(true); // グローバルステートも更新
      })
      .catch((error) => {
        console.error('Googleログインエラー:', error);
        alert(error.message);
      });
  };

  return (
    <Box sx={{ maxWidth: '400px', mx: 'auto', mt: 4 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
          ログイン
        </Typography>
        <TextField
          label="メールアドレス"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          name="email"
          required
        />
        <TextField
          label="パスワード"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          name="password"
          required
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          sx={{ mt: 2 }}
        >
          ログイン
        </Button>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          アカウントをお持ちでないですか？ <a href="/register">登録</a>
        </Typography>
      </form>

      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        またはGoogleでログイン
      </Typography>
      <GoogleOAuthProvider clientId="57851313624-4b5pejr838a4s33tttab7ac2td2gn5q0.apps.googleusercontent.com">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.error('Google login failed');
            }}
          />
        </Box>
      </GoogleOAuthProvider>
    </Box>
  );
};

export default Login;