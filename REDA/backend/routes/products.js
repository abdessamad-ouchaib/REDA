const express = require('express');
const Product = require('../models/Product');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/products  -> public, tout le monde peut voir les produits
// supporte ?category=... pour filtrer
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات.', error: err.message });
  }
});

// GET /api/products/:id -> public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ في الخادم.', error: err.message });
  }
});

// POST /api/products -> protégé (admin seulement)
router.post('/', requireAuth, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'تعذرت إضافة المنتج. تحقق من المعطيات.', error: err.message });
  }
});

// PUT /api/products/:id -> protégé (admin seulement)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود.' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'تعذر تعديل المنتج.', error: err.message });
  }
});

// DELETE /api/products/:id -> protégé (admin seulement)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود.' });
    res.json({ message: 'تم حذف المنتج بنجاح.' });
  } catch (err) {
    res.status(500).json({ message: 'تعذر حذف المنتج.', error: err.message });
  }
});

module.exports = router;
