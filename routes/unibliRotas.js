const express = require('express')
const router = express.Router()

const UniBliService = require('../services/UniBliService')


router.get('/acervo', UniBliService.integraBases)
router.get('/acervo/:id', UniBliService.buscaLivroPorId)


module.exports = router