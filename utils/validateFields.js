
//verification of all the fields il the parameter fields in req.body
//if at least one missing, redirect to the last page with already completed data
function checkExistenceFields(req,res,fields){
    const result = {}
    //delete req.session.error just in case
    delete req.session.errorMessage
    for(const field of fields){
        if(!req.body[field]){
            if(!req.session.errorMessage){
                req.session.errorMessage = `${field} is missing`
            }
        } else{
            result[field] = req.body[field]
        }
    }
    if(req.session.errorMessage){
        req.session.formData = result
        res.status(400).redirect(req.get('Referrer'))
        return null
    }
    return result
}

module.exports = { checkExistenceFields }