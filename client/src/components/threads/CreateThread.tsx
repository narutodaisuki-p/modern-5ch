import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, MenuItem } from '@mui/material';
import { useAppContext } from '../../context/Appcontext';
import Loading from '../common/Loading';
import { getCategories } from '../../api/apiClinet';
import Error from '../common/Error';

const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Category {
  _id: string;
  name: string;
}
const CreateThread: React.FC = () => {
  const navigate = useNavigate();
  const { loading, setLoading, error, setError } = useAppContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      await getCategories(setCategories, setLoading, setError);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories) {
      const generalCategory = categories.find((cat) => cat.name === 'general');
      if (generalCategory) {
        setSelectedCategory(generalCategory._id); // "general" の _id を設定
        console.log('General category found:', generalCategory);
      }
    }
  }, [categories]); // categories の変更を監視

  const handleRetry = () => {
    setCategories(null);
    getCategories(setCategories, setLoading, setError);
  };

  // eは使わずonSubmitでpreventDefaultするのでここはシンプルに
  const handleSubmit = async () => {
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容を入力してください。');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${URL}/api/threads`, {
        title,
        content,
        category: selectedCategory,
      });

      navigate(`/categories/${selectedCategory}`);
    } catch (err) {
      console.error('スレッド作成失敗:', err);
      setError('スレッドの作成に失敗しました。');
      if (axios.isAxiosError(err) && err.response) {
        setError(`エラー: ${err.response.data.message || '不明なエラー'}`);
      } else {
        setError('ネットワークエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && <Error message={error} />}
      <Typography variant="h4" gutterBottom>
        新しいスレッドを作成
        {categories === null && (
          <Button onClick={handleRetry} variant="outlined" sx={{ mt: 1 }}>
            再試行
          </Button>
        )}
      </Typography>
      {loading && <Loading />}

      {!loading && !error && !categories && (
        <Typography variant="body1" color="text.secondary">
          カテゴリを読み込んでいます...
        </Typography>
      )}

      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        sx={{ p: 4 }}
      >
        <TextField
          fullWidth
          label="スレッドタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
                />
                <TextField
  select
  fullWidth
  label="カテゴリー"
  value={selectedCategory}  //generalのidをデフォルトに設定
  onChange={(e) => setSelectedCategory(e.target.value)}
  margin="normal"
  variant="outlined"
  disabled={!categories || loading}
>
  {!categories ? (
    <MenuItem value="" disabled>
      読み込み中...
    </MenuItem>
  ) : (
    categories.map((cat) => (
      <MenuItem key={cat._id} value={cat._id}>
        {cat.name}
      </MenuItem>
    ))
  )}
</TextField>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="outlined" size="large">
            スレッドを作成
          </Button>
          <Button variant="text" onClick={() => navigate('/categories')} sx={{ ml: 2 }}>
            キャンセル
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateThread;