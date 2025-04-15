const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const auth = require('../middleware/auth');

// Get hospital profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Fetching hospital profile for userId:', req.user.userId);
        const hospital = await Hospital.findById(req.user.userId);
        
        if (!hospital) {
            console.log('Hospital not found for userId:', req.user.userId);
            return res.status(404).json({ message: 'Hospital not found' });
        }

        console.log('Found hospital:', {
            id: hospital._id,
            name: hospital.name,
            isVerified: hospital.isVerified
        });

        // Always return the hospital data, regardless of verification status
        res.json(hospital);
    } catch (error) {
        console.error('Error in /profile:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update blood bank inventory
router.patch('/inventory', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.user.userId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        if (!hospital.isVerified) {
            return res.status(403).json({ message: 'Hospital not verified yet' });
        }

        const { bloodGroup, units } = req.body;
        const bloodGroupIndex = hospital.availableBloodGroups.findIndex(
            bg => bg.bloodGroup === bloodGroup
        );

        if (bloodGroupIndex === -1) {
            hospital.availableBloodGroups.push({ bloodGroup, units });
        } else {
            hospital.availableBloodGroups[bloodGroupIndex].units = units;
        }

        await hospital.save();
        res.json({ message: 'Inventory updated successfully', hospital });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Search for donors
router.get('/search-donors', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.user.userId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        if (!hospital.isVerified) {
            return res.status(403).json({ message: 'Hospital not verified yet' });
        }

        const { bloodGroup, city } = req.query;
        const query = { isAvailable: true };
        
        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (city) query.city = city;

        const donors = await Donor.find(query).select('-password');
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update hospital profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        const hospital = await Hospital.findById(req.user.userId);
        
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        Object.keys(updates).forEach(update => {
            if (!['password', 'isVerified'].includes(update)) {
                hospital[update] = updates[update];
            }
        });

        await hospital.save();
        res.json(hospital);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get blood requests for a hospital
router.get('/blood-requests', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.user.userId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        const bloodRequests = await BloodRequest.find({ hospitalId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('donorId', 'name bloodType contactNumber');

        res.json(bloodRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new blood request
router.post('/blood-requests', auth, async (req, res) => {
  try {
    console.log('Received blood request creation request:', req.body);
    console.log('User from token:', {
      userId: req.user.userId,
      role: req.user.role,
      fullUser: req.user
    });

    // Validate and convert userId to ObjectId
    let hospitalId;
    try {
      hospitalId = new mongoose.Types.ObjectId(req.user.userId);
      console.log('Converted hospital ID:', hospitalId);
    } catch (error) {
      console.error('Invalid hospital ID format:', req.user.userId);
      return res.status(400).json({ 
        message: 'Invalid hospital ID format',
        details: { userId: req.user.userId }
      });
    }

    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    console.log('Hospital lookup result:', {
      userId: hospitalId,
      found: !!hospital,
      hospital: hospital ? {
        _id: hospital._id,
        name: hospital.name,
        isVerified: hospital.isVerified,
        email: hospital.email
      } : null
    });

    if (!hospital) {
      console.error('Hospital not found for ID:', hospitalId);
      return res.status(404).json({ 
        message: 'Hospital not found',
        details: {
          userId: hospitalId,
          role: req.user.role
        }
      });
    }

    if (!hospital.isVerified) {
      console.error('Hospital not verified:', hospitalId);
      return res.status(403).json({ 
        message: 'Hospital not verified',
        details: {
          userId: hospitalId,
          name: hospital.name,
          email: hospital.email
        }
      });
    }

    const { bloodType, contactPerson, contactNumber, urgent } = req.body;

    // Validate required fields
    if (!bloodType || !contactPerson || !contactNumber) {
      console.error('Missing required fields:', { bloodType, contactPerson, contactNumber });
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          bloodType: !bloodType ? 'Blood type is required' : undefined,
          contactPerson: !contactPerson ? 'Contact person is required' : undefined,
          contactNumber: !contactNumber ? 'Contact number is required' : undefined
        }
      });
    }

    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(bloodType)) {
      console.error('Invalid blood type:', bloodType);
      return res.status(400).json({ 
        message: 'Invalid blood type',
        details: { bloodType: 'Must be one of: ' + validBloodTypes.join(', ') }
      });
    }

    // Validate contact number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contactNumber)) {
      console.error('Invalid contact number format:', contactNumber);
      return res.status(400).json({ 
        message: 'Invalid contact number format',
        details: { contactNumber: 'Must be a 10-digit number' }
      });
    }

    // Create new blood request
    const bloodRequest = new BloodRequest({
      hospitalId: hospital._id,
      bloodType,
      contactPerson,
      contactNumber,
      urgent: urgent || false
    });

    console.log('Saving blood request:', {
      hospitalId: bloodRequest.hospitalId,
      bloodType: bloodRequest.bloodType,
      contactPerson: bloodRequest.contactPerson,
      contactNumber: bloodRequest.contactNumber,
      urgent: bloodRequest.urgent
    });

    // Save to database
    await bloodRequest.save();

    // Populate hospital details in response
    const populatedRequest = await BloodRequest.findById(bloodRequest._id)
      .populate('hospitalId', 'name email contactNumber');

    console.log('Blood request created successfully:', {
      _id: populatedRequest._id,
      hospitalId: populatedRequest.hospitalId._id,
      hospitalName: populatedRequest.hospitalId.name,
      bloodType: populatedRequest.bloodType,
      contactPerson: populatedRequest.contactPerson,
      contactNumber: populatedRequest.contactNumber,
      urgent: populatedRequest.urgent
    });

    res.status(201).json({
      _id: populatedRequest._id,
      hospitalId: populatedRequest.hospitalId._id,
      hospitalName: populatedRequest.hospitalId.name,
      bloodType: populatedRequest.bloodType,
      contactPerson: populatedRequest.contactPerson,
      contactNumber: populatedRequest.contactNumber,
      urgent: populatedRequest.urgent
    });
  } catch (error) {
    console.error('Error creating blood request:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error creating blood request',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update blood request status
router.patch('/blood-requests/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const bloodRequest = await BloodRequest.findById(req.params.id);

        if (!bloodRequest) {
            return res.status(404).json({ message: 'Blood request not found' });
        }

        if (bloodRequest.hospitalId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        bloodRequest.status = status;
        await bloodRequest.save();

        res.json(bloodRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 