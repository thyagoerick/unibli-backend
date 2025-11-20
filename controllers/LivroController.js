const sequelize = require('../db/conn.js')
const livroDao = require('../models/dao/LivroDao.js')
const livroFatecDao = require('../models/dao/LivroFatecDao.js')
const UniBliService = require('../services/UniBliService.js')

module.exports = class LivroController {

    static async listarLivros(req, res){
        try {
            const { titulo, autor, genero, fatecId, cursoId } = req.query;
            
            console.log('=== CONTROLLER - Parâmetros RAW ===');
            console.log('autor RAW:', autor, 'Tipo:', typeof autor);
            console.log('===================================');
            
            const processArrayParam = (param) => {
                if (Array.isArray(param)) {
                    return param;
                }
                if (param && typeof param === 'string' && param.includes(',')) {
                    return param.split(',').map(item => item.trim());
                }
                return param ? [param] : [];
            };
            
            const filtros = { 
                titulo, 
                autor: processArrayParam(autor),
                genero, 
                fatecId: processArrayParam(fatecId),
                cursoId: processArrayParam(cursoId)
            };
            
            console.log('=== CONTROLLER - Filtros processados ===');
            console.log('autor processado:', filtros.autor, 'Length:', filtros.autor.length);
            console.log('========================================');
            
        
            
            // Se não há filtros, usa o método antigo para performance
            if (!titulo && !autor && !genero && filtros.fatecId.length === 0 && filtros.cursoId.length === 0) {
                console.log('Sem filtros - usando listarLivros() simples');
                const livros = await livroDao.listarLivros();
                if (!livros || livros.length === 0) {
                    return res.status(204).send();
                }
                return res.status(200).json(livros);
            }
            
            console.log('Com filtros - usando listarLivrosComFiltros()');
            // Se há filtros, usa o novo método
            const livros = await livroDao.listarLivrosComFiltros(filtros);
            
            if (!livros || livros.length === 0) {
                console.log('Nenhum livro encontrado com os filtros');
                return res.status(204).send();
            }
            
            console.log(`✅ Encontrados ${livros.length} livros com os filtros`);
            return res.status(200).json(livros);
            
        } catch (error) {
            console.error('Erro ao listar livros:', error);
            return res.status(500).json({ error: 'Erro ao listar livros', details: error.message });
        }
    }

    static async filtrarLivros(req, res) {
        try {
            const { titulo, autor, genero, fatecId, cursoId } = req.query;
            
            console.log('Parâmetros RAW recebidos (filtrar):', req.query);
            
            // CORREÇÃO: O Express não cria arrays automaticamente para query params com mesmo nome
            const processArrayParam = (param) => {
                if (Array.isArray(param)) {
                    return param;
                }
                if (param && typeof param === 'string' && param.includes(',')) {
                    return param.split(',').map(item => item.trim());
                }
                return param ? [param] : [];
            };
            
            const filtros = { 
                titulo, 
                autor: processArrayParam(autor), // AGORA autor também é processado como array
                genero, 
                fatecId: processArrayParam(fatecId),
                cursoId: processArrayParam(cursoId)
            };
            
            console.log('Filtros processados (filtrar):', filtros);
            
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

    static async listarAutores(req, res){
        try {
            console.log('=== CONTROLLER listarAutores chamado ===');
            
            const autores = await livroDao.listarAutores();
            
            console.log('Autores retornados do DAO:', autores);
            
            if (!autores || autores.length === 0) {
                console.log('Nenhum autor encontrado - retornando 204');
                return res.status(204).send();
            }
            
            console.log(`Retornando ${autores.length} autores`);
            return res.status(200).json(autores);
            
        } catch (error) {
            console.error('Erro no controller ao listar autores:', error);
            return res.status(500).json({ 
                error: 'Erro ao listar autores', 
                details: error.message 
            });
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