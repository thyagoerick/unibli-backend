const express = require('express')
const router = express.Router()

const UniBliService = require('../services/UniBliService')

/** são rotas para debugar o service mas as rotas em si não são utilizadas */
router.get('/acervo/integrar', UniBliService.integraAcervo)
router.get('/acervo/livro/:id', UniBliService.buscaLivroPorId)

module.exports = router