import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';


const Header: React.FC = () => {
  const { category } = useAppContext();

  
  return (
    <AppBar position="static" sx={{ mb: 2,width: '100%' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          じゃっぱん
        </Typography>
        <Box>
          <Button
            color="primary"
            component={RouterLink}
            to="/create"
            sx={{ fontWeight: 'bold' }}
          >
            スレッド作成
          </Button>
        </Box>
      </Toolbar>
      <Toolbar>
        <Typography variant="body1">
          現在のカテゴリー:　{category}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 