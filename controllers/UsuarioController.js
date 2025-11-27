const Usuario = require('../models/Usuario')
const Auth0ManagementService = require('../services/Auth0ManagementService');
const Auth0UsersService = require('../services/Auth0UsersService');
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
            const { nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, validado, auth0UserId, rg, unidadePolo} = req.body;
            
            console.log('(A) req.body',req.body)

            console.log('(B) unidadePolo', unidadePolo);
            
            if (!nome || !cpf || !telefone || !email || !auth0UserId || !rg) {
                return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
            }
            
            // Captura o resultado da função do DAO em uma variável.
            const novoUsuario = await usuarioDao.cadastrarUsuario(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, validado, auth0UserId, rg, unidadePolo); 
            
            // Envia a resposta JSON com a mensagem E o objeto do novo usuário.
            res.status(201).json({ 
                message: 'Usuário cadastrado com sucesso!',
                usuario: novoUsuario // Adiciona o objeto do usuário à resposta
            });
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
        console.log('Rota /atualizar/:id chamada com ID:', req.params.id, 'Dados:', dadosAtualizados);
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

    static async deletarUsuarioPorId(req, res) {
        const auth0UserId = req.params.id;
        const auth0UserIdToken = req.auth.payload.sub; // ID do usuário autenticado pelo token

        console.log('--- DEPURANDO DELETAR USUÁRIO ---');
        console.log('ID da URL (auth0UserId):', auth0UserId);
        console.log('ID do Token (auth0UserIdToken):', auth0UserIdToken);
        console.log('Comparação (auth0UserId !== auth0UserIdToken):', auth0UserId !== auth0UserIdToken);
        console.log('---------------------------------');

        // 1. Verificação de segurança: O usuário só pode deletar a própria conta.
        if (auth0UserId !== auth0UserIdToken) {
            return res.status(403).json({
                message: "Acesso negado. Você só pode deletar sua própria conta."
            });
        }

        try {
            // Pega token do Auth0
            const tokenData = await Auth0ManagementService.getToken();
            const accessToken = tokenData.access_token;

            // Deleta no Auth0
            await Auth0UsersService.deletarUsuario(auth0UserId, accessToken);

            // Deleta no banco
            const rowsDeleted = await usuarioDao.deletarUsuarioPorId(auth0UserId);

            return res.json({
                message: "Usuário deletado!",
                rowsDeleted
            });

        } catch (error) {
            console.error('Erro ao deletar usuário (Controller):', error);
            // Se for um erro de validação de token, o erro.code será 'ERR_JWT_INVALID'
            // Se for um erro de Axios, o erro.response.status terá o código HTTP
            const statusCode = error.response?.status || 500;
            const errorMessage = error.response?.data || error.message;

            return res.status(statusCode).json({
                message: "Erro ao deletar usuário.",
                error: errorMessage
            });
        }
    }

    static async buscarInvalidados(req, res) {
        try {
            console.log('=== Controller: buscarInvalidados chamado ===');
            
            const usuarios = await usuarioDao.buscarInvalidados();
            
            console.log('Controller - Usuários retornados do DAO:', usuarios);
            console.log('Controller - Tipo de dados:', typeof usuarios);
            console.log('Controller - É array?', Array.isArray(usuarios));
            
            // Sempre retorna 200, mesmo se o array estiver vazio
            return res.status(200).json({ 
                usuarios: usuarios || [],
                total: usuarios ? usuarios.length : 0,
                message: usuarios && usuarios.length > 0 
                    ? 'Usuários não validados encontrados' 
                    : 'Nenhum usuário não validado encontrado'
            });
            
        } catch (error) {
            console.error('Erro no controller ao buscar usuários não validados:', error);
            return res.status(500).json({ 
                error: 'Erro ao buscar usuários não validados', 
                details: error.message 
            });
        }
    }

    static async validarUsuario(req, res) {
        const auth0UserId = req.params.auth0UserId;
        try {
            const usuarioValidado = await usuarioDao.validarUsuario(auth0UserId);
            
            return res.status(200).json({ 
                message: 'Usuário validado com sucesso!', 
                usuario: usuarioValidado 
            });
            
        } catch (error) {
            console.error('Erro ao validar usuário:', error);
            if (error.message === 'Usuário não encontrado') {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            return res.status(500).json({ message: 'Erro interno ao validar usuário.' });
        }
    }
    
}