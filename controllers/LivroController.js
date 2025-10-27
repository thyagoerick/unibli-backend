const sequelize = require('../db/conn.js')
//const Fatec = require('../models/Fatec.js')
//const Livro = require('../models/Livro.js')
const livroDao = require('../models/dao/LivroDao.js')
const livroFatecDao = require('../models/dao/LivroFatecDao.js')
const UniBliService = require('../services/UniBliService.js')

module.exports = class LivroController {

    static async listarLivros(req, res){
        try {
            // Captura todos os parâmetros de filtro
            const { titulo, autor, genero, fatecId, cursoId } = req.query;
            
            // Se não há filtros, usa o método antigo para performance
            if (!titulo && !autor && !genero && !fatecId && !cursoId) {
                const livros = await livroDao.listarLivros();
                if (!livros || livros.length === 0) {
                    return res.status(204).send();
                }
                return res.status(200).json(livros);
            }
            
            // Se há filtros, usa o novo método
            const filtros = { titulo, autor, genero, fatecId, cursoId };
            const livros = await livroDao.listarLivrosComFiltros(filtros);
            
            if (!livros || livros.length === 0) {
                return res.status(204).send();
            }
            
            return res.status(200).json(livros);
            
        } catch (error) {
            console.error('Erro ao listar livros:', error);
            return res.status(500).json({ error: 'Erro ao listar livros', details: error.message });
        }
    }

    static async filtrarLivros(req, res) {
        try {
            const { titulo, autor, genero, fatecId, cursoId } = req.query;
            
            const filtros = { titulo, autor, genero, fatecId, cursoId };
            const livros = await livroDao.listarLivrosComFiltros(filtros);
            
            if (!livros || livros.length === 0) {
                return res.status(204).send();
            }
            
            return res.status(200).json(livros);
            
        } catch (error) {
            console.error('Erro ao filtrar livros:', error);
            return res.status(500).json({ error: 'Erro ao filtrar livros', details: error.message });
        }
    }



    static async cadastrarAcervo(req, res) {
        const acervoIntegrado = await UniBliService.integraAcervo();
        const t = await sequelize.transaction(); // Inicia uma transação
        //console.log('\n\n\n\nAcervo integrado:\n', acervoIntegrado);

        try {
            for (const livro of acervoIntegrado) {
                try {
                    // Busca livro existente por ISBN10 ou ISBN13
                    let livroExistente = null;
                    if (livro.isbn10) {
                        livroExistente = await livroDao.buscaLivroPorISBN10(livro.isbn10);
                    }
                    if (!livroExistente && livro.isbn13) {
                        livroExistente = await livroDao.buscaLivroPorISBN13(livro.isbn13);
                    }

                    let livroCadastrado = livroExistente;

                    if (livroExistente) {
                        // Se já existe, soma as quantidades
                        const novaQuantidade = (livroExistente.quantidadeLivro || 0) + (livro.quantidadeLivro || 0);
                    
                        const novaDisponibilidade = 
                        (livroExistente.disponibilidadeLivro || 0) + (livro.disponibilidadeLivro ===  null ? livro.quantidadeLivro : livro.disponibilidadeLivro || 0);

                        await livroDao.atualizarLivroTotais(
                            livroExistente.id_livro,
                            {
                                quantidadeLivro: novaQuantidade,
                                disponibilidadeLivro: novaDisponibilidade
                            },
                            { transaction: t }
                        );
                    } else {
                        // Se não existe, cadastra normalmente                
                        // Cadastra o livro dentro da transação
                        livroCadastrado = await livroDao.cadastrarLivro(
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
                            livro?.quantidadeLivro,
                            livro?.disponibilidadeLivro,
                            livro?.imagem,
                            { transaction: t } // Passa a transação como opção
                        );
                    }

                    
                    // Associa o livro à Fatec dentro da transação
                    if (livro?.fatec) {
                        // Verifica se já existe associação livro-fatec
                        const jaExiste = await livroFatecDao.buscaLivroFatecPorId(livroCadastrado.id_livro, livro.fatec);
                        if (!jaExiste) {
                            // Cadastra em LivroFatec (um registro por Fatec)
                            await livroFatecDao.cadastrarLivroFatec({
                                fk_id_livro: livroCadastrado.id_livro,
                                fk_id_fatec: livro.fatec,
                                quantidadeLivro: livro?.disponibilidadeLivro === null ? livro?.quantidadeLivro : livro?.disponibilidadeLivro || 1,
                            }, { transaction: t });
                        } else {
                            // Se já existe, soma as quantidades
                            const novaQuantidade = (jaExiste.disponibilidadeLivro || 0) + (livro?.disponibilidadeLivro === null ? livro?.quantidadeLivro : livro?.disponibilidadeLivro || 1);
                            await livroFatecDao.atualizarLivroFatec(
                                livroCadastrado.id_livro,
                                livro.fatec,
                                { quantidadeLivro: novaQuantidade },
                                { transaction: t }
                            );
                        }
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


    static async buscaLivroPorId (req, res) {
            console.log('Rota [acervo/] livro/:id chamada com ID:', req.params.id);
            const livroId = req.params.id;
            const livro = await livroDao.buscaLivroPorId(livroId);
            res.json({livro});
        }

}