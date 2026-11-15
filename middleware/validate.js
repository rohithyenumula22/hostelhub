/**
 * Reusable validation middleware for HostelHub.
 * Each function returns an Express middleware that validates
 * the request and either calls next() or responds with 400.
 */

/**
 * Validate that a URL parameter is a positive integer ID.
 * Usage: router.get('/:id', validateId('id'), controller)
 */
const validateId = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    const id = Number(value);

    if (!value || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid ${paramName}: must be a positive integer`
      });
    }

    next();
  };
};

/**
 * Validate room input (name and block).
 * Used for POST /rooms and PUT /rooms/:id.
 */
const validateRoomInput = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: ['Request body must be a valid JSON object']
    });
  }

  const { name, block } = req.body;
  const errors = [];

  if (name === undefined || name === null) {
    errors.push('Room name is required');
  } else if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Room name must be a non-empty string');
  }

  if (block === undefined || block === null) {
    errors.push('Block name is required');
  } else if (typeof block !== 'string' || block.trim().length === 0) {
    errors.push('Block name must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Trim whitespace from validated values
  req.body.name = name.trim();
  req.body.block = block.trim();

  next();
};

/**
 * Validate resident input (name and email).
 * Used for POST /residents.
 */
const validateResidentInput = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: ['Request body must be a valid JSON object']
    });
  }

  const { name, email } = req.body;
  const errors = [];

  if (name === undefined || name === null) {
    errors.push('Resident name is required');
  } else if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Resident name must be a non-empty string');
  }

  if (email === undefined || email === null) {
    errors.push('Email is required');
  } else if (typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email must be a non-empty string');
  } else {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Email must be a valid email address');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Trim whitespace from validated values
  req.body.name = name.trim();
  req.body.email = email.trim();

  next();
};

/**
 * Validate allotment input (resident_id and room_id).
 * Used for POST /allotments.
 */
const validateAllotmentInput = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: ['Request body must be a valid JSON object']
    });
  }

  const { resident_id, room_id } = req.body;
  const errors = [];

  if (resident_id === undefined || resident_id === null) {
    errors.push('resident_id is required');
  } else if (!Number.isInteger(Number(resident_id)) || Number(resident_id) <= 0) {
    errors.push('resident_id must be a positive integer');
  }

  if (room_id === undefined || room_id === null) {
    errors.push('room_id is required');
  } else if (!Number.isInteger(Number(room_id)) || Number(room_id) <= 0) {
    errors.push('room_id must be a positive integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Ensure IDs are numbers
  req.body.resident_id = Number(resident_id);
  req.body.room_id = Number(room_id);

  next();
};

module.exports = {
  validateId,
  validateRoomInput,
  validateResidentInput,
  validateAllotmentInput
};

