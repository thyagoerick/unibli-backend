const express = require('express')
const router = express.Router()

const UsuarioController = require('../controllers/UsuarioController')



router.get('/', UsuarioController.listarUsuarios)
// pega para o /usuarios/ === /usuarios

router.post('/cadastrar', UsuarioController.cadastrarUsuario)

module.exports = router