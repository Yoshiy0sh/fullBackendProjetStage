const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { checkCSRFToken } = require('../middlewares/csrf')
const { generateCSRFToken } = require('../utils/csrf')
const { restrict } = require('../middlewares/restriction')

const User = require('../models/user')

router.route('/')
    .get((req,res) => {
        //add message "complete profile if unfinished"
        const isLoggedIn = req.session.userId != null
        const email = req.session.email ? req.session.email : null
        res.render('account/index',{isLoggedIn: isLoggedIn ,email: email}) 
    })

router.route('/register')
    .get((req,res) => {
        const csrfToken = generateCSRFToken(req)

        const {email,password,errors} = req.session.formData || {email: '',password: ''}
        req.session.formData = null
        const error = req.session.error
        req.session.error = null
        res.render('account/register',{email,password,error,csrfToken})
    })
    .post(checkCSRFToken,async (req,res) => {
        try {
            const {email, password} = req.body
            if(!email || !password){
                req.session.formData = {email,password}
                req.session.error = 'All fields are required'
                return res.status(400).redirect('register')
            }

            //is email unique ?
            const existingUser = await User.findOne({email : email})
            if(existingUser){
                req.session.formData = {email,password}
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
                usertype: 'applicant'
            })

            await newUser.save()
            console.log('New user : ', newUser)
            res.status(201).redirect('login')
        } catch (error) {
            console.error(error)
        }
    })

router.route('/login')
    .get((req,res) => {
        const csrfToken = generateCSRFToken(req)

        const {email,password} = req.session.formData || {email: '',password: ''}
        req.session.formData = null
        const error = req.session.error
        req.session.error = null
        res.render('account/login',{email,password,error,csrfToken})
    })
    .post(checkCSRFToken,async (req,res) => {
        try {
            const {email, password} = req.body
            
            if(!email || !password){
                req.session.formData = {email,password}
                req.session.error = 'All fields are required'
                return res.status(400).redirect('login')
            }

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

            //il faudrait faire un req.session.regenerate mais je veux voir
            //ce que ça fait sans avant
            req.session.userId = user._id
            req.session.email = user.email

            res.redirect('/account')
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
    .get(restrict,(req,res) => {
        csrfToken = generateCSRFToken(req)

        email = req.session.email
        const successMessage = req.session.successMessage
        delete req.session.successMessage
        res.render('account/edit',{email , successMessage,csrfToken})
    })
    .patch(checkCSRFToken,restrict,async (req,res) => {
        try {
            const user = await User.findById(req.session.userId)
            user.email = req.body.email
            req.session.email = req.body.email
            req.session.successMessage = "Informations successfully updated"

            await user.save()

            res.status(200).redirect('edit')
        } catch (error) {
            console.error(error)
        }
    })
    .delete(checkCSRFToken,restrict,async (req,res) => {
        try {
            await User.findOneAndDelete({ _id: req.session.userId })
            res.status(200).redirect('logout')
        } catch (error) {
            console.error(error)
            res.status(500)
        }
    })

module.exports = router