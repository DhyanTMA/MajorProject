const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/User');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String
});

router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid email or password' });

        // Authentication success
        // You can add session/token handling here if needed
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
