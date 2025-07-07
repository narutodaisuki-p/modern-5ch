import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { authAxios } from '../../api/authHelper';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 入力検証
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('すべてのフィールドを入力してください');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }

    // パスワードの強度チェック
    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    setLoading(true);
    try {
      await authAxios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setSuccess('パスワードが正常に変更されました');
      // フォームをリセット
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'パスワードの変更中にエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="現在のパスワード"
          type="password"
          fullWidth
          margin="normal"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          label="新しいパスワード"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          helperText="8文字以上で設定してください"
        />
        <TextField
          label="新しいパスワード（確認）"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            mt: 2,
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 2,
            py: 1,
            background: 'linear-gradient(90deg, #16232d 60%, #26c6da 100%)',
            boxShadow: '0 0 8px #26c6da88, 0 0 2px #43a04788',
            border: '1.5px solid #43a047',
            letterSpacing: 1,
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
          disabled={loading}
        >
          {loading ? 'パスワード変更中...' : 'パスワードを変更する'}
        </Button>
      </form>
    </Box>
  );
};

export default ChangePassword;