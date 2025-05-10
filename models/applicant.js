const mongoose = require('mongoose')

const applicantSchema = new mongoose.Schema({
        surname: {
            type: String,
        },
        name: {
            type: String,
        },
        CNI: {
            type: Buffer,
            contentType: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
        {
            timestamps: true
        }
    )

module.exports = mongoose.model('Applicant',applicantSchema)