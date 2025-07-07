// セキュリティ設定ファイル
// 高度なHelmet設定とセキュリティポリシー

/**
 * Helmet設定のドキュメント
 * 
 * 各セキュリティヘッダーの説明:
 * 
 * 1. Content Security Policy (CSP):
 *    - XSS攻撃を防ぐためのポリシー
 *    - リソースの読み込み元を制限
 * 
 
 * 3. X-Frame-Options:
 *    - クリックジャッキング攻撃を防ぐ
 *    - frameguardで設定
 * 
 * 4. X-Content-Type-Options:
 *    - MIMEタイプスニッフィングを防ぐ
 *    - noSniffで設定
 * 
 * 5. Referrer Policy:
 *    - リファラー情報の制御
 * 
 * 6. Feature Policy / Permissions Policy:
 *    - ブラウザ機能の制御
 */

const securityConfig = {
  // 開発環境用の緩い設定
  development: {
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'none'"],
      },
      reportOnly: true
    },
    hsts: false,
    expectCt: false
  },

  // 本番環境用の厳格な設定（Nginxリバースプロキシ想定）
  production: {
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net"
        ],
        styleSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.cloudinary.com"
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      },
      reportOnly: false
    },
    // HSTS無効化 - Nginxリバースプロキシで処理
    hsts: false,
    expectCt: {
      maxAge: 86400,
      enforce: true
    }
  },

  // 共通設定
  common: {
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: ["origin", "unsafe-url"] },
    hidePoweredBy: true,
    ieNoOpen: true,
    dnsPrefetchControl: { allow: false },
    permittedCrossDomainPolicies: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    originAgentCluster: true
  }
};

/**
 * Nginxリバースプロキシ環境での注意点:
 * 
 * 1. HSTS (Strict Transport Security)
 *    - Nginx側で設定することを推奨
 *    - add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
 * 
 * 2. Real IP取得
 *    - Express側で app.set('trust proxy', 1) を設定済み
 *    - Nginx側で proxy_set_header X-Real-IP $remote_addr; の設定が必要
 * 
 * 3. X-Forwarded-For
 *    - Nginx側で proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; の設定が必要
 * 
 * 4. プロトコル情報
 *    - Nginx側で proxy_set_header X-Forwarded-Proto $scheme; の設定が必要
 */

// CSPレポート用のエンドポイント設定例
const cspReportConfig = {
  endpoint: '/csp-report',
  reportTo: 'csp-endpoint',
  groupName: 'csp-endpoint',
  maxAge: 86400
};

// セキュリティヘッダーのテスト用URL
const securityTestUrls = {
  mozilla: 'https://observatory.mozilla.org/',
  securityheaders: 'https://securityheaders.com/',
  cspEvaluator: 'https://csp-evaluator.withgoogle.com/'
};

// 環境に応じたCSPディレクティブを取得
const getCSPDirectives = (allowedOrigins = []) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const config = isProduction ? securityConfig.production : securityConfig.development;
  const directives = { ...config.csp.directives };
  
  // allowedOriginsをconnectSrcに追加
  if (allowedOrigins.length > 0) {
    directives.connectSrc = [...directives.connectSrc, ...allowedOrigins];
  }
  
  return directives;
};

// 環境に応じたHelmet設定を取得
const getHelmetConfig = (allowedOrigins = []) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const envConfig = isProduction ? securityConfig.production : securityConfig.development;
  
  return {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: getCSPDirectives(allowedOrigins),
      reportOnly: isDevelopment
    },
    
    // Cross-Origin policies
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: securityConfig.common.crossOriginOpenerPolicy,
    crossOriginResourcePolicy: securityConfig.common.crossOriginResourcePolicy,
    
    // Security headers
    expectCt: envConfig.expectCt,
    hsts: envConfig.hsts,
    referrerPolicy: securityConfig.common.referrerPolicy,
    noSniff: securityConfig.common.noSniff,
    originAgentCluster: securityConfig.common.originAgentCluster,
    dnsPrefetchControl: securityConfig.common.dnsPrefetchControl,
    ieNoOpen: securityConfig.common.ieNoOpen,
    frameguard: securityConfig.common.frameguard,
    hidePoweredBy: securityConfig.common.hidePoweredBy,
    permittedCrossDomainPolicies: securityConfig.common.permittedCrossDomainPolicies,
    xssFilter: securityConfig.common.xssFilter
  };
};

module.exports = {
  securityConfig,
  cspReportConfig,
  securityTestUrls,
  getCSPDirectives,
  getHelmetConfig
};