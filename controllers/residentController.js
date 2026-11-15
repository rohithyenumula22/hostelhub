const { getDatabase } = require('../database/db');

// GET /residents - Get all residents
const getAllResidents = (req, res) => {
  try {
    const db = getDatabase();
    const residents = db.prepare('SELECT * FROM residents').all();

    res.status(200).json({
      status: 'success',
      data: residents
    });
  } catch (error) {
    console.error('Error fetching residents:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch residents'
    });
  }
};

// GET /residents/:id - Get a single resident by ID
// ID validated by validateId middleware
const getResidentById = (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(id);

    if (!resident) {
      return res.status(404).json({
        status: 'error',
        message: `Resident with id ${id} not found`
      });
    }

    res.status(200).json({
      status: 'success',
      data: resident
    });
  } catch (error) {
    console.error('Error fetching resident:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch resident'
    });
  }
};

// POST /residents - Create a new resident
// Input validated by validateResidentInput middleware
const createResident = (req, res) => {
  try {
    const db = getDatabase();
    const { name, email } = req.body;

    const result = db.prepare('INSERT INTO residents (name, email) VALUES (?, ?)').run(name, email);

    const newResident = db.prepare('SELECT * FROM residents WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      status: 'success',
      message: 'Resident created successfully',
      data: newResident
    });
  } catch (error) {
    console.error('Error creating resident:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create resident'
    });
  }
};

module.exports = {
  getAllResidents,
  getResidentById,
  createResident
};
