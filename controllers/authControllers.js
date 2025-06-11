//database models import
const User = require('../models/user')
const Applicant = require('../models/applicant')

//utils import
const bcrypt = require('bcryptjs')
const { checkFields,initializeEmptyFields } = require('../utils/validateFields')
const { generateCsrfToken } = require('../utils/csrf')
const { callWebhookWithEmailAndToken,callWebhookWithEmail } = require('../utils/mail')


function renderIndexPage(req,res){
    res.locals.csrfToken = generateCsrfToken(req)
    res.locals.emailIndex = req.session.email
    res.locals.firstNameIndex = req.session.firstName
    res.render('index')
}

function renderRegisterPage(req,res){
    initializeFields(req,res,['firstNameRegister','lastNameRegister','emailRegister','passwordRegister'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('auth/register')
}

async function createNewUser(req,res){
    try {
        if(!checkFields(req,res,['firstNameRegister','lastNameRegister','emailRegister','passwordRegister'])){
            return
        }

        //we verify if the email is already in use
        const existingUser = await User.findOne({email : req.body.emailRegister})
        if(existingUser){
            req.session.formFields = {email: req.body.emailRegister}
            req.session.errorMessage = 'email already in use'
            return res.status(409).redirect('register')
        }

        //hashing password
        const saltRounds = 10
        const hash  = await bcrypt.hash(req.body.passwordRegister,saltRounds)
        //create and save newUser
        const newUser = new User({
            email: req.body.emailRegister,
            password: hash,
            usertype: 'applicant', //default usertype for now
        })

        await newUser.save()
        console.log('New user : ', newUser)

        //creation of an applicant in the database
        await modelGeneratorUsertype('applicant',newUser._id,{
            firstName: req.body.firstNameRegister,
            lastName: req.body.lastNameRegister,
        })
        console.log(req.body.firstNameRegister, req.body.lastNameRegister)

        //send email to user
        // callWebhookWithEmail(req.body.email)

        res.status(201).redirect('login')
    } catch (error) {
       console.error(error)
    }
}

function renderLoginPage(req,res){
    initializeFields(req,res,['emailLogin','passwordLogin'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('auth/login')
}

async function loginUser(req,res){
    try {
        if(!checkFields(req,res,['emailLogin'])){
            return
        }

        //check if user exists
        const userFound = await User.findOne({email:req.body.emailLogin})
        if(!userFound){
            req.session.formFields = {emailLogin:req.body.emailLogin}
            req.session.errorMessage = 'User not found'
            return res.status(404).redirect('login')
        }

        //check if password is valid with bcrypt
        const passwordMatching = await bcrypt.compare(req.body.passwordLogin,userFound.password)
        if(!passwordMatching){
            req.session.formFields = { email: req.session.emailLogin }
            req.session.errorMessage = 'Invalid password'
            return res.status(401).redirect('login')
        }

        //regenerating session and initializing session variables
        await regenerateSession(req,userFound)

        res.redirect(`/${userFound.usertype}/dashboard`)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Server Error'})
    }
}

function renderEditPage(req,res){
    initializeFields(req,res,['emailEdit'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('edit')
}

async function patchUserData(req,res){
    try {
        if(!checkFields(req,res,['emailEdit'])){
            return
        }

        //check if email is already in use by the user and do not patch if it is
        if(req.session.email === req.body.emailEdit){
            req.session.errorMessage = 'Email already in use by your account'
            return res.status(409).redirect('edit')
        }

        //do not patch email if already in use by another user
        const userFound = await User.findOne({ email:req.body.emailEdit })
        if(userFound){
            req.session.errorMessage = 'Email already in use by another account'
            return res.status(409).redirect('edit')
        }

        //update user email
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { email : req.body.emailEdit },
            { new: true}
        )
        req.session.successMessage = "Informations successfully updated"

        req.session.email = req.body.emailEdit
        } catch (error) {
            console.error(error)
        }
}

async function deleteUser(req,res){
    try {
        //deleting all data related to the user
        await deleteChildModel(req.session.userId,req.session.usertype)
        await User.findByIdAndDelete(req.session.userId)
        res.status(200).redirect('logout')
    } catch (error) {
        console.error(error)
        res.status(500)
    }
}

//this function generates a password reset code, sends it to the user's email and stores it in the session
async function sendCodeToEmail(req,res){
    const code = generateResetPasswordCode(req)
    console.log('code generated :', code)
    // await callWebhookWithEmailAndToken(req.body.emailForgotPassword, code)
    console.log('on envoie un mail à',req.body.emailForgotPassword)
    req.session.emailForgotPassword = req.body.emailForgotPassword
    res.redirect('/verify-code')
}

//this function generates a new password reset code and sends it to the user's email
async function reSendCodeToEmail(req,res){
    const code = generateResetPasswordCode(req)
    console.log('code generated :', code)
    // await callWebhookWithEmailAndToken(req.session.emailForgotPassword, code)
    console.log('on envoie un mail à',req.session.emailForgotPassword)
    res.json({ success: true, csrfToken: generateCsrfToken(req) })
}

//this function compares the password reset code sent by the user with the one stored in the session
async function verifyCode(req,res){
    const code = req.body.codeVerifyCode
    console.log('comparaison des deux ( req.body puis req.session )',req.body.codeVerifyCode, req.session.resetPasswordCode)
    if(code === req.session.resetPasswordCode){
        res.redirect('/reset-password')
    } else {
        res.status(400).send('Code incorrect')
    }
}

async function resetPassword(req,res){
    try {
        //store the new password in newPassword variable
        const newPassword = req.body.passwordResetPassword

        //hashing new password
        const saltRounds = 10
        const hash  = await bcrypt.hash(newPassword,saltRounds)

        //updating the user password in the database
        const userFound = await User.findOneAndUpdate(
            { email: req.session.emailForgotPassword },
            { password : hash },
            { new: true }
        )

        console.log('user found :', userFound)

        console.log('password updated for user with email:', req.session.emailForgotPassword, 'new password:', newPassword)

        req.session.successMessage = 'Password successfully updated'
        delete req.session.resetPasswordCode
        delete req.session.emailForgotPassword
        res.redirect('/login')
    } catch (error) {
        console.error(error)
        return false
    }
}

function logoutUser(req,res){
    req.session.destroy(() => {
            res.redirect('/')
    })
} 

function generateResetPasswordCode(req){
    const code = require('crypto').randomBytes(3).toString('hex').toUpperCase()

    req.session.resetPasswordCode = code

    return code
}

//initializeFields function initializes the fields in res.locals with the values from req.session.formFields
//if there is no data, it initializes them to null
function initializeFields(req,res,fields){
    if(!req.session.formFields){
        for(const field of fields){
            res.locals[field] = null
        }
    }
    else{
        for(const field of fields){
            if(req.session.formFields[field]){
                res.locals[field] = req.session.formFields[field]
                req.session.formFields[field] = null 
            }
            else{
                res.locals[field] = null
            }
        }
    }
}

//regenerateSession function regenerates the session and initializes the session variables
function regenerateSession(req,user){
    return new Promise((resolve,reject) => {
        req.session.regenerate(async (err) => {
            if(err){
                console.error('Error regenerating session',err)
                return reject(err)
            }

            if(user.usertype === 'applicant'){
                //the firstName and lastName are stored in the applicant model
                const ChildApplicant = await Applicant.findOne({user: user._id})
                if(ChildApplicant){
                    req.session.firstName = ChildApplicant.personalInfo.firstName
                    req.session.lastName = ChildApplicant.personalInfo.lastName
                }
            }
            else{
                console.error('Usertype not implemented yet')
            }

            req.session.userId = user._id
            req.session.email = user.email
            req.session.usertype = user.usertype
            console.log('connected : ',user.email)
            resolve()
        })
    })
}

//this function generates a new model based on the usertype and saves it in the database
async function modelGeneratorUsertype(usertype,userId,modelData){
    if(usertype == 'applicant'){
        //the only data that we have to save in the applicant model is the firstName and lastName
        const newApplicant = new Applicant({ 
            user: userId,
            personalInfo: {
                firstName: modelData.firstName,
                lastName: modelData.lastName,
            },
        })
        await newApplicant.save()
        return newApplicant
    } else if(usertype == 'loanOfficer'){
        //not implemented yet
        return null
    }
    else{
        //not implemented yet
        return null
    }
}

//function delete the child model based on the usertype
async function deleteChildModel(userId,usertype){
    try{
        if(usertype === 'applicant'){
            await Applicant.findOneAndDelete({user: userId})
        } else {
            console.error('non implemented yet')
        }
    } catch (error){
        console.error(error)
        res.status(500)
    }
}

module.exports = { 
    renderIndexPage,
    renderRegisterPage,
    createNewUser,
    renderLoginPage,
    loginUser,
    renderEditPage,
    patchUserData,
    sendCodeToEmail,
    reSendCodeToEmail,
    verifyCode,
    resetPassword,
    deleteUser,
    logoutUser,
 }