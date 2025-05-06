const crypto = require('crypto')

function checkCSRFToken(req,res,next){
    console.log('\nCheckingCSRFToken\n')
    const token = req.body._csrf

    if(token && req.session.csrfTokens && req.session.csrfTokens.includes(token)){
        req.session.csrfTokens = req.session.csrfTokens.filter(t => t!= token)
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
    checkCSRFToken
}