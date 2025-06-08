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
    <Box sx={{ maxWidth: 540, mx: 'auto', mt: 4, mb: 6 }}>
      {error && <Error message={error} />}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 900,
          letterSpacing: 2,
          color: '#26c6da', // 落ち着いた青
          textAlign: 'center',
          mb: 2,
          textShadow: '0 2px 8px #00968888, 0 0px 4px #43a04788',
        }}
      >
        新しいスレッドを作成
        {categories === null && (
          <Button onClick={handleRetry} variant="outlined" sx={{ mt: 1, ml: 2, borderColor: '#26c6da', color: '#26c6da', fontWeight: 700 }}>
            再試行
          </Button>
        )}
      </Typography>
      {loading && <Loading />}

      {!loading && !error && !categories && (
        <Typography variant="body1" color="#26c6da" sx={{ textAlign: 'center', mb: 2, fontWeight: 700 }}>
          カテゴリを読み込んでいます...
        </Typography>
      )}

      <Paper
        elevation={4}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: '0 0 16px #00968844, 0 0 4px #43a04744',
          background: 'linear-gradient(120deg, #16232d 60%, #1a2e2e 100%)',
          border: '1.5px solid #26c6da',
        }}
      >
        <TextField
          fullWidth
          label="スレッドタイトル(3文字以上100文字以下)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          variant="outlined"
          inputProps={{ maxLength: 100 }}
          sx={{
            background: '#1a2633',
            borderRadius: 2,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontWeight: 700,
              fontSize: 18,
              color: '#26c6da',
              borderColor: '#26c6da',
              '& fieldset': { borderColor: '#26c6da' },
              '&:hover fieldset': { borderColor: '#43a047' },
              '&.Mui-focused fieldset': { borderColor: '#43a047' },
            },
            '& .MuiInputLabel-root': {
              color: '#26c6da',
              fontWeight: 700,
            },
          }}
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
          rows={5}
          margin="normal"
          required
          variant="outlined"
          sx={{
            background: '#1a2633',
            borderRadius: 2,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontSize: 16,
              color: '#26c6da',
              borderColor: '#26c6da',
              '& fieldset': { borderColor: '#26c6da' },
              '&:hover fieldset': { borderColor: '#43a047' },
              '&.Mui-focused fieldset': { borderColor: '#43a047' },
            },
            '& .MuiInputLabel-root': {
              color: '#26c6da',
              fontWeight: 700,
            },
          }}
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          margin="normal"
          variant="outlined"
          disabled={!categories || loading}
          sx={{
            background: '#1a2633',
            borderRadius: 2,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#26c6da',
              borderColor: '#26c6da',
              '& fieldset': { borderColor: '#26c6da' },
              '&:hover fieldset': { borderColor: '#43a047' },
              '&.Mui-focused fieldset': { borderColor: '#43a047' },
            },
            '& .MuiInputLabel-root': {
              color: '#26c6da',
              fontWeight: 700,
            },
          }}
        >
          {!categories ? (
            <MenuItem value="" disabled>
              読み込み中...
            </MenuItem>
          ) : (
            categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id} sx={{ fontWeight: cat.name === 'general' ? 700 : 400, color: '#26c6da', background: 'transparent', '&:hover': { color: '#43a047', background: '#16232d' } }}>
                {cat.name}
              </MenuItem>
            ))
          )}
        </TextField>
        {/* 画像アップロードカスタムUI */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              borderStyle: 'dashed',
              borderColor: '#26c6da',
              color: image ? '#43a047' : '#26c6da',
              fontWeight: 700,
              py: 2,
              borderRadius: 2,
              background: '#1a2633',
              letterSpacing: 1,
              fontSize: 16,
              '&:hover': { background: '#1a2e2e', borderColor: '#43a047', color: '#43a047' },
              boxShadow: image ? '0 0 8px #43a04788' : 'none',
              transition: 'all 0.2s',
            }}
            startIcon={<span role="img" aria-label="画像">🖼️</span>}
          >
            {image ? `画像選択済: ${image.name}` : '画像を選択 (任意)'}
            <input
              type="file"
              hidden
              onChange={handleImageChange}
              accept="image/*"
            />
          </Button>
        </Box>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {/* NinjaHackerButton風の作成ボタン（色を落ち着かせる） */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={
              <span style={{ display: 'inline-block', marginRight: 2 }}>
                <svg width="28" height="28" viewBox="0 0 48 48"><polygon points="24,4 29,19 44,24 29,29 24,44 19,29 4,24 19,19" fill="#26c6da" stroke="#43a047" strokeWidth="2"/><circle cx="24" cy="24" r="5" fill="#16232d" stroke="#43a047" strokeWidth="1.2"/><path d="M24 19 a5 5 0 1 1 -4.9 6" stroke="#009688" strokeWidth="1.2" fill="none"/><path d="M24 21 a3 3 0 1 1 -2.9 3.5" stroke="#43a047" strokeWidth="1" fill="none"/></svg>
              </span>
            }
            sx={{
              background: 'linear-gradient(90deg, #16232d 60%, #26c6da 100%)',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '12px',
              boxShadow: '0 0 8px #26c6da88, 0 0 2px #43a04788',
              letterSpacing: 2,
              textTransform: 'none',
              px: 4,
              py: 1.2,
              fontSize: 18,
              border: '1.5px solid #43a047',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #1a2e2e 60%, #43a047 100%)',
                boxShadow: '0 0 16px #43a04788, 0 0 6px #26c6da88',
                filter: 'brightness(1.05) contrast(1.1)',
                borderColor: '#43a047',
                color: '#fff',
              },
            }}
          >
            <span style={{ fontWeight: 900, letterSpacing: 2, textShadow: '0 0 4px #26c6da88, 0 0 1px #43a04788' }}>スレッドを作成</span>
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/categories')}
            sx={{
              color: '#26c6da',
              borderColor: '#26c6da',
              fontWeight: 700,
              borderRadius: '12px',
              px: 4,
              py: 1.2,
              fontSize: 18,
              background: '#1a2633',
              '&:hover': {
                background: '#1a2e2e',
                borderColor: '#43a047',
                color: '#43a047',
              },
            }}
          >
            キャンセル
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateThread;