// Import express
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const app = express();

// Importar dotenv para carregar variáveis de ambiente locais
require('dotenv').config();

// Import do conn para conexão do Oracle com Sequelize
const conn = require('./db/conn')

/*****************IMPORT MODELS****************/
// Obs.: só o fato delas estarem aqui quando rodar o projeto elas já são criadas.
const Usuario = require('./models/Usuario')
const Curso = require('./models/Curso')
const Fatec = require('./models/Fatec')
const FatecCurso = require('./models/FatecCurso')
const Livro = require('./models/Livro')
const Reserva = require('./models/Reserva')
const LivroFatec = require('./models/LivroFatec')
const LivroCurso = require('./models/LivroCurso')
/**********************************************/

/*****************IMPORT ROUTES****************/
const testeRotas = require('./routes/testeRotas')
const unibliRotas = require('./routes/unibliRotas')
const usuariosRotas =  require('./routes/usuariosRotas')
const authRotas = require('./routes/auth0ManagementRotas')
/**********************************************/


/**************CONFIGURAÇÕES APP****************/
// Configurar Express para poder pegar o body dos forms
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json()) //Obter o dado do body em json()


/* TENTATIVA DE FAZER USAR A PORTA HTTTPS 
// Se estiver em produção, usar HTTPS
if (process.env.NODE_ENV !== 'development') {

    try{
        const options = {
            key: fs.readFileSync('../chave.key', 'utf8'),
            cert: fs.readFileSync('../certificado.crt', 'utf8'),
            passphrase: `${process.env.OPENSSL_PASSPHRASE}`
        };
    
        const server = https.createServer(options, app);
        server.listen(443, () => {
            console.log('Servidor HTTPS iniciado na porta 443');
        });
    }catch(e){
        console.log(e);
    }
} else { // Se estiver em ambiente de desenvolvimento, usar HTTP
    const server = http.createServer(app);
    server.listen(3307, () => {
        console.log('Servidor HTTP iniciado na porta 3307');
    });
}
*/

app.use('/teste', testeRotas) // rotas para testar aqui
app.use('/unibli', unibliRotas)
app.use('/usuarios', usuariosRotas)
app.use('/auth0', authRotas)
/***********************************************/


// Conexão com o banco de dados e sincronização dos modelos
const server = http.createServer(app);
server.listen(3307, () => {
    console.log('Servidor HTTP iniciado na porta 3307');
});

conn.sync()
    .then(() => {
        console.log('Conectado ao banco de dados e modelos sincronizados');
    }).catch(err => {
        console.error('Erro ao conectar e sincronizar modelos:', err);
    });