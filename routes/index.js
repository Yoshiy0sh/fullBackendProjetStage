const express = require('express')
const router = express.Router()
const multer = require('multer')

//multer configuration
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//utils import
const { checkFields } = require('../utils/validateFields')
const { generateCsrfToken } = require('../utils/csrf')
const { callWebhookWithEmailAndToken } = require('../utils/mail')

//middlewares imports
const { checkBasicSessionFields } = require('../middlewares/sessionFields')
const { checkCsrfToken } = require('../middlewares/csrf')
const { restrictConnected } = require('../middlewares/restriction')

//controllers import
const { 
    renderIndexPage,
    renderRegisterPage,
    createNewUser,
    renderLoginPage,
    loginUser,
    renderEditPage,
    patchUserData,
    deleteUser,
    logoutUser,
    renderForgotPasswordPage,
    sendCodeToEmail,
    reSendCodeToEmail,
    verifyCode,
    resetPassword,
 } = require('../controllers/authControllers')

//routers import
const applicantRouter = require('./applicant/index')
const resetPasswordRouter = require('./auth/resetPassword')
const loanOfficerRouter = require('./loanOfficer/index')
const blogRouter = require('./blog/index')

//checks
router.use(upload.any())
router.use(checkBasicSessionFields)
router.use((req,res,next) => {
    if(req.method !== 'GET'){
        checkCsrfToken(req,res,next)
    }
    else{
        next()
    }
})

//routers use
router.use('/applicant',applicantRouter)
router.use('/loanOfficer',loanOfficerRouter)
// router.use('/reset-password', resetPasswordRouter)
router.use('/blog', blogRouter)


//auth routes
router.route('/')
    .get(renderIndexPage)

router.route('/register')
    .get(renderRegisterPage)
    .post(createNewUser)

router.route('/login')
    .get(renderLoginPage)
    .post(loginUser)

router.route('/logout')
    .post((req,res) => {
        logoutUser(req,res)
    })

router.route('/edit')
    .all(restrictConnected)
    .get(renderEditPage)
    .patch(patchUserData)
    .delete(deleteUser)

router.route('/forgot-password')
    .get((req, res) => {
        res.locals.csrfToken = generateCsrfToken(req)
        res.render('auth/forgot-password')
    })
    .post((req,res) => {
        sendCodeToEmail(req, res)
    })

router.route('/verify-code')
    .get((req, res) => {
        res.locals.csrfToken = generateCsrfToken(req)
        res.locals.emailVerifyCode = req.session.emailForgotPassword
        console.log('le _csrf local est ',res.locals.csrfToken)
        res.render('auth/verify-code')
    })
    .post((req,res) => {
        verifyCode(req, res)
    })

router.route('/resend-code')
    .post((req, res) => {
        reSendCodeToEmail(req, res)
    })

router.route('/reset-password')
    .get((req, res) => {
        res.locals.csrfToken = generateCsrfToken(req)
        res.render('auth/reset-password')
    })
    .post((req, res) => {
        resetPassword(req, res)
    })



module.exports = router