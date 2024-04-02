const express = require('express')
const router = express.Router()

const FatecAService = require('../services/FatecAService')
const FatecBService = require('../services/FatecBService')


router.get('/fetec1/acervo', FatecAService.listaAcervoFatec)
router.get('/fetec1/acervo/:id', FatecAService.buscaLivroPorId)

router.get('/fetec2/acervo', FatecBService.listaAcervoFatec)
router.get('/fetec2/acervo/:id', FatecBService.buscaLivroPorId)


module.exports = router