# GigFlow - Mini Freelance Marketplace Platform

A full-stack freelance marketplace where Clients can post jobs (Gigs) and Freelancers can apply for them (Bids). Built with React, Node.js, Express, MongoDB, and Socket.io for real-time updates.

## Features

- **User Authentication**: Secure sign-up and login with JWT tokens stored in HttpOnly cookies
- **Gig Management**: Browse, search, and create freelance job postings
- **Bidding System**: Freelancers can submit bids with messages and prices
- **Hiring Logic**: Atomic transaction-based hiring system that prevents race conditions
- **Real-time Notifications**: Socket.io integration for instant notifications when hired
- **Minimalistic UI**: Clean and modern design with Tailwind CSS

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router
- Socket.io Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.io
- Bcrypt for password hashing

## Project Structure

```
gigflow/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── gigs.js
│   │   └── bids.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gigflow
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Backend server port (default: 5000)
   - `CLIENT_URL`: Frontend URL (default: http://localhost:5173)

4. **Frontend Setup**
   ```bash
   cd frontend
   ```
   No additional configuration needed. The frontend is configured to proxy API requests to the backend.

5. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

6. **Run the application**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs` - Get all open gigs (supports `?search=query` parameter)
- `POST /api/gigs` - Create a new gig (requires authentication)
- `GET /api/gigs/:id` - Get single gig details

### Bids
- `POST /api/bids` - Submit a bid (requires authentication)
- `GET /api/bids/:gigId` - Get all bids for a gig (owner only)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (owner only, atomic transaction)

## Database Schema

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)

### Gig
- `title`: String (required)
- `description`: String (required)
- `budget`: Number (required)
- `ownerId`: ObjectId (ref: User)
- `status`: String (enum: 'open', 'assigned')

### Bid
- `gigId`: ObjectId (ref: Gig)
- `freelancerId`: ObjectId (ref: User)
- `message`: String (required)
- `price`: Number (required)
- `status`: String (enum: 'pending', 'hired', 'rejected')

## Bonus Features Implemented

### ✅ Bonus 1: Transactional Integrity
The hiring logic uses MongoDB transactions to ensure atomic updates. When a client hires a freelancer:
- The gig status is updated to 'assigned'
- The selected bid is marked as 'hired'
- All other pending bids are marked as 'rejected'
- All operations happen atomically, preventing race conditions

### ✅ Bonus 2: Real-time Updates
Socket.io is integrated to send real-time notifications. When a freelancer is hired, they receive an instant notification without page refresh.

## Security Features

- Password hashing with bcrypt
- JWT tokens stored in HttpOnly cookies
- Input validation with express-validator
- CORS configuration
- Protected routes with authentication middleware

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Development Notes

- The application uses ES6 modules
- Redux Toolkit is used for state management
- Socket.io is configured for real-time communication
- All API requests include credentials for cookie-based authentication

## Submission

- **GitHub Repository**: [Your repository link]
- **Hosted Link**: [Your hosted application link]
- **Demo Video**: [Loom video link]

## Author

Built as part of Full Stack Development Internship Assignment
