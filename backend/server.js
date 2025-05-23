const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔗 MongoDB Connection
const uri = "mongodb://localhost:27017/users"; // Ensure 'users' matches your database name

mongoose.connect(uri)
    .then(() => console.log("✅ Connected to Local MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware for JSON data handling
app.use(express.json());

// Serve static files from the "frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

// **Serve Homepage Automatically**
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

// **Serve Other HTML Files**
app.get('/:page', (req, res) => {
    const page = req.params.page;
    
    if (!page.endsWith('.html')) {
        return res.status(404).send('Page not found');
    }

    const filePath = path.join(__dirname, '../frontend/html', page);
    res.sendFile(filePath);
});

// 🚀 Start Express Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});