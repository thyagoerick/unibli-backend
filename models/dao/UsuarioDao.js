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

    async buscaUsuarioPorId(usuarioId, options = {}){
        return await Usuario.findOne({ raw: true, where: {id_usuario: usuarioId}, ...options})
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
        const t = await sequelize.transaction(); // Inicia a transação

        try {
            // 1. Busca o usuário para obter o id_usuario
            const usuario = await Usuario.findOne({ where: { auth0UserId }, transaction: t });
            if (!usuario) {
                await t.rollback();
                return 0; // Usuário não encontrado
            }

            const usuarioId = usuario.id_usuario;

            // 2. Busca todas as reservas ativas do usuário
            const reservasAtivas = await Reserva.findAll({
                where: { fk_id_usuario: usuarioId, status: 'ativa' },
                transaction: t,
                lock: t.LOCK.UPDATE // Bloqueia as reservas para garantir a atomicidade
            });

            // 3. Libera o estoque para cada reserva ativa
            for (const reserva of reservasAtivas) {
                // Busca o livro e o LivroFatec com bloqueio
                const livro = await livroDao.buscaLivroPorId(reserva.fk_id_livro, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                const livroFatec = await livroFatecDao.buscaLivroFatecPorId(reserva.fk_id_livro, reserva.fk_id_fatec, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (livro && livroFatec) {
                    // Incrementa a quantidade disponível na Fatec
                    await livroFatecDao.atualizarLivroFatec(
                        livroFatec.fk_id_livro, 
                        livroFatec.fk_id_fatec, 
                        { 
                            quantidadeLivro: livroFatec.quantidadeLivro + 1 
                        }, 
                        { transaction: t }
                    );

                    // Incrementa a disponibilidade geral do livro
                    await livroDao.atualizarLivro(
                        livro.id_livro, 
                        { 
                            disponibilidadeLivro: livro.disponibilidadeLivro + 1 
                        }, 
                        { transaction: t }
                    );
                }
            }

            // 4. Deleta todas as reservas do usuário (ativas ou não)
            await Reserva.destroy({ where: { fk_id_usuario: usuarioId }, transaction: t });

            // 5. Deleta o usuário
            const rowsDeleted = await Usuario.destroy({ where: { auth0UserId }, transaction: t });

            await t.commit(); // Confirma todas as operações
            return rowsDeleted;

        } catch (error) {
            await t.rollback(); // Desfaz tudo em caso de erro
            console.error('Erro ao deletar usuário e liberar reservas:', error);
            throw new Error('Erro ao deletar usuário e liberar reservas: ' + error.message);
        }
    }


}
