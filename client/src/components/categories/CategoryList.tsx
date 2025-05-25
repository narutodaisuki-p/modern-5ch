import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/Appcontext';
import { getCategories } from '../../api/apiClinet'; // APIからカテゴリを取得する関数をインポート

const CategoryList: React.FC = () => {
  const {  setLoading, setError } = useAppContext();
  const [categories, setCategories] = React.useState<any[]>([]); // カテゴリの状態を管理

  React.useEffect(() => {
    getCategories(setCategories, setLoading, setError);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        カテゴリ一覧
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={category._id} disablePadding>
            <ListItemButton component={Link} to={`/categories/${category._id}`}>
              <ListItemText primary={category.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};


export default CategoryList;