const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true,
            unique: true
        },
        //don't forget to hash this
        password: {
            type: String,
            required: true
        },
        usertype: {
            type: String,
            enum: ['loanOfficer','admin','applicant'],
            required: true
        }
    },
        {
            timestamps: true
        }
    )

module.exports = mongoose.model('User',userSchema)