const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 16*1024*1024 },
    fileFilter: (req, file, cb) => {
        // if(file.mimetype === 'application/pdf'){
        if(file.mimetype === 'image/png'){
            cb(null,true)
        } else {
            cb(new Error('Only PDF files are authorized'), false)
        }
    }
})

module.exports = upload