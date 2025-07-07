import React from 'react';
import { useParams } from 'react-router-dom';
import { AppProvider } from '../../context/Appcontext';
import Category from './Category';
import Header from '../common/Header';

const CategoryWithProvider: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  return (
    <AppProvider categoryId={categoryId!}>
      <Header />
      <Category />
    </AppProvider>
  );
};

export default CategoryWithProvider;