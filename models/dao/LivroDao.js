const Livro = require('../Livro');
const { Op } = require('sequelize');
const Fatec = require('../Fatec');
const Curso = require('../Curso');
const LivroFatec = require('../LivroFatec');
const LivroCurso = require('../LivroCurso');
const sequelize = require('../../db/conn');
const { QueryTypes } = require('sequelize');

module.exports = {
    async listarLivros() {
        return await Livro.findAll({ raw: true });
    },

    async listarAutores() {
        try {
            console.log('=== INICIANDO listarAutores ===');
            
            const query = `
                SELECT DISTINCT autor 
                FROM Livros 
                WHERE autor IS NOT NULL 
                AND autor != '' 
                AND autor != 'null'
                ORDER BY autor
            `;
            
            console.log('📋 Executando query no banco...');
            const resultado = await sequelize.query(query, {
                type: QueryTypes.SELECT
            });
            
            console.log('📊 Resultado COMPLETO do banco:', JSON.stringify(resultado, null, 2));
            console.log('🔢 Número de registros retornados:', resultado.length);
            
            // Verifica se há resultados
            if (!resultado || resultado.length === 0) {
                console.log('❌ Nenhum autor encontrado no banco');
                return [];
            }
            
            const autoresBrutos = resultado.map(item => item.autor).filter(autor => autor);
            console.log('📝 Autores brutos extraídos:', autoresBrutos);
            console.log('🔢 Quantidade de autores brutos:', autoresBrutos.length);
            
            // PROCESSAMENTO PASSO A PASSO com logs
            console.log('🔄 Iniciando processamento...');
            
            // Passo 1: Filtrar autores válidos
            const autoresFiltrados = autoresBrutos.filter(autor => autor && typeof autor === 'string');
            console.log('✅ Após filtro:', autoresFiltrados.length, 'autores válidos');
            
            // Passo 2: Quebrar por vírgula
            const autoresSeparados = autoresFiltrados.flatMap(autor => 
                autor.split(',').map(a => a.trim()).filter(a => a)
            );
            console.log('🔀 Após separar por vírgula:', autoresSeparados.length, 'autores individuais');
            console.log('📋 Autores separados:', autoresSeparados);
            
            // Passo 3: Remover duplicatas
            const autoresUnicos = [...new Set(autoresSeparados)];
            console.log('🎯 Após remover duplicatas:', autoresUnicos.length, 'autores únicos');
            
            // Passo 4: Ordenar
            const listaFinal = autoresUnicos.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
            console.log('🔤 Após ordenar:', listaFinal.length, 'autores ordenados');
            
            console.log('📋 LISTA FINAL DE AUTORES:', listaFinal);
            console.log(`✅ RESUMO: De ${autoresBrutos.length} para ${listaFinal.length} autores únicos`);
            
            return listaFinal;
            
        } catch (error) {
            console.error('❌ Erro ao listar autores:', error);
            console.error('❌ Stack trace:', error.stack);
            throw new Error('Erro ao listar autores: ' + error.message);
        }
    },

    async listarLivrosComFiltros(filtros = {}) {
        const { titulo, autor = [], genero, fatecId = [], cursoId = [] } = filtros;
        
        console.log('🎯 === DAO - DEBUG SUPER DETALHADO - INÍCIO ===');
        console.log('🎯 Filtros recebidos:', JSON.stringify(filtros, null, 2));
        console.log('🎯 Autores recebidos:', autor);
        console.log('🎯 Tipo de autores:', typeof autor);
        console.log('🎯 É array?', Array.isArray(autor));
        console.log('🎯 Número de autores:', autor.length);
        
        let whereConditions = ["1=1"];
        let queryParams = {};
        
        // FILTRO POR TÍTULO
        if (titulo) {
            whereConditions.push("l.titulo LIKE :titulo");
            queryParams.titulo = `%${titulo}%`;
            console.log('🎯 Filtro título adicionado:', titulo);
        }
        
        // ✅ CORREÇÃO: FILTRO POR AUTOR COM LIKE (não com IN)
        if (autor.length > 0) {
            console.log('🔍 Aplicando filtro de autores com LIKE...');
            
            const autorConditions = autor.map((autorNome, index) => {
                const paramName = `autor${index}`;
                queryParams[paramName] = `%${autorNome}%`;
                return `l.autor LIKE :${paramName}`;
            });
            
            // ✅ CORREÇÃO: Usa OR entre os autores
            whereConditions.push(`(${autorConditions.join(' OR ')})`);
            console.log('✅ Filtro autor aplicado (LIKE):', autor);
        }
        
        // FILTRO POR GÊNERO
        if (genero) {
            whereConditions.push("l.genero LIKE :genero");
            queryParams.genero = `%${genero}%`;
            console.log('🎯 Filtro gênero adicionado:', genero);
        }
        
        // FILTRO POR FATEC
        if (fatecId.length > 0) {
            const fatecIdsNumeros = fatecId.map(id => parseInt(id)).filter(id => !isNaN(id));
            console.log('🎯 Fatec IDs processados:', fatecId, '->', fatecIdsNumeros);
            
            whereConditions.push(`
                EXISTS (
                    SELECT 1 FROM Livros_Fatecs lf 
                    WHERE lf.fk_id_livro = l.id_livro 
                    AND lf.fk_id_fatec IN (:fatecIds)
                )
            `);
            queryParams.fatecIds = fatecIdsNumeros;
            console.log('🎯 Filtro Fatec adicionado para IDs:', fatecIdsNumeros);
        }
        
        // FILTRO POR CURSO
        if (cursoId.length > 0) {
            const cursoIdsNumeros = cursoId.map(id => parseInt(id)).filter(id => !isNaN(id));
            console.log('🎯 Curso IDs processados:', cursoId, '->', cursoIdsNumeros);
            
            whereConditions.push(`
                EXISTS (
                    SELECT 1 FROM Livros_Cursos lc 
                    WHERE lc.fk_id_livro = l.id_livro 
                    AND lc.fk_id_curso IN (:cursoIds)
                )
            `);
            queryParams.cursoIds = cursoIdsNumeros;
            console.log('🎯 Filtro Curso adicionado para IDs:', cursoIdsNumeros);
        }
        
        // CONSTRUÇÃO DA QUERY FINAL
        const whereClause = whereConditions.join(' AND ');
        
        const query = `
            SELECT DISTINCT l.* 
            FROM Livros l
            WHERE ${whereClause}
            ORDER BY l.titulo
        `;
        
        console.log('🎯 === QUERY FINAL CONSTRUÍDA ===');
        console.log('🎯 Query completa:');
        console.log(query);
        console.log('🎯 Parâmetros completos:');
        console.log(JSON.stringify(queryParams, null, 2));
        console.log('🎯 Número de condições WHERE:', whereConditions.length);
        console.log('🎯 =================================');
        
        try {
            console.log('🎯 🚀 Executando query no banco de dados...');
            console.log('🎯 Replacements enviados para Sequelize:');
            console.log('🎯', queryParams);
            
            const resultado = await sequelize.query(query, {
                replacements: queryParams,
                type: QueryTypes.SELECT,
                logging: (sql, timing) => {
                    console.log('🎯 📊 QUERY EXECUTADA NO BANCO:');
                    console.log('🎯', sql);
                    console.log('🎯 ⏱️  Timing:', timing);
                }
            });
            
            console.log(`🎯 ✅ CONSULTA FINALIZADA: ${resultado.length} livros encontrados`);
            
            if (resultado.length > 0) {
                console.log('🎯 📚 LIVROS ENCONTRADOS:');
                resultado.forEach((livro, index) => {
                    console.log(`🎯 ${index + 1}. ID: ${livro.id_livro}`);
                    console.log(`🎯    Autor: "${livro.autor}"`);
                    console.log(`🎯    Título: "${livro.titulo}"`);
                    console.log(`🎯    Gênero: ${livro.genero}`);
                    console.log(`🎯    ---`);
                });
            } else {
                console.log('🎯 ❌ NENHUM livro encontrado com os filtros aplicados');
                
                // DEBUG ADICIONAL: Verifica quantos livros existem no total
                console.log('🎯 🔍 Verificando total de livros na base...');
                const totalLivros = await sequelize.query('SELECT COUNT(*) as total FROM Livros', {
                    type: QueryTypes.SELECT
                });
                console.log(`🎯 📊 Total de livros na base: ${totalLivros[0].total}`);
                
                // DEBUG ADICIONAL: Verifica se existem livros com os autores procurados
                if (autor.length > 0) {
                    console.log('🎯 🔍 Verificando livros com autores similares...');
                    for (const autorNome of autor) {
                        const testeQuery = `SELECT COUNT(*) as count FROM Livros WHERE autor LIKE '%${autorNome}%'`;
                        const testeResult = await sequelize.query(testeQuery, {
                            type: QueryTypes.SELECT
                        });
                        console.log(`🎯    Autor "${autorNome}": ${testeResult[0].count} livros encontrados com LIKE direto`);
                    }
                }
            }
            
            console.log('🎯 === DAO - DEBUG SUPER DETALHADO - FIM ===');
            return resultado;
            
        } catch (error) {
            console.error('🎯 ❌ ERRO NA CONSULTA SQL:');
            console.error('🎯 Mensagem:', error.message);
            console.error('🎯 Stack:', error.stack);
            throw error;
        }
    },

    async buscaLivroPorId(id_livro, options = {}){
        return await Livro.findOne({ raw: true, where: {id_livro: id_livro}, ...options})
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
    
    async atualizarLivro(id, dadosAtualizados, options = {}) {
        try {
            const livro = await Livro.findByPk(id, options);
            if (!livro) {
                throw new Error('Livro não encontrado');
            }

            await livro.update(dadosAtualizados, options);
            return livro;
        } catch (error) {
            throw new Error('Erro ao atualizar o livro: ' + error.message);
        }
    },

    async atualizarLivroTotais(id_livro, { quantidadeLivro, disponibilidadeLivro }, options = {}) {
        return await Livro.update(
            { quantidadeLivro, disponibilidadeLivro },
            { where: { id_livro }, ...options }
        );
    },

    async buscaLivroPorISBN10(isbn10) {
        return await Livro.findOne({ where: { isbn10 } });
    },
    async buscaLivroPorISBN13(isbn13) {
        return await Livro.findOne({ where: { isbn13 } });
    },

};