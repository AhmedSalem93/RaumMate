const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, addUserToRequest } = require('../middleware/auth.middleware');
const Booking = require('../models/booking.model');
const Property = require('../models/property.model');
const Contract = require('../models/contract.model');

// Apply auth middleware to all routes and require verified role
router.use(authMiddleware, addUserToRequest, requireRole('verified'));

// Create a new booking request
router.post('/', async (req, res) => {
    try {
        const { propertyId, viewingDate, message } = req.body;
        const userId = req.user.userId; // Assuming user data is set by auth middleware

        // Find the property and check if it exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if the property is available
        if (!property.isAvailable) {
            return res.status(400).json({ message: 'Property is not available for viewing' });
        }

        // Create the booking
        const booking = new Booking({
            property: propertyId,
            requestedBy: userId,
            owner: property.owner,
            viewingDate: (new Date(viewingDate)).toISOString(),
            message: message || ''
        });

        await booking.save();

        // Add booking reference to the property
        property.bookings.push(booking._id);
        await property.save();

        res.status(201).json({
            message: 'Booking request created successfully',
            booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
}
);

// Get all bookings for the logged-in user (as requester or owner)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { role } = req.query; // 'owner' or 'requester'

        let query = {};

        if (role === 'owner') {
            query.owner = userId;
        } else {
            query.requestedBy = userId;
        }

        const bookings = await Booking.find(query)
            .populate('property')
            .populate('requestedBy')
            .populate('owner')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bookings', error: error.message });
    }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('property')
            .populate('requestedBy')
            .populate('owner');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user has permission to view this booking
        const userId = req.user.userId;
        if (booking.requestedBy._id.toString() !== userId.toString() &&
            booking.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving booking', error: error.message });
    }
});

// Update booking status (accept, reject, cancel)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, ownerNotes } = req.body;
        const userId = req.user.userId;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only the owner can update the status (except for cancellation)
        if (status !== 'cancelled' && booking.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only the property owner can update booking status' });
        }

        // Only the requester can cancel
        if (status === 'cancelled' && booking.requestedBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only the requester can cancel the booking' });
        }

        // Only property owner can create a contract
        if (status === 'contract_done' && booking.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only the property owner can create a contract' });
        }

        booking.status = status;

        if (ownerNotes) {
            booking.ownerNotes = ownerNotes;
        }

        // Create a contract if status is changed to contract_done
        if (status === 'contract_done') {
            // Verify this is the property owner
            if (booking.owner.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Only the property owner can create a contract' });
            }

            // Create the simple contract
            const contract = new Contract({
                property: booking.property,
                tenant: booking.requestedBy,
                owner: booking.owner
                // issueDate will default to current date
            });

            await contract.save();

            // Link the contract to the booking
            booking.contract = contract._id;
        }

        booking.updatedAt = Date.now();
        await booking.save();

        res.json({
            message: 'Booking status updated successfully',
            booking,
            contract: booking.contract ? await Contract.findById(booking.contract) : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
});

// Check if user lives in a specific property (has a contract as tenant)
router.get('/livesInProperty/:propertyId', authMiddleware, addUserToRequest, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId } = req.params;

        // Check if there's a contract where the user is the tenant for this property
        const contract = await Contract.findOne({
            property: propertyId,
            tenant: userId
        });

        // If contract exists, user lives in the property
        res.json(!!contract);
    } catch (error) {
        console.error('Error checking if user lives in property:', error);
        res.status(500).json({
            message: 'Error checking property residency status',
            error: error.message
        });
    }
});










module.exports = router;
