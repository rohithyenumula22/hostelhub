const express = require('express');
const router = express.Router();
const { validateAllotmentInput } = require('../middleware/validate');
const {
  getAllAllotments,
  createAllotment
} = require('../controllers/allotmentController');

// GET /allotments - Get all allotments
router.get('/', getAllAllotments);

// POST /allotments - Create a new allotment
router.post('/', validateAllotmentInput, createAllotment);

module.exports = router;
