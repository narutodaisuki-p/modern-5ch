import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { useAppContext } from '../../context/Appcontext';
import { useParams } from 'react-router-dom';

interface Thread {
  id: number;
  title: string;
  createdAt: string;
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const { loading, setLoading, error, setError } = useAppContext();
  const { threadId } = useParams();
  
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
          variant="contained"
          color="primary"
        >
          新規スレッド作成
        </Button>
      </Box>

      <List>
        {threads.map((thread) => (
          <Paper key={thread.id} sx={{ mb: 2 }}>
            <ListItem
              component={Link}
              to={`/thread/${thread.id}`}
              sx={{ textDecoration: 'none' }}
            >
              <ListItemText
                primary={thread.title}
                secondary={new Date(thread.createdAt).toLocaleString()}
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default ThreadList; 