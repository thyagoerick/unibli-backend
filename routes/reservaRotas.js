const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const ReservaController = require('../controllers/ReservaController')

// Rotas existentes
router.get('/', ReservaController.listarReservas)
router.get('/usuario/:id', ReservaController.listarReservasPorUsuario)
router.post('/reservar', ReservaController.reservar)
router.delete('/:reservaID/cancelar', ReservaController.cancelarReserva)
router.patch('/:reservaID/retirar', ReservaController.marcarComoRetirada)

// NOVAS ROTAS DE DEBUG E STATUS
router.get('/debug/expirar', ReservaController.debugExpirarReservas)
router.get('/status', ReservaController.statusSistemaReservas)
router.post('/debug/forcar-expiracao', (req, res) => {
    req.query.forcarExpiracao = 'true';
    return ReservaController.debugExpirarReservas(req, res);
})

module.exports = router