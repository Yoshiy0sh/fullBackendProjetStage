const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
    name: {
        type : String,
        required: true
    },
    CNI: {
        data:Buffer,
        contentType: String,
    },
    Justificatif: {
        data:Buffer,
        contentType: String,
    }
})

module.exports = mongoose.model('Document',documentSchema)