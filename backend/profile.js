const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/User');

router.get('/api/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || '',
            dateOfBirth: user.dateOfBirth || '',
            occupation: user.occupation || '',
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipCode: user.address?.zipCode || '',
            country: user.address?.country || ''
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/api/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const {
            fullName,
            phone,
            dateOfBirth,
            occupation,
            street,
            city,
            state,
            zipCode,
            country
        } = req.body;

        const updateData = {
            fullName,
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            occupation,
            address: {
                street,
                city,
                state,
                zipCode,
                country
            },
            updatedAt: new Date()
        };

        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === '') {
                delete updateData[key];
            }
        });

        if (updateData.address) {
            const addressFields = Object.values(updateData.address).filter(val => val && val !== '');
            if (addressFields.length === 0) {
                delete updateData.address;
            } else {
                Object.keys(updateData.address).forEach(key => {
                    if (!updateData.address[key] || updateData.address[key] === '') {
                        delete updateData.address[key];
                    }
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || '',
                occupation: user.occupation || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zipCode: user.address?.zipCode || '',
                country: user.address?.country || ''
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/api/change-password', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        await User.findByIdAndUpdate(req.session.userId, {
            $set: {
                password: hashedNewPassword,
                updatedAt: new Date()
            }
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;