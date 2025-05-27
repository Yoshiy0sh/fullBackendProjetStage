const express = require('express')
const router = express.Router()

//utils import
const { checkFields } = require('../utils/validateFields')
const { restrictConnected } = require('../middlewares/restriction')

//middlewares imports
const { checkBasicSessionFields, checkFormSessionFields } = require('../middlewares/sessionFields')
const { checkCsrfToken } = require('../middlewares/csrf')

//controllers import
const { 
    renderRegisterPage,
    createNewUser,
    renderLoginPage,
    loginUser,
    renderEditPage,
    patchUserData,
    deleteUser
 } = require('../controllers/authControllers')

//routers
const applicantRouter = require('./applicant/index')
router.use('/applicant',applicantRouter)

//checks
router.use(checkBasicSessionFields)
router.use((req,res,next) => {
    if(req.method !== 'GET'){
        checkCsrfToken(req,res,next)
    }
    else{
        next()
    }
})

router.route('/')
    .get((req,res)=>{
        res.render('index')
    })

router.route('/register')
    .get(renderRegisterPage)
    .post(createNewUser)

router.route('/login')
    .get(renderLoginPage)
    .post(loginUser)

router.route('/logout')
    .get((req,res) => {
        req.session.destroy(() => {
            res.redirect('/')
        })
    })

router.route('/edit')
    .all(restrictConnected)
    .get(renderEditPage)
    .patch(patchUserData)
    .delete(deleteUser)

module.exports = router