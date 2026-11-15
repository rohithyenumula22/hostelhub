const { getDatabase } = require('../database/db');

// GET /allotments - Get all allotments with resident and room details (JOIN)
const getAllAllotments = (req, res) => {
  try {
    const db = getDatabase();

    const allotments = db.prepare(`
      SELECT 
        a.id,
        r.name AS resident_name,
        rm.name AS room_name,
        rm.block
      FROM allotments a
      JOIN residents r ON a.resident_id = r.id
      JOIN rooms rm ON a.room_id = rm.id
    `).all();

    res.status(200).json({
      status: 'success',
      data: allotments
    });
  } catch (error) {
    console.error('Error fetching allotments:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch allotments'
    });
  }
};

// POST /allotments - Allot a room to a resident
// Input validated by validateAllotmentInput middleware
const createAllotment = (req, res) => {
  try {
    const db = getDatabase();
    const { resident_id, room_id } = req.body;

    // Check if the resident exists
    const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(resident_id);
    if (!resident) {
      return res.status(404).json({
        status: 'error',
        message: `Resident with id ${resident_id} not found`
      });
    }

    // Check if the room exists
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: `Room with id ${room_id} not found`
      });
    }

    // Check if the room is already allotted
    const existingAllotment = db.prepare('SELECT * FROM allotments WHERE room_id = ?').get(room_id);
    if (existingAllotment) {
      return res.status(409).json({
        status: 'error',
        message: `Room with id ${room_id} is already allotted to another resident`
      });
    }

    // Create the allotment
    const result = db.prepare('INSERT INTO allotments (resident_id, room_id) VALUES (?, ?)').run(resident_id, room_id);

    // Return the new allotment with joined details
    const newAllotment = db.prepare(`
      SELECT 
        a.id,
        r.name AS resident_name,
        rm.name AS room_name,
        rm.block
      FROM allotments a
      JOIN residents r ON a.resident_id = r.id
      JOIN rooms rm ON a.room_id = rm.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      status: 'success',
      message: 'Room allotted successfully',
      data: newAllotment
    });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        status: 'error',
        message: `Room with id ${req.body.room_id} is already allotted to another resident`
      });
    }
    console.error('Error creating allotment:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create allotment'
    });
  }
};

module.exports = {
  getAllAllotments,
  createAllotment
};
