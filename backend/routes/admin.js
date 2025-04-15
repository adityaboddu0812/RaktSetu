const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Get all unverified hospitals
router.get('/unverified-hospitals', auth, isAdmin, async (req, res) => {
    try {
        const hospitals = await Hospital.find({ isVerified: false });
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify hospital
router.post('/verify-hospital/:id', auth, isAdmin, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        
        hospital.isVerified = true;
        await hospital.save();
        
        res.json({ message: 'Hospital verified successfully', hospital });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all hospitals
router.get('/hospitals', auth, isAdmin, async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 