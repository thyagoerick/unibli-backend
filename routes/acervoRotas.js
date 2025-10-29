const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const LivroController = require('../controllers/LivroController')
const LivroFatecController = require('../controllers/LivroFatecController')
const LivroCursoController = require('../controllers/LivroCursoController')


// ------- Livros Integrar Acervo ------- OK
router.get('/cadastrar', LivroController.cadastrarAcervo)
// ------- Livros------- OK
router.get('/livros', LivroController.listarLivros)
router.get('/livros/filtrar', LivroController.filtrarLivros);
router.get('/livros/autores', LivroController.listarAutores);

// ------- Livros Fatec ------- OK
router.get('/livros/fatec', LivroFatecController.listarLivrosFatec)
// ------- Livros Curso -------
// Suporte também a query string: /livros/cursos?ids=1,2
router.get('/livros/cursos', LivroCursoController.listarLivrosAgrupadosNoCurso)

//--------------------------------------------------------------------------------

// ------- Livros------- 
router.get('/livros/:id', LivroController.buscaLivroPorId)
// ------- Livros Fatec -------
router.get('/livros/:livroId/fatec/:fatecId', LivroFatecController.buscaLivroFatecPorId)


// ------- Livros Curso -------
// Listar livros por curso(s) específico(s)
router.get('/livros/cursos/:ids', LivroCursoController.listarLivrosPorCursoIds);


module.exports = router 
