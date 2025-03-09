const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Placeholder routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all properties endpoint' });
});

router.post('/', authMiddleware, requireRole('verified'), (req, res) => {
  res.status(201).json({ message: 'Create property endpoint' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Get property ${req.params.id} endpoint` });
});

router.put('/:id', (req, res) => {
  res.status(200).json({ message: `Update property ${req.params.id} endpoint` });
});

module.exports = router;
