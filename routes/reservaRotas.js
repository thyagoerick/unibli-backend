const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const ReservaController = require('../controllers/ReservaController')

// Listar todas as reservas
router.get('/', /*cors(corsOptions),*/ ReservaController.listarReservas)

// Listar reservas por usuário específico
router.get('/usuario/:id', ReservaController.listarReservasPorUsuario)

// Cadastrar uma nova reserva
router.post('/reservar', /*cors(corsOptions),*/ ReservaController.reservar)

// Cancelar uma reserva
router.delete('/:reservaID/cancelar', /*cors(corsOptions),*/ ReservaController.cancelarReserva)

module.exports = router