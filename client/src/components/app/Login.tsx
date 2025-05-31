import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Box } from '@mui/material';
import { TextField, Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');

    if (jwt) {
      fetch('http://localhost:5000/auth/verify', {
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
        })
        .catch((error) => {
          console.error('認証エラー:', error);
          setIsAuthenticated(false); // 認証失敗
        });
    }
  }, []);

  if (isAuthenticated) {
    return (
      <>
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            あなたは既にログインしています。ダッシュボードに移動するか、ログアウトしてください。
          </Typography>
          
        </Container>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="contained" color="primary" component={Link} to="/dashboard">
            ダッシュボードへ
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => {
            localStorage.removeItem('jwt');
            setIsAuthenticated(false);
          }} sx={{ ml: 2 }}>
            ログアウト
          </Button>
        </Box>
      </>
    );
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

    fetch('http://localhost:5000/auth/login', {
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

  return (
    <GoogleOAuthProvider clientId="57851313624-4b5pejr838a4s33tttab7ac2td2gn5q0.apps.googleusercontent.com">
      <Box>
        <form action="" onSubmit={handleSubmit}>
          <h2>ログイン</h2>
          <TextField
            label="メールアドレス"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            name="email"
          />
          <TextField
            label="パスワード"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            name="password"
          />
          <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mt: 2 }}>
            ログイン
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            パスワードをお忘れですか？ <a href="/reset-password">リセット</a>
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            アカウントをお持ちでないですか？ <a href="/register">登録</a>
          </Typography>
        </form>

        <h3>またはGoogleでログイン</h3>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log('Google login successful:', credentialResponse);
          }}
          onError={() => {
            console.error('Google login failed');
          }}
        />
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;