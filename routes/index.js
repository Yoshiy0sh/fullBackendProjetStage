const express = require('express')
const router = express.Router()

//utils import
const { checkFields } = require('../utils/validateFields')

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
    patchUserData
 } = require('../controllers/authControllers')

//routers
const applicantRouter = require('./applicant/index')
router.use('/applicant',applicantRouter)

//checks
router.use(checkBasicSessionFields)
router.use((req,res,next) => {
    if(!req.method === 'GET'){
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
    .get(renderEditPage)
    .patch(async (req,res) => {
        try {
            const UserFields = checkExistenceFields(req,res,['email'])
            if(!UserFields){
                return
            }
            const { email } = UserFields

            const user = await User.findById(req.session.userId)
            //do not patch email if same as in use

            if(email === user.email){
                req.session.error = 'Email already in use by your account'
                return res.status(409).redirect('edit')
            }

            // do not patch email if already in use

            const existingUser = await User.findOne({ email:email })
            if(existingUser){
                req.session.error = 'Email already in use by another account'
                return res.status(409).redirect('edit')
            }

            user.email = email
            req.session.successMessage = "Informations successfully updated"

            await user.save()
            req.session.user = user
        } catch (error) {
            console.error(error)
        }
    })
    .delete(async (req,res) => {
        try {
            await User.findOneAndDelete({ _id: req.session.user._id })
            res.status(200).redirect('logout')
        } catch (error) {
            console.error(error)
            res.status(500)
        }
    })



module.exports = router