import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  category: string | null;
  categoryId: string | undefined;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  categoryId?: string;
}> = ({ children, categoryId })  => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

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

  return (
    <AppContext.Provider value={{ loading, setLoading, error, setError, category, categoryId }}>
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