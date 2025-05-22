import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Divider, TextField, Button } from '@mui/material';

interface Post {
  id: number;
  content: string;
  createdAt: string;
}

const Thread: React.FC = () => {
  const { threadId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    // TODO: スレッドの投稿を取得する処理を実装
    // 仮のデータを設定
    setPosts([
      { id: 1, content: '1番目の投稿です', createdAt: new Date().toISOString() },
      { id: 2, content: '2番目の投稿です', createdAt: new Date().toISOString() },
    ]);
  }, [threadId]);

  const handleSubmit = (e: React.FormEvent) => {  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
  
    const post: Post = {
      id: posts.length + 1, // 仮のID
      content: newPost,
      createdAt: new Date().toISOString(),
    };
  
    try {
      // サーバーに投稿を送信
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, ...post }),
      });
  
      if (!response.ok) {
        throw new Error('投稿の送信に失敗しました');
      }
  
      const savedPost = await response.json();
      setPosts([...posts, savedPost]); // サーバーから返された投稿を追加
      setNewPost('');
    } catch (error) {
      console.error(error);
      alert('投稿の送信に失敗しました');
    }
  };
    e.preventDefault();
    if (!newPost.trim()) return;

    // TODO: 新しい投稿を送信する処理を実装
    const post: Post = {
      id: posts.length + 1,
      content: newPost,
      createdAt: new Date().toISOString(),
    };
    setPosts([...posts, post]);
    setNewPost('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        スレッド #{threadId}
      </Typography>
      
      <Box mb={4}>
        {posts.map((post) => (
          <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {post.id}. {new Date(post.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body1">{post.content}</Typography>
          </Paper>
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
        <Button type="submit" variant="contained" color="primary">
          投稿する
        </Button>
      </Paper>
    </Box>
  );
};

export default Thread; 