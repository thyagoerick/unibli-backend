const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const LivroController = require('../controllers/LivroController')
const LivroFatecController = require('../controllers/LivroFatecController')

// ------- Livros Integrar Acervo ------- OK
router.get('/cadastrar', LivroController.cadastrarAcervo)
// ------- Livros------- OK
router.get('/livros', LivroController.listarLivros)
// ------- Livros Fatec ------- OK
router.get('/livros/fatec', LivroFatecController.listarLivrosFatec)

//--------------------------------------------------------------------------------

// ------- Livros------- 
router.get('/livros/:id', LivroController.buscaLivroPorId)
// ------- Livros Fatec -------
router.get('/livros/:livroId/fatec/:fatecId', LivroFatecController.buscaLivroFatecPorId)


// ------- Livros Curso -------
// Listar todos os livros por Curso
//router.get('/livros/fatec', LivroFatecController.listarLivros)


module.exports = router 
