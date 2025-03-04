// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn');
const Usuario = require('./Usuario');
const Livro = require('./Livro');
const Reserva = require('./Reserva');

//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const Fatec = db.define('Fatec', 
    {
        id_fatec: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        nome:{
            type: DataTypes.STRING,
            allowNull: false, //allowNull=false == NotNull :: (mas aceita string vazia não nula)
        },
        endereco:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        cep:{
            type: DataTypes.STRING,
            allowNull: false,
        }
    }
)


// Associações envolvendo Fatec estão em associations.js


module.exports = Fatec