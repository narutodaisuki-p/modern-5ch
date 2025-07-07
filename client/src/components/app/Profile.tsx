import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Avatar, Box, TextField } from '@mui/material';
import Loadingis from '../common/Loading';
import { logout, authAxios } from '../../api/authHelper';
import { useLocation, useNavigate } from 'react-router-dom';
const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('ユーザー名');
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false); // 編集モードの状態を追加
    const [newUsername, setNewUsername] = useState<string>('');
    const [showProfileImage, setShowProfileImage] = useState<boolean>(() => {
        const saved = localStorage.getItem('showProfileImage');
        return saved === null ? true : saved === 'true';
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<any>(null); // ユーザー情報を格納するステート

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authAxios.get('/auth/profile');
                const data = response.data;
                setUsername(data.name);
                setProfileImage(data.picture || '/default-avatar.png');
                setNewUsername(data.name); // 初期値を設定
                setUser(data); // ユーザー情報をステートに保存
            } catch (error) {
                console.error(error);
                setUsername('エラーが発生しました');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // プロフィール画像表示切替の保存
    useEffect(() => {
        localStorage.setItem('showProfileImage', String(showProfileImage));
    }, [showProfileImage]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('ログアウトエラー:', error);
            // ログアウトに失敗した場合は、ユーザーにエラーメッセージを表示
            alert('ログアウトに失敗しました。再度お試しください。');
        } finally {
            // 最悪の場合でもローカルストレージは消しておく
            localStorage.removeItem('jwt');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
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
        try {
            const response = await authAxios.put('/auth/profile', { name: newUsername });
            const data = response.data;
            setUsername(data.user.name);
            setIsEditing(false);
            // 更新成功のフィードバックを表示
        } catch (error) {
            console.error(error);
            // エラーハンドリングをここに追加（例：ユーザーにエラーメッセージを表示）
        }
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // ファイルサイズチェック（例：5MB以下）
        if (file.size > 5 * 1024 * 1024) {
            alert('ファイルサイズは5MB以下にしてください');
            return;
        }

        // ファイル形式チェック
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await authAxios.put('/auth/profile/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;
            setProfileImage(data.picture);
        } catch (error) {
            console.error('画像アップロードエラー:', error);
            alert('画像のアップロードに失敗しました');
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
            {/* プロフィール画像表示切替スイッチ */}
            <Box sx={{ mb: 2 }}>
                <Button
                    variant={showProfileImage ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => setShowProfileImage(v => !v)}
                    sx={{ mr: 1 }}
                >
                    {showProfileImage ? '画像を隠す' : '画像を表示'}
                </Button>
            </Box>
            {/* プロフィール画像を編集 */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mb: 2 }} 
                onClick={handleImageUpload}
            >
                画像を変更
            </Button>

            {showProfileImage && (
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
            )}
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
            
            {/* タブセクションを削除し、プロフィール情報のみ表示 */}
            <Box sx={{ width: '100%', mt: 4 }}>
                <Box sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ color: '#26c6da' }}>
                            プロフィール情報
                        </Typography>
                        {/* ジブンが入っている部屋 */}
                        {user && user.rooms && user.rooms.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ color: '#43a047' }}>
                                    あなたが参加している部屋:
                                </Typography>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    {user.rooms.map((room: any) => (
                                        <li key={room._id} style={{ marginBottom: '8px' }}>
                                            <Typography variant="body2" sx={{ color: '#26c6da' }}>
                                                {room.name}
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#888', mt: 2 }}>
                                参加している部屋はありません。
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

        
        </Box>
    );
};

export default Profile;