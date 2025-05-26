import { Toolbar, AppBar, Typography, Button } from '@mui/material';
import React from 'react'
import { Link } from 'react-router-dom';

const Navba = () => {
    return (
        <AppBar position="static" sx={{ mb: 2,width: '100%' }}>
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                    じゃっぱん
                </Typography>
                <Button color="primary" component={Link} to="/create" sx={{ fontWeight: 'bold' }}>
                    スレッド作成
                </Button>
                <Button color="primary" component={Link} to="/categories" sx={{ fontWeight: 'bold' }}>
                    カテゴリー
                </Button>
                <Button color="primary" component={Link} to="/ranking" sx={{ fontWeight: 'bold' }}>
                    ランキング
                </Button>
            </Toolbar>
        </AppBar>
    )

}

export default Navba;