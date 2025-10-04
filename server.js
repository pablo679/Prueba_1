const express = require('express');
const path = require('path');
const cors = require('cors');

const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // para futuras peticiones POST

// Logger global simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/productos', productsRouter);

// Simple test endpoints
app.get('/api/greeting', (req, res) => {
  res.json({ message: '¡Hola desde el backend!' });
});

app.post('/api/echo', (req, res) => {
  res.json({ youSent: req.body });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint no encontrado' });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
