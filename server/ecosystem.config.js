module.exports = {
  apps: [{
    name: "modern-5ch-server",
    script: "index.js",
    instances: "max",     // 利用可能なCPUコア数に基づいてインスタンス数を設定
    exec_mode: "cluster", // クラスターモードを有効化
    watch: false,         // ファイル変更の監視（開発環境では true にできる）
    max_memory_restart: "512M", // メモリ使用量が512MBを超えたら再起動
    env: {
      NODE_ENV: "production"
    },
    // エラー時の自動再起動
    autorestart: true,
    // グレースフルシャットダウンの設定
    kill_timeout: 5000,   // シグナル送信後、強制終了までの待機時間（ミリ秒）
  }]
}
