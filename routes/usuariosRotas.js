const express = require('express')
const router = express.Router()
require('dotenv').config();
const { auth } = require('express-oauth2-jwt-bearer');

// Middleware para validar o JWT de acesso
const checkJwt = auth({
    // O audience deve ser o identificador da sua API no Auth0.
    // Usaremos a URL do seu servidor como audience, que é o padrão se não for especificado.
    // O audience deve ser o identificador da sua API no Auth0.
    // O valor padrão para o audience da API de Gerenciamento do Auth0 é a URL /api/v2/
    audience: `${process.env.AUTH0_BASE_URL}/api/v2/`,
    // O issuerBaseURL é a URL da sua conta Auth0 (AUTH0_BASE_URL)
    issuerBaseURL: process.env.AUTH0_BASE_URL,
    tokenSigningAlg: 'RS256'
});

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

router.delete('/deletar/:id', checkJwt, /*cors(corsOptions),*/ UsuarioController.deletarUsuarioPorId)

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