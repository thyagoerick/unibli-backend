// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn')

//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const LivroFatec = db.define('LivroFatec', 
    {
        id_livro_fatec: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        quantidadeLivro:{
            //Não precisa definir o attr id, pois ele é criado automaticamente
            type: DataTypes.DATE,
            allowNull: false, //NotNull (aceita string vazia)
        }
    },
    {
        tableName: 'Livros_Fatecs' // Define o nome real da tabela no banco
    }
)


module.exports = LivroFatec