const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        // required: true
    },
    subject: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    division: {
        type: String,
        required: true
    },
    room: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        default: 60
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    radius: {
        type: Number,
        default: 50
    },
    isLocationRequired: {
        type: Boolean,
        default: true
    },
    isFaceRecogRequired: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    attendance: [{
        rollNo: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        deviceId: {
            type: String,
            required: true
        },
        ip: String,
        geoLocation: {
            latitude: Number,
            longitude: Number
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Session', sessionSchema);