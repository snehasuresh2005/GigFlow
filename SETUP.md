# GigFlow Setup Guide

## Quick Start

### 1. Install Dependencies

From the root directory:
```bash
npm run install-all
```

Or manually:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
- `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/gigflow`)
- `JWT_SECRET`: A secure random string (e.g., generate with `openssl rand -base64 32`)
- `PORT`: Backend port (default: 5000)
- `CLIENT_URL`: Frontend URL (default: http://localhost:5173)

### 3. Start MongoDB

Make sure MongoDB is running:
- **Local**: Start MongoDB service on your system
- **MongoDB Atlas**: Use your connection string in `.env`

### 4. Run the Application

**Option 1: Run both servers together**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Testing the Application

1. **Register a new user** at http://localhost:5173/register
2. **Login** at http://localhost:5173/login
3. **Post a gig** by clicking "Post a Gig" in the navbar
4. **Browse gigs** on the home page
5. **Submit a bid** on any open gig (as a different user)
6. **Hire a freelancer** (as the gig owner) - this will trigger a real-time notification

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Change the PORT in `backend/.env`
- Update `CLIENT_URL` if you change the frontend port

### CORS Issues
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- Check that credentials are enabled in API calls

### Socket.io Connection Issues
- Ensure both servers are running
- Check browser console for connection errors
- Verify CORS settings allow Socket.io connections

## Project Structure

```
gigflow/
├── backend/          # Express.js API server
│   ├── models/      # MongoDB models (User, Gig, Bid)
│   ├── routes/      # API routes
│   ├── middleware/  # Auth middleware
│   └── server.js    # Main server file
├── frontend/        # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store and slices
│   │   └── utils/       # Utility functions
└── README.md        # Project documentation
```

## Features Implemented

✅ User Authentication (JWT with HttpOnly cookies)
✅ Gig CRUD operations
✅ Search and filter gigs
✅ Bidding system
✅ Atomic hiring logic with MongoDB transactions
✅ Real-time notifications with Socket.io
✅ Minimalistic UI with Tailwind CSS
