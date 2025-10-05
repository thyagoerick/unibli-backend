const sequelize = require('../db/conn.js')
//const Fatec = require('../models/Fatec.js')
//const Livro = require('../models/Livro.js')
const livroDao = require('../models/dao/LivroDao.js')
const livroCursoDao = require('../models/dao/LivroCursoDao.js')

module.exports = class LivroCursoController {

    static async listarLivrosAgrupadosNoCurso (req, res) {
        try {
            const resultado = await livroCursoDao.listarLivrosAgrupadosNoCurso();
            return res.json(resultado);
        } catch (error) {
            console.error('Erro ao listar livros por curso:', error);
            return res.status(500).json({ error: 'Erro ao listar livros por curso.' });
        }
    }

    static async listarLivrosPorCursoIds(req, res) {
        try {
            let ids = [];

            // Suporte a diferentes formas de receber os IDs
            if (req.params.ids) {
                ids = req.params.ids.split(',').map(n => parseInt(n, 10));
            } else if (req.query.ids) {
                ids = req.query.ids.split(',').map(n => parseInt(n, 10));
            } else if (req.body.ids) {
                ids = req.body.ids.map(n => parseInt(n, 10));
            }

            if (!ids.length) {
                return res.status(400).json({ error: 'Informe ao menos um ID de curso.' });
            }

            const resultado = await livroCursoDao.listarLivrosPorCursoIds(ids);
            return res.json(resultado);
        } catch (error) {
            console.error('Erro ao listar livros por curso ID(s):', error);
            return res.status(500).json({ error: 'Erro ao listar livros por curso ID(s).' });
        }
    }


    
   
}