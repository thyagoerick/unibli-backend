const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const UsuarioController = require('../controllers/UsuarioController')

router.get('/', /*cors(corsOptions),*/ UsuarioController.listarUsuarios)
// pega para o /usuarios/ === /usuarios

router.get('/usuario/:id', /*cors(corsOptions),*/ UsuarioController.buscaUsuarioPorId)
///user/:id

router.post('/usuario/cadastrar', /*cors(corsOptions),*/ UsuarioController.cadastrarUsuario)
// Cadastro de usuário

router.put('/usuario/atualizar/:id', /*cors(corsOptions),*/ UsuarioController.atualizarUsuarioPorId)
// Atualização de usuário

// depois ajustar para ele remover o usuário do Auth0 também
router.delete('/usuario/deletar/:id', /*cors(corsOptions),*/ UsuarioController.deletarUsuarioPorId)
// Exclusão de usuário


//router.post('/edit/user',  UsuarioController.cadastrarUsuarioTela) 
// Editar usuario no banco Unibli



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
