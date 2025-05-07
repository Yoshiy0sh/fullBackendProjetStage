const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { checkCSRFToken } = require('../middlewares/csrf')
const { generateCSRFToken } = require('../utils/csrf')
const { restrict } = require('../middlewares/restriction')
const Loan = require('../models/loan')

router.route('/')
    .get(restrict,async (req,res) => {
        //il faut faire la vérification du logged in directement dans la route et non dans ejs
        //avec un paramètre isLoggedIn
        try {
            console.log("On passe dans index loan")
            const email = req.session.email
            
            const loans = await Loan.find({ user: req.session.userId})


            res.render('loan/index',{email,loans})
        } catch (error) {
            
        }
    })

router.route('/new')
    .get(restrict,async (req,res) => {
        const csrfToken = generateCSRFToken(req)

        res.render('loan/new',{ csrfToken })
    })
    .post(restrict,checkCSRFToken,async (req,res) => {
        try {
            const { name, amount } = req.body

            const user = req.session.userId;

            const loan = new Loan({
                user,
                name,
                amount
            })

            await loan.save()
            res.status(201).redirect('/loan')
        } catch (error) {
            console.error(error)
        }
    })

router.route('/:id')
    .get(restrict,async (req,res) => {
        try {
            const csrfToken = generateCSRFToken(req)
            const loanId = req.params.id

            const loan = await Loan.findById(loanId)
            res.render('loan/show',{csrfToken,loanId,name: loan.name,amount: loan.amount})
        } catch (error) {
            console.error(error)
        }
    })
    .patch(restrict,checkCSRFToken, async (req,res) => {
        try {
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                return res.status(400).send('Invalid loan ID')
            }
            const {name, amount} = req.body

            const loan = await Loan.findById(req.params.id)

            if(!loan){
                return res.status(404).send('Loan not found')
            }

            loan.name = name
            loan.amount = amount
            await loan.save()
            res.redirect(`/loan/${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    })
    

// router.route('/download/:name')
//     .get(async (req,res) => {
//     try {
//         console.log('Download')
//         const document = await Document.findOne({ name: req.params.name })

//         res.set({
//             'Content-Type': document.CNI.contentType,
//             'Content-Disposition': `attachment; filename="${document.name}-CNI.pdf"`,
//         })

//         res.send(document.CNI.data)
//     } catch (error) {
//         console.error(error)
//     }
// })

module.exports = router