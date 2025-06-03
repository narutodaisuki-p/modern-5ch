import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import { set } from 'date-fns';
import { is } from 'date-fns/locale';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  category: string | null;
  categoryId: string | undefined;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  categoryId?: string;
}> = ({ children, categoryId })  => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        if (!categoryId) {
          setCategory(null);
          setError(null);
          return;
        }
        const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setCategory(data.name);
      } catch (err) {
        setError('カテゴリの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  useEffect(() =>{
    const token = localStorage.getItem('jwt');
    if (token) {
      const response = fetch('http://localhost:5000/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      }); 
      response.then(res => {
        if (!res.ok) {
          localStorage.removeItem('jwt');
          setError(res.statusText);
        }
        return setIsLoggedIn(true);

      }).catch(err => {
        console.error('認証エラー:', err);
        setError('認証に失敗しました。再度ログインしてください。');
      });


    }
  }, []);

  return (
    <AppContext.Provider value={{ loading, setLoading, error, setError, category, categoryId, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};