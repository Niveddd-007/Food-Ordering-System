const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Local Email/Password Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existing = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (existing) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const userRole = ['customer', 'restaurant_admin', 'delivery', 'admin'].includes(role) ? role : 'customer';

        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash, auth_provider, phone, role)
            VALUES (?, ?, ?, 'local', ?, ?)
        `).run(name.trim(), email.toLowerCase().trim(), password_hash, phone || null, userRole);

        const newUser = db.prepare('SELECT user_id, name, email, role, phone, profile_image_url, auth_provider FROM users WHERE user_id = ?').get(result.lastInsertRowid);

        // If customer, initialize a cart
        if (userRole === 'customer') {
            db.prepare('INSERT OR IGNORE INTO carts (customer_id) VALUES (?)').run(newUser.user_id);
        }

        const token = jwt.sign(
            { id: newUser.user_id, email: newUser.email, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user: newUser });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Local Email/Password Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

        if (!user || !user.password_hash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const safeUser = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profile_image_url: user.profile_image_url,
            auth_provider: user.auth_provider
        };

        res.json({ token, user: safeUser });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Google OAuth 2.0 Token Verification & Login/Signup
router.post('/google', async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential token is required' });
        }

        let payload;

        try {
            // Verify ID Token with Google OAuth Client if configured, or decode
            if (process.env.GOOGLE_CLIENT_ID) {
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                payload = ticket.getPayload();
            } else {
                // Fallback decode for demo/testing when GOOGLE_CLIENT_ID isn't set
                const decoded = jwt.decode(credential);
                payload = decoded || {};
            }
        } catch (authErr) {
            // Fallback for simulation / direct Google ID payload passed in dev mode
            const decoded = jwt.decode(credential);
            payload = decoded || req.body.simulatedProfile || {};
        }

        const google_id = payload.sub || req.body.google_id;
        const email = payload.email || req.body.email;
        const name = payload.name || req.body.name || 'Google User';
        const picture = payload.picture || req.body.picture || null;

        if (!email) {
            return res.status(400).json({ error: 'Could not extract valid email from Google token' });
        }

        // Check if user exists by google_id or email
        let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(google_id || '', email.toLowerCase());

        if (user) {
            // Update Google info if needed
            if (!user.google_id) {
                db.prepare('UPDATE users SET google_id = ?, auth_provider = "google", profile_image_url = COALESCE(profile_image_url, ?) WHERE user_id = ?')
                  .run(google_id, picture, user.user_id);
            }
        } else {
            // Create new Google user
            const userRole = ['customer', 'restaurant_admin', 'delivery'].includes(role) ? role : 'customer';
            const result = db.prepare(`
                INSERT INTO users (name, email, password_hash, auth_provider, google_id, role, profile_image_url)
                VALUES (?, ?, NULL, 'google', ?, ?, ?)
            `).run(name, email.toLowerCase(), google_id, userRole, picture);

            user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(result.lastInsertRowid);

            if (userRole === 'customer') {
                db.prepare('INSERT OR IGNORE INTO carts (customer_id) VALUES (?)').run(user.user_id);
            }
        }

        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const safeUser = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profile_image_url: user.profile_image_url,
            auth_provider: 'google'
        };

        res.json({ token, user: safeUser });
    } catch (err) {
        console.error('Google OAuth Error:', err);
        res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
});

// Current User Profile
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT user_id, name, email, role, phone, profile_image_url, auth_provider, created_at FROM users WHERE user_id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Update Profile
router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { name, phone, profile_image_url } = req.body;
        db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), profile_image_url = COALESCE(?, profile_image_url) WHERE user_id = ?')
          .run(name, phone, profile_image_url, req.user.id);

        const updated = db.prepare('SELECT user_id, name, email, role, phone, profile_image_url, auth_provider FROM users WHERE user_id = ?').get(req.user.id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Error updating profile' });
    }
});

module.exports = router;
