// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn')

//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const Fatec = db.define('Fatec', {
    nome:{
        //Não precisa definir o attr id, pois ele é criado automaticamente
        type: DataTypes.STRING,
        allowNull: false, //NotNull (aceita string vazia)
    },
    endereco:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    cep:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})


module.exports = Fatec