// Import express
const express = require('express')
const app = express()


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


app.use('/teste', testeRotas) // rotas para testar aqui
app.use('/unibli', unibliRotas)
app.use('/usuarios', usuariosRotas)
app.use('/auth0', authRotas)
/***********************************************/


conn
    .sync()
    .then(() => {
        app.listen(3307)
    }).catch(err => console.log(err))
