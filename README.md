# Setup Instructions
### Prerequisites
* Node.js (v18+)
* PostgreSQL (v14+)
* npm (v9+)

1. Clone the Repository
```
git clone https://github.com/yourusername/event-management-api.git
cd event-management-api
```

2. Install Dependencies
```
npm install
```

3. Set Up Environment Variables
Create a .env file in the root directory:
```
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/eventdb?schema=public"
PORT=3000
```

4. Set Up PostgreSQL Database
Create a new PostgreSQL database named eventdb
Update the .env file with your database credentials

5. Run Database Migrations
```
npx prisma migrate dev --name init
```

6. Start the Server
```
npm run dev
```

The API will be available at http://localhost:3000


# API Endpoints

1. Create Event

**POST** `/events`
Creates a new event with validation

Request:
```
{
  "title": "Tech Conference",
  "dateTime": "2025-08-15T09:00:00Z",
  "location": "Convention Center",
  "capacity": 500
}
```


Response (Success):
```
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response (Error):
```
{
  "error": "Capacity must be between 1-1000"
}
```

2. Get Event Details

**GET** `/events/:id`
Retrieves event details with registered users

Request:
```
GET /events/550e8400-e29b-41d4-a716-446655440000
```


Response:
```
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Tech Conference",
  "dateTime": "2025-08-15T09:00:00Z",
  "location": "Convention Center",
  "capacity": 500,
  "registrations": [
    {
      "userId": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

3. Register for Event

**POST** `/events/:eventId/register/:userId`
Registers a user for an event

```
POST /events/550e8400-e29b-41d4-a716-446655440000/register/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8
```

Response (Success):
```
{
  "message": "Registration successful"
}
```

Response (Errors):
```
{
  "error": "Event at full capacity"
}
```

```
{
  "error": "Cannot register for past events"
}
```

```
{
  "error": "User already registered"
}
```

4. Cancel Registration

**DELETE** `/events/:eventId/cancel/:userId`
Cancels a user's registration

Request:
```
DELETE /events/550e8400-e29b-41d4-a716-446655440000/cancel/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8
```

Response (Success):
204 No Content

Response (Error):
```
{
  "error": "Registration not found"
}
```

5. List Upcoming Events

**GET** `/events/upcoming/list`
Lists future events sorted by date (ascending) and location (A-Z)

Request:
```
GET /events/upcoming/list
```

Response:
```
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference",
    "dateTime": "2025-08-15T09:00:00Z",
    "location": "Convention Center",
    "capacity": 500
  },
  {
    "id": "67d8f0e1-2b9c-4f5d-a8e3-0f1e2d3c4b5a",
    "title": "Music Festival",
    "dateTime": "2025-08-20T14:00:00Z",
    "location": "Central Park",
    "capacity": 1000
  }
]
```

6. Event Statistics

**GET** `/events/:id/stats`
Provides event registration statistics

Request:
```
GET /events/550e8400-e29b-41d4-a716-446655440000/stats
```

Response:
```
{
  "total_registrations": 250,
  "remaining_capacity": 250,
  "percentage_used": 50
}
```

7. Create User

**POST** `/users`
Creates a new user

Request:
```
{
  "name": "Jane Smith",
  "email": "jane@example.com"
}
```

Response (Success):
```
{
  "id": "b2c3d4e5-f6g7-8901-h2i3-j4k5l6m7n8o9"
}
```

Response (Error):
```
{
  "error": "Email already exists"
}
```

# Database Schema

## Users

| Column        | Type          | Description          |
| ------------- |:-------------:|:--------------------:|
| id            | UUID          | Primary key          |
| name          | String        | User's full name     |
| email         | String        | Unique email address |

## Events

| Column        | Type          | Description               |
| ------------- |:-------------:|:-------------------------:|
| id            | UUID          | Primary key               |
| title         | String        | Event title               |
| dateTime      | DateTime      | Event date and time (ISO) |
| location      | String        | Event location            |
| capacity      | Int           | Max attendees (1-1000)    |

## Events Registrations

| Column        | Type          | Description               |
| ------------- |:-------------:|:-------------------------:|
| id            | UUID          | Primary key               |
| eventId       | UUID          | Foreign key to Event      |
| userId        | UUID          | Foreign key to User       |
| createdAt     | DateTime      | Timestamp of registration |

