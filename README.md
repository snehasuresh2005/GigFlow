# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack, TypeScript, Tailwind CSS, JWT authentication, role-based access control, advanced filtering, pagination, debounced search, and CSV export.

## Features

- **JWT Authentication** — Register, login, protected routes, bcrypt password hashing
- **Leads CRUD** — Create, read, update, delete leads with status and source tracking
- **Advanced Filtering** — Filter by status, source, search by name/email, sort latest/oldest (combinable)
- **Backend Pagination** — 10 records per page with metadata
- **Debounced Search** — 400ms debounce on the frontend
- **CSV Export** — Export filtered leads as CSV
- **RBAC** — Admin (full access including delete) and Sales User roles
- **Docker Setup** — `docker-compose` for MongoDB, backend, and frontend
- **Dark Mode** — Toggle with persisted preference (bonus)

## Tech Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| Frontend | React, TypeScript, Tailwind, Redux    |
| Backend  | Node.js, Express, TypeScript, Mongoose|
| Database | MongoDB                               |

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   └── src/
│       ├── models/       # User, Lead
│       ├── routes/       # auth, leads
│       ├── middleware/   # auth, rbac, errors
│       ├── types/
│       └── utils/
├── frontend/
│   └── src/
│       ├── components/   # UI + leads components
│       ├── pages/
│       ├── store/        # Redux slices
│       ├── hooks/
│       └── types/
├── docker-compose.yml
├── API.md
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Frontend environment (optional)

```bash
cd frontend
cp .env.example .env
```

For local dev, leave `VITE_API_URL` empty to use the Vite proxy, or set:

```
VITE_API_URL=http://localhost:5000
```

### 4. Seed sample data

```bash
npm run seed
```

**Demo accounts:**

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@smartleads.com  | admin123  |
| Sales | sales@smartleads.com  | sales123  |

### 5. Run locally

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Docker

```bash
npm run docker:up
```

Stop containers:

```bash
npm run docker:down
```

## API Documentation

See [API.md](./API.md) for full endpoint reference.

## Environment Variables

### Backend (`backend/.env`)

| Variable     | Description                    |
|--------------|--------------------------------|
| MONGODB_URI  | MongoDB connection string      |
| JWT_SECRET   | Secret for signing JWT tokens  |
| PORT         | Server port (default 5000)     |
| CLIENT_URL   | Allowed CORS origin(s)         |
| NODE_ENV     | `development` or `production`  |

### Frontend (`frontend/.env`)

| Variable      | Description                          |
|---------------|--------------------------------------|
| VITE_API_URL  | Backend URL (optional in dev)        |

## Submission Checklist

- [x] TypeScript (frontend + backend)
- [x] JWT auth with protected routes
- [x] Leads CRUD
- [x] Combined filters + search + sort
- [x] Backend pagination (10/page)
- [x] Debounced search
- [x] CSV export
- [x] RBAC (admin / sales)
- [x] Docker setup
- [x] README, `.env.example`, API docs
- [x] Dark mode (bonus)

## Author

Full Stack Internship Assignment — Smart Leads Dashboard
