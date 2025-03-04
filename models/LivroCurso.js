// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn')

//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const LivroCurso = db.define('LivroCurso', 
    {
        id_livro_curso: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
    },
    {
        tableName: 'Livros_Cursos' // Define o nome real da tabela no banco
    }
)


module.exports = LivroCurso