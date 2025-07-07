import axios from 'axios';
import { threadId } from 'worker_threads';
import { authAxios } from './authHelper';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 認証不要なAPI用のaxiosインスタンス
const publicAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true // クッキーを送受信
});


interface Thread {
  id: number;
  title: string;
  createdAt: string;
}

interface NicknameValidationResult {
  isValid: boolean;
  message?: string;
  nickname?: string;
}


export const createThread = (title: string, content: string, setLoading: (loading: boolean) => void, setError: (error: string | null) => void, navigate: (path: string) => void) => {
  setLoading(true);
  authAxios.post(`/api/threads`, { title, content })
    .then((response) => {
      console.log('スレッド作成成功:', response.data);
      setLoading(false);
      navigate('/');
    })
    .catch((error) => {
      console.error('スレッド作成失敗:', error);
      setError('スレッドの作成に失敗しました。もう一度お試しください。');
      setLoading(false);
    });
};

export const fetchThreads = (setThreads: (threads: Thread[]) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
  setLoading(true);
  publicAxios.get(`/api/threads`)
    .then((response) => {
      console.log('スレッド取得成功:', response.data);
      setThreads(response.data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('スレッド取得失敗:', error);
      setError('スレッドの取得に失敗しました。もう一度お試しください。');
      setLoading(false);
    });
}
export const fetchPosts = (threadId: string, setPosts: (posts: any[]) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
  setLoading(true);
  publicAxios.get(`/api/threads/${threadId}/posts`)
    .then((response) => {
      console.log('投稿取得成功:', response.data);
      setPosts(response.data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('投稿取得失敗:', error);
      setError('投稿の取得に失敗しました。もう一度お試しください。');
      setLoading(false);
    });
}
export const getCategories = async (setCategories:  (categories: any) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
  setLoading(true);
  try {
    const response = await publicAxios.get(`/api/categories`);
    setCategories(response.data);
  } catch (error) {
    setError('カテゴリの取得に失敗しました。もう一度お試しください。');
  } finally {
    setLoading(false);
  }
};

export const validateAndSetAnonymousNickname = async (
  threadId: string,
  nicknameToValidate: string,
  sessionNicknameKey: string,
  setNicknameState: (nickname: string) => void,
  setErrorState: (error: string | null) => void,
  setOpenDialogState: (open: boolean) => void,
  isInitialAttempt: boolean = true // 初回試行かどうか
): Promise<NicknameValidationResult> => {
  try {
    const response = await publicAxios.post(`/api/threads/${threadId}/checkNickname`, {
      nickname: nicknameToValidate
    });
    
    const data = response.data;

    if (!data.available) {
      const errorMessage = data.message || 'このニックネームは使用できません。';
      setErrorState(errorMessage);
      setTimeout(() => setErrorState(null), 3000);

      if (isInitialAttempt) {
        // 初回生成でNGだった場合、新しい名前を生成して再度試行する
        // (generateFunnyName は Thread.tsx からインポートするか、こちらにも定義する必要がある)
        // const newFunnyName = generateFunnyName(); // generateFunnyNameをどこからか持ってくる
        // console.log(`Nickname '${nicknameToValidate}' taken, trying new: '${newFunnyName}'`);
        // return validateAndSetAnonymousNickname(threadId, newFunnyName, sessionNicknameKey, setNicknameState, setErrorState, setOpenDialogState, false);
        // ↑ 再帰呼び出しはループの可能性があるので、ここでは一旦、エラーを返してダイアログでユーザーに対応を促す
        setOpenDialogState(true); // ダイアログを開いてユーザーに修正を促す
        return { isValid: false, message: errorMessage, nickname: nicknameToValidate };
      }
      // ユーザーが入力したものがNGだった場合など
      console.warn(`Nickname '${nicknameToValidate}' is not available.`);
      setNicknameState(nicknameToValidate); // 入力したニックネームを表示しておく
      setErrorState(errorMessage);
      setTimeout(() => setErrorState(null), 3000);
      // ダイアログを開いてユーザーに修正を促す
      // ここでは再帰的に新しいニックネームを生成するのではなく、ユーザーに修正を促す
      setOpenDialogState(true);
      return { isValid: false, message: errorMessage, nickname: nicknameToValidate };
    }

    // 利用可能な場合
    sessionStorage.setItem(sessionNicknameKey, nicknameToValidate);
    setNicknameState(nicknameToValidate);
    if (isInitialAttempt) {
        setOpenDialogState(true); // 初回は確認のためダイアログを開く
        // ここでダイアログを開いて、ユーザーに確認を促す
    } else {
        setOpenDialogState(false); // ユーザーがダイアログで入力してOKだった場合は閉じる
    }
    return { isValid: true, nickname: nicknameToValidate };

  } catch (error) {
    console.error('ニックネームの確認中にエラー:', error);
    // ネットワークエラーなどの場合
    const errorMessage = 'ニックネームの確認中にネットワークエラーが発生しました。';
    setErrorState(errorMessage);
    setTimeout(() => setErrorState(null), 3000);
    setNicknameState(nicknameToValidate); // エラー時もとりあえず表示はしておく
    setOpenDialogState(true); // ダイアログでユーザーに対応を促す
    return { isValid: false, message: errorMessage, nickname: nicknameToValidate };
  }
};