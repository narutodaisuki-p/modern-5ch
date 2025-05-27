const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Thread = require('../models/Thread');




  // カテゴリを取得
  router.get('/', async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  router.get('/:categoryId/threads', async (req, res) => {
    try {
      console.log("req.params",req.params);
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
        sortOption = { viewCount: -1, createdAt: -1 };
      }
      
      const threads = await Thread.find(query).sort(sortOption);
      res.json(threads);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

router.get('/:categoryId', async (req, res) => {
    try {
      const category = await Category.findById(req.params.categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  
  });
  module.exports = router;