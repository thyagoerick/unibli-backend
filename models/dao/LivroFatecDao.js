const LivroFatec = require('../LivroFatec')

module.exports = {
    // Método assíncrono para listar todos os livros da Fatec
    async listarLivrosFatec() {
        // Retorna todos os livros da Fatec no banco de dados
        return await LivroFatec.findAll({ raw: true });
    },

    // Método assíncrono para cadastrar um novo livro da Fatec
    async cadastrarLivroFatec(dadosLivroFatec, options = {}) {
        // Cria um novo livro da Fatec no banco de dados com os dados fornecidos
        return await LivroFatec.create(dadosLivroFatec, options);
    },

    // Método assíncrono para atualizar os dados de um livro da Fatec existente
    async atualizarLivroFatec(livroId, fatecId, dadosAtualizados, options = {}) {
        try {
            // Busca o livro da Fatec pelo ID do livro e ID da Fatec
            const livroFatec = await LivroFatec.findOne({
                where: { fk_id_livro: livroId, fk_id_fatec: fatecId },
                ...options
            });
            // Verifica se o livro da Fatec foi encontrado
            if (!livroFatec) {
                throw new Error('Livro da Fatec não encontrado');
            }
            console.log('dadosAtualizados', dadosAtualizados);
            // Verifica se a quantidade de livros foi atualizada
            if (dadosAtualizados.quantidadeLivro !== undefined) {
                // Se a quantidade de livros foi atualizada, verifica se é um número válido
                if (typeof dadosAtualizados.quantidadeLivro !== 'number' || dadosAtualizados.quantidadeLivro < 0) {
                    throw new Error('Quantidade de livros inválida');
                }
            }
            
            // Atualiza os dados do livro da Fatec com os dados fornecidos
            await livroFatec.update(dadosAtualizados, options);
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
    },

    // Método assíncrono para buscar um livro da Fatec por ID
    async buscaLivroFatecPorId(livroId, fatecId) {
        // Busca um livro da Fatec pelo ID do livro e ID da Fatec
        return await LivroFatec.findOne({ raw: true, where: { fk_id_livro: livroId, fk_id_fatec: fatecId } });
    },

};