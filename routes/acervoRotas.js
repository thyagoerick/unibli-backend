const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const LivroController = require('../controllers/LivroController')

router.get('/livros', LivroController.listarLivros)
router.get('/cadastrar', LivroController.cadastrarAcervo)

router.get('/livro/:id', LivroController.buscaLivroPorId)


module.exports = router 
