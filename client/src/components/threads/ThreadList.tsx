import React, { use, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { useAppContext } from '../../context/Appcontext';
import { useParams } from 'react-router-dom';
const URL = process.env.REACT_APP_API_URL;

interface Thread {
  _id: string;
  title: string;
  createdAt: string;
  imageUrl?: string;
  likes?: number;
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const { loading, setLoading, error, setError } = useAppContext();
  
  useEffect(() => {
    setLoading(true);
    axios.get(`${URL}/api/threads`)
      .then((response) => {
        setThreads(response.data);
      })
      .catch((error) => {
        console.error('スレッド一覧の取得に失敗:', error);
        setError('スレッド一覧の取得に失敗しました。');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null); // エラーを表示したらリセット
    }
  }, [threads]);

  const handleLike = async (threadId: string) => {
    try {
      const response = await axios.post(`${URL}/api/threads/${threadId}/like`);
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === threadId ? { ...thread, likes: response.data.likes } : thread
        )
      );
    } catch (error) {
      console.error('いいね処理に失敗しました:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">スレッド一覧</Typography>
        <Button
          component={Link}
          to="/create"
          variant="outlined"
          color="primary"
        >
          新規スレッド作成
        </Button>
      </Box>
      <List>
        {threads.map((thread) => (
          <Paper key={thread._id} sx={{ mb: 2 }}>
            <ListItem
              component={Link}
              to={`/thread/${thread._id}`}
              sx={{ textDecoration: 'none' ,
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(144, 202, 159, 0.1)',
                  color: 'primary.main',
                },
              }}
            >
              {/* 画像 */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '& img': {
                    width: '100%',
                    height: 'auto',
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover img': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {thread.imageUrl && (
                  <img
                    src={thread.imageUrl}
                    alt={thread.title}
                  />
                )}
              </Box>
              <ListItemText
                primary={thread.title}
                secondary={new Date(thread.createdAt).toLocaleString()}
  
                sx={{
                    '& .MuiTypography-root': {
        color: 'text.primary', // タイトルの色
      },
      '& .MuiTypography-body2': {
        color: 'text.secondary', // 日付の色
      },

                }}
              />
            </ListItem>

              <Button onClick={() => handleLike(thread._id)}
                sx={{ ml: 2, color: 'primary.main', backgroundColor: 'rgba(241, 15, 241, 0.1)' }}
              >
                ❤️ {thread.likes || 0} いいね
              </Button>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default ThreadList;