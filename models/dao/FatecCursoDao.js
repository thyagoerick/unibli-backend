const FatecCurso = require('../FatecCurso')

module.exports = {
    // Método assíncrono para listar todos os cursos da Fatec
    async listarCursosFatec() {
        // Retorna todos os cursos da Fatec no banco de dados
        return await FatecCurso.findAll({ raw: true })
    },

    // Método assíncrono para cadastrar um novo curso da Fatec
    async cadastrarCursoFatec() {
        // Cria um novo curso da Fatec no banco de dados
        return await FatecCurso.create({})
    },

    // Método assíncrono para atualizar os dados de um curso da Fatec existente
    async atualizarCursoFatec(id, dadosAtualizados) {
        try {
            // Busca o curso da Fatec pelo ID fornecido
            const cursoFatec = await FatecCurso.findByPk(id)
            // Verifica se o curso da Fatec foi encontrado
            if (!cursoFatec) {
                throw new Error('Curso da Fatec não encontrado')
            }

            // Atualiza os dados do curso da Fatec com os dados fornecidos
            await cursoFatec.update(dadosAtualizados)
            // Retorna o curso da Fatec atualizado
            return cursoFatec
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar o curso da Fatec: ' + error.message)
        }
    },

    // Método assíncrono para deletar um curso da Fatec
    async deletarCursoFatec(id) {
        try {
            // Busca o curso da Fatec pelo ID fornecido
            const cursoFatec = await FatecCurso.findByPk(id)
            // Verifica se o curso da Fatec foi encontrado
            if (!cursoFatec) {
                throw new Error('Curso da Fatec não encontrado')
            }

            // Deleta o curso da Fatec do banco de dados
            await cursoFatec.destroy()
            // Retorna true para indicar que a operação foi bem-sucedida
            return true;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao deletar o curso da Fatec: ' + error.message)
        }
    }
}