// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn')

//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const Usuario = db.define('Usuario', {
    nome:{
        //Não precisa definir o attr id, pois ele é criado automaticamente
        type: DataTypes.STRING,
        allowNull: false, //NotNull (aceita string vazia)
    }
})


module.exports = Usuario