FROM node:18-alpine

WORKDIR /app

# プロジェクトのルートからpackage.jsonをコピー
COPY package.json ./

# PM2をグローバルにインストール
RUN npm install && npm install pm2 -g

# サーバーディレクトリの内容をコピー
COPY server/ .

# nginxがやるからhttpサーバーは不要
EXPOSE 5000

# PM2を使ってアプリケーションを起動
CMD ["pm2-runtime", "ecosystem.config.js"]