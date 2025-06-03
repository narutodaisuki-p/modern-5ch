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
  Button,
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
const URL = process.env.REACT_APP_API_URL;
interface Thread {
  _id: string;
  title: string;
  createdAt: string;
  category: string;
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
    <Box>
      <Typography variant="h4" gutterBottom>
        スレッド一覧
      </Typography>
      
      {/* 検索フィルターセクション */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, 
        mb: 3,
        alignItems: { xs: 'stretch', md: 'flex-end' }
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
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <DatePicker
            label="開始日"
            value={startDate}
            onChange={setStartDate}
              sx={{
              '& .MuiInputBase-root': {
                width: '100%',
              },
            }}
          />
          <DatePicker
            label="終了日"
            value={endDate}
            onChange={setEndDate}
            sx={{
              '& .MuiInputBase-root': {
                width: '100%',
              },
            }}
          />
        </Box>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>並び順</InputLabel>
          <Select
            value={sortOption}
            label="並び順"
            onChange={(e) => setSortOption(e.target.value)}
          >
            <MenuItem value="newest">新着順</MenuItem>
            <MenuItem value="oldest">古い順</MenuItem>
            <MenuItem value="popular">投稿数順</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          onClick={clearFilters}
          sx={{ height: 56 }}
        >
          クリア
        </Button>
      </Box>
      
      {/* スレッド一覧 */}
      {threads.length > 0 ? (
        console.log("threads",threads),
        threads.map((thread) => (
          <Card 
            key={thread._id} 
            sx={{ 
              border: '1px solid rgb(147, 165, 224)', 
              mb: 2, 
              borderRadius: 2,
              '&:hover': {
                boxShadow: '0 4px 8px rgba(144, 202, 159, 0.3)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <CardContent 
              component={Link} 
              to={`/thread/${thread._id}`} 
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(144, 202, 159, 0.05)'
                }
              }}
            >
              <Typography variant="h5" gutterBottom>
                {thread.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
        <Typography variant="body1" sx={{ mt: 2 }}>
          該当するスレッドが見つかりませんでした
        </Typography>
      )}
    </Box>
  );
};

export default Category;