const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    }
});

// Create compound indexes for common query patterns
contractSchema.index({ tenant: 1, property: 1 });
contractSchema.index({ owner: 1, property: 1 });

module.exports = mongoose.model('Contract', contractSchema);
