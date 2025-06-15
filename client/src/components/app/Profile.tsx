import React, { useState, useEffect } from 'react';
import { Button, Typography, Avatar, Box, TextField } from '@mui/material'; // TextField をインポート
import Loadingis from '../common/Loading';
const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('ユーザー名');
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false); // 編集モードの状態を追加
    const [newUsername, setNewUsername] = useState<string>('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('jwt');
            try {
                const response = await fetch(`${URL}/auth/profile`, {
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
                setNewUsername(data.name); // 初期値を設定
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

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) { // 編集モードを終了するときは、現在のユーザー名に戻す
            setNewUsername(username);
        }
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewUsername(event.target.value);
    };

    const handleSaveUsername = async () => {
    
        const token = localStorage.getItem('jwt');
        try {
            const response = await fetch(`${URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newUsername }),
            });

            if (!response.ok) {
                throw new Error('ユーザー名の更新に失敗しました');
            }

            const data = await response.json();
            setUsername(data.user.name);
            setIsEditing(false);
            window.location.reload(); // 更新後にページをリロードして最新の情報を反映
        } catch (error) {
            console.error(error);
            // エラーハンドリングをここに追加（例：ユーザーにエラーメッセージを表示）
        }
    };

    if (loading) {
        return <Loadingis />;
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 6,
            px: 2,
            py: 4,
            maxWidth: 420,
            mx: 'auto',
            borderRadius: 4,
            boxShadow: '0 0 24px #26c6da55, 0 0 8px #43a04744',
            background: 'linear-gradient(120deg, #16232d 60%, #1a2e2e 100%)',
            border: '1.5px solid #26c6da',
        }}>
            {/* プロフィール画像を編集 */}
            <Button variant="outlined" color="primary" sx={{ mb: 2 }} >
                画像を変更
            </Button>

            <Avatar
                src={profileImage || undefined}
                alt="プロフィール画像"
                sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    boxShadow: '0 0 16px #26c6da88, 0 0 4px #43a04788',
                    border: '3px solid #43a047',
                    background: '#1a2633',
                }}
            />
            <Typography variant="h4" gutterBottom sx={{
                fontWeight: 900,
                letterSpacing: 2,
                color: '#26c6da',
                textShadow: '0 2px 8px #00968888, 0 0px 4px #43a04788',
                mb: 1,
            }}>
                プロフィール
            </Typography>
            {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                        label="新しいユーザー名"
                        value={newUsername}
                        onChange={handleUsernameChange}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    />
                    <Button variant="contained" onClick={handleSaveUsername} sx={{ mr: 1 }}>保存</Button>
                    <Button variant="outlined" onClick={handleEditToggle}>キャンセル</Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{
                        mb:0, // 編集ボタンと縦位置を合わせるために調整
                        mr: 2, // ボタンとの間隔
                        color: '#43a047',
                        fontWeight: 700,
                        letterSpacing: 1,
                        textShadow: '0 0 4px #26c6da88',
                    }}>
                        {username}
                    </Typography>
                    <Button variant="outlined" onClick={handleEditToggle} size="small">編集</Button>
                </Box>
            )}
            <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                sx={{
                    fontWeight: 700,
                    fontSize: 18,
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    background: 'linear-gradient(90deg, #16232d 60%, #26c6da 100%)',
                    boxShadow: '0 0 8px #26c6da88, 0 0 2px #43a04788',
                    border: '1.5px solid #43a047',
                    letterSpacing: 2,
                    textTransform: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                        background: 'linear-gradient(90deg, #1a2e2e 60%, #43a047 100%)',
                        boxShadow: '0 0 16px #43a04788, 0 0 6px #26c6da88',
                        filter: 'brightness(1.05) contrast(1.1)',
                        borderColor: '#43a047',
                        color: '#fff',
                    },
                }}
            >
                ログアウト
            </Button>
        </Box>
    );
};

export default Profile;