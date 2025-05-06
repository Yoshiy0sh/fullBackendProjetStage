function generateCSRFToken(req) {
    //il faudra ajouter une façon de limiter le nombre de tokens
    console.log('\nGenerating CSRF Token\n')
    const token = require('crypto').randomBytes(24).toString('hex')

    if(!req.session.csrfTokens){
        req.session.csrfTokens = []
    }
    
    req.session.csrfTokens.push(token)
    return token
}

module.exports = { generateCSRFToken }