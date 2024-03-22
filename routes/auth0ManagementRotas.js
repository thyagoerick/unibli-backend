const express = require('express')


const router = express.Router()


const Auth0ManagementService = require('../services/Auth0ManagementService')


router.get('/token', Auth0ManagementService.getToken);


module.exports = router