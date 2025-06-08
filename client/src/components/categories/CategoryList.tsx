import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';
import { getCategories } from '../../api/apiClinet'; // APIからカテゴリを取得する関数をインポート
import NinjaHackerButton from '../common/NinjaHackerButton';

const CategoryList: React.FC = () => {
  const {  setLoading, setError, } = useAppContext();
  const [categories, setCategories] = React.useState<any[]>([]); // カテゴリの状態を管理

  React.useEffect(() => {
    getCategories(setCategories, setLoading, setError);
  }, []);

  return (
    <Box sx={{
      background: 'linear-gradient(120deg, #181a20 60%, #0ff 100%)',
      borderRadius: 4,
      boxShadow: '0 0 32px #0ff4, 0 0 8px #39ff144',
      color: '#fff',
      mt: 4,
      mb: 4,
      px: { xs: 1, md: 4 },
      py: { xs: 2, md: 4 },
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* タイトル＋手裏剣SVG＋グリッチ */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <svg width="40" height="40" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
          <polygon points="24,4 28,20 44,24 28,28 24,44 20,28 4,24 20,20" fill="#111" stroke="#39ff14" strokeWidth="2" />
          <circle cx="24" cy="24" r="4" fill="#0ff" />
        </svg>
        <Typography variant="h4" gutterBottom sx={{
          fontWeight: 900,
          letterSpacing: 2,
          color: '#39ff14',
          textShadow: '0 0 12px #0ff, 0 0 4px #181a20',
          fontFamily: 'monospace',
          filter: 'drop-shadow(0 0 8px #0ff)'
        }}>
          <span className="ninja-hacker-glitch">カテゴリ一覧</span>
        </Typography>
      </Box>
      <List sx={{ mt: 2 }}>
        {categories.map((category) => (
          <ListItem key={category._id} disablePadding sx={{ mb: 2 }}>
            <NinjaHackerButton
              label={category.name}
              component={Link}
              to={`/categories/${category._id}`}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                fontSize: '1.1rem',
                mb: 1,
                background: 'linear-gradient(90deg, #181a20 60%, #0ff 100%)',
                color: '#fff',
                border: '2px solid #39ff14',
                boxShadow: '0 0 12px #0ff8',
                '&:hover': {
                  background: 'linear-gradient(90deg, #222 60%, #39ff14 100%)',
                  color: '#ffd700',
                  borderColor: '#ffd700',
                  boxShadow: '0 0 32px #39ff14, 0 0 12px #0ff',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
      {/* グリッチアニメ用スタイル */}
      <style>{`
        .ninja-hacker-glitch {
          position: relative;
          display: inline-block;
        }
        .ninja-hacker-glitch:hover {
          animation: ninja-glitch 0.4s linear 1;
        }
        @keyframes ninja-glitch {
          0% { text-shadow: 2px 0 #0ff, -2px 0 #39ff14; }
          20% { text-shadow: -2px 0 #0ff, 2px 0 #39ff14; }
          40% { text-shadow: 2px 2px #0ff, -2px -2px #39ff14; }
          60% { text-shadow: -2px 2px #0ff, 2px -2px #39ff14; }
          80% { text-shadow: 0 0 12px #ffd700, 0 0 8px #0ff; }
          100% { text-shadow: none; }
        }
      `}</style>
    </Box>
  );
};


export default CategoryList;