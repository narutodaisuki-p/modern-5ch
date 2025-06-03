import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          利用規約
        </Typography>
        <Typography variant="body1" paragraph>
          この利用規約（以下、「本規約」といいます）は、当サービスの利用条件を定めるものです。本規約に同意いただいた上で、当サービスをご利用ください。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第1条（適用）
        </Typography>
        <Typography variant="body1" paragraph>
          本規約は、ユーザーと当サービス運営者との間のすべての関係に適用されます。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第2条（禁止事項）
        </Typography>
        <Typography variant="body1" paragraph>
          ユーザーは、以下の行為を行ってはなりません：
        </Typography>
        <ul>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当サービスの運営を妨害する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>

        <Typography variant="h5" gutterBottom>
          第3条（ログの保存）
        </Typography>
        <Typography variant="body1" paragraph>
          当サービスでは、通常ログを保存しません。ただし、法的要請があった場合や不正行為が疑われる場合には、必要に応じて一時的にログを保存することがあります。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第4条（免責事項）
        </Typography>
        <Typography variant="body1" paragraph>
          当サービスの利用により発生したいかなる損害についても、運営者は責任を負いません。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第5条（変更）
        </Typography>
        <Typography variant="body1" paragraph>
          運営者は、必要と判断した場合には、本規約を変更することができます。変更後の規約は、当サービス上に掲載された時点で効力を生じます。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第6条（お問い合わせ）
        </Typography>
        <Typography variant="body1" paragraph>
          本規約に関するお問い合わせは、以下のメールアドレスまでお願いいたします：
        </Typography>
        <Typography variant="body1" paragraph>
          shiluobenjian3@gmail.com
        </Typography>

        <Typography variant="body1" paragraph>
          以上
        </Typography>
      </Box>
    </Container>
  );
};

export default Terms;
