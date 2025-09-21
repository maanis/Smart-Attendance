const Session = require('../models/Session');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Python face recognition API URL (adjust port as needed)
const FACE_API_URL = process.env.FACE_API_URL || 'http://localhost:8000';

// Helper function to extract face embeddings from uploaded image
const extractFaceEmbeddingsFromImage = async (imagePath) => {
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

// Helper function to compare face embeddings using Python API
const compareFaceEmbeddings = async (embeddings1, embeddings2) => {
    try {
        const response = await axios.post(`${FACE_API_URL}/compare-embeddings/`, {
            embeddings1: embeddings1,
            embeddings2: embeddings2
        }, {
            timeout: 10000, // 10 second timeout
        });

        if (response.data.success) {
            return {
                success: true,
                similarity: response.data.similarity,
                match: response.data.match
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Face comparison failed'
            };
        }
    } catch (error) {
        console.error('Face comparison API error:', error.message);
        return {
            success: false,
            error: error.response?.data?.error || 'Face recognition service unavailable'
        };
    }
};

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

const createSession = async (req, res) => {
    try {
        const { latitude, longitude, radius, subject, course, year, division, room, duration, isLocationRequired, isFaceRecogRequired } = req.body;

        if (!latitude || !longitude || !subject || !course || !year || !division) {
            return res.status(400).json({ error: 'All required fields are required' });
        }

        // Generate 6-digit random sessionId
        const sessionId = Math.floor(100000 + Math.random() * 900000).toString();

        const session = new Session({
            sessionId,
            createdBy: req.user._id,
            subject,
            course,
            year,
            division,
            room: room || "",
            duration: duration || 15,
            location: { latitude, longitude },
            radius: radius || 50,
            isActive: true,
            isLocationRequired: typeof isLocationRequired === 'boolean' ? isLocationRequired : true,
            isFaceRecogRequired: typeof isFaceRecogRequired === 'boolean' ? isFaceRecogRequired : false
        });

        await session.save();

        res.status(201).json({
            message: 'Session created successfully',
            session: {
                sessionId: session.sessionId,
                subject: session.subject,
                course: session.course,
                year: session.year,
                division: session.division,
                room: session.room,
                duration: session.duration,
                location: session.location,
                radius: session.radius,
                isActive: session.isActive,
                isLocationRequired: session.isLocationRequired,
                isFaceRecogRequired: session.isFaceRecogRequired,
                createdAt: session.createdAt
            }
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const closeSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const session = await Session.findOneAndUpdate(
            { sessionId, createdBy: req.user._id },
            {
                isActive: false,
                closedAt: new Date()
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
            message: 'Session closed successfully',
            session: {
                sessionId: session.sessionId,
                isActive: session.isActive,
                closedAt: session.closedAt,
                attendanceCount: session.attendance.length
            }
        });
    } catch (error) {
        console.error('Close session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ sessionId })
            .populate('createdBy', 'name email')
            .select('-__v');

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        console.log(session)

        res.json({ session });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { sessionId, rollNo, name, deviceId, ip, geoLocation: geoLocationString } = req.body;

        if (!sessionId || !rollNo || !name || !deviceId) {
            return res.status(400).json({ error: 'Session ID, roll number, name, and device ID are required' });
        }

        const session = await Session.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (!session.isActive) {
            return res.status(400).json({ error: 'Session is not active' });
        }

        // Parse geoLocation from JSON string only if location is required
        let geoLocation = null;
        if (session.isLocationRequired) {
            if (!geoLocationString) {
                return res.status(400).json({ error: 'Location data is required for this session' });
            }
            try {
                geoLocation = JSON.parse(geoLocationString);
            } catch (error) {
                return res.status(400).json({ error: 'Invalid geoLocation format' });
            }
        }

        // console.log('geoLocation:', geoLocation);
        // console.log('session location:', session.location);

        console.log(
            `Teacher: https://www.google.com/maps?q=${session.location.latitude},${session.location.longitude}`
        );
        if (session.isLocationRequired && geoLocation) {
            console.log(
                `Student: https://www.google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`
            );
        }

        // Only check location distance if required
        if (session.isLocationRequired) {
            const distance = calculateDistance(
                session.location.latitude,
                session.location.longitude,
                geoLocation.latitude,
                geoLocation.longitude
            );

            console.log('distance', distance);

            if (distance > session.radius) {
                return res.status(400).json({
                    error: 'Location out of range',
                    distance: Math.round(distance),
                    maxDistance: session.radius
                });
            }
        }

        // Face recognition validation
        if (session.isFaceRecogRequired) {
            console.log('🔍 Face recognition required for this session');

            // Check if image was uploaded
            if (!req.file) {
                return res.status(400).json({
                    error: 'Face image is required for attendance verification'
                });
            }

            // Fetch student by roll number
            const Student = require('../models/Student');
            const student = await Student.findOne({ roll: rollNo.toUpperCase() });

            if (!student) {
                return res.status(404).json({
                    error: 'Student not found. Please register first.'
                });
            }

            if (!student.faceEmbeddings || student.faceEmbeddings.length === 0) {
                return res.status(400).json({
                    error: 'No face data found for this student. Please update your profile with a face image.'
                });
            }

            console.log('📸 Processing uploaded face image for verification...');

            // Extract embeddings from uploaded image
            const faceResult = await extractFaceEmbeddingsFromImage(req.file.path);

            if (!faceResult.success) {
                return res.status(400).json({
                    error: 'Face verification failed: ' + faceResult.error,
                    details: 'Please ensure your face is clearly visible in the camera'
                });
            }

            // Compare embeddings using Python API
            const comparisonResult = await compareFaceEmbeddings(faceResult.embeddings, student.faceEmbeddings);

            if (!comparisonResult.success) {
                return res.status(400).json({
                    error: 'Face verification failed: ' + comparisonResult.error,
                    details: 'Please ensure your face is clearly visible in the camera'
                });
            }

            const similarity = comparisonResult.similarity;

            console.log(`🔍 Face match similarity: ${(similarity * 100).toFixed(2)}%`);

            // Threshold for face match (adjust as needed)
            const MATCH_THRESHOLD = 0.6;

            if (similarity < MATCH_THRESHOLD) {
                return res.status(400).json({
                    error: 'Face verification failed',
                    details: `Face match confidence: ${(similarity * 100).toFixed(1)}%. Please try again with better lighting and positioning.`,
                    similarity: similarity
                });
            }

            console.log('✅ Face verification successful!');
        }
        console.log('Device ID:', deviceId);
        // Check for duplicates
        const duplicateRoll = session.attendance.find(att => att.rollNo.toUpperCase() === rollNo.toUpperCase());
        const duplicateDevice = session.attendance.find(att => att.deviceId === deviceId);
        // const duplicateIp = session.attendance.find(att => att.ip === ip);

        if (duplicateRoll) {
            return res.status(400).json({ error: 'Attendance already marked for this roll number' });
        }

        if (duplicateDevice) {
            return res.status(400).json({ error: 'Attendance already marked with this device' });
        }

        // if (duplicateIp && ip) {
        //     return res.status(400).json({ error: 'Attendance already marked from this IP address' });
        // }

        // Add attendance
        const attendanceRecord = {
            rollNo,
            name,
            deviceId,
            ip,
            geoLocation,
            timestamp: new Date()
        };

        session.attendance.push(attendanceRecord);
        await session.save();

        res.json({
            message: 'Attendance marked successfully',
            attendanceCount: session.attendance.length,
            record: attendanceRecord,
            faceVerified: session.isFaceRecogRequired
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getActiveSessions = async (req, res) => {
    try {
        const sessions = await Session.find({
            createdBy: req.user._id,
            isActive: true
        })
            .select('sessionId location radius attendance createdAt isActive')
            .sort({ createdAt: -1 });
        console.log(sessions)
        res.json({
            sessions: sessions.map(session => ({
                sessionId: session.sessionId,
                location: session.location,
                radius: session.radius,
                attendanceCount: session.attendance.length,
                createdAt: session.createdAt,
                isActive: session.isActive
            }))
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find({})
            .populate('createdBy', 'name email')
            .select('-__v')
            .sort({ createdAt: -1 }); // Latest first

        res.json({
            sessions: sessions.map(session => ({
                sessionId: session.sessionId,
                subject: session.subject,
                course: session.course,
                year: session.year,
                division: session.division,
                room: session.room,
                duration: session.duration,
                createdBy: session.createdBy,
                location: session.location,
                radius: session.radius,
                isActive: session.isActive,
                attendance: session.attendance,
                createdAt: session.createdAt,
                closedAt: session.closedAt,
                isLocationRequired: session.isLocationRequired,
                isFaceRecogRequired: session.isFaceRecogRequired
            }))
        });
    } catch (error) {
        console.error('Get all sessions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createSession, closeSession, getSession, markAttendance, getActiveSessions, getAllSessions };