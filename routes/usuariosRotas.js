const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const UsuarioController = require('../controllers/UsuarioController')

router.get('/', /*cors(corsOptions),*/ UsuarioController.listarUsuarios)
// pega para o /usuarios/ === /usuarios

router.post('/cadastrar/user', /*cors(corsOptions),*/ UsuarioController.cadastrarUsuario)
// Cadastro de usuasrio


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
