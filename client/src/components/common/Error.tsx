import React from 'react'
import { Box, Typography } from '@mui/material'

const Error: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <Box>
      <Typography color="error" variant="body1" gutterBottom>
        {message || 'エラーが発生しました。もう一度お試しください。'}
      </Typography>
    </Box>
  )
}

export default Error