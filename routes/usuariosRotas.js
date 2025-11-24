const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const UsuarioController = require('../controllers/UsuarioController')

// ==================================================
// ROTAS GET (CONSULTAS)
// ==================================================

// Rota raiz - Listar todos os usuários
router.get('/', /*cors(corsOptions),*/ UsuarioController.listarUsuarios)

// Rotas específicas PRIMEIRO (antes das rotas com parâmetros)
router.get('/invalidados', /*cors(corsOptions),*/ UsuarioController.buscarInvalidados)

// Rotas com parâmetros DEPOIS
router.get('/:id', /*cors(corsOptions),*/ UsuarioController.buscaUsuarioPorAuth0UserId)

// ==================================================
// ROTAS POST (CRIAÇÃO)
// ==================================================

router.post('/cadastrar/usuario', /*cors(corsOptions),*/ UsuarioController.cadastrarUsuario)

// ==================================================
// ROTAS PUT (ATUALIZAÇÃO)
// ==================================================

router.put('/atualizar/:id', /*cors(corsOptions),*/ UsuarioController.atualizarUsuarioPorId)
router.put('/validar/:auth0UserId', /*cors(corsOptions),*/ UsuarioController.validarUsuario)

// ==================================================
// ROTAS DELETE (EXCLUSÃO)
// ==================================================

router.delete('/deletar/:id', /*cors(corsOptions),*/ UsuarioController.deletarUsuarioPorId)

/**************************************************************************************
router.use((err, req, res, next) => {
    if (err) {
        if (err === 403) {
            return res.status(403).json({ message: "Acesso não permitido por CORS - Falta de cabeçalho Origin" });
        } else if (err === 401) {
            return res.status(401).json({ message: "Acesso não permitido por CORS - Origin não está na lista de permissões" });
        } else {
            return res.status(403).json({ message: "Acesso não permitido por CORS" });
        }
    }
    next();
});
/**************************************************************************************/

module.exports = router