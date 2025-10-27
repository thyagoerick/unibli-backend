const sequelize = require('../db/conn.js')
const fatecDao = require('../models/dao/FatecDao.js')

module.exports = class ReservaController {

    static async listarFatecs(req, res) {
        try {
            const fatecs = await fatecDao.listarFatecs();

            if (!fatecs || fatecs.length === 0) {
                return res.status(204).send(); // No Content = Sem fatecs cadastradas
            }
            return res.status(200).json({ fatecs: fatecs });
            
        } catch (error) {
            console.error('Erro ao listar fatecs:', error);
            return res.status(500).json({ error: 'Erro ao listar fatecs' });
        }
    }
}