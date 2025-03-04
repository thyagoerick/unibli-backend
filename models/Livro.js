// Dá acesso a todos os tipos de dados do banco
const { DataTypes } = require('sequelize')

// Chama a conexão do banco porque aqui teremos uma operação com o banco, já na definição do model
const db = require('../db/conn');
const Usuario = require('./Usuario');
const Fatec = require('./Fatec');
const Reserva = require('./Reserva');

//Criação da classe/model
/** O método define define o módulo 
 *  define('NomeDoModulo.js', objDeDefinicaoDeTipos{})
 */
const Livro = db.define('Livro', 
    {
        id_livro: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        isbn10: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true  // Estou na dúvida se pode ser unique, pois o mesmo é unico para cada livro
        },
        isbn13: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Estou na dúvida se pode ser unique, pois o mesmo é unico para cada livro
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        subTitulo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        autor: {
            type: DataTypes.STRING,
            allowNull: false
        },
        genero: {
            type: DataTypes.STRING,
            allowNull: false
        },
        edicao: {
            type: DataTypes.STRING,
            allowNull: true
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        quantidadePaginas: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        volume: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        editora: {
            type: DataTypes.STRING,
            allowNull: true
        },
        idioma: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }
)

// Associações envolvendo Livro estão em associations.js

module.exports = Livro