const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { checkCSRFToken } = require('../middlewares/csrf')
const { generateCSRFToken } = require('../utils/csrf')
const { restrictConnected } = require('../middlewares/restriction')
const Loan = require('../models/loan')
const { checkExistenceFields } = require('../utils/validateFields')

router.use(restrictConnected)

router.route('/')
    .get(async (req,res) => {
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
    .get((req,res) => {
        const csrfToken = generateCSRFToken(req)

        const error = req.session.error
        delete req.session.error

        const { name,amount } = req.session.formData || { name: '', amount: ''}
        delete req.session.formData

        res.render('loan/new',{ error,csrfToken,name,amount })
    })
    .post(checkCSRFToken,async (req,res) => {
        try {
            const fields = checkExistenceFields(req,res,['name','amount'])
            if(!fields){
                return
            }
            const { name, amount } = fields

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
    .get(async (req,res) => {
        try {
            const csrfToken = generateCSRFToken(req)
            const loanId = req.params.id

            const loan = await Loan.findById(loanId)

            const error = req.session.error
            delete req.session.error

            delete req.session.formData

            res.render('loan/show',{error,csrfToken,loanId,name: loan.name,amount: loan.amount})
        } catch (error) {
            console.error(error)
        }
    })
    .patch(checkCSRFToken, async (req,res) => {
        try {
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                return res.status(400).send('Invalid loan ID')
            }

            const fields = checkExistenceFields(req,res,['name','amount'])
            if(!fields){
                return
            }
            const {name, amount} = fields

            const loan = await Loan.findByIdAndUpdate(
                {_id:req.params.id},
                {name,amount},
                {new: true, runValidators: true}
            )

            if(!loan){
                return res.status(404).send('Loan not found')
            }

            res.redirect(`/loan/${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    })
    .delete(checkCSRFToken, async (req,res) => {
        try {
            await Loan.findByIdAndDelete(req.params.id)
            res.status(200).redirect('/loan')
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