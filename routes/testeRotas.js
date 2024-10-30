const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const FatecAService = require('../services/FatecAService')
const FatecBService = require('../services/FatecBService')



router.get('/fatec1/acervo', /*cors(corsOptions),*/ FatecAService.listaAcervoFatec)
router.get('/fatec1/acervo/:id', /*cors(corsOptions),*/ FatecAService.buscaLivroPorId)

router.get('/fatec2/acervo', /*cors(corsOptions),*/ FatecBService.listaAcervoFatec)
router.get('/fatec2/acervo/:id', /*cors(corsOptions),*/ FatecBService.buscaLivroPorId)


/**************************************************************************************
router.use((err, req, res, next) => {
    if (err) {
        if (err === 403) {
            return res.status(403).json({ message: "Acesso não permitido por CORS - Falta de cabeçalho Origin" });
        } else if (err === 401) {
            return res.status(401).json({ message: "Acesso não permitido por CORS - Origin não está na lista de permissões" });
        } else {
            return res.status(403).json({ message: "Acesso não permitido por CORS" });
        }
    }
    next();
});
/**************************************************************************************/

module.exports = router