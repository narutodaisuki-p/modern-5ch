import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, color: '#39ff14', textShadow: '0 0 12px #0ff' }}>
          忍者掲示板 利用の掟
        </Typography>
        <Typography variant="body1" paragraph>
          この掟（以下「忍掟」）は、現代忍者たちが平和に掲示板を使うための心得です。忍の道を守り、楽しくご利用ください。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第一条　忍の心得
        </Typography>
        <Typography variant="body1" paragraph>
          忍者は互いに敬意を払い、争いを避け、影のごとく静かに語り合うべし。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第二条　禁じ手
        </Typography>
        <Typography variant="body1" paragraph>
          以下の術は禁じ手とする：
        </Typography>
        <ul>
          <li>法令・公序良俗に反する術</li>
          <li>他者を傷つける闇の術</li>
          <li>掲示板の平穏を乱す妨害の術</li>
          <li>運営忍が不適切と認める術</li>
        </ul>

        <Typography variant="h5" gutterBottom>
          第三条　記録の巻物
        </Typography>
        <Typography variant="body1" paragraph>
          通常、忍の書き込みは巻物（ログ）に残さぬ。だが、法の掟や不正の気配があれば、一時的に巻物を記すことがある。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第四条　免責の術
        </Typography>
        <Typography variant="body1" paragraph>
          忍者掲示板の利用で生じた損害について、運営忍は一切責任を負わぬものとする。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第五条　掟の改定
        </Typography>
        <Typography variant="body1" paragraph>
          忍掟は時に応じて改定される。新たな掟は掲示板に示された時より効力を持つ。
        </Typography>

        <Typography variant="h5" gutterBottom>
          第六条　巻物の問い合わせ
        </Typography>
        <Typography variant="body1" paragraph>
          忍掟に関する問い合わせは、下記の巻物（メール）まで。
        </Typography>
        <Typography variant="body1" paragraph>
          shiluobenjian3@gmail.com
        </Typography>

        <Typography variant="body1" paragraph>
          以上、忍の道を共に歩まんことを。
        </Typography>
      </Box>
    </Container>
  );
};

export default Terms;
