//database models import
const Applicant = require('../models/applicant')

//utils import
const bcrypt = require('bcryptjs')
const { checkFields,initializeEmptyFields } = require('../utils/validateFields')
const { generateCsrfToken } = require('../utils/csrf')



//get /register
function renderRegisterPage(req,res){
    if(!req.session.formFields){
        initializeEmptyFields(res,['email','password','username'])
    }
    res.locals.csrfToken = generateCsrfToken(req)
    res.render('register')
}

//post /register
async function createNewUser(req,res){
    try {
        //we assume the data is stored in req.body
        checkFields(req,res,['email','password','usertype'])

        //is email unique ?
        const existingUser = await User.findOne({email : res.locals.email})
        if(existingUser){
            
            req.session.errorMessage = 'email already in use'
            return res.status(409).redirect('register')
        }

        //hashing password
        const saltRounds = 10
        const hash  = await bcrypt.hash(password,saltRounds)

        //create and save newUser
        const newUser = new User({
            email: res.locals.email,
            password: hash,
            usertype: res.locals.usertype
        })

        await newUser.save()
        console.log('New user : ', newUser)

        modelGeneratorUsertype(usertype,newUser._id)

        res.status(201).redirect('login')
    } catch (error) {
       console.error(error)
    }
}

function renderLoginPage(req,res){

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


module.exports = { renderRegisterPage, createNewUser }