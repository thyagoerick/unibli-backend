const Fatec = require('../Fatec')

module.exports = {

    // Método para buscar Fatec por ID
    async buscaFatecPorId(id) {
        // Busca uma Fatec pelo ID fornecido
        return await Fatec.findByPk(id)
    },
    
    // Método assíncrono para listar todas as Fatecs
    async listarFatecs() {
        // Usa o método findAll do modelo Fatec para buscar todas as Fatecs no banco de dados
        return await Fatec.findAll({ raw: true })
        // raw:true -> serve para converter o objeto especial, em um array de objetos
    },

    // Método assíncrono para cadastrar uma nova Fatec
    async cadastrarFatec(nome, endereco, cep) {
        // Cria uma nova Fatec no banco de dados com os dados fornecidos
        return await Fatec.create({
            nome,
            endereco,
            cep
        })
    },

    // Método assíncrono para atualizar os dados de uma Fatec existente
    async atualizarFatec(id, dadosAtualizados) {
        try {
            // Busca a Fatec pelo ID fornecido
            const fatec = await Fatec.findByPk(id)
            // Verifica se a Fatec foi encontrada
            if (!fatec) {
                throw new Error('Fatec não encontrada')
            }

            // Atualiza os dados da Fatec com os dados fornecidos
            await fatec.update(dadosAtualizados)
            // Retorna a Fatec atualizada
            return fatec
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar a Fatec: ' + error.message)
        }
    },
}