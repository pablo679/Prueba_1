const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /api/productos -> lista de productos
router.get('/', (req, res) => {
  res.json(products);
});

// GET /api/productos/:id -> producto por id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

module.exports = router;
