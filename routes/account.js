const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { checkCSRFToken } = require('../middlewares/csrf')
const { generateCSRFToken } = require('../utils/csrf')
const { restrictConnected } = require('../middlewares/restriction')
const { checkExistenceFields } = require('../utils/validateFields') 

const User = require('../models/user')

router.route('/')
    .get((req,res) => {
        //add message "complete profile if uncompleted"
        const isLoggedIn = req.session.userId != null
        const email = req.session.email ? req.session.email : null
        res.render('account/index',{isLoggedIn: isLoggedIn ,email: email}) 
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

            // modelGeneratorUsertype(usertype,newUser._id)

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

                req.session.userId = user._id
                req.session.email = user.email

                res.redirect('/account')
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

router.route('/edit')
    .get(restrictConnected,(req,res) => {
        csrfToken = generateCSRFToken(req)

        email = req.session.email
        const successMessage = req.session.successMessage
        delete req.session.successMessage
        const error = req.session.error
        delete req.session.error
        res.render('account/edit',{ error,email,successMessage,csrfToken })
    })
    .patch(checkCSRFToken,restrictConnected,async (req,res) => {
        try {
            const fields = checkExistenceFields(req,res,['email'])
            if(!fields){
                return
            }
            const { email } = fields

            const user = await User.findById(req.session.userId)
            //do not patch email if same as in use

            if(email === user.email){
                req.session.error = 'Email already in use by your account'
                return res.status(409).redirect('edit')
            }


            //do not patch email if already in use

            const existingUser = await User.findOne({ email:email })
            if(existingUser){
                req.session.error = 'Email already in use by another account'
                return res.status(409).redirect('edit')
            }

            user.email = email
            req.session.email = email
            req.session.successMessage = "Informations successfully updated"

            await user.save()

            res.status(200).redirect('edit')
        } catch (error) {
            console.error(error)
        }
    })
    .delete(checkCSRFToken,restrictConnected,async (req,res) => {
        try {
            await User.findOneAndDelete({ _id: req.session.userId })
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