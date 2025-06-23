# VPSデプロイガイド

このガイドでは、modern-5chアプリケーションをVPSにDockerを使ってデプロイし、更新する方法を説明します。

## 前提条件

- UbuntuなどのLinuxベースのVPS
- Dockerとdocker-composeがインストールされていること
- ドメイン名（オプション）

## 1. VPSの初期セットアップ

### 1.1 SSHでVPSに接続

```bash
ssh username@your-vps-ip
```

### 1.2 必要なパッケージのインストール

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# docker-composeのインストール
sudo apt install -y docker-compose
```

ログアウトして再度ログインし、dockerグループの変更を適用します。

## 2. アプリケーションのデプロイ

### 2.1 GitHubからコードをクローン

```bash
git clone https://github.com/yourusername/modern-5ch.git
cd modern-5ch
```

### 2.2 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、必要な値を設定します：

```bash
cp .env.example .env
nano .env
```

すべての環境変数に適切な値を設定してください。

### 2.3 フロントエンドの環境変数設定

クライアント側のAPIエンドポイントを正しく設定します。docker-compose.ymlファイルでは次のように設定されています：

```yaml
environment:
  - REACT_APP_API_URL=http://your-vps-ip:5000
```

`your-vps-ip`をVPSの実際のIPアドレスに変更するか、ドメイン名を使用している場合はそれに変更します。

### 2.4 Dockerイメージのビルドと起動

```bash
docker-compose build
docker-compose up -d
```

これでアプリケーションが起動し、フロントエンドはポート80、バックエンドはポート5000で動作します。

### 2.5 ログの確認

```bash
# すべてのコンテナのログを表示
docker-compose logs

# 特定のサービスのログをフォロー
docker-compose logs -f client
docker-compose logs -f server
```

## 3. ドメイン名とSSLの設定（オプション）

### 3.1 Nginxのインストール（Dockerの外部で実行）

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.2 Nginxの設定

```bash
sudo nano /etc/nginx/sites-available/modern-5ch
```

以下の内容を入力：

```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

シンボリックリンクを作成し、Nginxを再起動：

```bash
sudo ln -s /etc/nginx/sites-available/modern-5ch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.3 SSL証明書の取得

```bash
sudo certbot --nginx -d your-domain.com
```

## 4. コード更新時の手順

### 4.1 コード変更とGitへのプッシュ

ローカル環境でコードを変更し、GitHubにプッシュします：

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

### 4.2 VPSでのコード更新とデプロイ

VPSにSSH接続し、以下のコマンドを実行：

```bash
cd modern-5ch
git pull origin main

# Dockerイメージの再ビルドと再起動
docker-compose down
docker-compose build
docker-compose up -d
```

### 4.3 自動更新スクリプトの作成（オプション）

更新を自動化するスクリプトを作成します：

```bash
nano ~/update-app.sh
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
chmod +x ~/update-app.sh
```

更新が必要な場合は、次のコマンドを実行するだけです：

```bash
~/update-app.sh
```

## 5. バックアップと障害復旧

### 5.1 MongoDBのバックアップ

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

## 6. パフォーマンスモニタリング

### 6.1 基本的なモニタリング

```bash
# コンテナのリソース使用状況を確認
docker stats

# ディスク使用量の確認
df -h

# メモリ使用量の確認
free -m
```

### 6.2 アプリケーションログのモニタリング

```bash
# 最近のログを確認
docker-compose logs --tail=100

# エラーを含むログを確認
docker-compose logs | grep -i error
```
