const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');

// Get all donors
router.get('/', auth, async (req, res) => {
    try {
        const donors = await Donor.find();
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get donor profile
router.get('/profile', auth, async (req, res) => {
    try {
        const donor = await Donor.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        res.json(donor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update donor profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        const donor = await Donor.findById(req.user.userId);
        
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        Object.keys(updates).forEach(update => {
            if (update !== 'password') { // Don't allow password updates through this route
                donor[update] = updates[update];
            }
        });

        await donor.save();
        res.json(donor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update availability status
router.patch('/availability', auth, async (req, res) => {
    try {
        const donor = await Donor.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        donor.isAvailable = req.body.isAvailable;
        await donor.save();
        
        res.json({ message: 'Availability updated successfully', donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update last donation date
router.patch('/last-donation', auth, async (req, res) => {
    try {
        const donor = await Donor.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        donor.lastDonation = new Date(req.body.lastDonation);
        await donor.save();
        
        res.json({ message: 'Last donation date updated successfully', donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 