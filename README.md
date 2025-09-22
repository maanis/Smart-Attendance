<<<<<<< HEAD
# Room Checkr - Smart Attendance Management System
=======
# Smart Attendance Management System
>>>>>>> 5fa4d46a5805d15cd52a29e35e41813282116a8c

A comprehensive digital attendance tracking system built with modern web technologies, featuring face recognition, location verification, and real-time session management for educational institutions.

## 🚀 Features

### 👨‍🏫 Teacher Dashboard

- **Session Creation**: Generate unique Room IDs with customizable parameters (subject, course, year, division, location radius, duration)
- **QR Code Generation**: Automatic QR code creation for easy student access
- **Real-time Monitoring**: Live session tracking with attendee counts and session status
- **Face Recognition Integration**: Optional AI-powered face verification for attendance
- **Location Validation**: GPS-based radius checking to ensure attendance is marked within designated areas
- **Auto Session Closure**: Automatic session termination based on set duration
- **Comprehensive Reports**: Detailed attendance lists with timestamps, export capabilities (Excel/CSV)

### 👨‍🎓 Student Dashboard

- **Easy Session Joining**: Manual Room ID entry or QR code scanning
- **Face Recognition**: Optional biometric verification using webcam
- **Location Verification**: GPS validation within teacher-defined radius
- **Instant Feedback**: Real-time confirmation of attendance submission
- **Session History**: Access to past attendance records

### 🔧 Core Functionality

- **JWT Authentication**: Secure teacher login system
- **Real-time Updates**: Live session status and attendee tracking
- **Responsive Design**: Mobile-optimized interface with modern UI components
- **Toast Notifications**: User-friendly feedback for all actions
- **Data Export**: Excel and CSV export functionality for attendance reports
- **Performance Optimized**: Lazy loading and dynamic imports for fast loading

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript for modern component architecture
- **Vite** for fast development and optimized builds
- **shadcn/ui** components with Radix UI primitives for consistent design
- **Tailwind CSS** for responsive styling
- **React Router** for client-side navigation
- **TanStack React Query** for efficient data fetching and caching
- **Axios** for API communication

### Backend

- **Node.js/Express.js** with MongoDB for main API server
- **FastAPI/Python** for face recognition service using MTCNN and InceptionResnetV1
- **JWT** for secure authentication
- **Multer** for file upload handling
- **MongoDB** for data persistence

### DevOps & Deployment

- **Firebase Hosting** for frontend deployment
- **Ngrok** for local backend tunneling during development
- **ESLint** and **TypeScript** for code quality

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ (for face recognition)
- MongoDB database
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
pip install -r requirements.txt
npm start
```

### Face Recognition Service

```bash
cd backend
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## 🚀 Usage

### For Teachers

1. **Login** to the teacher dashboard with credentials
2. **Create Session** with subject details, location radius, and duration
3. **Share Room ID** or QR code with students
4. **Monitor** attendance in real-time
5. **Export Reports** when session completes

### For Students

1. **Access** student dashboard
2. **Join Session** using Room ID or QR scan
3. **Provide Details** (roll number, name)
4. **Face Recognition** (optional) - allow camera access for verification
5. **Location Verification** - ensure within designated radius
6. **Receive Confirmation** of successful attendance

## 📁 Project Structure

```
room-checkr/
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets (logo.png, favicon)
│   ├── src/
│   │   ├── components/ui/       # Reusable UI components
│   │   ├── pages/               # Main application pages
│   │   │   ├── TeacherDashboard/
│   │   │   ├── StudentDashboard/
│   │   │   ├── ActiveSession/
│   │   │   └── AttendanceConfirmation.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities and configurations
│   │   ├── store/               # State management
│   │   └── utils/               # Helper functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Authentication & upload middleware
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API routes
│   │   └── config/              # Database configuration
│   ├── app.py                   # FastAPI face recognition service
│   ├── requirements.txt
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/login` - Teacher login
- `GET /api/auth/verify` - Verify JWT token

### Sessions

- `POST /api/sessions` - Create new session
- `GET /api/sessions/active` - Get active sessions
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/close` - Close session

### Students

- `POST /api/students/attendance` - Mark attendance
- `GET /api/students/session/:sessionId` - Get session attendance

### Face Recognition

- `POST /api/face/verify` - Verify face against known faces
- `POST /api/face/register` - Register new face

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Deployment

### Current Hosting Setup

- **Frontend**: Hosted on Firebase Hosting
- **Backend**: Running locally with Ngrok tunneling for development
- **Face Recognition Service**: Local FastAPI service

### Frontend Deployment

```bash
cd frontend
npm run build
firebase deploy
```

### Backend Local Development

```bash
cd backend
npm start
# Use ngrok to expose local backend
ngrok http 3000
```

### Face Recognition Service

```bash
cd backend
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for modern educational institutions**
