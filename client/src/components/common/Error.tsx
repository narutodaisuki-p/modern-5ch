import React, { useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'

// 大剣SVG
const GreatSwordSVG = () => (
  <svg width="150" height="150" viewBox="0 0 80 80" style={{ display: 'block', margin: '0 auto' }}>
    {/* 刃 */}
    <rect x="36" y="10" width="8" height="50" rx="3" fill="rgb(0, 0, 0)" stroke="#333" strokeWidth="2" />
    {/* 刃の光 */}
    <rect x="39" y="13" width="2" height="44" rx="1" fill="rgb(255, 251, 0)" opacity="0.5" />
    {/* 柄 */}
    <rect x="37" y="60" width="6" height="15" rx="2" fill="rgb(37, 68, 60)" stroke="#333" strokeWidth="1" />
    {/* ガード */}
    <rect x="32" y="58" width="16" height="5" rx="2" fill="rgb(0, 0, 0)" stroke="#333" strokeWidth="1" />
  </svg>
)

const Error: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  const errorRef = useRef<HTMLDivElement>(null);
  // 斬撃アニメーション用の状態
  const [isCut, setIsCut] = React.useState(false);

  // 斬撃を発動する関数
  const handleCut = () => {
    setIsCut(true);
    setTimeout(() => {
    setIsCut(false);
      if (onRetry) onRetry();
    }, 800); // 斬撃アニメーション後にリトライ
  };

  useEffect(() => {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message]); // message が変更されたとき（エラーが表示されたとき）に実行

  return (
    <Box ref={errorRef}>
      {/* 剣を斬撃線に完全連動でアニメーション */}
      <Box sx={{ textAlign: 'center', mb: 1, height: 130, position: 'relative' }}> {/* heightも調整 */}
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
          transform: isCut
            ? 'translate(90px, 48px) rotate(-8deg) scaleY(1.2)'
            : 'none',
          position: 'absolute',
          left: 'calc(50% - 60px)', // 剣の中心を中央に
          top: 0,
          zIndex: 2,
        }}>
          <GreatSwordSVG />
        </span>
        {/* 斬撃線の上に剣を重ねるためrelative/absolute配置 */}
        <svg width="200" height="20" viewBox="0 0 200 20" style={{
          display: 'block',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          transition: 'transform 0.3s',
          transform: isCut ? 'scaleY(2) rotate(-8deg)' : 'none',
          opacity: isCut ? 1 : 0.7
        }}>
          <line x1="10" y1="8" x2="190" y2="16" stroke="#b71c1c" strokeWidth="4" strokeDasharray="8 4" />
        </svg>
      </Box>
      <Typography color="error" variant="body1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', position: 'relative', zIndex: 1 }}>
        {message || 'エラーが発生しました。もう一度お試しください。'}
      </Typography>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <button onClick={handleCut} style={{
          background: '#fff',
          border: '2px solid #b71c1c',
          color: '#b71c1c',
          borderRadius: 8,
          padding: '6px 18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'background 0.2s',
        }}>
          斬撃でいらいらを解消
        </button>
      </Box>
    </Box>
  )
}

export default Error