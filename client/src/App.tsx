import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import ThreadList from './components/threads/ThreadList';
import Thread from './components/threads/Thread';
import CreateThread from './components/threads/CreateThread';
import Header from './components/common/Header';
import CategoryList from './components/categories/CategoryList';
import { AppProvider } from './context/Appcontext';
import Category from './components/categories/Category';


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90ca9f', // 明るい緑色
      contrastText: '#fff', // 白色
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b0bec5', // 明るいグレー
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/thread/:threadId" element={<Thread />} />
              <Route path="/create" element={<CreateThread />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/" element={<ThreadList />} />
              <Route path="/categories/:categoryId" element={<Category />} />


            </Routes>
          </Container>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
