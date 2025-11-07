const { Sequelize } = require('sequelize');
require('dotenv').config()

const {
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_USERNAME,
    MYSQL_PASSWORD
} = process.env

const sequelize = new Sequelize(
    MYSQL_DATABASE,
    MYSQL_USERNAME,
    MYSQL_PASSWORD,
    {
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        dialect: 'mysql',
        dialectOptions: {
            // Configurações mais específicas para MySQL
            dateStrings: true,
            typeCast: true,
            supportBigNumbers: true,
            bigNumberStrings: true
        },
        timezone: '-03:00',
        // Define para não sincronizar automaticamente se já estiver dando erro
        sync: { force: false },
        // Desabilita o logging temporariamente para ver melhor
        logging: false
    }
);

sequelize.authenticate()
.then(() => {
    console.log('Conexão bem-sucedida!');
})
.catch(err => {
    console.error('Erro ao conectar:', err);
});

module.exports = sequelize