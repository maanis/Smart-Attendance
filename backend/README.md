# Room Checkr - Backend

A comprehensive attendance management system with face recognition capabilities.

## Features

- ✅ Student Management with Face Recognition
- ✅ Session-based Attendance Tracking
- ✅ Real-time Location Verification
- ✅ Image Upload and Processing
- ✅ RESTful API Design
- ✅ MongoDB Integration

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **File Upload:** Multer
- **Face Recognition:** Python FastAPI + FaceNet PyTorch
- **Authentication:** JWT Tokens

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── multer.js          # File upload configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── sessionController.js
│   │   └── studentsController.js
│   ├── middleware/
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Teacher.js
│   │   ├── Session.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── studentsRoutes.js
│   │   └── uploadRoutes.js
│   └── index.js               # Main application file
├── uploads/                   # Uploaded files directory
├── server.py                  # Python face recognition API
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ (for face recognition)
- CUDA-compatible GPU (recommended for face recognition)

### Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd room-checkr/backend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Install Python dependencies:**

   ```bash
   pip install fastapi uvicorn facenet-pytorch torch torchvision pillow numpy
   ```

4. **Environment Configuration:**
   Create a `.env` file:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/room-checkr
   JWT_SECRET=your-secret-key
   FACE_API_URL=http://localhost:8000
   ```

5. **Start MongoDB:**
   ```bash
   mongod
   ```

## Running the Application

### Development Mode

1. **Start the Node.js server:**

   ```bash
   npm run dev
   ```

2. **Start the Python face recognition server:**
   ```bash
   python server.py
   ```
   Or use the batch file:
   ```bash
   ./start_face_api.bat
   ```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register teacher
- `POST /api/auth/login` - Login teacher
- `POST /api/auth/logout` - Logout teacher

### Students Management

- `POST /api/students` - Create student (with face image)
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/roll/:roll` - Get student by roll number
- `PUT /api/students/:id` - Update student (with optional face image)
- `DELETE /api/students/:id` - Delete student
- `PUT /api/students/:id/face-embeddings` - Update face embeddings

### Sessions Management

- `POST /api/sessions/create` - Create attendance session
- `GET /api/sessions/all` - Get all sessions
- `PUT /api/sessions/close` - Close session
- `POST /api/sessions/mark-attendance` - Mark attendance

### File Upload

- `POST /api/upload/single` - Single file upload
- `POST /api/upload/multiple` - Multiple files upload

## Face Recognition Integration

### How It Works

1. **Image Upload:** Student photos are uploaded via the API
2. **Face Detection:** Python service detects faces using MTCNN
3. **Embedding Extraction:** FaceNet extracts 512-dimensional embeddings
4. **Storage:** Embeddings are stored in MongoDB for future comparison

### Python API Endpoints

- `POST /extract-embeddings/` - Extract face embeddings from image
- `POST /compare-faces/` - Compare two face images

### Configuration

Set the Python API URL in your environment:

```env
FACE_API_URL=http://localhost:8000
```

## Database Schema

### Student Model

```javascript
{
  name: String,           // Required
  roll: String,           // Required, unique, uppercase
  faceEmbeddings: [Number], // Face recognition data
  profileImage: String,   // Image URL
  createdAt: Date,
  updatedAt: Date
}
```

### Session Model

```javascript
{
  sessionId: String,      // Auto-generated 6-digit code
  subject: String,
  course: String,
  year: String,
  division: String,
  room: String,
  duration: Number,
  location: {
    latitude: Number,
    longitude: Number
  },
  radius: Number,
  isActive: Boolean,
  attendance: [{
    rollNo: String,
    name: String,
    deviceId: String,
    geoLocation: Object,
    timestamp: Date
  }]
}
```

## File Upload Configuration

- **Max Size:** 5MB per file
- **Allowed Types:** PNG, JPEG, JPG, GIF, WebP
- **Storage:** Local filesystem in `uploads/` directory
- **URL Access:** Files served at `/uploads/filename.ext`

## Error Handling

The API includes comprehensive error handling for:

- Database connection issues
- File upload failures
- Face recognition errors
- Validation errors
- Authentication failures

## Security Features

- JWT-based authentication
- File type validation
- Request size limits
- CORS configuration
- Input sanitization

## Testing

### API Testing

```bash
# Test student creation with face image
curl -X POST "http://localhost:5000/api/students" \
  -F "name=John Doe" \
  -F "roll=CS001" \
  -F "image=@face.jpg"
```

### Python API Testing

```bash
# Test face embedding extraction
curl -X POST "http://localhost:8000/extract-embeddings/" \
  -F "file=@face.jpg"
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-server/room-checkr
JWT_SECRET=your-production-secret
FACE_API_URL=http://face-api-server:8000
```

### Docker Support

Consider using Docker for containerized deployment of both Node.js and Python services.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

- Check the documentation files
- Review error logs
- Test with the provided examples
