import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const NotFound: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        background: 'radial-gradient(ellipse at center, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景の荒れた大地 */}
      <svg width="100%" height="40%" viewBox="0 0 1200 400" style={{ position: 'absolute', bottom: 0, zIndex: 0 }}>
        <path d="M0,350 Q200,320 400,370 Q600,290 800,350 Q1000,280 1200,330 L1200,400 L0,400 Z" fill="#2c3e50" />
        <path d="M0,360 Q150,340 300,365 Q450,310 600,355 Q750,300 900,345 Q1050,310 1200,340 L1200,400 L0,400 Z" fill="#34495e" opacity="0.7" />
      </svg>

      {/* 左側の戦士（須佐能乎風） */}
      <svg width="500" height="700" viewBox="0 0 500 700" style={{ position: 'absolute', left: '5%', bottom: '5%', zIndex: 2 }}>
        <defs>
          <linearGradient id="susanooBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6a1b9a" />
            <stop offset="100%" stopColor="#4527a0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* 下半身 */}
        <path d="M250,500 L200,700 L300,700 Z" fill="url(#susanooBody)" opacity="0.9" />
        
        {/* 肋骨状の装甲 */}
        <path d="M150,300 Q250,350 350,300 L350,400 Q250,450 150,400 Z" fill="none" stroke="#9c27b0" strokeWidth="8" opacity="0.8" />
        
        {/* 頭部 */}
        <circle cx="250" cy="200" r="60" fill="url(#susanooBody)" filter="url(#glow)" />
        
        {/* 仮面風デザイン */}
        <path d="M230,180 L270,180 M220,200 L280,200 M230,220 L270,220" stroke="#fff" strokeWidth="4" />
        
        {/* 写輪眼風（抽象化） */}
        <circle cx="250" cy="200" r="20" fill="#d32f2f" />
        <circle cx="250" cy="200" r="12" fill="#000" />
        <circle cx="250" cy="200" r="4" fill="#fff" />
        
        {/* 腕 */}
        <path d="M350,300 L450,250 L400,350 Z" fill="url(#susanooBody)" opacity="0.8" />
        <path d="M150,300 L50,250 L100,350 Z" fill="url(#susanooBody)" opacity="0.8" />
      </svg>

      {/* 右側のエネルギー球（尾獣玉風） */}
      <svg width="450" height="450" viewBox="0 0 450 450" style={{ position: 'absolute', right: '5%', bottom: '15%', zIndex: 2 }}>
        <defs>
          <radialGradient id="bijuudama" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#ffeb3b" />
            <stop offset="30%" stopColor="#ff9800" />
            <stop offset="70%" stopColor="#f44336" />
            <stop offset="100%" stopColor="#d32f2f" stopOpacity="0" />
          </radialGradient>
          <filter id="energyGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="225" cy="225" r="200" fill="url(#bijuudama)" filter="url(#energyGlow)" opacity="0.9" />
        <circle cx="225" cy="225" r="150" fill="url(#bijuudama)" opacity="0.7" />
        
        {/* エネルギー渦（抽象化） */}
        <path d="M225,25 Q325,100 225,175 Q125,100 225,25 Z" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
        <path d="M225,75 Q300,125 225,200 Q150,125 225,75 Z" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* 衝突エフェクト */}
      <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 1 }}>
        <defs>
          <radialGradient id="impact" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="35%" fill="url(#impact)" style={{ mixBlendMode: 'screen' }} />
      </svg>

      {/* メインテキスト */}
      <Typography variant="h1" sx={{ 
        fontSize: '9rem', 
        fontFamily: '"Impact", sans-serif', 
        color: 'transparent', 
        background: 'linear-gradient(45deg, #ff5722, #ffeb3b, #ff5722)',
        backgroundClip: 'text',
        zIndex: 3, 
        textShadow: '0 0 20px rgba(255,87,34,0.7)',
        mb: 2,
        letterSpacing: '0.1em'
      }}>
        404
      </Typography>
      
      <Typography variant="h4" sx={{ 
        fontSize: '2.8rem',
        fontFamily: '"Arial Narrow", sans-serif', 
        color: '#fff', 
        zIndex: 3, 
        textShadow: '0 0 15px rgba(0,0,0,0.8)',
        mb: 4,
        letterSpacing: '0.2em'
      }}>
        DIMENSIONAL COLLAPSE
      </Typography>
      
      <Typography variant="body1" sx={{ 
        fontSize: '1.4rem',
        color: 'rgba(255,255,255,0.9)', 
        zIndex: 3, 
        textAlign: 'center',
        maxWidth: '700px',
        mb: 4,
        lineHeight: 1.8
      }}>
        The page you seek has been obliterated by
        <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}> cosmic-scale chakra</span> collision
      </Typography>
      
      <Button 
        href="/" 
        variant="contained" 
        sx={{ 
          zIndex: 3,
          background: 'linear-gradient(45deg, #7b1fa2 0%, #4527a0 100%)',
          color: 'white',
          fontSize: '1.3rem',
          padding: '16px 48px',
          borderRadius: '4px',
          boxShadow: '0 0 25px rgba(123,31,162,0.6)',
          '&:hover': {
            background: 'linear-gradient(45deg, #8e24aa 0%, #512da8 100%)',
            boxShadow: '0 0 30px rgba(142,36,170,0.8)'
          },
          transition: 'all 0.3s'
        }}
      >
        現在の次元に急いで戻るべきです
      </Button>
    </Box>
  );
};

export default NotFound;