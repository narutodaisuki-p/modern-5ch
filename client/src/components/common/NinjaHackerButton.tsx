import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';

// サイバー忍者風の手裏剣＋グリッチエフェクトアイコン
function NinjaHackerIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 48 48">
      {/* 手裏剣の形状をより青系に */}
      <polygon 
        points="24,4 29,19 44,24 29,29 24,44 19,29 4,24 19,19" 
        fill="#2196f3" // 濃い青
        stroke="#00e5ff" // 明るいシアン
        strokeWidth="2" 
        filter="url(#glow)"
      />
      {/* 中心にうずまき模様（NARUTOの象徴）も青系 */}
      <circle cx="24" cy="24" r="5" fill="#0d223a" stroke="#00e5ff" strokeWidth="1.2" />
      <path d="M24 19 a5 5 0 1 1 -4.9 6" stroke="#00b8d4" strokeWidth="1.2" fill="none" />
      <path d="M24 21 a3 3 0 1 1 -2.9 3.5" stroke="#40c4ff" strokeWidth="1" fill="none" />
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </SvgIcon>
  );
}

interface NinjaHackerButtonProps extends ButtonProps {
  label: string;
  component?: React.ElementType;
  href?: string;
  target?: string;
  rel?: string;
  to?: string; // ← 追加
}

const NinjaHackerButton: React.FC<NinjaHackerButtonProps> = ({ label, component = 'button', href, target, rel, ...props }) => {
  // サイバー煙エフェクト用のstate
  const [smoke, setSmoke] = React.useState(false);

  // クリック時に煙を一瞬表示
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSmoke(true);
    setTimeout(() => setSmoke(false), 600);
    if (props.onClick) props.onClick(e);
  };

  return (
    <Button
      startIcon={
        <span className="ninja-hacker-icon-wrap">
          <NinjaHackerIcon sx={{ fontSize: 28 }} />
        </span>
      }
      component={component}
      href={href}
      target={target}
      rel={rel}
      {...props}
      onClick={handleClick}
      sx={{
        background: 'linear-gradient(90deg, #181a20 60%, #0ff 100%)',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '12px',
        boxShadow: '0 0 16px #0ff, 0 0 4px #39ff14',
        letterSpacing: 2,
        textTransform: 'none',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '"Noto Sans JP", "Noto Sans", "monospace"',
        border: '2px solid #39ff14',
        transition: 'all 0.2s',
        '&:hover': {
          background: 'linear-gradient(90deg, #222 60%, #39ff14 100%)',
          boxShadow: '0 0 32px #39ff14, 0 0 12px #0ff',
          filter: 'brightness(1.1) contrast(1.2)',
          borderColor: '#ffd700',
        },
        ...props.sx,
      }}
    >
      <span className="ninja-hacker-glitch" style={{
        fontWeight: 900,
        letterSpacing: 2,
        fontFamily: '"Noto Sans JP", "Noto Sans", "monospace"',
        textShadow: '0 0 8px #0ff, 0 0 2px #39ff14',
      }}>{label}</span>
      {/* サイバー煙エフェクト */}
      {smoke && (
        <span className="ninja-hacker-smoke" />
      )}
      <style>{`
        .ninja-hacker-icon-wrap {
          display: inline-block;
          transition: transform 0.4s cubic-bezier(.4,2,.6,.8);
        }
        .MuiButton-root:hover .ninja-hacker-icon-wrap {
          animation: ninja-shuriken-spin 0.6s cubic-bezier(.4,2,.6,.8);
        }
        @keyframes ninja-shuriken-spin {
          0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 0 #0ff); }
          60% { transform: rotate(320deg) scale(1.15); filter: drop-shadow(0 0 16px #0ff) drop-shadow(0 0 8px #39ff14); }
          100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 0 #0ff); }
        }
        .ninja-hacker-glitch {
          position: relative;
          display: inline-block;
        }
        .MuiButton-root:hover .ninja-hacker-glitch {
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
        .ninja-hacker-smoke {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 80px;
          height: 40px;
          pointer-events: none;
          transform: translate(-50%,-60%) scale(1);
          background: radial-gradient(ellipse at center, #0ff8 0%, #39ff144 60%, transparent 100%);
          opacity: 0.7;
          filter: blur(8px) brightness(1.5);
          animation: ninja-smoke-fade 0.6s ease-out;
          z-index: 2;
        }
        @keyframes ninja-smoke-fade {
          0% { opacity: 0.9; transform: translate(-50%,-60%) scale(0.8); }
          60% { opacity: 0.7; transform: translate(-50%,-70%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%,-80%) scale(1.5); }
        }
      `}</style>
    </Button>
  );
};

export default NinjaHackerButton;