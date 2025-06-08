// src/components/categories/CategoryLayout.jsx
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AppProvider } from '../../context/Appcontext';
import Header from '../common/Header';
import { Box } from '@mui/material';


const CategoryLayout: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  return (
    <AppProvider categoryId={categoryId}>
      <Box sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top left, #181a20 60%, #0ff 120%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Header />
        {/* サイバー忍者装飾（うずまきSVG） */}
        <svg width="120" height="120" viewBox="0 0 60 60" style={{ position: 'absolute', left: 24, top: 12, opacity: 0.12, zIndex: 0 }}>
          <circle cx="30" cy="30" r="24" stroke="#0ff" strokeWidth="3" fill="none" />
          <path d="M30 12 a18 18 0 1 1 -0.1 0" stroke="#39ff14" strokeWidth="2" fill="none" />
        </svg>
        {/* 子 Route (<Category>) がここに出る */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </AppProvider>
  );
};
export default CategoryLayout;