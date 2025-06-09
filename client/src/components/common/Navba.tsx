import { Toolbar, AppBar, Typography, IconButton, Drawer, List, ListItem } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppContext } from '../../context/Appcontext';
import SvgIcon from '@mui/material/SvgIcon';

// Shuriken (throwing star) icon
function ShurikenIcon(props: any) {
    return (
        <SvgIcon {...props} viewBox="0 0 48 48">
            <polygon 
                points="24,4 28,20 44,24 28,28 24,44 20,28 4,24 20,20" 
                fill="#111" // 黒色に変更
                stroke="#fff" 
                strokeWidth="1.5" 
            />
            <circle cx="24" cy="24" r="3" fill="#fff" />
        </SvgIcon>
    );
}

// Katana (Japanese sword) icon with all parts using same rotation center
function KatanaIcon(props: any) {
    return (
        <SvgIcon {...props} viewBox="0 0 64 64" style={{ fontSize: 56 }}>
            <defs>
                <filter id="katana-shadow" x="0" y="0" width="64" height="64">
                    <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.18" />
                </filter>
            </defs>
            <g transform="rotate(-18 32 32)" filter="url(#katana-shadow)">
                {/* Tsuka (handle) */}
                <rect 
                    x="8" 
                    y="29" 
                    width="11" 
                    height="6" 
                    rx="2" 
                    fill="#2a2a2a" 
                    stroke="#666" 
                    strokeWidth="1.2" 
                />
                {/* Handle wrap (tsuka-ito) */}
                <rect 
                    x="8.5" 
                    y="30.2" 
                    width="10" 
                    height="0.8" 
                    fill="#444" 
                />
                <rect 
                    x="8.5" 
                    y="33" 
                    width="10" 
                    height="0.8" 
                    fill="#444" 
                />
                {/* Tsuba (guard) - positioned exactly at handle end */}
                <ellipse 
                    cx="19" 
                    cy="32" 
                    rx="2.5" 
                    ry="3" 
                    fill="#c0a060" 
                    stroke="#8a6914" 
                    strokeWidth="1" 
                />
                {/* Blade - starts exactly where tsuba is */}
                <rect 
                    x="19" 
                    y="30.5" 
                    width="32" 
                    height="3" 
                    rx="1.5" 
                    fill="#f5f5f5" 
                    stroke="#ccc" 
                    strokeWidth="1" 
                />
                {/* Blade ridge (shinogi) */}
                <rect 
                    x="19" 
                    y="31.8" 
                    width="32" 
                    height="0.8" 
                    rx="0.4" 
                    fill="#e0e0e0" 
                    opacity="0.8" 
                />
                {/* Blade tip (kissaki) */}
                <polygon 
                    points="51,31.5 54,32 51,32.5" 
                    fill="#f5f5f5" 
                    stroke="#ccc" 
                    strokeWidth="1" 
                />
            </g>
        </SvgIcon>
    );
}

// Navigation button component with shuriken to katana transformation
interface ShurikenNavButtonProps {
    to: string;
    label: string;
    'aria-label'?: string;
    [key: string]: any;
}

function ShurikenNavButton({ to, label, 'aria-label': ariaLabel, ...props }: ShurikenNavButtonProps) {
    return (
        <IconButton 
            component={Link} 
            to={to} 
            aria-label={ariaLabel || label}
            sx={{
                mx: 1,
                color: '#fff',
                display: { xs: 'none', sm: 'inline-flex' },
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'color 0.2s',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
            }}
            {...props}
        >
            <div className="shuriken-katana-wrap">
                <div className="shuriken-icon">
                    <ShurikenIcon fontSize="large" />
                </div>
                <div className="katana-icon">
                    <KatanaIcon fontSize="inherit" />
                </div>
            </div>
            <span className="shuriken-label">{label}</span>
        </IconButton>
    );
}

// Mobile drawer list item with same transformation effect
function DrawerNavItem({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
    return (
        <ListItem 
            component={Link} 
            to={to} 
            onClick={onClick}
            aria-label={label}
            sx={{ 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                borderRadius: 2, 
                transition: 'background 0.2s, transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-1px)',
                }
            }}
        >
            <div className="shuriken-katana-wrap">
                <div className="shuriken-icon">
                    <ShurikenIcon fontSize="large" />
                </div>
                <div className="katana-icon">
                    <KatanaIcon fontSize="inherit" />
                </div>
            </div>
            <span className="shuriken-label">{label}</span>
        </ListItem>
    );
}

const Navbar = () => {
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

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <>
            <AppBar 
                position="static" 
                sx={{ 
                    mb: 2, 
                    width: '100%', 
                    background: 'linear-gradient(90deg, rgba(30,30,60,0.85) 0%, rgba(60,60,120,0.85) 100%)', 
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', 
                    backdropFilter: 'blur(6px)' 
                }}
            >
                <Toolbar sx={{ minHeight: 72 }}>
                    {/* Logo and site title */}
                    <Link 
                        to="/" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            textDecoration: 'none', 
                            flexGrow: 1 
                        }}
                    >
                        <img 
                            src="/logo.svg" 
                            alt="Logo" 
                            style={{ 
                                width: '44px', 
                                height: '44px', 
                                marginRight: '12px', 
                                filter: 'drop-shadow(0 2px 8px rgba(34, 34, 102, 0.4))' 
                            }} 
                        />
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                color: '#fff', 
                                fontWeight: 900, 
                                letterSpacing: 2, 
                                textShadow: '0 2px 8px rgba(34, 34, 102, 0.4)' 
                            }}
                        >
                            じゃっぱん
                        </Typography>
                    </Link>

                    {/* Mobile menu button */}
                    <IconButton 
                        edge="end" 
                        color="inherit" 
                        aria-label="メニューを開く" 
                        onClick={toggleDrawer(true)} 
                        sx={{ 
                            display: { xs: 'block', sm: 'none' }, 
                            ml: 1 
                        }}
                    >
                        <MenuIcon sx={{ fontSize: 32 }} />
                    </IconButton>

                    {/* Desktop navigation buttons */}
                    <ShurikenNavButton to="/create" label="作成" aria-label="スレッド作成" />
                    <ShurikenNavButton to="/categories" label="カテゴリ" aria-label="カテゴリー" />
                    <ShurikenNavButton to="/ranking" label="ランク" aria-label="ランキング" />
                    <ShurikenNavButton to="/about" label="案内" aria-label="このサイトについて" />
                    
                    {/* Conditional navigation based on login status */}
                    {isLoggedIn ? (
                        <ShurikenNavButton to="/profile" label="プロフ" aria-label="プロフィール" />
                    ) : (
                        <>
                            <ShurikenNavButton to="/login" label="ログイン" aria-label="ログイン" />
                            <ShurikenNavButton to="/register" label="登録" aria-label="新規登録" />
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer 
                anchor="right" 
                open={drawerOpen} 
                onClose={toggleDrawer(false)} 
                PaperProps={{ 
                    sx: { 
                        background: 'rgba(40,40,80,0.95)', 
                        backdropFilter: 'blur(12px)', 
                        minWidth: 240 
                    } 
                }}
            >
                <List sx={{ background: 'transparent', p: 2 }}>
                    {/* Mobile logo */}
                    <ListItem sx={{ justifyContent: 'center', mb: 2 }}>
                        <img 
                            src="/logo.svg" 
                            alt="Logo" 
                            style={{ width: '36px', height: '36px', marginRight: '8px' }} 
                        />
                        <Typography 
                            variant="h6" 
                            sx={{ color: '#fff', fontWeight: 700 }}
                        >
                            じゃっぱん
                        </Typography>
                    </ListItem>

                    {/* Mobile navigation items */}
                    <DrawerNavItem to="/create" label="作成" onClick={closeDrawer} />
                    <DrawerNavItem to="/categories" label="カテゴリ" onClick={closeDrawer} />
                    <DrawerNavItem to="/ranking" label="ランク" onClick={closeDrawer} />
                    <DrawerNavItem to="/about" label="案内" onClick={closeDrawer} />
                    
                    {isLoggedIn ? (
                        <DrawerNavItem to="/profile" label="プロフ" onClick={closeDrawer} />
                    ) : (
                        <>
                            <DrawerNavItem to="/login" label="ログイン" onClick={closeDrawer} />
                            <DrawerNavItem to="/register" label="登録" onClick={closeDrawer} />
                        </>
                    )}
                </List>
            </Drawer>

            {/* Global styles for the shuriken to katana transformation */}
            <style>{`
                .shuriken-katana-wrap {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 48px;
                }

                .shuriken-icon {
                    position: absolute;
                    left: 4px;
                    top: 4px;
                    width: 40px;
                    height: 40px;
                    opacity: 1;
                    transition: opacity 0.2s ease, transform 0.2s ease;
                    z-index: 2;
                }

                .katana-icon {
                    position: absolute;
                    left: -4px;
                    top: -4px;
                    width: 56px;
                    height: 56px;
                    opacity: 0;
                    transform: scale(0.7) rotate(-30deg);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    z-index: 1;
                }

                .shuriken-label {
                    font-size: 12px;
                    margin-top: 4px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 1px 4px rgba(34, 34, 34, 0.8);
                    font-family: 'Noto Sans JP', 'Noto Sans', monospace, sans-serif;
                    transition: color 0.2s ease;
                }

                /* Hover effects */
                .MuiIconButton-root:hover .shuriken-icon,
                .MuiListItem-root:hover .shuriken-icon {
                    opacity: 0;
                    transform: rotate(180deg) scale(0.8);
                }

                .MuiIconButton-root:hover .katana-icon,
                .MuiListItem-root:hover .katana-icon {
                    opacity: 1;
                    animation: katana-slash 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
                }

                .MuiIconButton-root:hover .shuriken-label,
                .MuiListItem-root:hover .shuriken-label {
                    color: #ffd700;
                    text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
                }

                @keyframes katana-slash {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.7) rotate(-30deg) translate(-12px, -12px); 
                    }
                    15% { 
                        opacity: 1; 
                        transform: scale(1) rotate(-18deg) translate(-8px, -8px); 
                    }
                    45% { 
                        opacity: 1; 
                        transform: scale(1.05) rotate(-12deg) translate(8px, 8px); 
                    }
                    75% { 
                        opacity: 1; 
                        transform: scale(1) rotate(-16deg) translate(2px, 2px); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: scale(1) rotate(-18deg) translate(0, 0); 
                    }
                }

                /* Focus styles for accessibility */
                .MuiIconButton-root:focus-visible {
                    outline: 2px solid #ffd700;
                    outline-offset: 2px;
                }

                .MuiListItem-root:focus-visible {
                    outline: 2px solid #ffd700;
                    outline-offset: 2px;
                }
            `}</style>
        </>
    );
};

export default Navbar;