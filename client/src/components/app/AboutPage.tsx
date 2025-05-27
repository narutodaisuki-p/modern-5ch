import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const AboutPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        このサイトについて
      </Typography>
      <Typography variant="body1" gutterBottom>
        この掲示板はオープンソースプロジェクトとして開発されています。
      </Typography>
        <Typography variant="body1"
         gutterBottom>
            目的は、ユーザーが自由に情報を共有し、コミュニケーションを楽しむことです。
        
        </Typography>
        <Typography variant="body1" gutterBottom>
        この掲示板は、高校生が趣味で開発したプロジェクトです。  
        若い世代の視点から、モダンで使いやすい掲示板を目指して作られました。
        </Typography>
        <Typography variant="body1" gutterBottom>
        このプロジェクトは、ReactとNode.jsを使用して構築されており、フロントエンドとバックエンドの両方がオープンソースで公開されています。
        </Typography>
        <Typography variant="body1" gutterBottom>
            表現の自由を尊重し、ユーザーが安心して利用できる環境を提供することを目指しています。
        </Typography>
        <Typography variant="body1" gutterBottom>
        この掲示板は、ユーザーが匿名で投稿できるように設計されており、個人情報の保護を重視しています。
        </Typography>
        <Typography variant="body1" gutterBottom>
            不適切なコンテンツやスパム行為を防ぐためのモデレーション機能も備えています。
        </Typography>
        <Typography variant="body1" gutterBottom>
        このプロジェクトは、コミュニティのフィードバックを歓迎しており、改善点や新機能の提案を受け付けています。
        </Typography>
        {/* お問い合わせページを持ってくる */}
        <Typography variant="body1" gutterBottom>
            ご意見やご要望がある場合は、GitHubのリポジトリでIssueを作成してください。
        </Typography>
        

      <Link href="https://github.com/narutodaisuki-p/modern-5ch.git" target="_blank" rel="noopener">
        GitHubリポジトリはこちら
      </Link>
    </Box>
  );
};

export default AboutPage;