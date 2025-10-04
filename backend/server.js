const express = require('express');
const path = require('path');
const cors = require('cors');

const productsRouter = require('../routes/products');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[BACKEND] ${req.method} ${req.url}`);
  next();
});

app.use('/api/productos', productsRouter);

app.get('/api/greeting', (req, res) => res.json({ message: 'Hola desde backend (carpeta backend)' }));

app.use('/api', (req, res) => res.status(404).json({ error: 'API not found' }));

app.listen(PORT, () => console.log(`Backend escuchando en http://localhost:${PORT}`));
