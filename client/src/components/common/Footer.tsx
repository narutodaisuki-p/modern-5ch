import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => (
  <Box component="footer" sx={{
    width: '100%',
    py: 3,
    mt: 8,
    background: 'linear-gradient(90deg, #16232d 60%, #1a2e2e 100%)',
    borderTop: '1.5px solid #26c6da',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  }}>
    <Typography variant="body2" sx={{ color: '#26c6da', fontWeight: 700, mb: 1 }}>
      © {new Date().getFullYear()} modern-5ch / Powered by DigitalOcean
    </Typography>
    <a href="https://www.digitalocean.com/?refcode=0418bda7e8fb&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge">
      <img src="https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg" alt="DigitalOcean Referral Badge" />
    </a>
  </Box>
);

export default Footer;