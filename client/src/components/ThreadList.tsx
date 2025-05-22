import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

interface Thread {
  id: number;
  title: string;
  createdAt: string;
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    // TODO: スレッド一覧を取得する処理を実装
    setThreads([
      { id: 1, title: 'はじめてのスレッド', createdAt: new Date().toISOString() },
      { id: 2, title: '2番目のスレッド', createdAt: new Date().toISOString() },
    ]);
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