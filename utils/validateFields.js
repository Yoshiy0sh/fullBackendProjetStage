
//verification of all the fields il the parameter fields in req.body
//if at least one missing, redirect to the last page with already completed data

// function checkFields(req,res,fields){
//     const result = {}
//     //delete req.session.error just in case
//     delete req.session.errorMessage
//     for(const field of fields){
//         if(!req.body[field]){
//             if(!req.session.errorMessage){
//                 req.session.errorMessage = `${field} is missing`
//             }
//         } else{
//             result[field] = req.body[field]
//         }
//     }
//     if(req.session.errorMessage){
//         req.session.formData = result
//         res.status(400).redirect(req.get('Referrer'))
//         return null
//     }
//     return result
// }

//push tous les champs possibles dans la session
//le message d'erreur devient le premier champ manquant
function pushBodyToSessionFields(req,res,fields){
    req.session.errorMessage = null
    req.session.formFields = {}
    for(const field of fields){
        if(req.body && req.body[field]){
            req.session.formFields[field] = req.body[field]
        }
        else{
            req.session.formFields[field] = null
            if(!req.session.errorMessage){
                req.session.errorMessage = field + ' missing'
            }
        }
    }
    res.status(400).redirect(req.get('Referrer'))
}

//checking if all fields are present
//pushing into session if missing and errorMessage
function checkFields(req,res,fields){
    if(!fields.every(field => req.body && req.body[field])){
        pushBodyToSessionFields(req,res,fields)
    }
}

function initializeEmptyFields(res,fields){
    for(const field of fields){
        res.locals[field] = null
    }
}

module.exports = { checkFields,initializeEmptyFields }