const express = require('express')
const router = express.Router()

//utils import
const { generateCsrfToken } = require('../../utils/csrf')

router.route('/')
    .get((req, res) => {
        res.locals.csrfToken = generateCsrfToken(req)
        res.locals.firstNameSimulation = req.session.firstName
        res.render('applicant/simulation')
    })

module.exports = router