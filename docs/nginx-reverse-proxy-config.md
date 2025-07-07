# Nginx リバースプロキシ設定例

## Modern-5ch用のNginx設定

```nginx
server {
    listen 80;
    server_name api.oira.ninja;
    
    # HTTPからHTTPSへのリダイレクト
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.oira.ninja;
    
    # SSL証明書設定
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # セキュリティヘッダー（Helmet設定と重複しないもの）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Real-IP $remote_addr;
    
    # リバースプロキシ設定
    location / {
        proxy_pass http://localhost:5000;  # Node.jsアプリのポート
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # タイムアウト設定
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Socket.IO用の設定
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # ファイルアップロード制限
    client_max_body_size 10M;
    
    # ログ設定
    access_log /var/log/nginx/modern-5ch.access.log;
    error_log /var/log/nginx/modern-5ch.error.log;
}
```

## 設定のポイント

### 1. HTTPS強制リダイレクト
- HTTPアクセスを自動的にHTTPSにリダイレクト
- Helmet側のHSTSは無効化してNginx側で処理

### 2. リバースプロキシヘッダー
- `X-Real-IP`: 実際のクライアントIPアドレス
- `X-Forwarded-For`: プロキシチェーンの情報
- `X-Forwarded-Proto`: オリジナルのプロトコル（http/https）

### 3. WebSocket対応
- Socket.IO用の特別な設定
- `Connection: upgrade`ヘッダーの適切な処理

### 4. セキュリティ考慮事項
- TLS 1.2/1.3のみ許可
- 強力な暗号化スイートの使用
- HSTSヘッダーの適切な設定

## Express側での対応

```javascript
// リバースプロキシを信頼する設定
app.set('trust proxy', 1);

// HSTS無効化（Nginx側で処理）
hsts: false
```

## 検証方法

1. **ヘッダー確認**:
   ```bash
   curl -I https://your-domain.com
   ```

2. **SSL設定確認**:
   ```bash
   openssl s_client -connect your-domain.com:443
   ```

3. **セキュリティテスト**:
   - https://www.ssllabs.com/ssltest/
   - https://securityheaders.com/

この設定により、Nginxでのリバースプロキシ環境に最適化されたセキュリティ設定となります。

## 重要：クッキーのセキュリティ設定について

### 問題
Nginxリバースプロキシ環境では以下の通信フローになります：
```
クライアント --[HTTPS]--> Nginx --[HTTP]--> Express
```

この場合、Expressサーバー自体はHTTPで動作しているため、クッキーの`secure: true`設定があると：
- クライアント → Nginx: HTTPSでクッキー送信可能
- Nginx → Express: HTTPなのでクッキーが送信されない
- **結果：認証が機能しない**

### 解決策
Express側でのクッキー設定を調整：

```javascript
// 従来の設定（問題あり）
secure: process.env.NODE_ENV === 'production'

// 修正後の設定
secure: false  // または環境変数で制御
```

### 環境変数での制御
`.env`ファイルで柔軟に制御可能：

```bash
# Nginxリバースプロキシ環境の場合
COOKIE_SECURE=false

# 直接HTTPS提供の場合
COOKIE_SECURE=true
DIRECT_HTTPS=true
```

### セキュリティ考慮事項
- `secure: false`でもNginx側でHTTPS強制しているため実質的にセキュア
- `httpOnly: true`と`sameSite: 'strict'`は維持
- Nginx側でのSSL/TLS設定が重要
