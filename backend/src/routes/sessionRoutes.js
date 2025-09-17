const express = require('express');
const { createSession, closeSession, getSession, markAttendance } = require('../controllers/sessionController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sessions/create
// @desc    Create a new session
// @access  Private (Teacher only)
router.post('/create', auth, createSession);

// @route   PUT /api/sessions/close
// @desc    Close an existing session
// @access  Private (Session creator only)
router.put('/close', auth, closeSession);

// @route   GET /api/sessions/:sessionId
// @desc    Get session details
// @access  Public
router.get('/:sessionId', getSession);

// @route   POST /api/sessions/attendance
// @desc    Mark attendance for a session
// @access  Public
router.post('/attendance', markAttendance);

module.exports = router;