const express = require('express')
const router = express.Router()

//models import
const Applicant = require('../../models/applicant')
const Loan = require('../../models/loan')

//middlewares import
const { 
    renderLoanIndex,
    handleLoanSubmission
 } = require('../../controllers/applicantControllers/loanControllers')

router.route('/new')
    .get(renderLoanIndex)

router.route('/')
    .get(async (req,res) => {
        console.log('Mes demandes')
        const applicant = await Applicant.findOne({ user: req.session.userId })
        const currentLoans = await Loan.find({ 
            applicant: applicant._id,
            state: 'pending'
         })
        const approvedLoans = await Loan.find({ 
            applicant: applicant._id,
            state: 'approved'
         })
        res.locals.firstNameMyLoans = req.session.firstName
        res.locals.currentLoans = currentLoans
        res.locals.demandesTerminees = approvedLoans
        res.render('applicant/mes-demandes')
    })
    .post(handleLoanSubmission)

module.exports = router