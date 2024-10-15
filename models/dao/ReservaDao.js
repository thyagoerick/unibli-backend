const Reserva = require('../Reserva')

module.exports = {
    // Método assíncrono para listar todas as reservas
    async listarReservas() {
        // Retorna todas as reservas no banco de dados
        return await Reserva.findAll({ raw: true })
    },

    // Método assíncrono para cadastrar uma nova reserva
    async cadastrarReserva(dataDaReserva) {
        // Cria uma nova reserva no banco de dados com a data fornecida
        return await Reserva.create({
            dataDaReserva
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

    // Método assíncrono para remover uma reserva
    async removerReserva(id) {
        try {
            // Busca a reserva pelo ID fornecido
            const reserva = await Reserva.findByPk(id);
            // Verifica se a reserva foi encontrada
            if (!reserva) {
                throw new Error('Reserva não encontrada')
            }

            // Remove a reserva do banco de dados
            await reserva.destroy()
            // Retorna true para indicar que a operação foi bem-sucedida
            return true;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao remover a reserva: ' + error.message);
        }
    }
}