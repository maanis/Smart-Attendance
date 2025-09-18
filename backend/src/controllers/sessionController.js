const Session = require('../models/Session');

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
        const { latitude, longitude, radius, subject, course, year, division, room, duration } = req.body;

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
            duration: duration || 60,
            location: { latitude, longitude },
            radius: radius || 50,
            isActive: true
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

        res.json({
            session: {
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
                closedAt: session.closedAt
            }
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { sessionId, rollNo, name, deviceId, ip, geoLocation } = req.body;

        if (!sessionId || !rollNo || !name || !deviceId || !geoLocation) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const session = await Session.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (!session.isActive) {
            return res.status(400).json({ error: 'Session is not active' });
        }

        console.log('geoLocation:', geoLocation);
        console.log('session location:', session.location);

        console.log(
            `Teacher: https://www.google.com/maps?q=${session.location.latitude},${session.location.longitude}`
        );
        console.log(
            `Student: https://www.google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`
        );


        // Check location distance
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

        // Check for duplicates
        const duplicateDevice = session.attendance.find(att => att.deviceId === deviceId);
        const duplicateIp = session.attendance.find(att => att.ip === ip);

        if (duplicateDevice) {
            return res.status(400).json({ error: 'Attendance already marked with this device' });
        }

        if (duplicateIp && ip) {
            return res.status(400).json({ error: 'Attendance already marked from this IP address' });
        }

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
            record: attendanceRecord
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
            .select('sessionId location radius attendance createdAt')
            .sort({ createdAt: -1 });

        res.json({
            sessions: sessions.map(session => ({
                sessionId: session.sessionId,
                location: session.location,
                radius: session.radius,
                attendanceCount: session.attendance.length,
                createdAt: session.createdAt
            }))
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createSession, closeSession, getSession, markAttendance, getActiveSessions };