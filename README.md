API Endpoints Reference:

Events
GET /events - Get all events
GET /events/:id - Get event by ID
POST /events - Create event
PUT /events/:id - Update event
DELETE /events/:id - Delete event

Users
GET /users - Get all users
GET /users/:id - Get user by ID
POST /users - Create user

Registrations
POST /registrations/:eventId/register/:userId - Register user for event
DELETE /registrations/:eventId/deregister/:userId - Deregister user from event