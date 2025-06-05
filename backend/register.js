const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/User');
const mongoose = require('mongoose');


// Schema for user
const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String
});

// Register Endpoint
router.post('/api/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
