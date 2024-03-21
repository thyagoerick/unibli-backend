// Aqui criar o serviço para o banco Mongo

const {MongoClient} = require('mongodb')
//const { DataTypes } = require('sequelize') Fazer conexão com o banco uniBli

// cria a uri que é o protocolo mongo + IP do servidor
const uri = "mongodb+srv://weslleywbarros:UniBli123@cluster0.va50zjx.mongodb.net/"

const acervo = new MongoClient(uri)

async function buscaFatecA() {
    try {
        await acervo.connect()
    console.log("Conectado com o MongoDB")

    const livros = conn.db().collection('acervo').find().toArray() // Chamo a conexão, indico o banco, a colection 
       return livros // Vai no banco em cima e retornar os dados localizados
    } catch(err) {
        console.log(err)
    }finally {
        await acervo.close(); // Fechando a conexão com o banco de dados
        console.log('Conexão fechada com o MongoDB')
    }
}

//buscaFatecA() .Executo a função para buscar os livros. Ela sera chamada sempre nos intervalos

// Função para buscar dados periodicamente
function atualizaUnibli() {
    // Defino o intervalo de tempo em milissegundos (por exemplo, a cada 5 minutos)
    const intervaloDeTempo = 5 * 60 * 1000;

    // Chamo a função de busca de dados
    buscaFatecA()
        .then(livros => {
            console.log('Dados encontrados:', livros);
            // Posso atualizar o banco Unibli aqui
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            // Trate o erro aqui
        });

    // Agenda a execução da função de busca a cada intervalo de tempo
    setInterval(async () => {
        try {
            const livros = await buscaFatecA();
            console.log('Dados encontrados:', livros);
            // Posso atualizar o banco Unibli aqui
        } catch (error) {
            console.error('Erro ao buscar dados periodicamente:', error);
            // Trate o erro aqui
        }
    }, intervaloDeTempo);
}
atualizaUnibli()// Chamo a função para atualizar o banco da Unibli

module.exports = livros 