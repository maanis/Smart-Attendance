const express = require('express');
const path = require('path');

// Serve static files from uploads directory
const setupStaticFiles = (app) => {
    // Serve uploaded images statically
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
};

module.exports = setupStaticFiles;