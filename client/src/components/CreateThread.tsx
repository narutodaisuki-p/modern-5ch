import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import axios, { Axios } from 'axios';
const API_URL = 'http://localhost:3000'; // APIのURLを指定




const CreateThread: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // TODO: スレッド作成のAPI呼び出しを実装
    console.log('新しいスレッドを作成:', { title, content });
    // ここでAPIを呼び出してスレッドを作成する処理を追加します。
    setLoading(true);
    axios.post(`${API_URL}/api/threads`, { title, content })
      .then((response) => {
        console.log('スレッド作成成功:', response.data);
        // スレッド作成後、スレッド一覧に戻る
        setLoading(false);
        navigate('/');
      })
      .catch((error) => {
        console.error('スレッド作成失敗:', error);
        // エラーハンドリングを追加することができます。


      });

    
    // 仮の実装：スレッド一覧に戻る
    navigate('/');

  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        新しいスレッドを作成
      </Typography>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="スレッドタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="最初の投稿内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={4}
          margin="normal"
          required
          variant="outlined"
        />

        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            スレッドを作成
          </Button>
          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{ ml: 2 }}
          >
            キャンセル
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateThread; 