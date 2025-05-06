const express = require('express')
const router = express.Router()
const { checkCSRFToken } = require('../middlewares/csrf')
const { generateCSRFToken } = require('../utils/csrf')
const { restrict } = require('../middlewares/restriction')
const { upload } = require('../utils/upload')
const Document = require('../models/document')

router.route('/')
    .get(restrict,async (req,res) => {
        //il faut faire la vérification du logged in directement dans la route et non dans ejs
        //avec un paramètre isLoggedIn
        try {
            console.log("On passe dans index loan")
            const email = req.session.email
            res.render('loan/index',{email})
        } catch (error) {
            
        }
    })

router.route('/new')
    .get(restrict,async (req,res) => {
        const csrfToken = generateCSRFToken(req)
        
        res.render('loan/new',{ csrfToken })
    })
    .post(restrict,upload.fields([
        { name: 'cni', maxCount: 1}, 
        { name: 'justificatif', maxCount: 1 }
    ]),async (req,res) => {
        try {
            const files = req.files

            const document = new Document({
                name: req.body.nom,
                CNI: {
                    data: files['cni'][0].buffer,
                    contentType: files['cni'][0].mimetype
                },
                Justificatif: {
                    data: files['justificatif'][0].buffer,
                    contentType: files['justificatif'][0].mimetype
                }
            })

            await document.save()
            res.redirect('/loan')
        } catch (error) {
            console.error(error)
        }
    })

router.route('/download/:name')
    .get(async (req,res) => {
    try {
        console.log('Download')
        const document = await Document.findOne({ name: req.params.name })

        res.set({
            'Content-Type': document.CNI.contentType,
            'Content-Disposition': `attachment; filename="${document.name}-CNI.pdf"`,
        })

        res.send(document.CNI.data)
    } catch (error) {
        console.error(error)
    }
})

module.exports = router