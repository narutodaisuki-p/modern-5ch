import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { useAppContext } from '../../context/Appcontext';
import LoadingIs from '../common/Loading';

const URL = process.env.REACT_APP_API_URL;

interface Thread {
  _id: string;
  title: string;
  createdAt: string;
  imageUrl?: string;
  likes?: number;
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const { loading, setLoading, error, setError } = useAppContext();
  
  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/threads`);
      setThreads(response.data);
    } catch (error) {
      console.error('スレッド一覧の取得に失敗:', error);
      setError('スレッド一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error, setError]);

  // 黒炎アマテラス演出 - ターゲットを焼き尽くす
  const amaterasuBlackFlame = useCallback((threadId: string) => {
    const btn = document.querySelector(`.amaterasu-btn-${threadId}`) as HTMLElement | null;
    if (!btn) return;
    
    // ボタン全体を燃やす演出
    btn.classList.add('amaterasu-burning');
    
    // 黒炎エフェクトを作成
    const flameContainer = document.createElement('div');
    flameContainer.className = 'amaterasu-black-flames';
    
    // 複数の黒炎を生成
    for (let i = 0; i < 8; i++) {
      const flame = document.createElement('div');
      flame.className = 'black-flame';
      flame.style.left = `${Math.random() * 100}%`;
      flame.style.animationDelay = `${Math.random() * 0.5}s`;
      flame.innerHTML = `
        <svg viewBox="0 0 24 48" width="20" height="40">
          <path d="M12 46c-3-2-5-5-5-8 0-4 3-6 5-10 2 4 5 6 5 10 0 3-2 6-5 8z" 
                fill="#000" opacity="0.9"/>
          <path d="M12 46c-2-2-3-4-3-6 0-3 2-4 3-7 1 3 3 4 3 7 0 2-1 4-3 6z" 
                fill="#1a1a1a" opacity="0.8"/>
          <path d="M12 42c-1-1-2-2-2-4 0-2 1-2 2-5 1 3 2 3 2 5 0 2-1 3-2 4z" 
                fill="#333" opacity="0.7"/>
        </svg>
      `;
      flameContainer.appendChild(flame);
    }
    
    btn.appendChild(flameContainer);
    
    // 燃え尽きる演出後にクリーンアップ
    setTimeout(() => {
      btn.classList.remove('amaterasu-burning');
      const flames = btn.querySelector('.amaterasu-black-flames');
      if (flames) {
        flames.remove();
      }
    }, 2000);
    
  }, []);

  const handleLike = useCallback(async (threadId: string, currentLikes: number = 0) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      alert('ログインしてください。');
      return;
    }

    // アマテラス発動！
    amaterasuBlackFlame(threadId);

    // 楽観的更新
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread._id === threadId 
          ? { ...thread, likes: currentLikes + 1 } 
          : thread
      )
    );

    try {
      const response = await axios.post(
        `${URL}/api/threads/${threadId}/like`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === threadId 
            ? { ...thread, likes: response.data.likes } 
            : thread
        )
      );
      
    } catch (error) {
      // エラー時はロールバック
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === threadId 
            ? { ...thread, likes: currentLikes } 
            : thread
        )
      );
      
      const err = error as any;
      console.error('いいね処理に失敗しました:', err);
      alert(err.response?.data?.message || 'いいね処理中にエラーが発生しました');
    }
  }, [amaterasuBlackFlame]);

  if (loading) {
    return <LoadingIs />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">スレッド一覧</Typography>
        <Button
          component={Link}
          to="/create"
          variant="outlined"
          color="primary"
        >
          新規スレッド作成
        </Button>
      </Box>
      
      <List>
        {threads.map((thread) => (
          <Paper key={thread._id} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem
              component={Link}
              to={`/thread/${thread._id}`}
              sx={{ 
                textDecoration: 'none',
                color: 'text.primary',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                '&:hover': {
                  backgroundColor: 'rgba(144, 202, 159, 0.1)',
                  color: 'primary.main',
                },
              }}
            >
              {thread.imageUrl && (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '300px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '& img': {
                      width: '100%',
                      height: 'auto',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover img': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <img
                    src={thread.imageUrl}
                    alt={thread.title}
                    loading="lazy"
                  />
                </Box>
              )}
              
              <ListItemText
                primary={thread.title}
                secondary={new Date(thread.createdAt).toLocaleString('ja-JP')}
                sx={{
                  width: '100%',
                  '& .MuiTypography-root': {
                    color: 'text.primary',
                  },
                  '& .MuiTypography-body2': {
                    color: 'text.secondary',
                  },
                }}
              />
            </ListItem>
            
            <Box sx={{ p: 2, pt: 0 }}>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike(thread._id, thread.likes);
                }}
                sx={{ 
                  color: 'white', 
                  backgroundColor: '#2c2c2c',
                  border: '2px solid #444',
                  position: 'relative', 
                  overflow: 'visible',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #666',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  }
                }}
                className={`amaterasu-btn amaterasu-btn-${thread._id}`}
              >
                🔥 {thread.likes || 0} 天照
              </Button>
            </Box>
          </Paper>
        ))}
      </List>

      {/* 黒炎アマテラス演出スタイル */}
      <style>{`
        .amaterasu-btn {
          position: relative;
          overflow: visible !important;
        }
        
        .amaterasu-burning {
          animation: button-burn 2s ease-out forwards;
          pointer-events: none;
        }
        
        .amaterasu-black-flames {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }
        
        .black-flame {
          position: absolute;
          bottom: 0;
          animation: black-flame-burn 1.5s ease-out forwards;
        }
        
        @keyframes button-burn {
          0% {
            background-color: #2c2c2c;
            transform: scale(1);
            filter: brightness(1);
          }
          20% {
            background-color: #1a1a1a;
            transform: scale(1.05);
            filter: brightness(0.8);
          }
          40% {
            background-color: #0a0a0a;
            transform: scale(1.1);
            filter: brightness(0.6) contrast(1.2);
          }
          60% {
            background-color: #000;
            transform: scale(1.15);
            filter: brightness(0.4) contrast(1.5);
          }
          80% {
            background-color: #000;
            transform: scale(1.1);
            filter: brightness(0.2) contrast(2);
          }
          100% {
            background-color: #2c2c2c;
            transform: scale(1);
            filter: brightness(1);
          }
        }
        
        @keyframes black-flame-burn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          40% {
            opacity: 1;
            transform: translateY(-10px) scale(1.2) rotate(5deg);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-20px) scale(1.1) rotate(-3deg);
          }
          80% {
            opacity: 0.4;
            transform: translateY(-30px) scale(0.8) rotate(2deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.3) rotate(0deg);
          }
        }
        
        /* 燃え尽きるときの追加エフェクト */
        .amaterasu-burning::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, transparent 70%);
          animation: burn-glow 2s ease-out forwards;
          z-index: -1;
        }
        
        @keyframes burn-glow {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default ThreadList;