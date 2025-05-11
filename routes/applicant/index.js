const express = require('express')
const router = express.Router()

const { restrictApplicant } = require('../../middlewares/restriction')

//routers

const loanRouter = require('./loan')
const accountRouter = require('./account')

//models

const User = require('../../models/user')

router.route('/')
    .get(restrictApplicant,(req,res) => {
        res.redirect('/applicant/account')
    })

router.use('/loan',loanRouter)
router.use('/account',accountRouter)

module.exports = router