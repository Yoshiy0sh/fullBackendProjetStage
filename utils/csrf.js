function generateCsrfToken(req) {
    //il faudra ajouter une façon de limiter le nombre de tokens
    const token = require('crypto').randomBytes(24).toString('hex')

    console.log('generating CSRF token:', token)

    if(!req.session.csrfTokens){
        req.session.csrfTokens = []
    }
    
    req.session.csrfTokens.push(token)
    return token
}

module.exports = { generateCsrfToken }