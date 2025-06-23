# サーバーサイドVPSデプロイガイド（Vercelクライアント連携版）

このガイドでは、modern-5chアプリケーションのサーバーサイドをVPSにDockerを使ってデプロイする方法を説明します。クライアント側はVercelにデプロイされていることを前提としています。

## 前提条件

- UbuntuなどのLinuxベースのVPS
- Dockerとdocker-composeがインストールされていること
- Nginxがインストールされていること（SSLターミネーション用）
- ドメイン名が設定済みであること

## 1. VPSの初期セットアップ

### 1.1 SSHでVPSに接続

```bash
ssh username@your-vps-ip
```

### 1.2 必要なパッケージのインストール

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# docker-composeのインストール
sudo apt install -y docker-compose
```

ログアウトして再度ログインし、dockerグループの変更を適用します。

## 2. Nginxの設定（リバースプロキシとSSL）

### 2.1 Nginxの設定ファイル作成

```bash
sudo nano /etc/nginx/sites-available/api.oira.ninja
```

以下の内容を入力：

```nginx
server {
    server_name api.oira.ninja;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 大きなファイルのアップロードを許可
    client_max_body_size 10M;
}
```

シンボリックリンクを作成し、Nginxの設定をテスト：

```bash
sudo ln -s /etc/nginx/sites-available/api.oira.ninja /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2.2 SSL証明書の取得

```bash
sudo certbot --nginx -d api.oira.ninja
```

プロンプトに従って、SSL証明書を設定します。Certbotは自動的にNginxの設定を更新します。

## 3. アプリケーションのデプロイ

### 3.1 GitHubからコードをクローン

```bash
git clone https://github.com/yourusername/modern-5ch.git
cd modern-5ch
```

### 3.2 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、必要な値を設定します：

```bash
cp .env.example .env
nano .env
```

すべての環境変数に適切な値を設定してください。特に以下の変数を確認してください：

```
CORS_ORIGIN=https://www.oira.ninja
NODE_ENV=production
```

### 3.3 Dockerイメージのビルドと起動

```bash
docker-compose build
docker-compose up -d
```

これでサーバーアプリケーションが起動し、Nginxを通じてHTTPSで公開されます。

### 3.4 ログの確認

```bash
docker-compose logs -f
```

## 4. Vercelのクライアント側設定

Vercelにデプロイされたクライアントアプリケーションで、以下の環境変数を設定してください：

- `REACT_APP_API_URL=https://api.oira.ninja`

Vercelのダッシュボードで、プロジェクト設定 > 環境変数から設定できます。

## 5. コード更新時の手順

### 5.1 コード変更とGitへのプッシュ

ローカル環境でコードを変更し、GitHubにプッシュします：

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

### 5.2 サーバー側のコード更新とデプロイ

VPSにSSH接続し、以下のコマンドを実行：

```bash
cd modern-5ch
git pull origin main

# Dockerイメージの再ビルドと再起動
docker-compose down
docker-compose build
docker-compose up -d
```

### 5.3 自動更新スクリプトの作成（オプション）

更新を自動化するスクリプトを作成します：

```bash
nano ~/update-server.sh
```

以下の内容を入力：

```bash
#!/bin/bash
cd ~/modern-5ch
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

スクリプトに実行権限を付与：

```bash
chmod +x ~/update-server.sh
```

更新が必要な場合は、次のコマンドを実行するだけです：

```bash
~/update-server.sh
```

## 6. バックアップと障害復旧

### 6.1 MongoDBのバックアップ

定期的なバックアップを設定します：

```bash
# バックアップディレクトリの作成
mkdir -p ~/backups

# バックアップスクリプトの作成
nano ~/backup-db.sh
```

スクリプト内容：

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR=~/backups
MONGODB_URI=$(grep MONGODB_URI ~/modern-5ch/.env | cut -d '=' -f2)

# MongoDBダンプの作成
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$TIMESTAMP"

# 古いバックアップの削除（30日以上経過したもの）
find $BACKUP_DIR -type d -name "mongodb_*" -mtime +30 -exec rm -rf {} \;
```

スクリプトに実行権限を付与：

```bash
chmod +x ~/backup-db.sh
```

cronジョブを設定して自動バックアップを行います：

```bash
crontab -e
```

以下の行を追加して毎日午前3時にバックアップを実行：

```
0 3 * * * ~/backup-db.sh
```

## 7. パフォーマンスモニタリング

### 7.1 PM2モニタリング

PM2を使用しているので、以下のコマンドでパフォーマンスを監視できます：

```bash
# コンテナ内でPM2のモニタリングを確認
docker exec -it modern-5ch_server_1 pm2 monit

# ログの確認
docker exec -it modern-5ch_server_1 pm2 logs
```

### 7.2 Docker統計情報

```bash
# コンテナのリソース使用状況を確認
docker stats
```

## 8. トラブルシューティング

### 8.1 Nginxの接続問題

```bash
# Nginxのエラーログを確認
sudo tail -f /var/log/nginx/error.log

# Nginxの設定を確認
sudo nginx -t
```

### 8.2 Dockerコンテナの問題

```bash
# コンテナの状態を確認
docker ps -a

# コンテナのログを確認
docker-compose logs -f
```

### 8.3 SSL証明書の更新

Certbotは自動的に証明書を更新しますが、手動で更新する場合は：

```bash
sudo certbot renew
```
