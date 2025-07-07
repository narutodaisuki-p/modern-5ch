# IP取得とNginxリバースプロキシ設定ガイド

## 問題の概要

Nginxリバースプロキシ環境では、以下の通信フローになります：

```
実際のクライアント --[HTTPS]--> Nginx --[HTTP]--> Express
```

この場合、Express側で直接取得できるIPアドレスは：
- `socket.handshake.address` = `::1` (localhost)
- `req.connection.remoteAddress` = `127.0.0.1` または `::1`

これらは**Nginxサーバーのアドレス**であり、実際のクライアントIPではありません。

## 解決策

### 1. Nginx側の設定

実際のクライアントIPをヘッダーに設定する必要があります：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        
        # 重要：実際のクライアントIP情報を転送
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

### 2. Express側の設定

#### プロキシを信頼する設定
```javascript
app.set('trust proxy', 1); // Nginxプロキシを信頼
```

#### IP取得のヘルパー関数
```javascript
function getRealClientIP(req) {
  // 優先順位：X-Forwarded-For > X-Real-IP > CF-Connecting-IP > req.ip
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.headers['cf-connecting-ip'] ||
         req.ip;
}
```

## 実際のIPアドレス取得方法

### HTTPリクエストの場合
```javascript
app.get('/api/endpoint', (req, res) => {
  const clientIP = getRealClientIP(req);
  console.log('実際のクライアントIP:', clientIP);
});
```

### Socket.IOの場合
```javascript
function getSocketClientIP(socket) {
  const headers = socket.handshake.headers;
  return headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         headers['x-real-ip'] ||
         headers['cf-connecting-ip'] ||
         socket.handshake.address;
}

io.on('connection', (socket) => {
  const clientIP = getSocketClientIP(socket);
  console.log('Socket接続のクライアントIP:', clientIP);
});
```

## IP取得の確認方法

### 1. テストエンドポイントの使用
```bash
# ローカルテスト
curl http://localhost:5000/test-ip

# 本番環境テスト
curl https://your-domain.com/test-ip
```

### 2. ログの確認
サーバーログで以下の情報を確認：
```javascript
console.log("IP detection:", {
  rawAddress: socket.handshake.address,        // ::1 または 127.0.0.1
  'x-forwarded-for': headers['x-forwarded-for'], // 実際のクライアントIP
  'x-real-ip': headers['x-real-ip'],           // Nginxが設定したIP
  detectedIP: ip                               // 最終的に使用するIP
});
```

## 本番環境での注意点

### 1. セキュリティ考慮事項
- `X-Forwarded-For`ヘッダーは偽装可能
- 信頼できるプロキシからのリクエストのみ処理
- IPベースの制限は補助的な手段として使用

### 2. ログ監視
```javascript
// 異常なIPパターンの監視
if (ip === '::1' || ip === '127.0.0.1') {
  console.warn('プロキシ設定に問題がある可能性があります');
}
```

### 3. Cloudflare使用時
Cloudflareを使用している場合は `CF-Connecting-IP` ヘッダーを優先：
```javascript
const cfIP = req.headers['cf-connecting-ip'];
if (cfIP) {
  return cfIP; // Cloudflareの実際のクライアントIP
}
```

## トラブルシューティング

### 問題：常に`::1`や`127.0.0.1`が表示される
**原因**：Nginx設定でプロキシヘッダーが設定されていない

**解決策**：
1. Nginx設定に`proxy_set_header`を追加
2. Nginxを再起動
3. Express側で`trust proxy`設定を確認

### 問題：レート制限が正常に動作しない
**原因**：全てのクライアントが同じIP（プロキシIP）として認識される

**解決策**：
1. 実際のクライアントIP取得の実装
2. レート制限ロジックでヘルパー関数を使用

## 実装確認

実装後、以下を確認してください：

1. **開発環境**：`::1`が表示される（正常）
2. **本番環境**：実際のクライアントIPが表示される
3. **レート制限**：異なるクライアントで個別に制限される
4. **ログ**：適切なIP情報が記録される