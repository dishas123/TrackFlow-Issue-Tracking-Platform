# TrackFlow

A full-stack issue tracking and project management platform. TrackFlow helps teams manage projects, organize tasks, track bugs and monitor project progress using interactive dashboards.

---

## Features

### Authentication & Security
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and authorization
- Input validation and error handling
- Helmet security headers

### Project Management
- Create, update, and delete projects
- Project ownership-based access control
- Project-level issue statistics
- Project progress tracking

### Issue Tracking
- Create and manage issues
- Priority levels (Low, Medium, High, Critical)
- Status workflow (Open, In Progress, Review, Done)
- Due date tracking
- Search, filtering, and pagination

### Features
- Activity timeline
- User avatars
- Dark and light mode

### Dashboard & Analytics
- Total projects and issues overview
- Open and completed issue tracking
- Priority distribution charts
- Status-wise issue analytics
- Recent activity feed

---

## Tech Stack

### Frontend
- React 18
- Context API
- Axios
- Recharts
- CSS3

### Backend
- Node.js
- Express.js
- Sequelize ORM
- JWT Authentication
- bcrypt
- express-validator

### Database
- MySQL

---

## Architecture

```text
Client (React)
      |
      v
REST API (Express)
      |
      v
Service Layer
      |
      v
Sequelize ORM
      |
      v
MySQL Database
```

The application follows a **Service Layer Architecture** with clear separation between routes, services, models, middleware, and utilities.

---

## API Modules

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Projects

```http
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Issues

```http
GET    /api/issues
POST   /api/issues
PUT    /api/issues/:id
DELETE /api/issues/:id
```

### Dashboard

```http
GET /api/dashboard/stats
GET /api/dashboard/activity
GET /api/dashboard/charts/*
```

---

## Key Highlights

- 20+ RESTful API endpoints
- JWT Authentication & Authorization
- Search, Filter & Pagination
- Activity Logging System
- Responsive UI with Dark Mode
- MySQL Relational Database Design
- Service Layer Architecture
- Secure Backend

---

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5016

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=track

JWT_SECRET=your_secret_key

NODE_ENV=development
```

---

## Project Outcomes

- Built a full-stack application using modern web technologies.
- Implemented secure authentication.
- Designed scalable REST APIs and relational database models.
- Applied software engineering best practices including modular architecture, validation, logging, and error handling.

---

## Future Improvements

- Real-time notifications using Socket.io
- Email notifications
- Role-based team collaboration
- Kanban drag-and-drop board
- File attachments for issues
- CI/CD deployment pipeline

---

