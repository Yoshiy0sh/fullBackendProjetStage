const { doubleCsrf } = require('csrf-csrf')

const { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => "secret key",
    getSessionIdentifier: (req) => req.session.id,
    cookieName: "csrfToken",
    cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false
    },
    size: 64,
    ignoreMethods: ["GET","HEAD","OPTIONS"]
})

module.exports = { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection }