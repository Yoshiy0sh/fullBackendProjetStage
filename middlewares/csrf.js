const crypto = require('crypto')

function checkCsrfToken(req,res,next){
    console.log('\nCheckingCSRFToken')
    const token = req.body._csrf

    if(token && req.session.csrfTokens && req.session.csrfTokens.includes(token)){
        req.session.csrfTokens = req.session.csrfTokens.filter(t => t!= token)
        console.log('CSRF Token accepted\n')
        next()
    } else {
        console.log('\ninvalid CSRF Token\n')
        // return res.status(403).send('Invalid Token')
        //ceci est probablement temporaire mais dans le cas d'une erreur de token,
        //on redirige vers le dernier get
        const referer = req.get('Referer') || '/account'
        return res.status(403).redirect(referer)
    }
}

module.exports = {
    checkCsrfToken
}