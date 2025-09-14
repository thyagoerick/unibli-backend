// Import express
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const app = express();
const cors = require('cors');

// Importar dotenv para carregar variáveis de ambiente locais
require('dotenv').config();

// Import do conn para conexão do Oracle com Sequelize
const conn = require('./db/conn')

/*****************IMPORT MODELS****************/
// Obs.: só o fato delas estarem aqui quando rodar o projeto elas já são criadas.
const { Usuario, Reserva, LivroFatec, LivroCurso, Livro, FatecCurso, Fatec, Curso } = require('./models/associations/associations');
/**********************************************/

/*****************IMPORT ROUTES****************/
//const testeRotas = require('./routes/testeRotas')
const unibliRotas = require('./routes/unibliRotas')
const authRotas = require('./routes/auth0ManagementRotas')
const fatecRotas = require('./routes/fatecRotas')

// Rotas internas Unibli:
const usuariosRotas =  require('./routes/usuariosRotas')
const acervoRotas = require('./routes/acervoRotas')
const reservaRotas = require('./routes/reservaRotas')
const cursoRotas = require('./routes/cursoRotas')

/**********************************************/


/**************CONFIGURAÇÕES APP****************/
// Configurar Express para poder pegar o body dos forms
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json()) //Obter o dado do body em json()

app.use(cors());

//app.use('/teste', testeRotas) // rotas para testar aqui
app.use('/unibli', unibliRotas)
app.use('/auth0', authRotas)
app.use('/fatec', fatecRotas)
// Rotas internas Unibli:
app.use('/acervo', acervoRotas)
app.use('/usuarios', usuariosRotas)
app.use('/reservas', reservaRotas)
app.use('/cursos', cursoRotas)
/***********************************************/


// Conexão com o banco de dados e sincronização dos modelos
const PORT = process.env.PORT; //3307
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Servidor HTTP iniciado na porta ${PORT}`);
});

conn
    .sync()
    //.sync({force: true}) //DESSE JEITO ALTERA A ESTRUTURA, MAS PERDE OS DADOS 
    //.sync({alter: true}) //DESSE JEITO ALTERA A ESTRUTURA, MAS NÃO PERDE OS DADOS 
    .then(() => {
        console.log('Conectado ao banco de dados e modelos sincronizados');
    }).catch(err => {   
        console.error('Erro ao conectar e sincronizar modelos:', err);
    });
