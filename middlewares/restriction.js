const User = require('../models/user')

async function restrictApplicant(req,res,next){
    try {
        if(req.session && req.session.userId){
            if(req.session.user.usertype == 'applicant'){
                return next()
            }
        }

        console.log('Access denied')
        req.session.error = "Access denied"
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
            req.session.error = "Access denied"
            res.status(401).redirect('/account/login')
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = { restrictConnected, restrictApplicant }