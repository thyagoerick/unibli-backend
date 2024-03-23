const express = require('express')
const router = express.Router()

const FatecAService = require('../services/FatecAService')

router.get('/fetec1/acervo', FatecAService.listaAcervoFatecA)


module.exports = router