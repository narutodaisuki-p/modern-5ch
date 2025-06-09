import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;


interface Thread {
  id: number;
  title: string;
  createdAt: string;
}



export const createThread = (title: string, content: string, setLoading: (loading: boolean) => void, setError: (error: string | null) => void, navigate: (path: string) => void) => {
  setLoading(true);
  axios.post(`${API_URL}/api/threads`, { title, content })
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
  axios.get(`${API_URL}/api/threads`)
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
  axios.get(`${API_URL}/api/threads/${threadId}/posts`)
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
    const response = await axios.get(`${API_URL}/api/categories`);
    setCategories(response.data);
  } catch (error) {
    setError('カテゴリの取得に失敗しました。もう一度お試しください。');
  } finally {
    setLoading(false);
  }
};