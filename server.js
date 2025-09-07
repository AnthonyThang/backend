const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock user database (replace with real database)
const users = [
  {
    username: '123456789',
    password: '$2b$10$8zXMMk7yvV84bmOaf8mIq.QFrMGfpKKyTsKa1AY/ZEJIvk87HVKKK', // bcrypt hash for '123456'
    accountNumber: '123456789',
    accountHolder: 'Nguyen Van A',
    balance: 5000000,
    pin: '123456'
  },
  {
    username: '987654321',
    password: '$2b$10$rG.9xvRxu3oCMPhnANds8.sYhHcECqK3cWSYoEHq0/9jnOt21TS6q', // bcrypt hash for '654321'
    accountNumber: '987654321',
    accountHolder: 'Tran Thi B',
    balance: 10000000,
    pin: '654321'
  }
];

// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: user.username,
        accountNumber: user.accountNumber
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      status: 'success',
      token: token,
      user: {
        accountNumber: user.accountNumber,
        accountHolder: user.accountHolder,
        balance: user.balance,
        pin: user.pin
      },
      app_type: 'mb'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MB Bank Backend API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Login endpoint: POST http://localhost:${PORT}/api/v1/auth/login`);
});

module.exports = app;
