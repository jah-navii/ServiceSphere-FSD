# ServiceSphere

A full-stack service-booking platform built with React 19, Node.js 18+, Express, and MongoDB.

## Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ServiceSphere-FSD
```

### 2. Server setup
```bash
cd server
npm install
cp .env.example .env   # then edit .env with your values
```

Required variables in `server/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | — (required) |
| `JWT_SECRET` | Secret for signing JWTs (≥ 16 chars) | — (required) |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `JWT_EXPIRY` | JWT token lifetime | `7d` |
| `NODE_ENV` | `development` \| `production` \| `test` | `development` |

### 3. Client setup
```bash
cd client
npm install
```

## Running

### Development (both terminals)
```bash
# Terminal 1 — API server with hot-reload
cd server && npm run dev      # http://localhost:5000

# Terminal 2 — Vite dev server with HMR
cd client && npm run dev      # http://localhost:5173
```

### Production build
```bash
cd client && npm run build    # outputs to client/dist
cd server && npm start        # serves API on $PORT
```

### Other useful commands
```bash
cd server && npm run swagger  # regenerate Swagger spec
cd client && npm run lint     # ESLint
cd client && npm run format   # Prettier
```

## API

Swagger UI is available at **http://localhost:5000/api-docs** when the server is running.

Health check: `GET /api/health` → `{ ok: true, uptime: <s>, db: "connected" }`

## Project Structure

```
ServiceSphere-FSD/
├── client/          React 19 frontend (Vite)
├── server/          Express API
│   ├── config/      DB connection, env validation, Swagger
│   ├── controllers/ Route handlers
│   ├── middleware/  Auth, rate-limiting, error handling
│   ├── models/      Mongoose schemas
│   ├── routes/      Express routers
│   └── utils/       JWT helpers, Winston logger
└── other/           Legacy / reference files
```

## Features

- User authentication — Seeker, Helper, Moderator, Administrator (JWT)
- Service browsing and booking
- Admin and Moderator dashboards
- Helper dashboard with earnings and schedule
- Booking management and status tracking
- Feedback and review system
- File uploads (résumés, Aadhaar) via Multer
