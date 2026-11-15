const express = require('express');
const { initializeDatabase, closeDatabase } = require('./database/db');
const roomRoutes = require('./routes/roomRoutes');
const residentRoutes = require('./routes/residentRoutes');
const allotmentRoutes = require('./routes/allotmentRoutes');

// Initialize Express app
const app = express();

// Port configuration
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ==================== Initialize Database ====================

initializeDatabase();

// ==================== Routes ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HostelHub server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to HostelHub - Room Allotment Management System'
  });
});

// API routes
app.use('/rooms', roomRoutes);
app.use('/residents', residentRoutes);
app.use('/allotments', allotmentRoutes);

// 404 Not Found handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handling middleware (handles JSON parse errors, unexpected exceptions)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload format'
    });
  }

  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// ==================== Start Server ====================

const server = app.listen(PORT, () => {
  console.log(`HostelHub server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown — close database when the server stops
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  closeDatabase();
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;
