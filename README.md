# Hostel Management System

A simple hostel management web application where an admin allocates students to rooms with a maximum capacity of two, and students can submit complaints about their room.

---

## Project Overview

This is a full-stack web application for hostel management with separate authentication for Admin/Warden and Student users. After login, each user sees a role-based dashboard with appropriate functionalities.

**User Roles:**
- **Admin / Warden**: Adds rooms, allocates students, and resolves room complaints
- **Student**: Views assigned room details and files maintenance complaints

---

## Features & Functionalities

## Features & Functionalities

### Required Pages
1. **Register & Login Pages**: Separate forms with role selection for Admin and Student
2. **Admin Dashboard**: 
   - Form to add hostel rooms
   - Form to allocate students to rooms
   - View and resolve maintenance complaints
   - View room occupancy and student roster
3. **Student Dashboard**: 
   - View assigned room allocation details
   - Submit maintenance complaints about the room
   - View complaint history and status

### Main Functionalities

#### 1. Room Management (Admin)
- **Add Hostel Rooms**: Admin can create unique rooms (e.g., Room 101, 102, 103)
- **Allocate Students**: Assign students to available rooms with a strict maximum of 2 students per room
- **View Room Occupancy**: Real-time visualization of room occupancy status
- **Check-In/Check-Out Management**: Track student arrivals and departures

#### 2. Complaint Management
- **Submit Complaints** (Students): Students can report maintenance issues about their assigned room
- **View Complaints** (Admin): Admin can view all submitted complaints with student and room details
- **Resolve Complaints** (Admin): Admin can mark complaints as "Resolved"

---

## Business Logic Rules (Strictly Enforced)

All business rules are enforced on the **backend server** with appropriate HTTP status codes:

| Business Rule | Enforcement | Error Response |
|--------------|-------------|----------------|
| **Maximum 2 Students Per Room** | `server/routes/admin.ts` (Lines 87-93)<br>`server/db.ts` (Lines 274-284) | `400 Bad Request`: "Room is full (maximum 2 students)" |
| **Single Room Assignment** | `server/routes/admin.ts` (Lines 74-85) | `400 Bad Request`: "Student is already assigned to Room [number]" |
| **Room-Bound Complaints** | `server/routes/student.ts` (Lines 63-71) | `403 Forbidden`: "Cannot file a complaint without an assigned room" |
| **Non-Empty Complaints** | `server/routes/student.ts` (Lines 57-61) | `400 Bad Request`: "Complaint text cannot be empty" |
| **Unique Room Numbers** | `server/routes/admin.ts` (Lines 30-35) | `409 Conflict`: "Room [number] already exists" |

### Edge Cases Handled
✅ Attempting to allocate a student to a room that already has 2 occupants → **Rejected**  
✅ Attempting to allocate a student who is already assigned to another active room → **Rejected**  
✅ Student without room assignment trying to submit complaint → **Rejected with 403 Forbidden**

### Technical Constraints Followed
❌ No room change requests or transfers implemented  
❌ No complaint escalation timers  
❌ No priority-based complaint routing  

---

## Additional Features (Beyond Basic Requirements)

### Hosteller Public Showcase
- Modern landing page with hostel branding and amenities showcase
- Interactive room search with availability checker
- Guest reviews and social proof ratings
- Smooth toggle between public website and management console

### Admin Analytics Dashboard
- **Data Visualization**: Interactive Recharts displaying empty vs occupied rooms ratio
- **Per-Room Analysis**: Bar chart showing bed allocation status
- **Student Roster**: Comprehensive directory with inline actions
- **Stay History**: Complete check-in/check-out records with filtering

### Student Self-Service Features
### Student Self-Service Features
- **Self Check-In**: Browse available rooms and self-check-in with stay dates
- **Room Details**: View assigned room, capacity, and roommate information
- **Self Check-Out**: Vacate room bed with confirmation
- **Stay History**: Complete log of past and active stay records
- **Complaint Tracking**: Real-time status updates on submitted complaints

---

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite (Build tool)
- Tailwind CSS v4 (Styling)
- Recharts (Data visualization)
- Lucide React (Icons)

**Backend:**
- Node.js
- Express.js (REST API)
- TypeScript with tsx runner

**Database:**
- MongoDB with Mongoose
- Fallback persistent datastore (works without MongoDB installation)

**Authentication:**
- JWT (JSON Web Tokens) with Bearer token scheme
- bcryptjs for password hashing (10 salt rounds)

---

## Test Credentials

The database comes pre-seeded with demo accounts for instant testing:

### Admin / Warden Account
- **Email**: `warden@hostel.edu`
- **Password**: `warden123`
- **Admin Registration Code**: `warden123` (required for new admin registration)

### Student Accounts
1. **Alex Johnson** (Assigned to Room 101, has a pending complaint)
   - Email: `alex@student.edu`
   - Password: `student123`

2. **Samantha Lee** (Roommate of Alex in Room 101, making it 2/2 full)
   - Email: `sam@student.edu`
   - Password: `student123`

3. **Jordan Miller** (Assigned to Room 102, 1/2 occupied)
   - Email: `jordan@student.edu`
   - Password: `student123`

4. **Rohan Sharma** (Unassigned student for testing allocation)
   - Email: `rohan@student.edu`
   - Password: `student123`

*Note: You can also use the 1-Click Demo Login buttons on the login page.*

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm (or bun)
- (Optional) MongoDB running locally or MongoDB Atlas connection URI

### Steps to Run Locally

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd hostel-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or if you have bun installed:
   # bun install
   ```

3. **Set up environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   PORT=3000
   MONGO_URI="mongodb://localhost:27017/hostel"
   JWT_SECRET="super-secret-jwt-key-hostel-system-2026"
   ADMIN_CODE="warden123"
   APP_URL="http://localhost:3000"
   ```
   
   **Note:** If `MONGO_URI` is omitted or MongoDB is offline, the server automatically uses an integrated persistent fallback datastore—no MongoDB installation required!

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

---

## API Documentation

### Public Authentication Endpoints

#### Register
- **POST** `/api/register`
- **Body**: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "min6chars",
    "role": "admin" | "student",
    "adminCode": "warden123"  // Required only for admin role
  }
  ```
- **Response**: `201 Created` with JWT token and user info

#### Login
- **POST** `/api/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123",
    "role": "admin" | "student"
  }
  ```
- **Response**: `200 OK` with JWT token and user info

### Admin Endpoints (Protected, requires `role: admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all rooms with occupants |
| POST | `/api/rooms` | Create a new room |
| GET | `/api/students` | List all students with room assignments |
| POST | `/api/check-in` | Allocate student to a room |
| POST | `/api/check-out` | Remove student from room |
| GET | `/api/complaints` | List all maintenance complaints |
| PATCH | `/api/complaints/:id/resolve` | Toggle complaint status (Pending ↔ Resolved) |

### Student Endpoints (Protected, requires `role: student`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/my-room` | Get assigned room and roommate details |
| POST | `/api/my-check-in` | Self check-in to available room |
| POST | `/api/my-check-out` | Self check-out from current room |
| GET | `/api/my-complaints` | Get own complaint history |
| POST | `/api/complaints` | Submit maintenance complaint |
| GET | `/api/my-stays` | Get complete stay history |

---

## Deployment Instructions

### Deploy to Render (Recommended)

1. **Set up MongoDB Atlas** (Free Tier):
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/hostel`)

2. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hostel Management System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hostel-management-system.git
   git push -u origin main
   ```

3. **Deploy on Render**:
   - Go to [Render Dashboard](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Add Environment Variables:
     - `NODE_ENV` = `production`
     - `MONGO_URI` = `<Your MongoDB Atlas Connection String>`
     - `JWT_SECRET` = `<Random secure string>`
     - `ADMIN_CODE` = `warden123`
     - `PORT` = `3000`
     - `APP_URL` = `<Your Render URL>`
   - Click "Create Web Service"

### Deploy to Vercel (Frontend) + Render (Backend)

**Option 1: Full-stack on Vercel**
- Connect repository to Vercel
- Configure MongoDB Atlas connection in Environment Variables
- Vercel will auto-detect Vite and build accordingly

**Option 2: Split Deployment**
- Deploy backend API to Render/Railway
- Deploy frontend to Vercel/Netlify
- Update API base URL in frontend configuration

---

## Project Structure

```
hostel-management-system/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── AuthCard.tsx         # Login/Register form
│   │   ├── AdminDashboard.tsx   # Admin management console
│   │   ├── StudentDashboard.tsx # Student portal
│   │   └── ...
│   ├── context/                 # React context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Theme management
│   ├── services/                # API service layer
│   │   └── api.ts               # HTTP client
│   └── types/                   # TypeScript type definitions
│       └── index.ts
├── server/                       # Backend Express application
│   ├── routes/                  # API route handlers
│   │   ├── auth.ts              # Authentication routes
│   │   ├── admin.ts             # Admin-only routes
│   │   └── student.ts           # Student-only routes
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts              # User model
│   │   ├── Room.ts              # Room model
│   │   └── Complaint.ts         # Complaint model
│   ├── middleware/              # Express middleware
│   │   └── auth.ts              # JWT authentication
│   └── db.ts                    # Database connection & operations
├── server.ts                     # Express server entry point
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## Screenshots & Demo

### Login Page
- Role-based authentication (Admin/Student)
- Separate registration with admin code verification
- Demo login buttons for quick testing

### Admin Dashboard
- Room management with creation form
- Student allocation interface
- Room occupancy visualization (Recharts)
- Complaint management with resolution toggle
- Real-time roster and check-in/out tracking

### Student Dashboard
- Room allocation card showing roommate details
- Complaint submission form (disabled if no room assigned)
- Complaint history with status tracking
- Self check-in/out functionality

---

## How to Push to GitHub

To push this codebase to a public GitHub repository:

1. **Create a new public repository on GitHub** (e.g., `hostel-management-system`)
   - Go to [GitHub New Repository](https://github.com/new)
   - Leave it empty (don't initialize with README or .gitignore)

2. **In your local terminal**:
   ```bash
   # Initialize git (if not already done)
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "feat: complete hostel management system with admin and student portals"

   # Rename branch to main
   git branch -M main

   # Add remote repository
   git remote add origin https://github.com/YOUR_USERNAME/hostel-management-system.git

   # Push to GitHub
   git push -u origin main
   ```

3. **Repository is now live at**: `https://github.com/YOUR_USERNAME/hostel-management-system`

---

## Requirements Checklist

### ✅ Common Requirements
- [x] Separate Register and Login pages for Admin and Student
- [x] Role-based dashboards after login
- [x] Built with React.js, Node.js, Express.js, MongoDB
- [x] TypeScript for type safety
- [x] Modern UI with Tailwind CSS

### ✅ Admin/Warden Features
- [x] Add hostel rooms with unique room numbers
- [x] Allocate students to rooms
- [x] View all complaints
- [x] Mark complaints as Resolved
- [x] View room occupancy status
- [x] Manage student roster

### ✅ Student Features
- [x] View assigned room details
- [x] View roommate information
- [x] Submit maintenance complaints
- [x] View complaint history and status
- [x] Self check-in/check-out functionality

### ✅ Business Rules Enforced
- [x] Maximum 2 students per room (strictly enforced)
- [x] Student cannot be assigned to multiple rooms
- [x] Only assigned students can submit complaints
- [x] Admin can toggle complaint resolution status
- [x] Empty complaints are rejected
- [x] Duplicate room numbers prevented

### ✅ Technical Constraints
- [x] No room change requests
- [x] No complaint escalation
- [x] No priority-based complaint handling

### ✅ Edge Cases Handled
- [x] Room full (2/2) allocation rejection
- [x] Duplicate room assignment prevention
- [x] Unassigned student complaint rejection

---

## License

This project is open source and available for educational purposes.

---

## Support & Contact

For issues or questions:
- Create an issue on GitHub
- Contact: [Your Email]

---

**Built with ❤️ for Hostel Management**
