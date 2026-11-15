const { getDatabase } = require('../database/db');

// GET /rooms - Get all rooms, with optional smart search via ?q=
const getAllRooms = (req, res) => {
  try {
    const db = getDatabase();
    const { q } = req.query;

    let rooms;

    if (q && q.trim().length > 0) {
      // Smart Search: case-insensitive partial match on name OR block
      const searchTerm = `%${q.trim()}%`;
      rooms = db.prepare(
        'SELECT * FROM rooms WHERE name LIKE ? COLLATE NOCASE OR block LIKE ? COLLATE NOCASE'
      ).all(searchTerm, searchTerm);

      if (rooms.length === 0) {
        return res.status(200).json({
          message: 'Nothing found',
          rooms: []
        });
      }

      return res.status(200).json({
        status: 'success',
        data: rooms
      });
    }

    // No search query — return all rooms
    rooms = db.prepare('SELECT * FROM rooms').all();

    res.status(200).json({
      status: 'success',
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch rooms'
    });
  }
};

// GET /rooms/:id - Get a single room by ID
const getRoomById = (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: `Room with id ${id} not found`
      });
    }

    res.status(200).json({
      status: 'success',
      data: room
    });
  } catch (error) {
    console.error('Error fetching room:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch room'
    });
  }
};

// POST /rooms - Create a new room
// Input validated by validateRoomInput middleware
const createRoom = (req, res) => {
  try {
    const db = getDatabase();
    const { name, block } = req.body;

    const result = db.prepare('INSERT INTO rooms (name, block) VALUES (?, ?)').run(name, block);

    const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      status: 'success',
      message: 'Room created successfully',
      data: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create room'
    });
  }
};

// PUT /rooms/:id - Update a room by ID
// Input validated by validateId + validateRoomInput middleware
const updateRoom = (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { name, block } = req.body;

    // Check if room exists
    const existingRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    if (!existingRoom) {
      return res.status(404).json({
        status: 'error',
        message: `Room with id ${id} not found`
      });
    }

    db.prepare('UPDATE rooms SET name = ?, block = ? WHERE id = ?').run(name, block, id);

    const updatedRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);

    res.status(200).json({
      status: 'success',
      message: 'Room updated successfully',
      data: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update room'
    });
  }
};

// DELETE /rooms/:id - Delete a room by ID
// ID validated by validateId middleware
const deleteRoom = (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Check if room exists
    const existingRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    if (!existingRoom) {
      return res.status(404).json({
        status: 'error',
        message: `Room with id ${id} not found`
      });
    }

    // Check if room is currently allotted
    const allotment = db.prepare('SELECT * FROM allotments WHERE room_id = ?').get(id);
    if (allotment) {
      return res.status(409).json({
        status: 'error',
        message: `Cannot delete room with id ${id} because it is currently allotted to a resident`
      });
    }

    db.prepare('DELETE FROM rooms WHERE id = ?').run(id);

    res.status(204).send();
  } catch (error) {
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(409).json({
        status: 'error',
        message: `Cannot delete room with id ${req.params.id} because it is currently allotted to a resident`
      });
    }
    console.error('Error deleting room:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete room'
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
