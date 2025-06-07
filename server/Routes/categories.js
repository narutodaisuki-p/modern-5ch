const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Thread = require('../models/Thread');
const AppError = require('../utils/Error');

  // カテゴリを取得
  router.get('/', async (req, res, next) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      next(AppError(err.message || 'カテゴリの取得に失敗しました', 500));
    }
  });
  router.get('/:categoryId/threads', async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const { search, sort, startDate, endDate } = req.query;

      // 基本クエリ: カテゴリ指定
      let query = { category: categoryId };
      // キーワード検索
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }
      
      // 日付範囲フィルター
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      // ソートオプション
      let sortOption = { createdAt: -1 }; // デフォルト: 新着順
      if (sort === 'oldest') {
        sortOption = { createdAt: 1 };
      } else if (sort === 'popular') {
        sortOption = { postCount: -1, createdAt: -1 }; // 投稿数の降順でソート
      }
      
      const threads = await Thread.find(query).sort(sortOption);
      res.json(threads);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

router.get('/:categoryId', async (req, res, next) => {  
    try {
      const category = await Category.findById(req.params.categoryId);
      if (!category) {
        return next(AppError('Category not found', 404));
      }
      res.json(category);
    } catch (err) {
      next(AppError(err.message || 'カテゴリの取得に失敗しました', 500));
    }
  
  });
  
  module.exports = router;