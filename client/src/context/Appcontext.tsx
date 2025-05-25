import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
interface AppContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  category: string | null;
}


const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchCategory = async () => {
      console.log("始まり")
      try {
        setLoading(true);
        if (!categoryId) return;
        const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`);
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        setCategory(data.name);
        console.log("カテゴリー",data.name)
      } catch (err) {
        setError('カテゴリの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  return (
    <AppContext.Provider value={{ loading, setLoading, error, setError, category }}>
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
