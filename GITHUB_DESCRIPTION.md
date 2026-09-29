# GitHub Repository Description

## Repository Name
```
hostel-management-system
```

## Short Description (280 characters max - for GitHub About section)
```
🏨 Full-stack hostel management web app with role-based authentication (Admin/Student). Features: room allocation with 2-student capacity enforcement, complaint management, real-time analytics. Built with React, TypeScript, Node.js, Express, MongoDB. Production-ready with fallback datastore.
```

## Tags/Topics (for GitHub)
```
hostel-management
student-management
room-allocation
complaint-management
react
typescript
nodejs
express
mongodb
full-stack
authentication
jwt
rest-api
tailwind-css
vite
responsive-design
hackathon-project
educational-project
```

## Detailed Project Description

### 🎯 Overview
A comprehensive hostel management system designed to streamline room allocation and maintenance complaint handling. The application features separate portals for administrators (wardens) and students with strict business rule enforcement at the backend level.

### ✨ Key Features

#### For Administrators
- 📊 **Dashboard Analytics**: Real-time room occupancy visualization with interactive Recharts
- 🏢 **Room Management**: Create and manage hostel rooms
- 👥 **Student Allocation**: Assign students to rooms with automatic capacity validation
- 📋 **Complaint Resolution**: View and resolve maintenance complaints
- 🔍 **Check-in/Check-out Tracking**: Monitor student stays with complete history

#### For Students
- 🏠 **Room Details**: View assigned room, capacity, and roommate information
- 📝 **Complaint Submission**: Report maintenance issues (only when room is assigned)
- 📊 **Complaint Tracking**: Monitor status of submitted complaints
- ⏱️ **Stay History**: Complete log of check-ins and check-outs
- 🔑 **Self-Service**: Self check-in and check-out functionality

### 🔒 Business Rules (Server-Enforced)
- ✅ Maximum 2 students per room (atomic enforcement)
- ✅ Single room assignment per student
- ✅ Only assigned students can submit complaints
- ✅ Admin authorization required for management functions
- ✅ All validations enforced at API level with proper HTTP status codes

### 🛠️ Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite (Build tool & Dev server)
- Tailwind CSS v4 (Modern styling)
- Recharts (Data visualization)
- Lucide React (Icons)
- JWT Authentication

**Backend:**
- Node.js with Express.js
- TypeScript with tsx runner
- RESTful API architecture
- JWT token-based authentication
- bcryptjs password hashing

**Database:**
- MongoDB with Mongoose ODM
- Persistent fallback datastore (works without MongoDB!)

### 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hostel-management-system.git
   cd hostel-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```

5. **Access the app:**
   Open http://localhost:3000

### 🔐 Demo Accounts

**Admin:**
- Email: `warden@hostel.edu`
- Password: `warden123`

**Students:**
- Email: `alex@student.edu` | Password: `student123`
- Email: `sam@student.edu` | Password: `student123`
- Email: `jordan@student.edu` | Password: `student123`

### 📦 What's Included

✅ Complete authentication system with role-based access control  
✅ Responsive UI with dark mode support  
✅ RESTful API with comprehensive error handling  
✅ Automatic port management (handles EADDRINUSE gracefully)  
✅ Graceful shutdown handlers (SIGINT, SIGTERM)  
✅ Production-ready with deployment guides  
✅ Pre-seeded demo data for instant testing  
✅ Comprehensive documentation  

### 🏗️ Architecture

```
hostel-management-system/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── context/           # State management
│   ├── services/          # API client
│   └── types/             # TypeScript definitions
├── server/                # Backend Express application
│   ├── routes/           # API endpoints
│   ├── models/           # Database models
│   ├── middleware/       # Auth & validation
│   └── db.ts             # Database connection
├── server.ts             # Server entry point
└── vite.config.ts        # Vite configuration
```

### 🌐 Deployment

Supports deployment to:
- Render (Backend + Frontend)
- Vercel (Frontend)
- Netlify (Frontend)
- Railway (Backend)
- MongoDB Atlas (Database)

Detailed deployment instructions included in README.md

### 📝 API Documentation

Complete REST API with endpoints for:
- Authentication (`/api/register`, `/api/login`)
- Admin operations (`/api/rooms`, `/api/students`, `/api/complaints`)
- Student operations (`/api/my-room`, `/api/my-complaints`)

Full API documentation available in the repository.

### 🐛 Bug Fixes & Improvements

All production issues resolved:
- ✅ Port conflict handling with automatic fallback
- ✅ WebSocket HMR port configuration
- ✅ MongoDB connection with graceful fallback
- ✅ ES module compatibility (`__dirname` fix)
- ✅ Graceful shutdown for clean resource cleanup

See `FIXES_APPLIED.md` for detailed technical documentation.

### 📄 License

This project is open source and available for educational purposes.

### 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### 👨‍💻 Author

**Kartik Uparkar**
- GitHub: [@YOUR_GITHUB_USERNAME]
- LinkedIn: [Your LinkedIn Profile]
- Email: [Your Email]

### ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ for efficient hostel management**
