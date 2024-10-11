const LivroFatec = require('../LivroFatec')

module.exports = {
    // Método assíncrono para listar todos os livros da Fatec
    async listarLivrosFatec() {
        // Retorna todos os livros da Fatec no banco de dados
        return await LivroFatec.findAll({ raw: true });
    },

    // Método assíncrono para cadastrar um novo livro da Fatec
    async cadastrarLivroFatec(quantidadeLivro) {
        // Cria um novo livro da Fatec no banco de dados com os dados fornecidos
        return await LivroFatec.create({
            quantidadeLivro
        });
    },

    // Método assíncrono para atualizar os dados de um livro da Fatec existente
    async atualizarLivroFatec(id, dadosAtualizados) {
        try {
            // Busca o livro da Fatec pelo ID fornecido
            const livroFatec = await LivroFatec.findByPk(id);
            // Verifica se o livro da Fatec foi encontrado
            if (!livroFatec) {
                throw new Error('Livro da Fatec não encontrado');
            }

            // Atualiza os dados do livro da Fatec com os dados fornecidos
            await livroFatec.update(dadosAtualizados);
            // Retorna o livro da Fatec atualizado
            return livroFatec;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar o livro da Fatec: ' + error.message);
        }
    },

    // Método assíncrono para deletar um livro da Fatec
    async deletarLivroFatec(id) {
        try {
            // Busca o livro da Fatec pelo ID fornecido
            const livroFatec = await LivroFatec.findByPk(id);
            // Verifica se o livro da Fatec foi encontrado
            if (!livroFatec) {
                throw new Error('Livro da Fatec não encontrado');
            }

            // Deleta o livro da Fatec do banco de dados
            await livroFatec.destroy();
            // Retorna true para indicar que a operação foi bem-sucedida
            return true;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao deletar o livro da Fatec: ' + error.message);
        }
    }
};