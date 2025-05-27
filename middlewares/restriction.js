const User = require('../models/user')

async function restrictApplicant(req,res,next){
    try {
        if(req.session && req.session.userId){
            if(req.session.usertype == 'applicant'){
                return next()
            }
        }

        console.log('Access denied')
        req.session.errorMessage = "Access denied ( applicant only )"
        res.status(401).redirect('/')
    } catch (error) {
        console.error(error)
    }
}

function restrictConnected(req,res,next){
    try {
        if(req.session && req.session.userId){
            next()
        } else {
            console.log('Access denied')
            req.session.errorMessage = "Access denied ( connected only )"
            res.status(401).redirect('/')
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = { restrictConnected, restrictApplicant }