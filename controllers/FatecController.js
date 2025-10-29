const sequelize = require('../db/conn.js')
const fatecDao = require('../models/dao/FatecDao.js')

module.exports = class FatecController {

    static async listarFatecs(req, res) {
        try {
            // Verifica se foi passado um ID de livro como query parameter
            const { livroId } = req.query;
            
            let fatecs;
            
            if (livroId) {
                // Se tem livroId, busca apenas as Fatecs que possuem esse livro
                fatecs = await fatecDao.listarFatecsPorLivro(livroId);
            } else {
                // Se não tem livroId, busca todas as Fatecs
                fatecs = await fatecDao.listarFatecs();
            }

            if (!fatecs || fatecs.length === 0) {
                return res.status(204).send(); // No Content = Sem fatecs cadastradas
            }
            return res.status(200).json({ fatecs: fatecs });
            
        } catch (error) {
            console.error('Erro ao listar fatecs:', error);
            return res.status(500).json({ error: 'Erro ao listar fatecs', details: error.message });
        }
    }
}