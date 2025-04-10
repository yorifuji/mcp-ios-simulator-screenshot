FROM node:18-alpine

WORKDIR /app

# パッケージ情報とインストール
COPY package*.json ./
RUN npm install --production

# ビルド済みファイルをコピー
COPY build ./build

# 実行
ENTRYPOINT ["node", "build/index.js"]