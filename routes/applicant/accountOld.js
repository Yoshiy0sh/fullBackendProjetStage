const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const upload = require('../../utils/upload')

//utils import
const { generateCsrfToken } = require('../../utils/csrf')

//import from models
const Applicant = require('../../models/applicant')
const User = require('../../models/user')

//controllers import
const { renderAccountIndex } = require('../../controllers/applicantControllers/accountControllers')

router.route('/')
    .get(renderAccountIndex)

router.route('/register')
    .get((req,res) => {
        const {email,password,usertype} = req.session.formData || {email: '',password: '',usertype: ''}
        req.session.formData = null
        const error = req.session.error
        req.session.error = null
        res.render('applicant/account/register',{email,password,error/*,csrfToken*/})
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

        const {email,password} = req.session.formData || {email: '',password: ''}
        delete req.session.formData
        const error = req.session.error
        delete req.session.error
        // const csrfToken = generateCSRFToken(req)
        res.render('applicant/account/login',{email,password,error/*,csrfToken*/})
    })
    // .post(checkCSRFToken,async (req,res) => {
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


router.route('/edit')
    .get((req,res) => {
        // const csrfToken = generateCSRFToken(req)
        email = req.session.email
        const successMessage = req.session.successMessage
        delete req.session.successMessage
        const error = req.session.error
        delete req.session.error
        const name = null
        res.render('applicant/account/edit',{ error,email,successMessage/*,csrfToken*/,name })
    })
    // .patch(upload.single('CNI'),checkCSRFToken,async (req,res) => {
    .patch(upload.single('CNI'),async (req,res) => {
        try {
            const ApplicantFields = checkExistenceFields(req,res,['name'])
            if(!ApplicantFields){
                return
            }
            const { name } = ApplicantFields

            const applicant = await Applicant.findOne({ user: req.session.user._id })
            applicant.name = name

            applicant.CNI = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }

            await applicant.save()
            res.status(200).redirect('edit')
        } catch (error) {
            console.error(error)
        }
    })
    .delete(async (req,res) => {
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