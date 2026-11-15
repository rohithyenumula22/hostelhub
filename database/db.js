const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'hostelhub.db');

let db;

/**
 * Initialize the database connection, create tables, and seed sample data.
 * Called once when the application starts.
 */
function initializeDatabase() {
  try {
    // Open (or create) the SQLite database
    db = new Database(DB_PATH);
    console.log('Connected to SQLite database at', DB_PATH);

    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
    console.log('Foreign key constraints enabled');

    // Create tables
    createTables();

    // Seed sample data (only if tables are empty)
    seedSampleData();

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

/**
 * Create the residents, rooms, and allotments tables if they don't exist.
 */
function createTables() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS residents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        block TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS allotments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resident_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (resident_id) REFERENCES residents(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      );
    `);
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error.message);
    throw error;
  }
}

/**
 * Insert sample data for testing, but only if the tables are empty.
 * This prevents duplicate data on every server restart.
 */
function seedSampleData() {
  try {
    // Check if data already exists
    const residentCount = db.prepare('SELECT COUNT(*) AS count FROM residents').get();
    if (residentCount.count > 0) {
      console.log('Sample data already exists, skipping seed');
      return;
    }

    // Use a transaction to ensure all-or-nothing insertion
    const seed = db.transaction(() => {
      // Insert sample residents
      const insertResident = db.prepare('INSERT INTO residents (name, email) VALUES (?, ?)');
      insertResident.run('Arun Kumar', 'arun.kumar@email.com');
      insertResident.run('Priya Sharma', 'priya.sharma@email.com');
      insertResident.run('Rahul Verma', 'rahul.verma@email.com');

      // Insert sample rooms
      const insertRoom = db.prepare('INSERT INTO rooms (name, block) VALUES (?, ?)');
      insertRoom.run('Room 101', 'Block A');
      insertRoom.run('Room 102', 'Block A');
      insertRoom.run('Room 201', 'Block B');
      insertRoom.run('Room 202', 'Block B');

      // Insert sample allotments (assign some residents to rooms)
      const insertAllotment = db.prepare('INSERT INTO allotments (resident_id, room_id) VALUES (?, ?)');
      insertAllotment.run(1, 1); // Arun Kumar -> Room 101
      insertAllotment.run(2, 3); // Priya Sharma -> Room 201
    });

    seed();
    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Failed to seed sample data:', error.message);
    throw error;
  }
}

/**
 * Get the database instance.
 * @returns {Database} The better-sqlite3 database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection gracefully.
 */
function closeDatabase() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};

