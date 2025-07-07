import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// アクセストークンを更新する関数
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/auth/refresh`, {}, {
      withCredentials: true // クッキーを送信
    });
    return true;
  } catch (error) {
    console.error('トークン更新エラー:', error);
    // リフレッシュトークンが無効な場合
    return false;
  }
};

// 認証付きリクエストを行うための axios インスタンス
export const authAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true // クッキーを送受信
});

// インターセプターを追加してトークンの自動更新を行う
authAxios.interceptors.request.use(
  async (config) => {
    // HTTP-onlyクッキーは自動的にリクエストに含まれるため、
    // 特別な処理は必要ありません
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプターで401エラーを処理
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401エラーかつリトライフラグが立っていない場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // アクセストークンを更新
      const success = await refreshAccessToken();
      
      if (success) {
        // 新しいクッキーで再試行（ヘッダーの設定は不要）
        return authAxios(originalRequest);
      } else {
        // リフレッシュできなかった場合はログインページにリダイレクト
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ログアウト関数
export const logout = async () => {
  try {
    // サーバー側でトークンを無効化し、クッキーを削除
    await authAxios.post('/auth/logout', {}, {
      withCredentials: true
    });
    
    // ログインページにリダイレクト
    window.location.href = '/login';
  } catch (error) {
    console.error('ログアウトエラー:', error);
    // エラーが発生してもログインページにリダイレクト
    window.location.href = '/login';
  }
};

// 認証状態チェック関数
export const checkAuth = async (): Promise<boolean> => {
  try {
    // トークンの検証をサーバーに依頼（クッキーベース）
    await authAxios.post('/auth/verify', {}, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    // 検証に失敗した場合はリフレッシュを試みる
    return await refreshAccessToken();
  }
};