require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const initDb = require('./db/init');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const deliveryRoutes = require('./routes/delivery');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const dbQueriesRoutes = require('./routes/dbQueries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Boot Database & Mount Routes
(async () => {
    try {
        await initDb();

        app.use('/api/auth', authRoutes);
        app.use('/api', restaurantRoutes);
        app.use('/api', cartRoutes);
        app.use('/api', orderRoutes);
        app.use('/api', adminRoutes);
        app.use('/api', deliveryRoutes);
        app.use('/api', reviewRoutes);
        app.use('/api', favoriteRoutes);
        app.use('/api', dbQueriesRoutes);

        // Health Check
        app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', service: 'Food Ordering System REST API', timestamp: new Date().toISOString() });
        });

        app.listen(PORT, () => {
            console.log(`🚀 Food Ordering Backend REST API listening at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();
