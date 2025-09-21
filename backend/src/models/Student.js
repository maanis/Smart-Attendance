const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    roll: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    faceEmbeddings: {
        type: [Number], // Array of numbers for face recognition embeddings
        default: [],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Index for faster queries
studentSchema.index({ roll: 1 });
studentSchema.index({ name: 1 });

module.exports = mongoose.model('Student', studentSchema);