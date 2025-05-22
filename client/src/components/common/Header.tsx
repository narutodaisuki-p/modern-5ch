import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
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
            color="inherit"
            component={RouterLink}
            to="/create"
            sx={{ fontWeight: 'bold' }}
          >
            スレッド作成
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 