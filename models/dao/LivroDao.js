const Livro = require('../Livro');

module.exports = {
    async listarLivros() {
        return await Livro.findAll({ raw: true });
        // raw:true -> serve para converter o objeto especial, em um array de objetos
    },

     async buscaLivroPorId(id_livro){
        return await Livro.findOne({ raw: true, where: {id_livro: id_livro}})
    },

    async cadastrarLivro(
        isbn10,
        isbn13,
        titulo,
        autor,
        genero,
        edicao,
        descricao,
        quantidadePaginas,
        editora,
        idioma,
        quantidadeLivro,
        disponibilidadeLivro,
        imagem
    ) {
        return await Livro.create({
            isbn10,
            isbn13,
            titulo,
            autor,
            genero,
            edicao,
            descricao,
            quantidadePaginas,
            editora,
            idioma,
            quantidadeLivro,
            disponibilidadeLivro,
            imagem
        })
    },
    
    async atualizarLivro(id, dadosAtualizados) {
        try {
            const livro = await Livro.findByPk(id);
            if (!livro) {
                throw new Error('Livro não encontrado');
            }

            await livro.update(dadosAtualizados);
            return livro;
        } catch (error) {
            throw new Error('Erro ao atualizar o livro: ' + error.message);
        }
    }
};