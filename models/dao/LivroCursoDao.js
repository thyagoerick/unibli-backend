const LivroCurso = require('../LivroCurso')

module.exports = {
    // Método assíncrono para listar todos os livros de curso
    async listarLivrosCurso() {
        // Retorna todos os livros de curso no banco de dados
        return await LivroCurso.findAll({ raw: true })
    },

    // Método assíncrono para cadastrar um novo livro de curso
    async cadastrarLivroCurso() {
        // Cria um novo livro de curso no banco de dados
        return await LivroCurso.create({})
    },

    // Método assíncrono para atualizar os dados de um livro de curso existente
    async atualizarLivroCurso(id, dadosAtualizados) {
        try {
            // Busca o livro de curso pelo ID fornecido
            const livroCurso = await LivroCurso.findByPk(id)
            // Verifica se o livro de curso foi encontrado
            if (!livroCurso) {
                throw new Error('Livro de curso não encontrado')
            }

            // Atualiza os dados do livro de curso com os dados fornecidos
            await livroCurso.update(dadosAtualizados)
            // Retorna o livro de curso atualizado
            return livroCurso;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar o livro de curso: ' + error.message)
        }
    },

    // Método assíncrono para deletar um livro de curso
    async deletarLivroCurso(id) {
        try {
            // Busca o livro de curso pelo ID fornecido
            const livroCurso = await LivroCurso.findByPk(id)
            // Verifica se o livro de curso foi encontrado
            if (!livroCurso) {
                throw new Error('Livro de curso não encontrado')
            }

            // Deleta o livro de curso do banco de dados
            await livroCurso.destroy()
            // Retorna true para indicar que a operação foi bem-sucedida
            return true;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao deletar o livro de curso: ' + error.message)
        }
    }
};