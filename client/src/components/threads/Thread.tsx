import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Divider, TextField, Button } from '@mui/material';
import {fetchPosts } from '../../api/apiClinet'; // APIから投稿を取得する関数をインポート
import {useAppContext  } from '../../context/Appcontext'; // コンテキストをインポート


interface Post {
  id: number;
  content: string;
  createdAt: string;
  number: number;
  threadId?: number;
  
}


const Thread: React.FC = () => {
  const { threadId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const { setLoading, setError } = useAppContext(); // コンテキストから関数を取得

  
  useEffect(() => {
    if (!threadId) return;

    fetchPosts(threadId, setPosts, setLoading, setError); // 投稿を取得する関数を呼び出す
  }, [threadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
  

    try {
      // サーバーに投稿を送信
      const response = await fetch(`http://localhost:5000/api/threads/${threadId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId,content: newPost }),
      });
  
      if (!response.ok) {
        console.error('投稿の送信に失敗:', response);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        スレッド #{threadId}
      </Typography>
      
      <Box mb={4}>
        {posts.map((post) => (
          <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {post.number}. {new Date(post.createdAt).toLocaleString()}
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
        <Button type="submit" variant="outlined" color="primary" onClick={handleSubmit}>
          投稿する
        </Button> 
      </Paper>
    </Box>
  );
};

export default Thread; 