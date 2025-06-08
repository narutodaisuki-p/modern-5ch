import React from 'react';
import { Box, Typography } from '@mui/material';

const NotFound: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      height="100vh"
      bgcolor="black"
      color="red"
    >
      <Typography variant="h1" style={{ fontFamily: 'Creepster, cursive' }}>
        404
      </Typography>
      <Typography variant="h4" style={{ fontFamily: 'Creepster, cursive' }}>
        ページが見つかりません
      </Typography>
      <Typography variant="body1" style={{ marginTop: '20px', textAlign: 'center' }}>
        闇の中に迷い込んでしまったようです...
      </Typography>
    </Box>
  );
};

export default NotFound;
