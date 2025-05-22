import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useAppContext } from '../../context/Appcontext'; // 修正済み
import { useParams } from 'react-router-dom';
import Loading from '../common/Loading'; // 修正済み


const CreateThread: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { loading, setLoading, error, setError } = useAppContext(); // 修正済み
  const { threadId } = useParams(); // 修正済み


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容を入力してください。');
      return;
    }

    setLoading(true);
    setError(null); // エラーをリセット
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        新しいスレッドを作成
      </Typography>
      {loading && <Loading />}
      {error && (
        <Typography color="error" variant="body1" gutterBottom>
          {error}
        </Typography>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
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
        {/*  カテゴリーの選択 */}
        <TextField
          fullWidth
          label="カテゴリー"
          select
          SelectProps={{
            native: true,
          }}
          margin="normal"
          variant="outlined"
        >
          <option value="general">一般</option>
          <option value="news">ニュース</option>
          <option value="tech">技術</option>
          <option value="other">その他</option>
        </TextField>
        

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