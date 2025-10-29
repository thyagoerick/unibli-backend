const Usuario = require('../models/Usuario')
const usuarioDao = require('../models/dao/UsuarioDao')


module.exports = class UsuarioController {

    static async listarUsuarios(req, res){
        try {
        const usuarios = await usuarioDao.listarUsuarios();
        
        if (!usuarios || usuarios.length === 0) {
            return res.status(204).send();// No Content = Sem usuários cadastrados
        }
        return res.status(200).json({ usuarios });
        
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
        } 
    }

    static async cadastrarUsuario(req, res) {
        try {
            const { nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, auth0UserId, rg, unidadePolo} = req.body;
            
            console.log('(A) req.body',req.body)

            // Alterar o valor de unidadePolo para 1 se for vazio ou null, e 2 caso contrário
            const fatecId = (unidadePolo === null || unidadePolo === '') ? 1 : 2;
            console.log('(B) fatecId', fatecId);
            
            if (!nome || !cpf || !endereco || !numResidencia || !cep || !telefone || !email || !ra || !auth0UserId || !rg/*|| !matricula*/) {
                return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
            }
            
            await usuarioDao.cadastrarUsuario(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, auth0UserId, rg, fatecId);
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error); // Exibe o erro completo no console
            res.status(500).json({ error: 'Erro ao cadastrar usuário', details: error.message }); // Retorna detalhes adicionais
        }
    }

    static async buscaUsuarioPorAuth0UserId (req, res) {
        try {
            const auth0UserId = req.params.id;
            console.log('Rota /user/:id chamada com ID:', req.params.id);
            const usuario = await usuarioDao.buscaUsuarioPorAuth0UserId(auth0UserId);

            if(usuario) {
                return res.status(200).json({usuario});
            } else{
                return res.status(204).send();// No Content = Sem usuários cadastrados
            }      
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
        }
    }

    static async atualizarUsuarioPorId(req, res) {
        const auth0UserId = req.params.id;
        const dadosAtualizados = req.body;
        console.log('Rota /atualizar/usuario/:id chamada com ID:', req.params.id, 'Dados:', dadosAtualizados);
        try {
            const usuarioAtualizado = await usuarioDao.atualizarUsuarioPorId(auth0UserId, dadosAtualizados);
            if (usuarioAtualizado) {
                return res.status(200).json({ message: 'Usuário atualizado com sucesso.', usuario: usuarioAtualizado });
            } else {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
        }
    }

    static async deletarUsuarioPorId (req, res) {
        const auth0UserId = req.params.id;
        console.log('Rota /deletar/usuario/:id chamada com ID:', req.params.id);
        try {
            const rowsDeleted = await usuarioDao.deletarUsuarioPorId(auth0UserId);
            if (rowsDeleted > 0) {
                return res.status(200).json({ message: 'Usuário deletado com sucesso!', rowsDeleted });
            } else {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            } 
        }catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({ message: 'Erro interno ao deletar usuário.' });
        }
    }
    
}