# Helmet セキュリティ設定ガイド

## 概要
このドキュメントでは、modern-5chアプリケーションで実装されているHelmetセキュリティ設定について説明します。

## 設定された主要なセキュリティヘッダー

### 1. Content Security Policy (CSP)
**目的**: XSS攻撃を防ぐため、リソースの読み込み元を制限

**設定内容**:
- `defaultSrc: ["'self'"]` - デフォルトでは自分のサイトのみ許可
- `scriptSrc` - JavaScript読み込み元を制限
- `styleSrc` - CSS読み込み元を制限
- `imgSrc` - 画像読み込み元を制限（Cloudinary含む）
- `connectSrc` - AJAX/WebSocket接続先を制限
- `frameSrc: ["'none'"]` - iframe埋め込みを完全禁止

**環境別設定**:
- 開発環境: `unsafe-inline`, `unsafe-eval`を許可（デバッグのため）
- 本番環境: 厳格な制限

### 2. Strict Transport Security (HSTS)
**目的**: HTTPS接続を強制

**設定内容**:
- `maxAge: 31536000` - 1年間HTTPS強制
- `includeSubDomains: true` - サブドメインも対象
- `preload: true` - HSSTプリロードリストに対応

**注意**: 本番環境でのみ有効化

### 3. X-Frame-Options
**目的**: クリックジャッキング攻撃を防ぐ

**設定**: `frameguard: { action: 'deny' }` - iframe埋め込みを完全禁止

### 4. X-Content-Type-Options
**目的**: MIMEタイプスニッフィング攻撃を防ぐ

**設定**: `noSniff: true`

### 5. X-XSS-Protection
**目的**: 古いブラウザでのXSS保護

**設定**: `xssFilter: true`

### 6. Referrer Policy
**目的**: リファラー情報の制御

**設定**: `referrerPolicy: { policy: ["origin", "unsafe-url"] }`

### 7. その他のセキュリティヘッダー
- `hidePoweredBy: true` - X-Powered-Byヘッダーを隠す
- `ieNoOpen: true` - IE8+でのダウンロード時の動作制御
- `dnsPrefetchControl: { allow: false }` - DNS prefetchを無効化
- `originAgentCluster: true` - Origin Agent Clusterを有効化

## CSP違反レポート機能

### エンドポイント
- `POST /csp-report` - CSP違反を受信

### 使用方法
CSPヘッダーに`report-uri`または`report-to`ディレクティブを追加することで、違反を自動報告できます。

```javascript
// CSPディレクティブに追加例
'report-uri': ['/csp-report']
```

## セキュリティテスト

### テスト用エンドポイント
- `GET /security-test` - セキュリティヘッダーの確認

### 外部ツールでのテスト
1. **Mozilla Observatory**: https://observatory.mozilla.org/
2. **Security Headers**: https://securityheaders.com/
3. **Google CSP Evaluator**: https://csp-evaluator.withgoogle.com/

## 設定のカスタマイズ

### 新しいドメインを許可する場合
1. `allowedOrigins`配列に追加
2. CSPの`connectSrc`に追加

```javascript
const allowedOrigins = [
  'https://existing-domain.com',
  'https://new-domain.com' // 新しいドメインを追加
];
```

### 新しいCDNを許可する場合
CSPの該当ディレクティブに追加:

```javascript
scriptSrc: [
  "'self'",
  'https://existing-cdn.com',
  'https://new-cdn.com' // 新しいCDNを追加
]
```

## トラブルシューティング

### よくある問題

1. **CSP違反でページが正常に表示されない**
   - ブラウザの開発者ツールでCSP違反を確認
   - 必要なドメインをCSPに追加

2. **フォントが読み込まれない**
   - `fontSrc`ディレクティブを確認
   - Google Fontsなどの外部フォントサービスを追加

3. **画像が表示されない**
   - `imgSrc`ディレクティブを確認
   - Cloudinaryや他の画像CDNのドメインを追加

### デバッグモード
開発環境では`reportOnly: true`が設定されているため、CSP違反があってもページは正常に表示され、コンソールに警告が表示されます。

## セキュリティの継続的改善

1. **定期的なセキュリティヘッダーのテスト**
2. **CSP違反ログの監視**
3. **新機能追加時のセキュリティレビュー**
4. **Helmetライブラリの定期的更新**

## 参考資料
- [Helmet.js 公式ドキュメント](https://helmetjs.github.io/)
- [OWASP セキュリティヘッダーガイド](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
