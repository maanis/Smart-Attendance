// Example usage of multer configuration in routes

const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, uploadProfile, uploadAttendance } = require('../config/multer');

// Example route for single image upload
router.post('/upload/single', uploadSingle, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                url: `/uploads/${req.file.filename}` // URL to access the file
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Example route for multiple images upload
router.post('/upload/multiple', uploadMultiple, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: `/uploads/${file.filename}`
        }));

        res.json({
            message: `${req.files.length} files uploaded successfully`,
            files: files
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Example route for profile picture upload
router.post('/upload/profile', uploadProfile, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No profile image uploaded' });
        }

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: {
                filename: req.file.filename,
                url: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Profile upload error:', error);
        res.status(500).json({ error: 'Profile image upload failed' });
    }
});

// Example route for attendance image upload
router.post('/upload/attendance', uploadAttendance, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No attendance image uploaded' });
        }

        res.json({
            message: 'Attendance image uploaded successfully',
            attendanceImage: {
                filename: req.file.filename,
                url: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Attendance upload error:', error);
        res.status(500).json({ error: 'Attendance image upload failed' });
    }
});

module.exports = router;