import { Box } from '@mui/material'
import React from 'react'

// くノ一風SVG
const KunoichiSVG = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: 'block', margin: '0 auto' }}>
    {/* 顔 */}
    <circle cx="60" cy="50" r="28" fill="#ffe0b2" stroke="#333" strokeWidth="2" />
    {/* 目 */}
    <ellipse cx="50" cy="52" rx="3" ry="5" fill="#333" />
    <ellipse cx="70" cy="52" rx="3" ry="5" fill="#333" />
    {/* 口 */}
    <path d="M54 64 Q60 70 66 64" stroke="#e57373" strokeWidth="2" fill="none" />
    {/* 頭巾 */}
    <ellipse cx="60" cy="38" rx="30" ry="18" fill="#ab47bc" opacity="0.8" />
    {/* 体 */}
    <rect x="48" y="78" width="24" height="30" rx="10" fill="#7e57c2" stroke="#333" strokeWidth="2" />
    {/* 手裏剣 */}
    <polygon points="60,90 65,100 60,110 55,100" fill="#90caf9" stroke="#333" strokeWidth="1" />
    {/* ポーズの手 */}
    <ellipse cx="45" cy="90" rx="5" ry="8" fill="#ffe0b2" stroke="#333" strokeWidth="1" />
    <ellipse cx="75" cy="90" rx="5" ry="8" fill="#ffe0b2" stroke="#333" strokeWidth="1" />
  </svg>
)

const Success = ({ message }: { message: string }) => {
  return (
    <Box>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <KunoichiSVG />
        <p style={{ fontWeight: 'bold', fontSize: '1.2em', marginTop: 8 }}>{message}</p>
      </Box>
    </Box>
  )
}

export default Success
