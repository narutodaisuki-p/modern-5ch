import { Box, Typography } from '@mui/material';
import React from 'react';

// 手裏剣アイコン（黒）
function ShurikenIcon({ style = {}, ...props }: any) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" style={style} {...props}>
      <polygon 
        points="24,4 28,20 44,24 28,28 24,44 20,28 4,24 20,20" 
        fill="#111" 
        stroke="#fff" 
        strokeWidth="1.5" 
      />
      <circle cx="24" cy="24" r="3" fill="#fff" />
    </svg>
  );
}

// 刀アイコン（シンプル交差用）
function Katana({ style = {}, ...props }: any) {
  return (
    <svg viewBox="0 0 64 8" width="64" height="8" style={style} {...props}>
      <rect x="2" y="2" width="60" height="4" rx="2" fill="#eee" stroke="#aaa" strokeWidth="1" />
      <rect x="2" y="2" width="10" height="4" rx="2" fill="#222" stroke="#555" strokeWidth="1" />
      <rect x="12" y="2" width="3" height="4" rx="1.5" fill="#c0a060" stroke="#8a6914" strokeWidth="1" />
    </svg>
  );
}

const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #222 0%, #111 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 手裏剣アニメーション */}
      <div className="ninja-loading-shuriken left">
        <ShurikenIcon />
      </div>
      <div className="ninja-loading-shuriken right">
        <ShurikenIcon />
      </div>
      {/* 刀バトルアニメーション */}
      <div className="ninja-loading-katana katana-left">
        <Katana />
      </div>
      <div className="ninja-loading-katana katana-right">
        <Katana />
      </div>
      {/* 刀が交差した瞬間の光エフェクト */}
      <div className="ninja-loading-flash" />
      <Typography variant="h5" sx={{ mt: 8, color: '#fff', fontWeight: 900, letterSpacing: 2, textShadow: '0 2px 8px #000' }}>
        忍術発動中…
      </Typography>
      <style>{`
        .ninja-loading-shuriken {
          position: absolute;
          top: 38vh;
          width: 48px;
          height: 48px;
          z-index: 2;
          animation: shuriken-move 1.6s cubic-bezier(0.7,0,0.3,1) infinite alternate;
        }
        .ninja-loading-shuriken.left {
          left: 8vw;
          animation-name: shuriken-move-left;
        }
        .ninja-loading-shuriken.right {
          right: 8vw;
          animation-name: shuriken-move-right;
        }
        @keyframes shuriken-move-left {
          0% { left: 8vw; transform: rotate(0deg); }
          50% { left: 44vw; transform: rotate(360deg); }
          100% { left: 8vw; transform: rotate(720deg); }
        }
        @keyframes shuriken-move-right {
          0% { right: 8vw; transform: rotate(0deg); }
          50% { right: 44vw; transform: rotate(-360deg); }
          100% { right: 8vw; transform: rotate(-720deg); }
        }
        .ninja-loading-katana {
          position: absolute;
          top: 44vh;
          width: 64px;
          height: 8px;
          z-index: 3;
          opacity: 0.92;
          animation: katana-battle 1.6s cubic-bezier(0.7,0,0.3,1) infinite;
        }
        .ninja-loading-katana.katana-left {
          left: 38vw;
          transform: rotate(-30deg);
          animation-name: katana-battle-left;
        }
        .ninja-loading-katana.katana-right {
          right: 38vw;
          transform: rotate(30deg) scaleX(-1);
          animation-name: katana-battle-right;
        }
        @keyframes katana-battle-left {
          0% { left: 38vw; top: 44vh; opacity: 0.92; }
          40% { left: 48vw; top: 42vh; opacity: 1; }
          50% { left: 49vw; top: 41.5vh; opacity: 1; }
          60% { left: 48vw; top: 42vh; opacity: 1; }
          100% { left: 38vw; top: 44vh; opacity: 0.92; }
        }
        @keyframes katana-battle-right {
          0% { right: 38vw; top: 44vh; opacity: 0.92; }
          40% { right: 48vw; top: 42vh; opacity: 1; }
          50% { right: 49vw; top: 41.5vh; opacity: 1; }
          60% { right: 48vw; top: 42vh; opacity: 1; }
          100% { right: 38vw; top: 44vh; opacity: 0.92; }
        }
        .ninja-loading-flash {
          position: absolute;
          left: 50vw;
          top: 42vh;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, #ffd700 40%, transparent 80%);
          opacity: 0;
          z-index: 4;
          pointer-events: none;
          animation: flash-battle 1.6s cubic-bezier(0.7,0,0.3,1) infinite;
        }
        @keyframes flash-battle {
          0%, 39% { opacity: 0; }
          45% { opacity: 0.85; }
          55% { opacity: 0.5; }
          60%, 100% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default Loading;