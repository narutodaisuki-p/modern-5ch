import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: 'AI' },
  { id: 2, name: 'ニュース' },
  { id: 3, name: '相談' },
];

const CategoryList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        カテゴリ一覧
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={category.id} disablePadding>
            <ListItemButton component={Link} to={`/category/${category.id}`}>
              <ListItemText primary={category.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};


export default CategoryList;