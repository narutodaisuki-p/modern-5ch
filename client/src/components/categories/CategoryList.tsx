import React from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';
import { getCategories } from '../../api/apiClient';

import NinjaHackerButton from '../common/NinjaHackerButton';


const CategoryList: React.FC = () => {
  const { setLoading, setError } = useAppContext();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [cut, setCut] = React.useState(false);
  const [hideTitle, setHideTitle] = React.useState(false);
  const [shurikenDance, setShurikenDance] = React.useState(false);
  const [shurikenArray, setShurikenArray] = React.useState<any[]>([]);

  React.useEffect(() => {
    getCategories(setCategories, setLoading, setError);
  }, [setLoading, setError]);

  // 刀で斬る処理 (Katana cutting process)
  const handleKatanaCut = () => {
    if (cut || hideTitle) return;
    setCut(true);
    setTimeout(() => {
      setHideTitle(true);
      setCut(false);
    }, 900);
  };

  // 手裏剣乱舞を発生させる
  const triggerShurikenDance = () => {
    if (shurikenDance) return;
    // 5〜8個の手裏剣をランダム生成
    const count = Math.floor(Math.random() * 4) + 5;
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: i + '-' + Date.now(),
      left: Math.random() * 80 + 5, // 5%〜85%
      top: Math.random() * 60 + 10, // 10%〜70%
      rotate: Math.random() * 360,
      duration: Math.random() * 0.6 + 1.1, // 1.1〜1.7s
      delay: Math.random() * 0.3,
      scale: Math.random() * 0.5 + 0.8, // 0.8〜1.3
    }));
    setShurikenArray(arr);
    setShurikenDance(true);
    setTimeout(() => {
      setShurikenDance(false);
      setShurikenArray([]);
    }, 1700);
  };

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
      {/* タイトル＋手裏剣SVG＋グリッチ (Title + Katana SVG + Glitch) */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 120 80" 
          style={{ 
            cursor: 'pointer', 
            marginRight: 18, 
            transition: 'transform 0.3s', 
            transform: cut ? 'rotate(-30deg) scale(2.2)' : 'scale(1.9)'
          }} 
          onClick={handleKatanaCut}
        >
          {/* 刀身 */}
          <rect x="40" y="36" width="60" height="8" rx="4" fill="#e0e0e0" stroke="#aaa" strokeWidth="2" />
          {/* 刃の光 */}
          <rect x="40" y="36" width="60" height="4" rx="2" fill="#fff" opacity="0.7" />
          {/* 刀の先端 */}
          <polygon points="100,36 116,40 100,44" fill="#fff" stroke="#aaa" strokeWidth="2" />
          {/* 鍔（つば） */}
          <ellipse cx="40" cy="40" rx="5" ry="10" fill="#bfa76f" stroke="#8a6914" strokeWidth="2" />
          {/* 柄（つか） */}
          <rect x="18" y="34" width="22" height="12" rx="6" fill="#2a2a2a" stroke="#666" strokeWidth="2" />
          {/* 柄の装飾 */}
          <rect x="22" y="36" width="4" height="8" rx="2" fill="#c0a060" stroke="#8a6914" strokeWidth="1" />
          <rect x="28" y="36" width="4" height="8" rx="2" fill="#c0a060" stroke="#8a6914" strokeWidth="1" />
          <rect x="34" y="36" width="4" height="8" rx="2" fill="#c0a060" stroke="#8a6914" strokeWidth="1" />
          <defs>
            <filter id="katana-shadow" x="0" y="0" width="120" height="80">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
            </filter>
          </defs>
        </svg>
        
        {!hideTitle && (
          <Typography variant="h4" gutterBottom sx={{
            fontWeight: 900,
            letterSpacing: 2,
            color: '#39ff14',
            textShadow: '0 0 12px #0ff, 0 0 4px #181a20',
            fontFamily: 'monospace',
            filter: 'drop-shadow(0 0 8px #0ff)',
            position: 'relative',
          }}>
            <span className={`ninja-hacker-glitch${cut ? ' katana-cut' : ''}`}>
              {cut ? '斬！' : 'カテゴリ一覧'}
            </span>
            {cut && (
              <svg 
                className="katana-slash-effect" 
                width="180" 
                height="48" 
                viewBox="0 0 180 48" 
                style={{ position: 'absolute', left: -20, top: 10 }}
              >
                <path 
                  d="M20 24 Q90 0 160 24 Q90 48 20 24" 
                  fill="none" 
                  stroke="#fff" 
                  strokeWidth="7" 
                  filter="url(#glow)" 
                />
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>
            )}
          </Typography>
        )}
      </Box>

      <List sx={{ mt: 2 }}>
        {categories.map((category) => (
          <ListItem key={category._id} disablePadding sx={{ mb: 2 }}>
            <NinjaHackerButton
              label={category.name}
              component={Link}
              to={`/categories/${category._id}`}
              onMouseEnter={() => { triggerShurikenDance(); }}
              onTouchStart={() => { triggerShurikenDance(); }}
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

      {/* 手裏剣乱舞エフェクト */}
      {shurikenDance && shurikenArray.map((s) => (
        <svg
          key={s.id}
          className="shuriken-dance"
          width={36 * s.scale}
          height={36 * s.scale}
          viewBox="0 0 36 36"
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            pointerEvents: 'none',
            zIndex: 20,
            animation: `shuriken-fly ${s.duration}s cubic-bezier(.6,1.5,.4,1) ${s.delay}s both`,
            transform: `rotate(${s.rotate}deg) scale(${s.scale})`,
            filter: 'drop-shadow(0 0 8px #0ff) drop-shadow(0 0 2px #39ff14)'
          }}
        >
          <polygon points="18,2 22,14 34,18 22,22 18,34 14,22 2,18 14,14" fill="#fff" stroke="#39ff14" strokeWidth="2" />
          <circle cx="18" cy="18" r="3" fill="#0ff" stroke="#39ff14" strokeWidth="1" />
        </svg>
      ))}

      {/* グリッチアニメ用スタイル (Glitch animation styles) */}
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
        
        .katana-cut {
          animation: katana-cut-glitch 0.7s cubic-bezier(.4,2,.6,.8);
          color: #fff;
          text-shadow: 0 0 32px #0ff, 0 0 16px #39ff14, 0 0 48px #ffd700;
        }
        
        @keyframes katana-cut-glitch {
          0% { opacity: 1; filter: blur(0); }
          30% { opacity: 0.7; filter: blur(2px); transform: skewX(-10deg) scaleY(1.1); }
          60% { opacity: 0.3; filter: blur(5px); transform: skewX(10deg) scaleY(0.9); }
          100% { opacity: 0; filter: blur(12px); transform: scaleY(0.7); }
        }
        
        .katana-slash-effect {
          animation: slash-appear 0.9s ease-out;
          pointer-events: none;
        }
        
        @keyframes slash-appear {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotate(-45deg); 
          }
          30% { 
            opacity: 1; 
            transform: scale(1.2) rotate(0deg); 
          }
          100% { 
            opacity: 0; 
            transform: scale(1.5) rotate(15deg); 
          }
        }

        .shuriken-dance {
          opacity: 0;
          will-change: transform, opacity;
          /* モバイル対応: 画面幅に応じてサイズ調整 */
          @media (max-width: 600px) {
            width: 24px !important;
            height: 24px !important;
          }
        }
        @keyframes shuriken-fly {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(0deg) translateY(0);
          }
          10% {
            opacity: 1;
          }
          60% {
            opacity: 1;
            transform: scale(1.1) rotate(360deg) translateY(-30px);
          }
          100% {
            opacity: 0;
            transform: scale(1.3) rotate(720deg) translateY(-80px);
          }
        }
      `}</style>
    </Box>
  );
};

export default CategoryList;