const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3200;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Data
let products = [
  { id: 1, name: "Product A", description: "Desc A", price: 199, categoryId: 1 },
  { id: 2, name: "Product B", description: "Desc B", price: 299, categoryId: 2 },
  { id: 3, name: "Product C", description: "Desc C", price: 499, categoryId: 1 }
];

let categories = [
  { id: 1, name: "Gadget" },
  { id: 2, name: "Fashion" }
];

let cart = [];

// Routes

// GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (product) return res.json(product);
  res.status(404).json({ error: 'Product not found' });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// POST /api/cart
app.post('/api/cart', (req, res) => {
  // Expected: { productId, quantity }
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(400).json({ error: 'Invalid productId' });

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  res.json({ success: true, cart });
});

// DELETE /api/cart/:productId
app.delete('/api/cart/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  cart = cart.filter(item => item.productId !== productId);
  res.json({ success: true, cart });
});

// Reset Cart (for dev/demo)
app.post('/api/cart/reset', (req, res) => {
  cart = [];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
