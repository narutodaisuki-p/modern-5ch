import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';
import Loading from './Loading';

const PrivateRoute: React.FC = () => {
  const { isLoggedIn, loading } = useAppContext();
  
  // 認証チェック中はローディング表示
  if (loading) {
    return <Loading />;
  }
  
  // 認証済みならOutlet（子ルート）を表示、未認証ならログインページへリダイレクト
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;