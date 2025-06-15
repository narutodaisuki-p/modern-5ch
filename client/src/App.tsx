import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import ThreadList from './components/threads/ThreadList';
import Thread from './components/threads/Thread';
import CreateThread from './components/threads/CreateThread';
import CategoryList from './components/categories/CategoryList';
import { AppProvider } from './context/Appcontext';
import CategoryLayout from './components/categories/CategoryLayout';
import Category from './components/categories/Category';
import Navba from './components/common/Navba';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import PurchasePage from './shops/PurchasePage'; // 購入ページのインポート

import AboutPage from './components/app/AboutPage'; // Aboutページのインポート
import Login from './components/app/Login';
import Register from './components/app/Register';
import Profile from './components/app/Profile'; // プロフィールページのインポート
import Terms from './components/app/Terms';
import NotFound from './components/common/NotFound';
import Footer from './components/common/Footer'; // フッターのインポート
import PrivateRoute from './components/common/PrivateRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#26c6da',
      contrastText: '#fff',
    },
    text: {
      primary: '#e0f7fa',
      secondary: '#80cbc4',
    },
    secondary: {
      main: '#43a047',
    },
    background: {
      default: '#16232d',
      paper: '#1a2633',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Noto Sans"',
      'monospace',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightBold: 900,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(120deg, #16232d 60%, #1a2e2e 100%)',
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // AppBarのsxで直接指定するためここは省略
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: '#1a2633',
          color: '#26c6da',
          borderRadius: 8,
        },
        notchedOutline: {
          borderColor: '#26c6da',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#26c6da',
          fontWeight: 700,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#26c6da',
          '&:hover': { color: '#43a047', background: '#16232d' },
        },
      },
    },
  },
});

// MainContent.jsx
function MainContent() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Routes>
        <Route path="/" element={<ThreadList />} />
        <Route path="/create" element={<CreateThread />} />
        <Route path="/thread/:threadId" element={<Thread />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/ranking" element={<ThreadList />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/terms' element={<Terms />}></Route>
        {/* プロフィールは認証ガード付き */}
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>
        {/* カテゴリ関連は Layout を使用 */}
        <Route element={<CategoryLayout />}>
          <Route path="/categories/:categoryId" element={<Category />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Container>
  );
  
}

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppProvider>
          <Navba /> 
          <MainContent />
          <Footer /> 
        </AppProvider>
      </Router>
    </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;