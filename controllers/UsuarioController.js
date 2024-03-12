const Usuario = require('../models/Usuario')
const usuarioDao = require('../models/dao/UsuarioDao')


module.exports = class UsuarioController {

    static async listarUsuarios(req, res){
        const usuarios = await usuarioDao.listarUsuarios()
        res.json({usuarios});
    }

    static async cadastrarUsuario(req, res) {
        if (!req.body || !req.body.nome) {
            return res.status(400).json({ error: 'Nome não fornecido na requisição' });
        }
    
        const nome = req.body.nome;
        await usuarioDao.cadastrarUsuario(nome);
    }
}