//database models import
const User = require('../models/user')
const Applicant = require('../models/applicant')

//utils import
const bcrypt = require('bcryptjs')
const { checkFields,initializeEmptyFields } = require('../utils/validateFields')
const { generateCsrfToken } = require('../utils/csrf')
const { callWebhookWithEmail } = require('../utils/mail')


//get /register
function renderRegisterPage(req,res){
    initializeFields(req,res,['emailRegister','passwordRegister','usernameRegister'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('register')
}

//post /register
async function createNewUser(req,res){
    try {
        //we assume the data is stored in req.body
        if(!checkFields(req,res,['emailRegister','passwordRegister','usertypeRegister'])){
            return
        }

        //is email unique ?
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
        console.log(req.body.usertypeRegister)
        const newUser = new User({
            email: req.body.emailRegister,
            password: hash,
            usertype: req.body.usertypeRegister
        })

        await newUser.save()
        console.log('New user : ', newUser)

        await modelGeneratorUsertype(req.body.usertypeRegister,newUser._id)

        //send email
        //callWebhookWithEmail(req.body.email)

        res.status(201).redirect('login')
    } catch (error) {
       console.error(error)
    }
}

function renderLoginPage(req,res){
    console.log(req.session.formFields)
    initializeFields(req,res,['emailLogin','passwordLogin'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('login')
}

async function loginUser(req,res){
    try {
        if(!checkFields(req,res,['emailLogin','passwordLogin'])){
            return
        }

        const userFound = await User.findOne({email:req.body.emailLogin})
        if(!userFound){
            req.session.formFields = {emailLogin:req.body.emailLogin}
            req.session.errorMessage = 'User not found'
            return res.status(404).redirect('login')
        }

        const passwordMatching = await bcrypt.compare(req.body.passwordLogin,userFound.password)
        if(!passwordMatching){
            req.session.formFields = { email: req.session.emailLogin }
            req.session.errorMessage = 'Invalid password'
            return res.status(401).redirect('login')
        }

        await regenerateSession(req,userFound)

        //be careful, we include the field usertype in our uri
        res.redirect(`/${userFound.usertype}/account`)
        console.log('pass there')
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
        //do not patch email if same as in use

        if(req.session.email === req.body.emailEdit){
            req.session.errorMessage = 'Email already in use by your account'
            return res.status(409).redirect('edit')
        }

        // do not patch email if already in use

        const userFound = await User.findOne({ email:req.body.emailEdit })
        if(userFound){
            req.session.errorMessage = 'Email already in use by another account'
            return res.status(409).redirect('edit')
        }

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
        //delete cascade
        await deleteChildModel(req.session.userId,req.session.usertype)
        await User.findByIdAndDelete(req.session.userId)
        res.status(200).redirect('logout')
    } catch (error) {
        console.error(error)
        res.status(500)
    }
}

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
            }
            else{
                res.locals[field] = null
                console.log(field)
            }
        }
    }
}

function regenerateSession(req,user){
    return new Promise((resolve,reject) => {
        req.session.regenerate((err) => {
            if(err){
                console.error('Error regenerating session',err)
                return reject(err)
            }

            req.session.userId = user._id
            req.session.email = user.email
            req.session.usertype = user.usertype
            console.log('connected : ',user.email)
            resolve()
        })
    })
}

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
    renderRegisterPage,
    createNewUser,
    renderLoginPage,
    loginUser,
    renderEditPage,
    patchUserData,
    deleteUser
 }