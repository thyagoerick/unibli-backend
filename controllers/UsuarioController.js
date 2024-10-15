const Usuario = require('../models/Usuario')
const usuarioDao = require('../models/dao/UsuarioDao')


module.exports = class UsuarioController {

    static async listarUsuarios(req, res){
        const usuarios = await usuarioDao.listarUsuarios()
        res.json({usuarios});
    }

    static async cadastrarUsuario(req, res) {
        const { nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario } = req.body;

        if (!nome || !cpf || !endereco || !numResidencia || !cep || !telefone || !email || !ra || !matricula) {
            return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
        }
        try {
            await usuarioDao.cadastrarUsuario(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario);
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        }
    }
}