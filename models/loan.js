const mongoose = require('mongoose')
const { nanoid } = require('nanoid')

const loanSchema = new mongoose.Schema({
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Applicant',
            required: true
        },
        //duplication is rare but not impossible,
        //need to treat error case in the controller
        loanNumber: {
            type: String,
            required: true,
            unique: true,
            default: () => nanoid(8)
        },
        projectType: { type: String, required: true },
        projectAmount: { type: Number, required: true },
        personalContribution: { type: Number, required: true },
        borrowedAmount: { type: Number, required: true },
        loanDuration: { type: Number, required: true },
        amortizationType: { type: String, required: true },
        borrowerInsurance: { type: String, required: true },
        state: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Loan',loanSchema)