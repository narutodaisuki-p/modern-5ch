import React from 'react';
import { Box, Typography } from '@mui/material';
import NinjaHackerButton from '../common/NinjaHackerButton';

const AboutPage = () => {
  return (
    <Box p={2} maxWidth="md" mx="auto" sx={{
      background: 'linear-gradient(120deg, #181a20 60%, #0ff 100%)',
      borderRadius: 4,
      boxShadow: '0 0 32px #0ff4, 0 0 8px #39ff144',
      color: '#fff',
      mt: 4,
      mb: 4,
      px: { xs: 1, md: 4 },
      py: { xs: 2, md: 4 },
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Typography variant="h4" gutterBottom sx={{
        fontWeight: 900,
        letterSpacing: 2,
        color: '#39ff14',
        textShadow: '0 0 12px #0ff, 0 0 4pxrgb(23, 26, 22)',
        mb: 2,
        fontFamily: 'monospace',
      }}>
        <span style={{ filter: 'drop-shadow(0 0 8px #0ff)' }}>この掲示板について</span>
      </Typography>

      <Typography variant="body1" gutterBottom sx={{ fontSize: '1.1rem', color: '#b2ffef' }}>
        この掲示板は、1人の高校生が「自分が使いたい掲示板を作る」というシンプルな動機からスタートしたオープンソースプロジェクトです。
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ color: '#0ff', fontWeight: 700, mt: 3 }}>
        🎯 目的と思想
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#b2ffef' }}>
        この掲示板は、ユーザーが自由に情報を共有し、匿名でも安心して対話できる「ネットの原点」を目指しています。<br/>
        <span style={{ color: '#39ff14', fontWeight: 700 }}>忍者の如く匿名、ハッカーの如く自由。</span><br/>
        表現の自由を尊重しつつも、最低限の秩序を守ることを大切にしています。
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ color: '#0ff', fontWeight: 700, mt: 3 }}>
        🛠 技術スタック
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#b2ffef' }}>
        フロントエンドは <strong>React + TypeScript</strong>、バックエンドは <strong>Node.js + Express</strong>、データベースは <strong>MongoDB</strong> を使用。<br/>
        <span style={{ color: '#39ff14' }}>GitHubで全コード公開中。誰でも改造・貢献OK！</span>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ color: '#0ff', fontWeight: 700, mt: 3 }}>
        🔐 セキュリティと安心設計
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#b2ffef' }}>
        スパム対策や不適切な投稿に対して、以下のようなモデレーション機能を実装：
      </Typography>
      <ul style={{ color: '#39ff14', fontWeight: 600, marginLeft: 24 }}>
        <li>NGワード自動チェック</li>
        <li>15分間に50回以上の投稿をスパムと判定しブロック</li>
        <li>通報機能によるユーザー主導の監視</li>
      </ul>

      <Typography variant="h6" gutterBottom sx={{ color: '#0ff', fontWeight: 700, mt: 3 }}>
        🧠 開発の背景
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#b2ffef' }}>
        学校の勉強より、実際に動くものを作ることに価値があると信じています。<br/>
        <span style={{ color: '#39ff14', fontWeight: 700 }}>「思考停止せず、自分の言葉で語れるネットの場」を取り戻す任務。</span>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ color: '#0ff', fontWeight: 700, mt: 3 }}>
        💬 フィードバック歓迎
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#b2ffef' }}>
        このプロジェクトはあなたの意見で進化します。<br/>
        改善点や新機能の提案は、GitHubのIssueから気軽にどうぞ。
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <NinjaHackerButton
          label="👉 GitHubリポジトリ"
          component="a"
          href="https://github.com/narutodaisuki-p/modern-5ch.git"
          target="_blank"
          rel="noopener noreferrer"
        />
        <NinjaHackerButton
          label="利用規約"
          component="a"
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
        />
      </Box>
    </Box>
  );
};

export default AboutPage;
