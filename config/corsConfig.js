require('dotenv').config();

const whitelist = [    
    process.env.UNIBLI_SERVER_LOCALHOST,
    process.env.UNIBLI_SERVER_HTTPS,
    process.env.UNIBLI_FRONT_LOCALHOST,
    process.env.UNIBLI_FRONT_HTTPS,
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            // Requisição não possui o cabeçalho Origin (navegador)
            callback(403);
        } else if (whitelist.includes(origin)) {
            // Origin está na lista de permissões
            callback(null, true);
        } else {
            // Origin não está na lista de permissões
            callback(401);
        }
    }
};


module.exports = corsOptions;