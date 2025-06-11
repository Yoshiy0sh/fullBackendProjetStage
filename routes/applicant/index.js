const express = require('express')
const router = express.Router()

//routers
const loanRouter = require('./loanOld')
const accountRouter = require('./account')
const simulationRouter = require('./simulation')
const demandeRouter = require('./loan')

//utils import
const { generateCsrfToken } = require('../../utils/csrf')

//middlewares import
const { restrictApplicant } = require('../../middlewares/restriction')

router.use(restrictApplicant)

router.route('/')
    .get((req,res) => {
        res.redirect('/applicant/dashboard')
    })

router.route('/dashboard')
    .get((req, res) => {
        res.render('applicant/dashboard', {
            currentPage: 'dashboard',
            firstNameDashboard: req.session.firstName,
            lastNameDashboard: req.session.lastName,
            csrfToken: generateCsrfToken(req)
        })
    })

//identity card preview route
// router.get('/CNI', async (req, res) => {
//         const applicant = await require('../../models/applicant').findOne({ user: req.session.userId })
//         if (applicant.identityCard.contentType === 'application/pdf') {
//             const base64 = applicant.identityCard.data.toString('base64');
//             return res.send(`
//                 <h2>Identity Card Preview</h2>
//                 <embed src="data:application/pdf;base64,${base64}" width="600" height="800" type="application/pdf">
//             `);
//         }
//     })

router.use('/account',accountRouter)
router.use('/simulation',simulationRouter)
router.use('/demande',demandeRouter)

module.exports = router