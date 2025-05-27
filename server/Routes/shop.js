// require('dotenv').config();
// const express = require('express');
// const router = express.Router();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// // const CoinbaseCommerce = require('@coinbase/commerce-node');
// // const { Client } = CoinbaseCommerce;

// if (!process.env.STRIPE_SECRET_KEY) {
//     throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
// }
// // if (!process.env.COINBASE_API_KEY) {
// //     throw new Error('COINBASE_API_KEY is not set in environment variables');
// // }

// // const client = new Client({ apiKey: process.env.COINBASE_API_KEY });

// // Stripe決済
// router.post('/create-checkout-session', async (req, res) => {
//     const { itemName, itemPrice } = req.body;
//     if (!itemName || typeof itemName !== 'string') {
//         return res.status(400).json({ error: 'Invalid item name' });
//     }
//     if (!itemPrice || typeof itemPrice !== 'number' || itemPrice <= 0) {
//         return res.status(400).json({ error: 'Invalid item price' });
//     }
//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [{
//                 price_data: {
//                     currency: 'jpy',
//                     product_data: {
//                         name: itemName,
//                     },
//                     unit_amount: itemPrice * 100,
//                 },
//                 quantity: 1,
//             }],
//             mode: 'payment',
//             success_url: `${req.headers.origin}/success`,
//             cancel_url: `${req.headers.origin}/cancel`,
//         });
//         res.json({ status: 'success', id: session.id });
//     } catch (error) {
//         console.error('Stripe error:', error.message);
//         res.status(500).json({ status: 'error', message: 'Internal Server Error', details: error.message });
//     }
// });

// // // ビットコイン決済
// // router.post('/create-bitcoin-payment', async (req, res) => {
// //     const { itemName, itemPrice } = req.body;
// //     try {
// //         const charge = await client.charge.create({
// //             name: itemName,
// //             description: 'Payment for item',
// //             local_price: {
// //                 amount: itemPrice,
// //                 currency: 'JPY',
// //             },
// //             pricing_type: 'fixed_price',
// //         });
// //         res.json({ status: 'success', hosted_url: charge.hosted_url });
// //     } catch (error) {
// //         console.error('Coinbase error:', error.message);
// //         res.status(500).json({ status: 'error', message: 'Internal Server Error', details: error.message });
// //     }
// // });

// // アマゾンギフトカード（コード受け取り）
// router.post('/submit-gift-card', (req, res) => {
//     const { giftCardCode } = req.body;
//     if (!giftCardCode) {
//         return res.status(400).json({ error: 'Gift card code is required' });
//     }
//     // ここでギフトカードコードの処理を行う
    
//     res.json({ status: 'success', message: 'Gift card submitted successfully' });
// });

// module.exports = router;