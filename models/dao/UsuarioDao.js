const Usuario = require('../Usuario')

module.exports = {
    // Método assíncrono para listar todos os usuários
    async listarUsuarios() {
        // Retorna todos os usuários no banco de dados
        return await Usuario.findAll({ raw: true })
    },

    async buscaUsuarioPorAuth0UserId(auth0UserId){
        return await Usuario.findOne({ raw: true, where: {auth0UserId: auth0UserId}})
    },

    async buscaUsuarioPorId(usuarioId){
        return await Usuario.findOne({ raw: true, where: {id_usuario: usuarioId}})
    },

    // Método assíncrono para cadastrar um novo usuário
    async cadastrarUsuario(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, auth0UserId, rg, unidadePolo) {
        // Cria um novo usuário no banco de dados com os dados fornecidos


        console.log(nome, cpf, endereco, numResidencia, complemento, cep, telefone, email, ra, matricula, tipoBibliotecario, auth0UserId, rg, unidadePolo);
        

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
            tipoBibliotecario,
            auth0UserId,
            rg,
            fk_id_fatec:unidadePolo //fk_id_fatec
        })
    },

    async atualizarUsuarioPorId(auth0UserId, dadosAtualizados) {
        const usuario = await Usuario.findOne({ where: { auth0UserId } });
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        await usuario.update(dadosAtualizados);
        return usuario;
    },


    async deletarUsuarioPorId(auth0UserId){
        const rowsDeleted = await Usuario.destroy({ where: { auth0UserId } });
        return rowsDeleted;
    }


}