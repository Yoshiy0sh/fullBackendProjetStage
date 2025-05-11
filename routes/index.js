const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { checkCSRFToken } = require('../middlewares/csrf')
const { generateCSRFToken } = require('../utils/csrf')
const { checkExistenceFields } = require('../utils/validateFields') 

const Applicant = require('../models/applicant')
const User = require('../models/user')

//routers
const applicantRouter = require('./applicant/index')
router.use('/applicant',applicantRouter)

router.route('/')
    .get((req,res)=>{
        res.render('index')
    })

router.route('/register')
    .get((req,res) => {
        const csrfToken = generateCSRFToken(req)

        const {email,password,usertype} = req.session.formData || {email: '',password: '',usertype: ''}
        req.session.formData = null
        const error = req.session.error
        req.session.error = null
        res.render('account/register',{email,password,error,csrfToken})
    })
    .post(checkCSRFToken,async (req,res) => {
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
        const csrfToken = generateCSRFToken(req)

        const {email,password} = req.session.formData || {email: '',password: ''}
        delete req.session.formData
        const error = req.session.error
        delete req.session.error
        res.render('account/login',{email,password,error,csrfToken})
    })
    .post(checkCSRFToken,async (req,res) => {
        try {
            const fields = checkExistenceFields(req,res,['email','password'])

            if(!fields){
                return
            }

            const {email, password} = fields

            const user = await User.findOne({email:email})

            if(!user){
                req.session.formData = {email,password}
                req.session.error = 'User not found'
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
                req.session.userId = user._id
                req.session.email = user.email

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
            res.redirect('/account')
        })
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