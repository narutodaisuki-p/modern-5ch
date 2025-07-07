import React, { createContext, useContext, useEffect, useState } from 'react';

// ユーザー情報の型を定義 (必要に応じて拡張してください)
export interface User {
  _id: string;
  name: string;
  email: string;
  picture?: string; // Googleのプロフィール画像URLなど
}

export interface AppContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  category: string | null;
  categoryId: string | undefined;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: User | null; // user情報を追加
  setUser: (user: User | null) => void; // setUser関数を追加
}
const URL = process.env.REACT_APP_API_URL;

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  categoryId?: string;
}> = ({ children, categoryId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null); // user の state を追加

  useEffect(() => {
    const fetchCategory = async () => {
    // カテゴリIDが未指定の場合は何もしない
      if (!categoryId) {
        return;
      }
      try {
        console.log('カテゴリID:', categoryId);
        setLoading(true);
        if (!categoryId) {
          setCategory(null);
          setError(null);
          return;
        }
        const res = await fetch(`${URL}/api/categories/${categoryId}`);
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
    const checkAuth = async () => {
      try {
        setLoading(true);
        // まずクッキーベースの認証をチェック
        const res = await fetch(`${URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
          credentials: 'include', // クッキーを含める
        })
        // レスポンスが200 OKなら認証成功
        if (res.ok) {
          // クッキー認証成功
          const userData = await res.json();
          setUser(userData.user);
          setIsLoggedIn(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('認証エラー:', err);
        setError('認証に失敗しました。再度ログインしてください。');
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AppContext.Provider value={{ loading, setLoading, error, setError, category, categoryId, isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('アッププロバイダーでラップされていません。useAppContextをAppProviderの子コンポーネントで使用してください。');
  }
  return context;
};