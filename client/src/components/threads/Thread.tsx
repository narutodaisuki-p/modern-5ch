import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { fetchPosts } from '../../api/apiClient';
import { useAppContext } from '../../context/Appcontext';
import ErrorIs from '../common/Error';
import NinjaHackerButton from '../common/NinjaHackerButton';
import { socket } from '../../socket';
import { validateAndSetAnonymousNickname } from '../../api/apiClient';

const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 面白い名前を生成する関数
const adjectives = ['風変わりな', '陽気な', '静かな', '賢い', '勇敢な', '眠たい', 'さすらいの', 'おかしな', '輝く', '謎めいた'];
const nouns = ['猫', '犬', '忍者', '侍', '旅人', '狐', '梟', '龍', '影', '星'];

const generateFunnyName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  // 簡単な重複回避のため、短いランダム文字列を追加（サーバー側での重複チェックが本筋）

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${adj}${noun}_${randomSuffix}`;
};


interface Post {
  _id: number;
  content: string;
  createdAt: string;
  number: number;
  threadId?: number;
  imageUrl?: string;
  name?: string; // 投稿者名フィールドを追加
  userId?: string; // 追記: 投稿者のユーザーID
}

const PostItem = React.memo(({ post, onReport, currentUserId }: { post: Post; onReport: (id: number, content: string) => void; currentUserId: string | null | undefined }) => { // content引数を追加, currentUserId を props に追加
  const isOwnPost = post.userId && currentUserId && post.userId === currentUserId;

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: isOwnPost ? 'rgba(255, 0, 0, 0.05)' : undefined }}> {/* 自分の投稿であれば背景色を薄い赤に */}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {post.number}. <span style={{ color: isOwnPost ? 'red' : undefined }}>{post.name || '名無しさん'}</span> - {new Date(post.createdAt).toLocaleString()} {/* 自分の投稿であれば名前を赤字に */}
      </Typography>
      <Typography variant="body1" sx={{ color: isOwnPost ? 'darkred' : undefined }}>{post.content}</Typography> {/* 自分の投稿であれば本文を濃い赤に */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          style={{ maxWidth: '100%', marginTop: '10px' }}
        />
      )}
      <button
        style={{
          background: 'transparent',
          color: '#b71c1c',
          border: '1px solid #e57373',
          borderRadius: '4px',
          fontSize: '0.8rem',
          width: '38px', // 余裕を持たせる
          height: '26px',
          minWidth: 0,
          minHeight: 0,
          padding: '1px 0', // 横paddingを減らす
          marginLeft: '8px',
          cursor: 'pointer',
          fontFamily: '"Noto Sans JP", "Noto Sans", monospace',
          opacity: 0.7,
          transition: 'background 0.2s, color 0.2s, opacity 0.2s',
          letterSpacing: '0.05em',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
        onMouseOver={e => (e.currentTarget.style.opacity = '1')}
        onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
        onFocus={e => (e.currentTarget.style.opacity = '1')}
        onBlur={e => (e.currentTarget.style.opacity = '0.7')}
        onClick={() => onReport(post._id, post.content)}
        aria-label="投稿を報告"
      >
        報告
      </button>
    </Paper>
  );
});

const Thread: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const { setLoading, setError, user, isLoggedIn } = useAppContext(); // user を Appcontext から取得
  const [loadingState, setLoadingState] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false); // 初期値をfalseにし、useEffectで制御

  useEffect(() => {
    if (!threadId) return;

    if (isLoggedIn && user) {
      setNickname(user.name || 'ログインユーザー');
      setOpenDialog(false); // ログインしていればダイアログは不要
    } else {
      // 匿名ユーザーの場合
      const sessionNicknameKey = `anonymousNickname-${threadId}`;
      const existingNickname = sessionStorage.getItem(sessionNicknameKey);
      if (!existingNickname) {
        const generatedNickname = generateFunnyName();
        validateAndSetAnonymousNickname(
          threadId,
          generatedNickname,
          sessionNicknameKey,
          setNickname,
          setErrorState,
          setOpenDialog,
          true // 初回なのでtrue
        );
      } else {
        setNickname(existingNickname);
        setOpenDialog(false); // 既存のニックネームを使用するためダイアログは表示しない
      }
    }
  }, [threadId, user, isLoggedIn]);

  // 名前決定時の処理
  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      if (!user && threadId) {
        const sessionNicknameKey = `anonymousNickname-${threadId}`;
        await validateAndSetAnonymousNickname(
          threadId,
          nickname,
          sessionNicknameKey,
          setNickname,
          setErrorState,
          setOpenDialog,
          false // 初回ではないのでfalse
        );
      }
      // TODO: ログインユーザーの場合、サーバーにニックネームを保存する処理 (user.threadNicknames)

      setOpenDialog(false);
    }
  };

  const loadPosts = useCallback(() => {
    if (!threadId) return;
    fetchPosts(threadId, setPosts, setLoadingState, setErrorState);
  }, [threadId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // コンテキストのsetLoading/setErrorとローカルのloadingState/errorStateを同期
  useEffect(() => {
    setLoading(loadingState);
  }, [loadingState, setLoading]);

  useEffect(() => {
    setError(errorState);
  }, [errorState, setError]);


  useEffect(() => {
    // ニックネームが確定するまで、または必須情報が揃うまでソケット接続を待つ
    if (!threadId || !nickname) return;
    
    const currentNameForSocket = (user) ? (user.name || nickname) : nickname;
    if (!currentNameForSocket) {
        console.warn('ニックネームが未設定のため、ソケット接続をスキップします。');
        return;
    }

    socket.connect();
    socket.emit('joinThread', { threadId, name: currentNameForSocket });

    socket.on('newPost', (post: Post) => {
      setPosts((prev) => [...prev, post]);
    });
    socket.on('postError', (msg: string) => {
      setErrorState(msg);
      setTimeout(() => setErrorState(null), 3000);
    });
    return () => {
      socket.off('newPost');
      socket.off('postError');
      socket.disconnect();
    };
  }, [threadId, nickname, user]); // user を依存配列に追加

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const nameToSend = (user) ? (user.name || nickname) : nickname;
    if (!nameToSend) {
        setErrorState("ニックネームが設定されていません。");
        return;
    }

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const token = localStorage.getItem('jwt');
        socket.emit('newPost', { threadId, content: newPost, image: base64, token, name: nameToSend });
        setNewPost('');
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      socket.emit('newPost', { threadId, content: newPost, name: nameToSend , token: localStorage.getItem('jwt') });
      setNewPost('');
    }
  };

  const handleReport = useCallback(async (postId: number, content: string) => {
    if (!threadId) return;

    try {
      const response = await fetch(`${URL}/api/threads/${threadId}/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // alert(`通報の送信に失敗しました: ${errorData.message}`); // alertは重複するのでコメントアウト
        setErrorState(`通報の送信に失敗しました: ${errorData.message}`);
        setTimeout(() => setErrorState(null), 1000); 
        throw new Error(`通報の送信に失敗しました: ${errorData.message}`);
      }
      // 通報成功時の処理
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      alert('通報が送信されました');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorState(error.message);
      } else {
        setErrorState('通報処理中に不明なエラーが発生しました。');
      }
    }
  }, [threadId, setErrorState]); 
  // useCallbackでメモ化して、依存関係にhandleReportを追加
  const memoizedOnReport = useCallback((postId: number, content: string) => {
    handleReport(postId, content);
  }, [handleReport]);

  return (
    <Box>
      <Dialog
        open={openDialog && !user}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
        }}
      >
        <form onSubmit={handleNicknameSubmit}>
          <DialogTitle>ニックネームを入力または確認してください</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="ニックネーム"
              type="text"
              fullWidth
              value={nickname}
              onChange={e => {
                const newNick = e.target.value;
                setNickname(newNick);
                if (!user && threadId) {
                  sessionStorage.setItem(`anonymousNickname-${threadId}`, newNick);
                }
              }}
              required
              helperText={!user ? "この名前で投稿されます。" : ""}
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained" color="primary" disabled={!nickname.trim()}>
              入室する
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {errorState && <ErrorIs message={errorState} />}
      {loadingState && <Typography variant="h6">読み込み中...</Typography>}
      <Typography variant="h4" gutterBottom>
        スレッド {user ? `(${user.name}として参加中)` : `(匿名で参加中)名前は ${nickname}`}
      </Typography>
      

      <Box mb={4}>
        {posts.map((post) => (
          console.log(post,"はろー"), // デバッグ用
          <PostItem
            key={post._id}
            post={post}
            onReport={() => memoizedOnReport(post._id, post.content)}
            currentUserId={user?._id} // ログインユーザーのIDを渡す
          />
        ))}
      </Box>
      <Typography variant="h5" gutterBottom>
        新しい投稿
      </Typography>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="投稿内容を入力してください"
          required
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <input
          type="file"
          accept="image/jpeg, image/png, image/gif, image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              
              // ファイルサイズのチェック (10MB)
              if (file.size > 10 * 1024 * 1024) {
                setErrorState('画像サイズが大きすぎます。最大10MBまでです。');
                setTimeout(() => setErrorState(null), 3000);
                return;
              }
              
              // ファイル形式のチェック
              const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
              if (!allowedTypes.includes(file.type)) {
                setErrorState('サポートされていない画像形式です。JPEG, PNG, GIF, WebPのみ許可されています。');
                setTimeout(() => setErrorState(null), 3000);
                return;
              }
              
              setSelectedFile(file);
            }
          }}
          style={{ display: 'block', marginBottom: '10px' }}
          aria-label="画像を選択"
        />
        {selectedFile && (
          <Box sx={{ mb: 2 }}>
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={window.URL.createObjectURL(selectedFile)}
                alt="Selected"
                style={{ maxWidth: '50%', marginTop: '10px' }}
              />
            ) : (
              <Typography color="error" variant="body2">
                無効なファイル形式です。画像ファイルを選択してください。
              </Typography>
            )}
          </Box>
        )}

        <NinjaHackerButton type="submit" label="投稿する" variant="outlined" color="primary" sx={{ fontFamily: '"Noto Sans JP", "Noto Sans", monospace' }}  />
      </Paper>
    </Box>
  );
};

export default Thread;