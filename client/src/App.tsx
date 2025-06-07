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


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90ca9f',
      contrastText: '#fff',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b0bec5',
    },
    secondary: {
      main: '#757575',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
     
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
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
        <Route path="/ranking" element={<ThreadList />} /> {/* ランキングページはスレッド一覧を再利用 */}
        <Route path="/about" element={<AboutPage />} /> {/* Aboutページはコンポーネントを使用 */}
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/terms' element={<Terms />}></Route>
        {/* カテゴリ関連は Layout を使用 */}
{/* 
        <Route path="/purchase" element={<PurchasePage />} /> 追加 */}
        <Route element={<CategoryLayout />}>
          <Route path="/categories/:categoryId" element={<Category />} />
        </Route>
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
        </AppProvider>
      </Router>
    </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;