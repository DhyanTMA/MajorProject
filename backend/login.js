const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/User');  

router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    req.session.userEmail = user.email;
    req.session.userName = user.fullName;

    console.log('User logged in:', user.email, 'Session ID:', req.session.id);

    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/api/logout', (req, res) => {
  console.log('Logout requested for session:', req.session.id);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.clearCookie('connect.sid');
    console.log('User logged out successfully');
    
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

router.get('/api/checkAuth', (req, res) => {
  console.log('Auth check - Session ID:', req.session.id, 'User ID:', req.session.userId);
  
  if (req.session.userId) {
    res.status(200).json({ 
      loggedIn: true, 
      userId: req.session.userId,
      userEmail: req.session.userEmail,
      userName: req.session.userName
    });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

module.exports = router;