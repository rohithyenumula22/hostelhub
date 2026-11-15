const express = require('express');
const router = express.Router();
const { validateId, validateRoomInput } = require('../middleware/validate');
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

// GET /rooms - Get all rooms
router.get('/', getAllRooms);

// GET /rooms/:id - Get a single room
router.get('/:id', validateId('id'), getRoomById);

// POST /rooms - Create a new room
router.post('/', validateRoomInput, createRoom);

// PUT /rooms/:id - Update a room
router.put('/:id', validateId('id'), validateRoomInput, updateRoom);

// DELETE /rooms/:id - Delete a room
router.delete('/:id', validateId('id'), deleteRoom);

module.exports = router;
