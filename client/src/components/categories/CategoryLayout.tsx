// src/components/categories/CategoryLayout.jsx
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AppProvider } from '../../context/Appcontext';
import Header from '../common/Header';


const CategoryLayout: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  return (
    <AppProvider categoryId={categoryId}>
      {/* ここの Header はちゃんと category が取れる */}
      <Header />
      {/* 子 Route (<Category>) がここに出る */}
      <Outlet />
    </AppProvider>
  );
};
export default CategoryLayout;