const express = require('express')
const router = express.Router()

const cors = require('cors');
const corsOptions = require('../config/corsConfig')

const FatecAService = require('../services/FatecAService')
const FatecBService = require('../services/FatecBService')


/**Acervo */
router.get('/1/acervo', /*cors(corsOptions),*/ FatecAService.listaAcervoFatec)
router.get('/2/acervo', /*cors(corsOptions),*/ FatecBService.listaAcervoFatec)

/**Cursos */
router.get('/1/cursos', /*cors(corsOptions),*/ FatecAService.listaCursosFatec)
router.get('/2/cursos', /*cors(corsOptions),*/ FatecBService.listaCursosFatec)

//--------------------------------------------------------------------------------

/**Acervo */
router.get('/1/acervo/:id', /*cors(corsOptions),*/ FatecAService.buscaLivroPorId)
router.get('/2/acervo/:id', /*cors(corsOptions),*/ FatecBService.buscaLivroPorId)

/**Cursos */
router.get('/1/cursos/:id', /*cors(corsOptions),*/ FatecAService.buscaCursoPorId)
router.get('/2/cursos/:id', /*cors(corsOptions),*/ FatecBService.buscaCursoPorId)

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