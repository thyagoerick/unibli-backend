const { Sequelize } = require('sequelize');
require('dotenv').config()

//console.log(process.env) // remova após confirmar que está funcionando
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
        host:MYSQL_HOST,
        port:MYSQL_PORT,
        dialect:'mysql'
    });


//checka a conexão, como um "ping", mas não mantém/persiste nada no BD 
sequelize.authenticate()
.then(() => {
    console.log('Conexão bem-sucedida!');
})
.catch(err => {
    console.error('Erro ao conectar:', err);
});

module.exports = sequelize
