const Usuario = require('../Usuario')

module.exports = {
    // Método assíncrono para listar todos os usuários
    async listarUsuarios() {
        // Retorna todos os usuários no banco de dados
        return await Usuario.findAll({ raw: true })
    },

    // Método assíncrono para cadastrar um novo usuário
    async cadastrarUsuario(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario) {
        
        // Cria um novo usuário no banco de dados com os dados fornecidos
        return await Usuario.create({
            nome,
            cpf,
            endereco,
            numResidencia,
            complemento,
            cep,
            telefone,
            email,
            ra,
            matricula,
            tipoBibliotecario
        })
    },

    // Método assíncrono para atualizar os dados de um usuário existente
    async atualizarUsuario(id, dadosAtualizados) {
        try {
            // Busca o usuário pelo ID fornecido
            const usuario = await Usuario.findByPk(id)
            // Verifica se o usuário foi encontrado
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            // Atualiza os dados do usuário com os dados fornecidos
            await usuario.update(dadosAtualizados)
            // Retorna o usuário atualizado
            return usuario;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar o usuário: ' + error.message)
        }
    }
}