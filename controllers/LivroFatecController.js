const sequelize = require('../db/conn.js')
//const Fatec = require('../models/Fatec.js')
//const Livro = require('../models/Livro.js')
const livroDao = require('../models/dao/LivroDao.js')
const livroFatecDao = require('../models/dao/LivroFatecDao.js')

module.exports = class LivroFatecController {

    // Método para listar todos os livros por fatec de LivroFatecDao
    static async listarLivrosFatec(req, res) {
        try {
            const livros = await livroFatecDao.listarLivrosFatec();
            return res.json(livros);
        } catch (error) {
            console.error('Erro ao listar livros:', error);
            return res.status(500).json({ error: 'Erro ao listar livros.' });
        }
    }
    

    // Método para retornar a quantidade de um livro específico por Fate e Livro utilizando o ID do livro e o ID da Fatec do método dao LivroFatecDao
    static async buscaLivroFatecPorId(req, res) {
        const { livroId, fatecId } = req.params;
        try {
            const livroFatec = await livroFatecDao.buscaLivroFatecPorId(livroId, fatecId);
            if (!livroFatec) {
                return res.status(404).json({ error: 'Livro não encontrado na Fatec especificada.' });
            }
            return res.json(livroFatec);
        } catch (error) {
            console.error('Erro ao buscar livro na Fatec:', error);
            return res.status(500).json({ error: 'Erro ao buscar livro na Fatec.' });
        }
    }
}