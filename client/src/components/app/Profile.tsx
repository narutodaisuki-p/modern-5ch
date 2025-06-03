import React, { useState, useEffect } from 'react';
import { Button, Typography, Avatar, Box } from '@mui/material';

const Profile = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('ユーザー名');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                setLoading(false);
                setUsername('ログインしてください');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('ユーザー情報の取得に失敗しました');
                }

                const data = await response.json();
                setUsername(data.name);
                setProfileImage(data.picture || '/default-avatar.png');
            } catch (error) {
                console.error(error);
                setUsername('エラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
    };

    if (loading) {
        return <Typography>読み込み中...</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                プロフィール
            </Typography>
            <Avatar
                src={profileImage || undefined} // null を undefined に変換
                alt="プロフィール画像"
                sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 2 }}>
                {username}
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
                ログアウト
            </Button>
        </Box>
    );
};

export default Profile;