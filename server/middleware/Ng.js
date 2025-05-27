const Ngwords = process.env.NG_WORDS?.split(',') || ["爆発", "殺人", "ころしてやる"];

const Ng = (req, res, next) => {
    const { content } = req.body;
    console.log('NGワードチェック:', content);

    if (!content) {
        console.error('リクエストに content が含まれていません');
        return res.status(400).json({ message: 'リクエストに content が含まれていません。' });
    }

    if (Ngwords.some((word) => content.includes(word))) {
        console.error('NGワードが含まれています:', content);
        return next()
    }
    res.status(400).json({ message: 'NGワードが含まれていません。' });

    
};

module.exports = Ng;