function checkMessageFields(req,res,next){
    fields = ['errorMessage','successMessage']
    if(req.session){
        fields.forEach(field => {
            res.locals[field] = req.session[field] ? req.session[field] : null
            delete req.session[field]
        })
    }
    else{
        fields.forEach(field => {
            res.locals[field] = null
        })
    }
    next()
}

module.exports = { checkMessageFields }