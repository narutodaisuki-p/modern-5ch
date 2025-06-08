import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, MenuItem } from '@mui/material';
import { useAppContext } from '../../context/Appcontext';
import Loading from '../common/Loading';
import { getCategories } from '../../api/apiClinet';
import Error from '../common/Error';

const URL = process.env.REACT_APP_API_URL;

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
  const [image, setImage] = useState<File | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', selectedCategory);
      if (image) {
        formData.append('image', image);
      }

      await axios.post(`${URL}/api/threads`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt') || ''}`,
        },
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
          label="スレッドタイトル(3文字以上100文字以下)"
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
        <TextField
          type="file"
          fullWidth
          onChange={handleImageChange}
          margin="normal"
          variant="outlined"
          inputProps={{ accept: 'image/*' }}
        />
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