const express = require('express');
const router = express.Router();
const Product = require('../models/Product');


// seed endpoint (dev only)
router.post('/seed', async (req, res)=>{
const items = req.body.items || [];
const created = await Product.insertMany(items);
res.json({ createdCount: created.length });
});


router.get('/', async (req,res)=>{
const q = req.query.q || '';
const page = parseInt(req.query.page||1);
const per = 12;
const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
const total = await Product.countDocuments(filter);
const products = await Product.find(filter).skip((page-1)*per).limit(per);
res.json({ products, total, page, per });
});


router.get('/:slug', async (req,res)=>{
const p = await Product.findOne({ slug: req.params.slug });
if(!p) return res.status(404).end();
res.json(p);
});


module.exports = router;