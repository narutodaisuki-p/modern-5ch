import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { useAppContext } from '../../context/Appcontext';
import { useParams } from 'react-router-dom';

interface Thread {
  _id: string;
  title: string;
  createdAt: string;
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const { loading, setLoading, error, setError } = useAppContext();
  
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/threads')
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
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default ThreadList; 