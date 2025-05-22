const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔗 MongoDB Connection
const uri = "mongodb+srv://dhyanmarasinghe:dt240108001100@cluster0.090nnbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware for JSON data handling
app.use(express.json());

// Serve static files from the "frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Universal route handler for all HTML files
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../frontend/html', page);

    if (path.extname(page) === '.html') {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

// 🚀 **Start Express Server**
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});