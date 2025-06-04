import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { fetchPosts } from '../../api/apiClinet';
import { useAppContext } from '../../context/Appcontext';
import ErrorIs from '../common/Error';
import { ht } from 'date-fns/locale';
const URL = process.env.REACT_APP_API_URL || 'https://localhost:5000';
interface Post {
  _id: number;
  content: string;
  createdAt: string;
  number: number;
  threadId?: number;
  imageUrl?: string;
}

const PostItem = React.memo(({ post, onReport }: { post: Post; onReport: (id: number) => void }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {post.number}. {new Date(post.createdAt).toLocaleString()}
    </Typography>
    <Typography variant="body1">{post.content}</Typography>
    {post.imageUrl && (
      <img
        src={`${URL}${post.imageUrl}`}
        alt="Post"
        style={{ maxWidth: '100%', marginTop: '10px' }}
      />
    )}
    <Button
      variant="outlined"
      color="error"
      sx={{ ml: 2 }}
      onClick={() => onReport(post._id)}
    >
      報告する
    </Button>
  </Paper>
));

const Thread: React.FC = () => {
  const { threadId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const { setLoading, setError } = useAppContext();
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadPosts = useCallback(async () => {
    if (!threadId) return;
    await fetchPosts(threadId, setPosts, setLoadingState, setErrorState);
  }, [threadId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    setLoading(loading);
    setError(error);
  }, [loading, error, setLoading, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() ) return;

    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('image', selectedFile ?? '');

    try {
      const response = await fetch(`${URL}/api/threads/${threadId}/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt') || ''}`,
        },
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('投稿の送信に失敗しました');

      const savedPost = await response.json();
      setPosts((prevPosts) => [...prevPosts, savedPost]);
      setNewPost('');
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setErrorState('投稿の送信に失敗しました');
      setTimeout(() => setErrorState(null), 3000);
    }
  };

  const handleReport = useCallback(async (postId: number, content: string) => {
    if (!threadId) return;

    try {
      const response = await fetch(`${URL}/api/threads/${threadId}/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`通報の送信に失敗しました: ${errorData.message}`);
      
       setErrorState(`通報の送信に失敗しました: ${errorData.message}`);
       setTimeout(() => setErrorState(null), 1000); // 1秒後にエラーメッセージをクリア
        throw new Error(`通報の送信に失敗しました: ${errorData.message}`);
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      alert('通報が送信されました');
    } catch (error) {
      console.error(error);
    }
  }, [threadId]);

  return (
    <Box>
      {error && <ErrorIs message={error} />}
      {loading && <Typography variant="h6">読み込み中...</Typography>}
      <Typography variant="h4" gutterBottom>
        スレッド #{threadId}
      </Typography>

      <Box mb={4}>
        {posts.map((post) => (
          console.log("post",post),
          <PostItem key={post._id} post={post} onReport={() =>{
            handleReport(post._id, post.content);
          }} />
        ))}
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="投稿内容を入力してください"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          style={{ display: 'block', marginBottom: '10px' }}
          aria-label="画像を選択"
        />
        {/* 画像を表示 */}
        {selectedFile && (
          <Box sx={{ mb: 2 }}>
            <img
              src={window.URL.createObjectURL(selectedFile)}
              alt="Selected"
              style={{ maxWidth: '50%', marginTop: '10px' }}
            />
          </Box>
          
        )}

        <Button type="submit" variant="outlined" color="primary">
          投稿する
        </Button>
      </Paper>
    </Box>
  );
};

export default Thread;