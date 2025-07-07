import React, { useEffect, useState } from 'react';
import { Link} from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';
import axios from 'axios';
import {
  Box,
  CardContent,
  Card,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import NinjaHackerButton from '../common/NinjaHackerButton';

const URL = process.env.REACT_APP_API_URL;
interface Thread {
  _id: string;
  title: string;
  createdAt: string;
  category: string;
  likes?: number;
  imageUrl?: string;
}

const Category: React.FC = () => {
  const { categoryId } = useAppContext();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { setLoading } = useAppContext();

  const fetchThreads = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        sort: sortOption,
        ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
        ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') })
      };

      const response = await axios.get(`${URL}/api/categories/${categoryId}/threads`, { params });
      console.log("response",response);
      setThreads(response.data);
    } catch (error) {
      console.error('スレッド一覧の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [categoryId, sortOption, searchTerm]); // カテゴリ変更時とソート変更時に再取得

  const handleSearch = () => {
    fetchThreads();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
    fetchThreads();
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
          <span className="ninja-hacker-glitch">スレッド一覧</span>
        </Typography>
      </Box>
      {/* 検索フィルターセクション */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, 
        mb: 3,
        alignItems: { xs: 'stretch', md: 'flex-end' },
        background: 'rgba(20,40,40,0.7)',
        borderRadius: 2,
        p: 2,
        boxShadow: '0 0 12px #0ff8',
      }}>
        <TextField
          label="スレッドを検索"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <SearchIcon sx={{ color: '#39ff14' }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: { color: '#0ff', borderColor: '#39ff14' }
          }}
          sx={{ input: { color: '#0ff' }, label: { color: '#39ff14' } }}
        />
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <DatePicker
            label="開始日"
            value={startDate}
            onChange={setStartDate}
            sx={{ '& .MuiInputBase-root': { width: '100%', color: '#0ff' } }}
          />
          <DatePicker
            label="終了日"
            value={endDate}
            onChange={setEndDate}
            sx={{ '& .MuiInputBase-root': { width: '100%', color: '#0ff' } }}
          />
        </Box>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: '#39ff14' }}>並び順</InputLabel>
          <Select
            value={sortOption}
            label="並び順"
            onChange={(e) => setSortOption(e.target.value)}
            sx={{ color: '#0ff', borderColor: '#39ff14' }}
          >
            <MenuItem value="newest">新着順</MenuItem>
            <MenuItem value="oldest">古い順</MenuItem>
            <MenuItem value="popular">投稿数順</MenuItem>
          </Select>
        </FormControl>
        <NinjaHackerButton
          label="クリア"
          variant="outlined"
          onClick={clearFilters}
          sx={{ height: 56, minWidth: 100 }}
        />
      </Box>
      {/* スレッド一覧 */}
      {threads.length > 0 ? (
        threads.map((thread) => (
          <Card 
            key={thread._id} 
            sx={{ 
              border: '2px solid #39ff14',
              mb: 3, 
              borderRadius: 3,
              background: 'linear-gradient(100deg, #181a20 70%, #0ff2 100%)',
              boxShadow: '0 0 24px #0ff8, 0 0 8px #39ff144',
              position: 'relative',
              overflow: 'hidden',
              transition: 'box-shadow 0.3s, transform 0.3s',
              '&:hover': {
                boxShadow: '0 0 48px #39ff14, 0 0 16px #0ff',
                transform: 'translateY(-4px) scale(1.02)',
                borderColor: '#ffd700',
              }
            }}
          >
            {/* うずまきSVG装飾 */}
            <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', right: 8, top: 8, opacity: 0.18 }}>
              <circle cx="30" cy="30" r="24" stroke="#0ff" strokeWidth="3" fill="none" />
              <path d="M30 12 a18 18 0 1 1 -0.1 0" stroke="#39ff14" strokeWidth="2" fill="none" />
            </svg>
            <CardContent 
              component={Link} 
              to={`/thread/${thread._id}`} 
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(39,255,20,0.08)'
                }
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 900, color: '#0ff', textShadow: '0 0 8px #39ff14' }}>
                {thread.title}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px #0ff4',
                  border: thread.imageUrl ? '2px solid #39ff14' : 'none',
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
                {thread.imageUrl && (
                  <img
                    src={thread.imageUrl}
                    alt={thread.title}
                    style={{ width: '100%', height: 'auto' }}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: '#b2ffef', mt: 1 }}>
                {new Date(thread.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 2, color: '#b2ffef' }}>
          該当するスレッドが見つかりませんでした
        </Typography>
      )}
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

export default Category;