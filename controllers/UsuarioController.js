const Usuario = require('../models/Usuario')
const usuarioDao = require('../models/dao/UsuarioDao')


module.exports = class UsuarioController {

    static async listarUsuarios(req, res){
        const usuarios = await usuarioDao.listarUsuarios()
        res.json({usuarios});
    }

    static async cadastrarUsuario(req, res) {
        const { nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, auth0UserId, rg, unidadePolo} = req.body;
        
        // Alterar o valor de unidadePolo para 1 se for vazio ou null, e 2 caso contrário
        const FatecId = unidadePolo === null || unidadePolo === '' ? 1 : 2;
        
        console.log('req.body',req.body)

        if (!nome || !cpf || !endereco || !numResidencia || !cep || !telefone || !email || !ra || !auth0UserId || !rg/*|| !matricula*/) {
            return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
        }
        try {
            await usuarioDao.cadastrarUsuario(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, auth0UserId, rg, FatecId);
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error); // Exibe o erro completo no console
            res.status(500).json({ error: 'Erro ao cadastrar usuário', details: error.message }); // Retorna detalhes adicionais
            
        }
    }

    static async buscaUsuarioPorId (req, res) {
        console.log('Rota /user/:id chamada com ID:', req.params.id);
        const auth0UserId = req.params.id;
        const usuario = await usuarioDao.buscaUsuarioPorId(auth0UserId);
        res.json({usuario});
    }
    
}