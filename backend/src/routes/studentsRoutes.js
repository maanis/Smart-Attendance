const express = require('express');
const {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentByRoll,
    updateStudent,
    deleteStudent,
    updateFaceEmbeddings
} = require('../controllers/studentsController');
const { uploadSingle } = require('../config/multer');

const router = express.Router();

// @route   POST /api/students
// @desc    Create a new student
// @access  Public (or Private depending on your auth setup)
router.post('/', uploadSingle, createStudent);

// @route   GET /api/students
// @desc    Get all students with pagination and search
// @access  Public (or Private)
router.get('/', getAllStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Public (or Private)
router.get('/:id', getStudentById);

// @route   GET /api/students/roll/:roll
// @desc    Get student by roll number
// @access  Public (or Private)
router.get('/roll/:roll', getStudentByRoll);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (should require authentication)
router.put('/:id', uploadSingle, updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (should require authentication)
router.delete('/:id', deleteStudent);

// @route   PUT /api/students/:id/face-embeddings
// @desc    Update face embeddings for a student
// @access  Private (should require authentication)
router.put('/:id/face-embeddings', updateFaceEmbeddings);

module.exports = router;