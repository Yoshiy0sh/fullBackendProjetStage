const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { checkExistenceFields } = require('../utils/validateFields')
const { checkMessageFields } = require('../middlewares/sessionFields')

const Applicant = require('../models/applicant')
const User = require('../models/user')

//routers
const applicantRouter = require('./applicant/index')
router.use('/applicant',applicantRouter)
router.use(checkMessageFields)

router.route('/')
    .get((req,res)=>{
        res.render('index')
    })

router.route('/register')
    .get((req,res) => {
        // const csrfToken = generateCSRFToken(req)
        const {email,password,usertype} = req.session.formData || {email: '',password: '',usertype: ''}
        req.session.formData = null
        res.render('register',{email,password/*errorcsrfToken*/})
    })
    .post(async (req,res) => {
        try {
            const fields = checkExistenceFields(req,res,['email','password','usertype'])
            if(!fields){
                return
            }
            const {email,password,usertype} = fields

            //is email unique ?
            const existingUser = await User.findOne({email : email})
            if(existingUser){
                req.session.formData = {email,password,usertype}
                req.session.error = 'Email already in use'
                return res.status(409).redirect('register')
            }

            //hashing password
            const saltRounds = 10
            const hash  = await bcrypt.hash(password,saltRounds)

            //create and save newUser
            const newUser = new User({
                email: email,
                password: hash,
                usertype: usertype
            })

            await newUser.save()
            console.log('New user : ', newUser)

            modelGeneratorUsertype(usertype,newUser._id)

            res.status(201).redirect('login')
        } catch (error) {
            console.error(error)
        }
    })

router.route('/login')
    .get((req,res) => {
        // const csrfToken = generateCSRFToken(req)
        const {email,password} = req.session.formData || {email: '',password: ''}
        delete req.session.formData
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

async function modelGeneratorUsertype(usertype,userId){
    if(usertype == 'applicant'){
        const newApplicant = new Applicant({ user: userId })
        await newApplicant.save()
        return newApplicant
    } else if(usertype == 'loanOfficer'){
        return null
    }
    else{
        return null
    }
}

module.exports = router