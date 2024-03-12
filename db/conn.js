const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'oracle',
    username: 'ADMIN',
    password: 'UniBliTCC2024',
    dialectOptions:{
        connectString: '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.sa-saopaulo-1.oraclecloud.com))(connect_data=(service_name=gf9e540c7cf6e79_unibli_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
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