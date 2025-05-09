function checkExistenceFields(req,res,fields){
    const result = {}
    for(const field of fields){
        if(!req.body[field]){
            req.session.error = field + ' is missing'
            res.status(400).redirect(req.get('Referrer'))
            return null
        }
        
        result[field] = req.body[field]
    }

    return result
}

module.exports = { checkExistenceFields }