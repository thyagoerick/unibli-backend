// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn')

const Fatec = require('./Fatec')


//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const Usuario = db.define(
    'Usuario', 
    {
        nome: {
            //Não precisa definir o attr id, pois ele é criado automaticamente
            type: DataTypes.STRING,
            allowNull: false, //NotNull (aceita string vazia)
        },
        cpf: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        endereco: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        numResidencia: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        complemento: {

            type: DataTypes.STRING,
            allowNull: true,
        },
        cep: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        telefone: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        ra: {

            type: DataTypes.STRING,
            allowNull: false,
        },
        matricula: {

            type: DataTypes.STRING,
            allowNull: true, //mudar para false depois pois deve ser obrigatósio
        },
        tipoBibliotecario: {

            type: DataTypes.BOOLEAN,
            allowNull: false,
            set(value) {
                this.setDataValue('tipoBibliotecario', value != null ? value : false);
            }
        },
        auth0UserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rg: {

            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        indexes: [
          // Create a unique index on email
          {
            unique: true,
            fields: ['auth0UserId'],
          },
        ],
    }
)

Usuario.belongsTo(Fatec)

module.exports = Usuario