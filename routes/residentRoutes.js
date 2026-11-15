const express = require('express');
const router = express.Router();
const { validateId, validateResidentInput } = require('../middleware/validate');
const {
  getAllResidents,
  getResidentById,
  createResident
} = require('../controllers/residentController');

// GET /residents - Get all residents
router.get('/', getAllResidents);

// GET /residents/:id - Get a single resident
router.get('/:id', validateId('id'), getResidentById);

// POST /residents - Create a new resident
router.post('/', validateResidentInput, createResident);

module.exports = router;
