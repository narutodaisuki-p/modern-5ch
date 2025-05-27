export {};
// import React from 'react';
// import { Box, Typography, Button, Card, CardContent, Menu, MenuItem } from '@mui/material';
// import { loadStripe } from '@stripe/stripe-js';
// import axios from 'axios';
// const API_BASE_URL =   'http://localhost:5000/api'; // APIのベースURLを設定

// const stripePromise = loadStripe('pk_test_51RTFqePIBZCvgpNngVy17QhTwHjYRXABdUU7xzYTmQLQy8f28wXKTC2b2aC2glejYdFfOoB3jeNoot3dVxF5wiNR00dRYwd7t4'); // Stripeの公開可能キーを設定

// const PurchasePage = () => {
//   const items = [
//     { id: 1, name: 'ゴールドバッチ', price: 500 },
//     { id: 2, name: 'シルバーバッチ', price: 300 },
//     { id: 3, name: 'ブロンズバッチ', price: 100 },
//   ];

//   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
//   const [selectedItem, setSelectedItem] = React.useState<{ id: number; name: string; price: number } | null>(null);

//   const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, item: { id: number; name: string; price: number }) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedItem(item);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedItem(null);
//   };

//   const handleStripePayment = async () => {
//     if (!selectedItem) return;
//     try {
//       const stripe = await stripePromise;
//       const response = await axios.post(`${API_BASE_URL}/shop/create-checkout-session`  , {
//         itemName: selectedItem.name,
//         itemPrice: selectedItem.price,
//       });
//       console.log('Stripe session response:', response.data);
//       const { id } = response.data;
//       await stripe?.redirectToCheckout({ sessionId: id });
//     } catch (error) {
//       console.error('Stripe payment error:', error);
//     }
//     handleMenuClose();
//   };

//   const handleBitcoinPayment = async () => {
//     if (!selectedItem) return;
//     try {
//       const response = await axios.post(`${API_BASE_URL}/shop/create-bitcoin-payment`, {
//         itemName: selectedItem.name,
//         itemPrice: selectedItem.price,
//       });
//       const { hosted_url } = response.data;
//       window.location.href = hosted_url; // Coinbase Commerceの支払いページにリダイレクト
//     } catch (error) {
//       console.error('Bitcoin payment error:', error);
//     }
//     handleMenuClose();
//   };

//   const handleGiftCardSubmission = async () => {
//     const giftCardCode = prompt('ギフトカードコードを入力してください:');
//     if (!giftCardCode) return;
//     try {
//       const response = await axios.post(`${API_BASE_URL}/shop/submit-gift-card`, { giftCardCode });
//       alert(response.data.message);
//     } catch (error) {
//       console.error('Gift card submission error:', error);
//       alert('ギフトカードの送信に失敗しました。');
//     }
//     handleMenuClose();
//   };

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         購入ページ
//       </Typography>
//       <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//         {items.map((item) => (
//           <Card key={item.id} sx={{ width: 200 }}>
//             <CardContent>
//               <Typography variant="h6">{item.name}</Typography>
//               <Typography variant="body2">価格: ¥{item.price}</Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={(event) => handleMenuOpen(event, item)}
//                 sx={{ mt: 2 }}
//               >
//                 購入
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </Box>

//       {/* 決済手段の選択メニュー */}
//       <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
//         <MenuItem onClick={handleStripePayment}>クレジットカード（Stripe）</MenuItem>
//         <MenuItem onClick={handleBitcoinPayment}>ビットコイン</MenuItem>
//         <MenuItem onClick={handleGiftCardSubmission}>アマゾンギフトカード</MenuItem>
//       </Menu>
//     </Box>
//   );
// };

// export default PurchasePage;