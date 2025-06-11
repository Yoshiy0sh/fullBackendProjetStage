const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const upload = require('../../utils/upload')

//utils import
const { generateCsrfToken } = require('../../utils/csrf')

//import from models
const Applicant = require('../../models/applicant')
const User = require('../../models/user')

//controllers import
const { renderAccountIndex } = require('../../controllers/applicantControllers/accountControllers')

router.route('/')
    .get(renderAccountIndex)

module.exports = router