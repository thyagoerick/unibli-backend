const { Sequelize } = require('sequelize');

require('dotenv').config()
//console.log(process.env) // remova após confirmar que está funcionando
const {
    SEQUELIZE_DIALECT,
    OCI_ADB_USER_NAME,
    OCI_ADB_PASSWORD,
    OCI_ADB_CONNECT_STR
} = process.env

const sequelize = new Sequelize({
    dialect: `${SEQUELIZE_DIALECT}`,
    username: `${OCI_ADB_USER_NAME}`,
    password: `${OCI_ADB_PASSWORD}`,
    dialectOptions:{
        connectString: `${OCI_ADB_CONNECT_STR}`
    }
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