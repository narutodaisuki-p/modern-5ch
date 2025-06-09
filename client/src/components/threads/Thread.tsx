import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, TextField } from '@mui/material';
import { fetchPosts } from '../../api/apiClient';
import { useAppContext } from '../../context/Appcontext';
import ErrorIs from '../common/Error';
import NinjaHackerButton from '../common/NinjaHackerButton';
import { ht } from 'date-fns/locale';
import { socket } from '../../socket';

const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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
        src={post.imageUrl}
        alt="Post"
        style={{ maxWidth: '100%', marginTop: '10px' }}
      />
    )}
    <button
      style={{
        background: 'transparent',
        color: '#b71c1c',
        border: '1px solid #e57373',
        borderRadius: '4px',
        fontSize: '0.8rem',
        width: '38px', // 余裕を持たせる
        height: '26px',
        minWidth: 0,
        minHeight: 0,
        padding: '1px 0', // 横paddingを減らす
        marginLeft: '8px',
        cursor: 'pointer',
        fontFamily: '"Noto Sans JP", "Noto Sans", monospace',
        opacity: 0.7,
        transition: 'background 0.2s, color 0.2s, opacity 0.2s',
        letterSpacing: '0.05em',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
      onMouseOver={e => (e.currentTarget.style.opacity = '1')}
      onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
      onFocus={e => (e.currentTarget.style.opacity = '1')}
      onBlur={e => (e.currentTarget.style.opacity = '0.7')}
      onClick={() => onReport(post._id)}
      aria-label="投稿を報告"
    >
      報告
    </button>
  </Paper>
));

const Thread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const { setLoading, setError } = useAppContext();
  const [loading, setLoadingState] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null); // 修正: setErrorStateの定義
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
    setErrorState(errorState); // 修正: errorStateを使用
  }, [loading, errorState, setLoading]);

  useEffect(() => {
    if (!threadId) return;
    socket.connect();
    socket.emit('joinThread', threadId);
    socket.on('newPost', (post: Post) => {
      setPosts((prev) => [...prev, post]);
    });
    socket.on('postError', (msg: string) => {
      setErrorState(msg);
      setTimeout(() => setErrorState(null), 3000);
    });
    return () => {
      socket.off('newPost');
      socket.off('postError');
      socket.disconnect();
    };
  }, [threadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    if (selectedFile) {
      // 画像がある場合はbase64で送信＋JWTトークンも送信
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const token = localStorage.getItem('jwt');
        socket.emit('newPost', { threadId, content: newPost, image: base64, token });
        setNewPost('');
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      socket.emit('newPost', { threadId, content: newPost });
      setNewPost('');
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

  const memoizedOnReport = useCallback((postId: number, content: string) => {
    handleReport(postId, content);
  }, [handleReport]);

  return (
    <Box>
      {errorState && <ErrorIs message={errorState} />} {/* 修正: errorStateを使用 */}
      {loading && <Typography variant="h6">読み込み中...</Typography>}
      <Typography variant="h4" gutterBottom>
        スレッド ログインしてないなら画像投稿はできません
      </Typography>
      

      <Box mb={4}>
        {posts.map((post) => (
          <PostItem
            key={post._id}
            post={post}
            onReport={() => memoizedOnReport(post._id, post.content)}
          />
        ))}
      </Box>
      <Typography variant="h5" gutterBottom>
        新しい投稿
      </Typography>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="投稿内容を入力してください"
          required
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
        {selectedFile && (
          <Box sx={{ mb: 2 }}>
            <img
              src={window.URL.createObjectURL(selectedFile)}
              alt="Selected"
              style={{ maxWidth: '50%', marginTop: '10px' }}
            />
          </Box>
        )}

        <NinjaHackerButton type="submit" label="投稿する" variant="outlined" color="primary" sx={{ fontFamily: '"Noto Sans JP", "Noto Sans", monospace' }} />
      </Paper>
    </Box>
  );
};

export default Thread;