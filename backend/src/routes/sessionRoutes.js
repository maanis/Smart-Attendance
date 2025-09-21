const express = require('express');
const { createSession, closeSession, getSession, markAttendance, getActiveSessions, getAllSessions } = require('../controllers/sessionController');
const auth = require('../middleware/auth');
const { uploadAttendance } = require('../config/multer');

const router = express.Router();

// @route   POST /api/sessions/create
// @desc    Create a new session
// @access  Private (Teacher only)
router.post('/create', auth, createSession);

// @route   PUT /api/sessions/close
// @desc    Close an existing session
// @access  Private (Session creator only)
router.put('/close', auth, closeSession);

// @route   GET /api/sessions/active
// @desc    Get active sessions for current teacher
// @access  Private (Teacher only)
router.get('/active', auth, getActiveSessions);

// @route   GET /api/sessions/all
// @desc    Get all sessions (latest first)
// @access  Private (Teacher only)
router.get('/all', auth, getAllSessions);

// @route   GET /api/sessions/:sessionId
// @desc    Get session details
// @access  Public
router.get('/:sessionId', getSession);

// @route   POST /api/sessions/attendance
// @desc    Mark attendance for a session
// @access  Public
router.post('/attendance', uploadAttendance, markAttendance);

module.exports = router;