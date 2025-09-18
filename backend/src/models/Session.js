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