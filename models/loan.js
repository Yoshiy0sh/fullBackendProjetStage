const mongoose = require('mongoose')

const loanSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
        {
            timestamps: true
        }
    )

module.exports = mongoose.model('Loan',loanSchema)