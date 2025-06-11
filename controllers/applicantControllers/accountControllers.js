//utils import
const { generateCsrfToken } = require('../../utils/csrf')

function renderAccountIndex(req,res){
    res.locals.csrfToken = generateCsrfToken(req)
    res.locals.firstNameDashboard = req.session.firstName
    res.locals.lastNameDashboard = req.session.lastName
    res.render('applicant/account/dashboard')
}

module.exports = {
    renderAccountIndex
}