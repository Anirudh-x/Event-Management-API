// Input validation middleware
const validateEventInput = (req, res, next) => {
  const { title, dateTime, location, capacity } = req.body;
  const errors = [];
  
  if (!title || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  
  if (!dateTime || isNaN(Date.parse(dateTime))) {
    errors.push('Invalid date format (use ISO 8601)');
  } else if (new Date(dateTime) < new Date()) {
    errors.push('Event date must be in the future');
  }
  
  if (!location || location.trim().length < 3) {
    errors.push('Location must be at least 3 characters');
  }
  
  if (typeof capacity !== 'number' || capacity < 1 || capacity > 1000) {
    errors.push('Capacity must be a number between 1 and 1000');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  }
  next();
};

module.exports = { validateEventInput, sanitizeInput };