# Skill-Share Open Ledger - Backend API

A RESTful API for a time-banking skill-sharing platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 Firebase Authentication Integration
- 👥 User Management
- 👨‍🏫 Tutor Profiles & Reviews
- 📅 Session Booking & Management
- 💰 Time Wallet System
- 📊 Transaction Ledger
- 🤖 AI-Powered Tutor Matching
- ✅ Input Validation
- 🛡️ Security Best Practices

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **Validation**: Express Validator
- **Security**: Helmet, CORS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Firebase Project with Admin SDK credentials

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Firebase service account email
   - `FIREBASE_PRIVATE_KEY`: Firebase service account private key
   - `JWT_SECRET`: A secure random string
   - `CORS_ORIGIN`: Your frontend URL (default: http://localhost:5173)

4. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify/create user from Firebase token
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Deactivate user account
- `GET /api/users/:id/stats` - Get user statistics

### Tutors
- `GET /api/tutors` - Get all tutors (with filters)
- `GET /api/tutors/:id` - Get tutor by ID
- `POST /api/tutors` - Create tutor profile
- `PUT /api/tutors/:id` - Update tutor profile
- `POST /api/tutors/:id/reviews` - Add review to tutor
- `GET /api/tutors/:id/reviews` - Get tutor reviews

### Sessions
- `GET /api/sessions` - Get all user sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Book a new session
- `PUT /api/sessions/:id` - Update session
- `POST /api/sessions/:id/complete` - Complete session
- `POST /api/sessions/:id/cancel` - Cancel session
- `POST /api/sessions/:id/review` - Add session review

### Transactions
- `GET /api/transactions` - Get all user transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/stats` - Get transaction statistics

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/adjust` - Adjust wallet balance (demo)

### Matchmaker
- `POST /api/matchmaker/recommend` - Get AI tutor recommendations
- `GET /api/matchmaker/suggestions` - Get personalized suggestions

## Authentication

All protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

Get the token from Firebase Authentication on the frontend and include it in API requests.

## Database Models

### User
- Profile information
- Time wallet (balance, earned, spent)
- Skills and interests
- Tutor status

### Tutor
- Expertise and categories
- Hourly rate
- Availability schedule
- Reviews and ratings
- Session statistics

### Session
- Tutor and student references
- Skill and category
- Scheduled date and time
- Status (pending, confirmed, completed, cancelled)
- Review and notes

### Transaction
- Type (earned, spent, adjustment, refund)
- Amount in hours
- Session reference
- Balance before and after
- Metadata

## Security Features

- Firebase token verification
- Request validation
- Helmet security headers
- CORS protection
- MongoDB injection prevention
- Error handling middleware

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── .env.example     # Environment template
├── .gitignore      # Git ignore rules
├── package.json    # Dependencies
└── server.js       # Entry point
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License
