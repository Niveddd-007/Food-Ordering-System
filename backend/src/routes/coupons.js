const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Get all active public coupons
router.get('/coupons/available', (req, res) => {
    try {
        const coupons = db.prepare(`
            SELECT coupon_id, code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date
            FROM coupons
            WHERE is_active = 1 AND expiry_date >= DATE('now') AND used_count < usage_limit
            ORDER BY discount_value DESC
        `).all();
        res.json(coupons);
    } catch (err) {
        console.error('Error fetching coupons:', err);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

// Validate and apply a coupon to an order/cart subtotal
router.post('/coupons/apply', authenticateToken, (req, res) => {
    try {
        const { code, subtotal } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Promo coupon code is required' });
        }

        const numSubtotal = Number(subtotal);
        if (isNaN(numSubtotal) || numSubtotal <= 0) {
            return res.status(400).json({ error: 'Valid cart subtotal is required' });
        }

        const coupon = db.prepare(`
            SELECT * FROM coupons
            WHERE UPPER(code) = UPPER(?) AND is_active = 1
        `).get(code.trim());

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid promo coupon code' });
        }

        // Check expiration
        const today = new Date().toISOString().split('T')[0];
        if (coupon.expiry_date < today) {
            return res.status(400).json({ error: `Coupon ${coupon.code} has expired on ${coupon.expiry_date}` });
        }

        // Check usage limit
        if (coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ error: `Coupon ${coupon.code} has reached its maximum redemption limit` });
        }

        // Check minimum order amount
        if (numSubtotal < coupon.min_order_amount) {
            return res.status(400).json({
                error: `Minimum order amount of $${coupon.min_order_amount.toFixed(2)} required for coupon ${coupon.code}. Your subtotal is $${numSubtotal.toFixed(2)}.`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (numSubtotal * coupon.discount_value) / 100;
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else if (coupon.discount_type === 'flat') {
            discount = Math.min(coupon.discount_value, numSubtotal);
        }

        discount = +(discount.toFixed(2));
        const finalSubtotal = +(Math.max(0, numSubtotal - discount).toFixed(2));

        res.json({
            valid: true,
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            discount_amount: discount,
            original_subtotal: numSubtotal,
            discounted_subtotal: finalSubtotal,
            message: `Coupon "${coupon.code}" applied successfully! You saved $${discount.toFixed(2)}`
        });
    } catch (err) {
        console.error('Error applying coupon:', err);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
});

module.exports = router;
