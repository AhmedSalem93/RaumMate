const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewingDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['requested', 'in_progress', 'accepted', 'rejected', 'cancelled', 'contract_done'],
        default: 'requested'
    },
    message: {
        type: String
    },
    ownerNotes: {
        type: String
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
