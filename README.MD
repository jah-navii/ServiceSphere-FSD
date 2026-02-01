# ServiceSphere

A full-stack web application for service booking and management, built with React, Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ServiceSphere-FSD
```

### 2. Server Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
SESSION_SECRET=your_session_secret
```

### 3. Client Setup
```bash
cd client
npm install
```

## Running the Application

### Start the Server
```bash
cd server
npm start
```
Server runs on http://localhost:3000

### Start the Client
```bash
cd client
npm start
```
Client runs on http://localhost:5173

## Project Structure

- `/client` - React frontend application
- `/server` - Node.js/Express backend API
- `/other` - Additional resources and legacy code

## Features

- User authentication (Seeker, Helper, Admin)
- Service browsing and booking
- Admin dashboard for management
- Helper dashboard for service providers
- Booking management and tracking
- Feedback and review system