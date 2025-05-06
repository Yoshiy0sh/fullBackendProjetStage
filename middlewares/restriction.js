function restrict(req,res,next){
    if(req.session.userId){
        next()
    } else {
        console.log('Access denied')
        req.session.error = "Access denied"
        res.status(401).redirect('/account/login')
    }
}

module.exports = { restrict }