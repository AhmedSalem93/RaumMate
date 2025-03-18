const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, addUserToRequest } = require('../middleware/auth.middleware');
const Contract = require('../models/contract.model');

// Apply auth middleware to all routes and require verified role
router.use(authMiddleware, addUserToRequest, requireRole('verified'));

// Get all contracts for the logged-in user (as tenant or owner)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { role } = req.query; // 'owner' or 'tenant'

        let query = {};

        if (role === 'owner') {
            query.owner = userId;
        } else {
            query.tenant = userId;
        }

        const contracts = await Contract.find(query)
            .populate('property')
            .populate('tenant')
            .populate('owner')
            .sort({ issueDate: -1 });

        res.json(contracts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving contracts', error: error.message });
    }
});

// Get contracts for a specific property
router.get('/property/:propertyId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { propertyId } = req.params;

        // Find contracts for this property where the user is either owner or tenant
        const contracts = await Contract.find({
            property: propertyId,
            $or: [{ owner: userId }, { tenant: userId }]
        })
            .populate('property')
            .populate('tenant')
            .populate('owner')
            .sort({ issueDate: -1 });

        res.json(contracts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving property contracts', error: error.message });
    }
});



// Get a specific contract by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;

        const contract = await Contract.findById(req.params.id)
            .populate('property')
            .populate('tenant')
            .populate('owner');

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        // Check if user has permission to view this contract
        if (contract.tenant.toString() !== userId.toString() &&
            contract.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this contract' });
        }

        res.json(contract);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving contract', error: error.message });
    }
});

module.exports = router;
