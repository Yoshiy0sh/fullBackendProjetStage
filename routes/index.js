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
    createNewUser
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
    .get(checkFormSessionFields,renderRegisterPage)
    .post(createNewUser)

router.route('/login')
    .get((req,res) => {
        // const csrfToken = generateCSRFToken(req)
        const {email,password} = req.session.formData || {email: '',password: ''}
        delete req.session.formData
        console.log(res.locals.csrfToken)
        res.render('login',{email,password/*,csrfToken*/})
    })
    .post(async (req,res) => {
        try {
            const fields = checkExistenceFields(req,res,['email','password'])

            if(!fields){
                return
            }

            const {email, password} = fields

            const user = await User.findOne({email:email})

            if(!user){
                req.session.formData = {email,password}
                req.session.errorMessage = 'User not found'
                return res.status(404).redirect('login')
            }

            const isMatch = await bcrypt.compare(password,user.password)
            if(!isMatch){
                req.session.formData = {email,password}
                req.session.error = 'Invalid password'
                return res.status(401).redirect('login')
            }

            req.session.regenerate((err) => {
                if(err){
                    console.error('Error regenerating session',err)
                    return res.status(500).send('Internal server error')
                }

                req.session.user = user
                console.log('connected : ' + req.session.user.email)

                //careful, we include the field usertype in our uri
                res.redirect(`/${user.usertype}/account`)
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({message: 'Server Error'})
        }
    })

router.route('/logout')
    .get((req,res) => {
        req.session.destroy(() => {
            res.redirect('/')
        })
    })

router.route('/edit')
    .get((req,res) => {
        // csrfToken = generateCSRFToken(req)

        email = req.session.user.email
        const successMessage = req.session.successMessage
        delete req.session.successMessage
        const error = req.session.error
        delete req.session.error

        const name = null
        
        res.render('edit',{ error,email,successMessage/*,csrfToken*/,name })
    })
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