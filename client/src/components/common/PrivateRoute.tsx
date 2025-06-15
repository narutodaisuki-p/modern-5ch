import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';

// 仮の認証判定。実際はAppcontextやAuthProviderから取得するのが理想
const useAuth = () => {
  // ここは本来contextやグローバルstateから取得
  const { isLoggedIn } = useAppContext();
  return isLoggedIn;
};

const PrivateRoute: React.FC = () => {
  const isAuth = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;