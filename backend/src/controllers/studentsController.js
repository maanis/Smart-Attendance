const Student = require('../models/Student');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Python face recognition API URL (adjust port as needed)
const FACE_API_URL = process.env.FACE_API_URL || 'http://localhost:8000';

// Helper function to extract face embeddings from image
const extractFaceEmbeddings = async (imagePath) => {
    try {
        const formData = new FormData();

        // Read image file
        const imageBuffer = fs.readFileSync(imagePath);
        formData.append('file', imageBuffer, {
            filename: 'face.jpg',
            contentType: 'image/jpeg'
        });

        const response = await axios.post(`${FACE_API_URL}/extract-embeddings/`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000, // 30 second timeout
        });

        console.log('FastApi res', response.data);

        if (response.data.success && response.data.embeddings) {
            return {
                success: true,
                embeddings: response.data.embeddings,
                dimensions: response.data.dimensions
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Face extraction failed'
            };
        }
    } catch (error) {
        console.error('Face extraction API error:', error.message);
        return {
            success: false,
            error: error.response?.data?.error || 'Face recognition service unavailable'
        };
    }
};

// Create a new student
const createStudent = async (req, res) => {
    let uploadedFilePath = null;

    try {
        const { name, roll } = req.body;

        // Validate required fields
        if (!name || !roll) {
            return res.status(400).json({
                error: 'Name and roll number are required'
            });
        }

        // Check if student with this roll number already exists
        const existingStudent = await Student.findOne({ roll: roll.toUpperCase() });
        if (existingStudent) {
            return res.status(400).json({
                error: 'Student with this roll number already exists'
            });
        }

        let faceEmbeddings = [];
        let profileImage = null;

        // Handle image upload and face extraction
        if (req.file) {
            uploadedFilePath = req.file.path;

            console.log('Processing uploaded image for face recognition...');

            const faceResult = await extractFaceEmbeddings(uploadedFilePath);

            console.log('Face extraction result:', faceResult);

            if (faceResult.success) {
                faceEmbeddings = faceResult.embeddings;
                profileImage = `/uploads/${req.file.filename}`;
                console.log(`Face embeddings extracted: ${faceResult.dimensions} dimensions`);
            } else {
                // If face extraction fails, don't create the student
                console.error('Face extraction failed:', faceResult.error);
                return res.status(400).json({
                    error: 'Face recognition failed. Please upload a clear photo of your face.',
                    details: faceResult.error
                });
            }
        }

        // Create new student
        const student = new Student({
            name: name.trim(),
            roll: roll.toUpperCase().trim(),
            faceEmbeddings: faceEmbeddings,
            profileImage: profileImage,
        });

        await student.save();

        res.status(201).json({
            message: 'Student created successfully',
            student: {
                id: student._id,
                name: student.name,
                roll: student.roll,
                hasFaceEmbeddings: faceEmbeddings.length > 0,
                profileImage: student.profileImage,
                createdAt: student.createdAt
            }
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Clean up uploaded file
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            try {
                fs.unlinkSync(uploadedFilePath);
                console.log('Cleaned up uploaded file:', uploadedFilePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
    }
};

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        let query = {};

        // Add search functionality
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { roll: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const students = await Student.find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments(query);

        res.json({
            students: students.map(student => ({
                id: student._id,
                name: student.name,
                roll: student.roll,
                hasFaceEmbeddings: student.faceEmbeddings && student.faceEmbeddings.length > 0,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt
            })),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalStudents: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id).select('-__v');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            student: {
                id: student._id,
                name: student.name,
                roll: student.roll,
                faceEmbeddings: student.faceEmbeddings,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        console.error('Get student by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get student by roll number
const getStudentByRoll = async (req, res) => {
    try {
        const { roll } = req.params;

        const student = await Student.findOne({ roll: roll.toUpperCase() }).select('-__v');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            student: {
                id: student._id,
                name: student.name,
                roll: student.roll,
                faceEmbeddings: student.faceEmbeddings,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        console.error('Get student by roll error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update student
const updateStudent = async (req, res) => {
    let uploadedFilePath = null;

    try {
        const { id } = req.params;
        const { name, roll } = req.body;

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (roll) updateData.roll = roll.toUpperCase().trim();

        // Check if roll number is being changed and if it already exists
        if (roll) {
            const existingStudent = await Student.findOne({
                roll: roll.toUpperCase().trim(),
                _id: { $ne: id }
            });
            if (existingStudent) {
                return res.status(400).json({
                    error: 'Student with this roll number already exists'
                });
            }
        }

        // Handle image upload and face extraction
        if (req.file) {
            uploadedFilePath = req.file.path;

            console.log('Processing uploaded image for face recognition update...');

            const faceResult = await extractFaceEmbeddings(uploadedFilePath);

            if (faceResult.success) {
                updateData.faceEmbeddings = faceResult.embeddings;
                updateData.profileImage = `/uploads/${req.file.filename}`;
                console.log(`Face embeddings updated: ${faceResult.dimensions} dimensions`);
            } else {
                // Check if the error is specifically about no face detected
                if (faceResult.error && faceResult.error.includes('No face detected')) {
                    console.error('Face detection failed during update:', faceResult.error);
                    return res.status(400).json({
                        error: 'No face detected in the uploaded image. Please upload a clear photo of your face.',
                        details: faceResult.error
                    });
                } else {
                    // For other types of errors (API unavailable, etc.), still allow student update
                    console.warn('Face extraction failed during update (non-critical):', faceResult.error);
                    // Student can still be updated without changing face embeddings
                }
            }
        }

        const student = await Student.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            message: 'Student updated successfully',
            student: {
                id: student._id,
                name: student.name,
                roll: student.roll,
                hasFaceEmbeddings: student.faceEmbeddings && student.faceEmbeddings.length > 0,
                profileImage: student.profileImage,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Clean up uploaded file
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            try {
                fs.unlinkSync(uploadedFilePath);
                console.log('Cleaned up uploaded file:', uploadedFilePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            message: 'Student deleted successfully',
            student: {
                id: student._id,
                name: student.name,
                roll: student.roll
            }
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update face embeddings for a student
const updateFaceEmbeddings = async (req, res) => {
    try {
        const { id } = req.params;
        const { faceEmbeddings } = req.body;

        if (!faceEmbeddings || !Array.isArray(faceEmbeddings)) {
            return res.status(400).json({
                error: 'Face embeddings must be an array of numbers'
            });
        }

        const student = await Student.findByIdAndUpdate(
            id,
            {
                faceEmbeddings: faceEmbeddings,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-__v');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            message: 'Face embeddings updated successfully',
            student: {
                id: student._id,
                name: student.name,
                roll: student.roll,
                hasFaceEmbeddings: student.faceEmbeddings && student.faceEmbeddings.length > 0,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        console.error('Update face embeddings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentByRoll,
    updateStudent,
    deleteStudent,
    updateFaceEmbeddings
};