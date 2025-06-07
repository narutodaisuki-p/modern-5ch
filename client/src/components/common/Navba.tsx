import { Toolbar, AppBar, Typography, Button } from '@mui/material';
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom';
import { IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppContext } from '../../context/Appcontext';

const Navba = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { isLoggedIn } = useAppContext();

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            'key' in event &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <AppBar position="static" sx={{ mb: 2, width: '100%', backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Toolbar >
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                    じゃっぱん
                </Typography>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <MenuIcon />
                </IconButton>
                <Drawer 
                    anchor="right" 
                    open={drawerOpen} 
                    onClose={toggleDrawer(false)} 
                    PaperProps={{ sx: { backgroundColor: "transparent" } }}
                >
                    <List sx={{ backgroundColor: "transparent" }}>
                        <ListItem component={Link} to="/create" sx={{ color: "primary.main" }}>
                            <ListItemText primary="スレッド作成" />
                        </ListItem>
                        <ListItem component={Link} to="/categories" sx={{ color: "primary.main" }}>
                            <ListItemText primary="カテゴリー" />
                        </ListItem>
                        <ListItem component={Link} to="/ranking" sx={{ color: "primary.main" }}>
                            <ListItemText primary="ランキング" />
                        </ListItem>
                        <ListItem component={Link} to="/about" sx={{ color: "primary.main" }}>
                            <ListItemText primary="このサイトについて" />
                        </ListItem>
                        {isLoggedIn ? (
                            <ListItem component={Link} to="/profile" sx={{ color: "primary.main" }}>
                                <ListItemText primary="プロフィール" />
                            </ListItem>
                        ) : (
                            <>
                                <ListItem component={Link} to="/login" sx={{ color: "primary.main" }}>
                                    <ListItemText primary="ログイン" />
                                </ListItem>
                                <ListItem component={Link} to="/register" sx={{ color: "primary.main" }}>
                                    <ListItemText primary="登録" />
                                </ListItem>
                            </>
                        )}
                    </List>
                </Drawer>
                <Button color="primary" component={Link} to="/create" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                    スレッド作成
                </Button>
                <Button color="primary" component={Link} to="/categories" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                    カテゴリー
                </Button>
                <Button color="primary" component={Link} to="/ranking" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                    ランキング
                </Button>
                <Button color="primary" component={Link} to="/about" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                    このサイトについて
                </Button>
                {isLoggedIn ? (
                    <Button color="primary" component={Link} to="/profile" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                        プロフィール
                    </Button>
                ) : (
                    <>
                        <Button color="primary" component={Link} to="/login" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                            ログイン
                        </Button>
                        <Button color="primary" component={Link} to="/register" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                            登録
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navba;