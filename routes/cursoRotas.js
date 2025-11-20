const express = require('express')
const router = express.Router()


const CursoController = require('../controllers/CursoController')
//const LivroFatecController = require('../controllers/LivroFatecController')

// ------- Cursos -------
router.get('/', CursoController.listarCursos)
// ------- Integrar Cursos -------
router.get('/cadastrar', CursoController.cadastrarCursos)

//--------------------------------------------------------------------------------

// ------- Cursos ------- 
router.get('/:id', CursoController.buscaCursoPorId)
// ------- Cursos Fatec -------
router.get('/:id/fatecs', CursoController.buscarFatecsDeCurso);



module.exports = router 
