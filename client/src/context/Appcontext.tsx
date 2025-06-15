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
}> = ({ children, categoryId })  => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null); // user の state を追加

  useEffect(() => {
    const fetchCategory = async () => {
      try {
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
    const token = localStorage.getItem('jwt');
    if (token) {
      fetch(`${URL}/auth/verify`, { // fetchの戻り値を直接使わない
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      })
      .then(async res => { // async を追加してレスポンスボディの処理を待つ
        if (!res.ok) {
          localStorage.removeItem('jwt');
          setUser(null); // 認証失敗時はユーザー情報もクリア
          setIsLoggedIn(false);
          // エラーメッセージをセットする前にレスポンスボディを試みる
          try {
            const errorData = await res.json();
            setError(errorData.message || res.statusText);
          } catch (e) {
            setError(res.statusText);
          }
          return; // 早期リターン
        }
        const userData = await res.json(); // レスポンスからユーザーデータを取得
        setUser(userData.user); // ユーザー情報をセット (APIのレスポンス形式に合わせる)
        setIsLoggedIn(true);
      })
      .catch(err => {
        console.error('認証エラー:', err);
        setError('認証に失敗しました。再度ログインしてください。');
        localStorage.removeItem('jwt'); // エラー時もトークン削除
        setUser(null);
        setIsLoggedIn(false);
      });
    } else {
      // トークンがない場合はログアウト状態
      setUser(null);
      setIsLoggedIn(false);
    }
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
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};