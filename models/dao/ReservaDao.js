const Reserva = require('../Reserva')

module.exports = {
    // Método assíncrono para listar todas as reservas
    async listarReservas() {
        // Retorna todas as reservas no banco de dados
        return await Reserva.findAll({ raw: true })
    },

    // Método assíncrono para buscar uma reserva pelo ID
    async buscaReservaPorId(id) {
        // Busca a reserva pelo ID fornecido
        const reserva = await Reserva.findByPk(id)
        // Verifica se a reserva foi encontrada
        if (!reserva) {
            throw new Error('Reserva não encontrada')
        }
        // Retorna a reserva encontrada
        return reserva
    },

    // Método assíncrono para cadastrar uma nova reserva
    async reservar(usuarioId, livroId, fatecId, dataDaReserva) {
        // Verifica se os parâmetros obrigatórios foram fornecidos
        if (!usuarioId || !livroId || !fatecId || !dataDaReserva) {
            throw new Error('Dados obrigatórios não fornecidos')
        }
        // Atibui a data atual para a data da reserva
        dataDaReserva = new Date();        
        // Cria uma nova reserva no banco de dados com a data fornecida
        return await Reserva.create({
            dataDaReserva,
            fk_id_livro: livroId,
            fk_id_usuario: usuarioId, 
            fk_id_fatec: fatecId
        })
    },

    // Método assíncrono para atualizar os dados de uma reserva existente
    async atualizarReserva(id, dadosAtualizados) {
        try {
            // Busca a reserva pelo ID fornecido
            const reserva = await Reserva.findByPk(id)
            // Verifica se a reserva foi encontrada
            if (!reserva) {
                throw new Error('Reserva não encontrada')
            }

            // Atualiza os dados da reserva com os dados fornecidos
            await reserva.update(dadosAtualizados)
            // Retorna a reserva atualizada
            return reserva;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar a reserva: ' + error.message)
        }
    },

    // Método assíncrono para cancelar uma reserva
    async cancelarReserva(id, options = {}) {
        try {
            // Busca a reserva pelo ID fornecido, passando a transação se existir
            const reserva = await Reserva.findByPk(id, options)
            if (!reserva) {
                throw new Error('Reserva não encontrada')
            }
            // Deleta a reserva do banco de dados, passando a transação se existir
            await reserva.destroy(options)
            return { message: 'Reserva cancelada com sucesso' }
        } catch (error) {
            throw new Error('Erro ao cancelar a reserva: ' + error.message)
        }
    },

    // Verifica se já existe uma reserva ativa para o usuário e o livro
    async verificaReservaAtiva(usuarioId, livroId) {
        try {
            const reservaExistente = await Reserva.findOne({
                where: {
                    fk_id_usuario: usuarioId,
                    fk_id_livro: livroId
                }
            });

            // Retorna true se houver reserva, caso contrário, false
            return !!reservaExistente;
        } catch (error) {
            throw new Error('Erro ao verificar reserva existente: ' + error.message);
        }
    }
}