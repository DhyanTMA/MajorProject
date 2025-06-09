const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true,
    collection: 'bills'
});

const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);

module.exports = Bill;