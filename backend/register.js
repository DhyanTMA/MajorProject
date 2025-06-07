const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/User');

router.post('/api/register', async (req, res) => {
    const { 
        fullName, 
        email, 
        password, 
        phone, 
        dateOfBirth, 
        occupation, 
        address 
    } = req.body;

    if (!fullName || !email || !password || !phone || !dateOfBirth || !occupation || !address) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
        return res.status(400).json({ message: 'Complete address information is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (age < 13 || age > 120) {
        return res.status(400).json({ message: 'Please enter a valid date of birth' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(409).json({ message: 'User with this phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email: email.toLowerCase(), 
            password: hashedPassword,
            phone,
            dateOfBirth: new Date(dateOfBirth),
            occupation,
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country
            }
        });

        await newUser.save();
        
        const userResponse = {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            dateOfBirth: newUser.dateOfBirth,
            occupation: newUser.occupation,
            address: newUser.address,
            createdAt: newUser.createdAt
        };

        res.status(201).json({ 
            message: 'User registered successfully',
            user: userResponse
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ message: `${field} already exists` });
        }
        
        res.status(500).json({ message: 'Server error during registration' });
    }
});

module.exports = router;