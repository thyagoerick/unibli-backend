const sequelize = require('../db/conn.js')
const Fatec = require('../models/Fatec.js')
const Livro = require('../models/Livro.js')
const livroDao = require('../models/dao/LivroDao.js')
const UniBliService = require('../services/UniBliService.js')

module.exports = class LivroController {

    static async listarLivros(req, res){
        const livros = await livroDao.listarLivros()
       
        // Captura os parâmetros da query
        const { titulo } = req.query;
        //console.log('Query recebida (req.query):', req.query);
        //console.log('Livros recebidos (livros):', livros);
        //console.log('Título da query (titulo):', titulo);

        // Filtragem local dos livros
        if(titulo){
            const livrosFiltrados = livros.filter(livro =>
               livro.titulo.toLowerCase().includes(titulo.toLowerCase())
            );
            return res.json(livrosFiltrados);
        }else{
            return res.json(livros);
        }
    }

    static async cadastrarAcervo(req, res) {
        const acervoIntegrado = await UniBliService.integraBases();
        const t = await sequelize.transaction(); // Inicia uma transação
    
        try {
            for (const livro of acervoIntegrado) {
                try {
                    // Cadastra o livro dentro da transação
                    const livroCadastrado = await livroDao.cadastrarLivro(
                        livro?.isbn10,
                        livro?.isbn13,
                        livro?.titulo,
                        livro?.autor,
                        livro?.genero,
                        livro?.edicao,
                        livro?.descricao,
                        livro?.quantidadePaginas,
                        livro?.editora,
                        livro?.idioma,
                        { transaction: t } // Passa a transação como opção
                    );
    
                    // Associa o livro à Fatec dentro da transação
                    if (livro.fatec) {
                        await livroCadastrado.addFatecs(livro.fatec, {
                            through: { quantidadeLivro: livro?.quantidadeLivro || 1 }, // Define quantidadeLivro
                            transaction: t // Passa a transação como opção
                        });
                    }
                } catch (error) {
                    console.error("Erro ao cadastrar livro ou associar à Fatec:", error);
                    throw error; // Lança o erro para o bloco catch externo
                }
            }
    
            await t.commit(); // Confirma a transação
            res.status(201).json({ message: "Livros cadastrados com sucesso!" }); // Envia uma única resposta
        } catch (error) {
            await t.rollback(); // Reverte a transação em caso de erro
            console.error("Erro ao cadastrar livros:", error);
            res.status(500).json({ error: "Erro ao cadastrar livros", details: error.message }); // Envia uma única resposta de erro
        }
    }


}