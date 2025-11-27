/**
 * Example usage of express-swagger-autogen
 */

const express = require('express');
const { initSwagger } = require('../index');

const app = express();

app.use(express.json());

// Example routes
const router = express.Router();

// Simple GET endpoint
router.get('/users', (req, res) => {
  res.json({ users: [] });
});

// GET with path parameter
router.get('/users/:id', (req, res) => {
  res.json({ user: { id: req.params.id } });
});

// POST endpoint
router.post('/users', (req, res) => {
  res.json({ message: 'User created', user: req.body });
});

// Protected endpoint (simulated)
const verifyToken = (req, res, next) => next();
router.get('/profile', verifyToken, (req, res) => {
  res.json({ profile: {} });
});

app.use('/api/v1', router);

// Initialize Swagger AFTER routes
initSwagger(app, {
  title: 'Example API',
  version: '1.0.0',
  description: 'Example API with auto-generated documentation',
  basePath: '/api/v1',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ]
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
