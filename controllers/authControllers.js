//database models import
const User = require('../models/user')
const Applicant = require('../models/applicant')

//utils import
const bcrypt = require('bcryptjs')
const { checkFields,initializeEmptyFields } = require('../utils/validateFields')
const { generateCsrfToken } = require('../utils/csrf')



//get /register
function renderRegisterPage(req,res){
    initializeFields(req,res,['email','password','username'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('register')
}

//post /register
async function createNewUser(req,res){
    try {
        //we assume the data is stored in req.body
        if(!checkFields(req,res,['email','password','usertype'])){
            return
        }

        //is email unique ?
        const existingUser = await User.findOne({email : req.body.email})
        if(existingUser){
            req.session.formFields = {email: req.body.email}
            req.session.errorMessage = 'email already in use'
            return res.status(409).redirect('register')
        }

        //hashing password
        const saltRounds = 10
        const hash  = await bcrypt.hash(req.body.password,saltRounds)
        //create and save newUser
        console.log(req.body.usertype)
        const newUser = new User({
            email: req.body.email,
            password: hash,
            usertype: req.body.usertype
        })

        await newUser.save()
        console.log('New user : ', newUser)

        modelGeneratorUsertype(req.body.usertype,newUser._id)

        res.status(201).redirect('login')
    } catch (error) {
       console.error(error)
    }
}

function renderLoginPage(req,res){
    initializeFields(req,res,['email','password'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('login')
}

async function loginUser(req,res){
    try {
        if(!checkFields(req,res,['email','password'])){
            return
        }

        const userFound = await User.findOne({email:req.body.email})
        if(!userFound){
            req.sesison.formFields = {email:req.body.email}
            req.session.errorMessage = 'User not found'
            return res.status(404).redirect('login')
        }

        const passwordMatching = await bcrypt.compare(req.body.password,userFound.password)
        if(!passwordMatching){
            req.session.formFields = {email: req.session.email, password: req.body.password}
            req.session.errorMessage = 'Invalid password'
            return res.status(401).redirect('login')
        }

        await regenerateSession(req,userFound)

        //be careful, we include the field usertype in our uri
        res.redirect(`/${userFound.usertype}/account`)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Server Error'})
    }
}

function renderEditPage(req,res){
    initializeFields(req,res,['email'])
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('edit')
}

async function patchUserData(req,res){
    try {
        if(!checkFields(req,res,['email'])){
            return
        }

        const user = await User.findById(req.session.userId)
        //do not patch email if same as in use

        if(res.locals.email === user.email){
            req.session.errorMessage = 'Email already in use by your account'
            return res.status(409).redirect('edit')
        }

        // do not patch email if already in use

        const userFound = await User.findOne({ email:req.body.email })
        if(userFound){
            req.session.errorMessage = 'Email already in use by another account'
            return res.status(409).redirect('edit')
        }

        user.email = req.body.email
        req.session.successMessage = "Informations successfully updated"

        await user.save()
        req.session.email = req.body.email
        req.session.userId = req.body.userId
        } catch (error) {
            console.error(error)
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
    console.log('on passe cete argument',res.locals.email)
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




module.exports = { 
    renderRegisterPage,
    createNewUser,
    renderLoginPage,
    loginUser,
    renderEditPage,
    patchUserData
 }