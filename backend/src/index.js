require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const studentsRoutes = require('./routes/studentsRoutes');

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
    /\.localhost:\d+$/,                 // ✅ any localhost port
    "http://localhost:8080",  // ✅ any localhost port (string version)
    /\.vercel\.app$/,                   // ✅ any vercel.app subdomain
    /\.ngrok-free\.app$/,               // ✅ any ngrok-free.app subdomain
    "https://attend-ex.web.app",
    "https://93f2d792a542.ngrok-free.app"
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(o => (typeof o === "string" ? o === origin : o.test(origin)))) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS: " + origin));
        }
    },
    credentials: true,
}));

app.use(cookieParser());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', studentsRoutes);

// Connect to DB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});