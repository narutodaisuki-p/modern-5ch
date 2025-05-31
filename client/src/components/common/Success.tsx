import { Box } from '@mui/material'
import React from 'react'

const Success = ({ message }: { message: string }) => {

  return (
    <Box>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <p>{message}</p>
        </Box>
    </Box>
  )
}

export default Success
