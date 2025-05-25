function checkBasicSessionFields(req,res,next){
    console.log('checking basic fields')
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
    res.locals.isConnected = !!req.session.userId
    next()
}

//pushing formFields from session into res.locals
function checkFormSessionFields(req,res,next){
    if(req.session.formFields){
        const fields = Object.keys(req.session.formFields)
        for(const field of fields){
            res.locals[field] = req.session.formFields[field]
        }
    }
    next()
}

module.exports = { checkBasicSessionFields, checkFormSessionFields }