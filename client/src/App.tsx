import React from 'react';
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


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
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
              <Route path="/" element={<CategoryList />} />
              <Route path="/category/:categoryId" element={<ThreadList />} />
            </Routes>
          </Container>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
