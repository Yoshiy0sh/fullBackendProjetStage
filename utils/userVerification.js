const User = require('../models/user')

async function existingUser(res){
    return !!(await User.findOne({email: res.locals.email}))
}

