const Livro = require('../Livro');
const { Op } = require('sequelize');
const Fatec = require('../Fatec');
const Curso = require('../Curso');
const LivroFatec = require('../LivroFatec');
const LivroCurso = require('../LivroCurso');
const sequelize = require('../db/conn');
const { QueryTypes } = require('sequelize');

module.exports = {
    async listarLivros() {
        return await Livro.findAll({ raw: true });
    },

    async listarLivrosComFiltros(filtros = {}) {
        const { titulo, autor, genero, fatecId, cursoId } = filtros;
        
        // Se não há filtros de relacionamento, usa consulta simples
        if (!fatecId && !cursoId) {
            let whereClause = {};
            
            if (titulo) whereClause.titulo = { [Op.like]: `%${titulo}%` };
            if (autor) whereClause.autor = { [Op.like]: `%${autor}%` };
            if (genero) whereClause.genero = { [Op.like]: `%${genero}%` };
            
            return await Livro.findAll({
                where: whereClause,
                raw: true
            });
        }
        
        // Se há filtros de relacionamento, usa SQL direto para melhor controle
        let whereConditions = ["1=1"]; // Sempre verdadeiro para base
        let joinConditions = [];
        let queryParams = {};
        
        // Filtros básicos
        if (titulo) {
            whereConditions.push("l.titulo LIKE :titulo");
            queryParams.titulo = `%${titulo}%`;
        }
        if (autor) {
            whereConditions.push("l.autor LIKE :autor");
            queryParams.autor = `%${autor}%`;
        }
        if (genero) {
            whereConditions.push("l.genero LIKE :genero");
            queryParams.genero = `%${genero}%`;
        }
        
        // Filtro por Fatec
        if (fatecId) {
            joinConditions.push(`
                INNER JOIN Livros_Fatecs lf 
                ON lf.fk_id_livro = l.id_livro 
                AND lf.fk_id_fatec = :fatecId
            `);
            queryParams.fatecId = parseInt(fatecId);
        }
        
        // Filtro por Curso
        if (cursoId) {
            joinConditions.push(`
                INNER JOIN Livros_Cursos lc 
                ON lc.fk_id_livro = l.id_livro 
                AND lc.fk_id_curso = :cursoId
            `);
            queryParams.cursoId = parseInt(cursoId);
        }
        
        const whereClause = whereConditions.join(' AND ');
        const joinClause = joinConditions.join(' ');
        
        const query = `
            SELECT DISTINCT l.* 
            FROM Livros l
            ${joinClause}
            WHERE ${whereClause}
            ORDER BY l.titulo
        `;
        
        console.log('Query executada:', query);
        console.log('Parâmetros:', queryParams);
        
        const resultado = await sequelize.query(query, {
            replacements: queryParams,
            type: QueryTypes.SELECT
        });
        
        console.log('Resultados encontrados:', resultado.length);
        
        return resultado;
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