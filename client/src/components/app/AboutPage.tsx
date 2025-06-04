import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const AboutPage = () => {
  return (
    <Box p={2} maxWidth="md" mx="auto">
      <Typography variant="h4" gutterBottom>
        この掲示板について
      </Typography>

      <Typography variant="body1" gutterBottom>
        この掲示板は、1人の高校生が「自分が使いたい掲示板を作る」というシンプルな動機からスタートしたオープンソースプロジェクトです。
      </Typography>

      <Typography variant="h6" gutterBottom>
        🎯 目的と思想
      </Typography>
      <Typography variant="body1" gutterBottom>
        この掲示板は、ユーザーが自由に情報を共有し、匿名でも安心して対話できる「ネットの原点」を目指しています。
        表現の自由を尊重しつつも、最低限の秩序を守ることを大切にしています。
      </Typography>

      <Typography variant="h6" gutterBottom>
        🛠 技術スタック
      </Typography>
      <Typography variant="body1" gutterBottom>
        フロントエンドは <strong>React + TypeScript</strong>、バックエンドは <strong>Node.js + Express</strong>、データベースは <strong>MongoDB</strong> を使用。
        GitHubで全コードを公開しており、誰でも改善や改造ができます。
      </Typography>

      <Typography variant="h6" gutterBottom>
        🔐 セキュリティと安心設計
      </Typography>
      <Typography variant="body1" gutterBottom>
        スパム対策や不適切な投稿に対して、以下のようなモデレーション機能を実装しています：
      </Typography>
      <ul>
        <li>NGワード自動チェック</li>
        <li>15分間に50回以上の投稿をスパムと判定しブロック</li>
        <li>通報機能によるユーザー主導の監視</li>
      </ul>

      <Typography variant="h6" gutterBottom>
        🧠 開発の背景
      </Typography>
      <Typography variant="body1" gutterBottom>
        学校の勉強より、実際に動くものを作ることに価値があると信じています。
        この掲示板は「思考停止せず、自分の言葉で語れるネットの場」を取り戻す試みです。
      </Typography>

      <Typography variant="h6" gutterBottom>
        💬 フィードバック歓迎
      </Typography>
      <Typography variant="body1" gutterBottom>
        このプロジェクトはあなたの意見で進化します。
        改善点や新機能の提案は、GitHubのIssueから気軽にどうぞ。
      </Typography>

      <Link
        href="https://github.com/narutodaisuki-p/modern-5ch.git"
        target="_blank"
        rel="noopener noreferrer"
      >
        👉 GitHubリポジトリはこちら
      </Link>
      <Box>
        <Link href="/terms" target="_blank" color="primary" underline="hover">
          利用規約
        </Link>
      </Box>
       
    </Box>
  );
};

export default AboutPage;
