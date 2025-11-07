// Reserva.js - CORRIGIDO
const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Reserva = db.define('Reserva', 
    {
        id_reserva: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        dataDaReserva: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: { 
            type: DataTypes.ENUM('ativa', 'cancelada', 'concluida'),
            allowNull: false,
            defaultValue: 'ativa'
        },
        dataExpiracao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW // Valor inicial, será sobrescrito no DAO
        }
    },
    {
        tableName: 'Reservas',
        underscored: false,
        name: {
            singular: 'Reserva',
            plural: 'Reservas'
        }
    }
)

module.exports = Reserva