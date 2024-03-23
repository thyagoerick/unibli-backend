require('dotenv').config()
const {
    MONGO_BASE_CONNECT_URI,
} = process.env

// Aqui criar o serviço para o banco Mongo
const {MongoClient} = require('mongodb')

// cria a uri que é o protocolo mongo + IP do servidor
const uri = `${MONGO_BASE_CONNECT_URI}`

// Instancia um objeto de cliente para o a collection de acervo no Mongo
const acervo = new MongoClient(uri)
try {
    acervo.connect().then(() => console.log("Conectado com o MongoDB"))
    
} catch(e){console.log(`Erro ao conectar com o MongoDB: ${e}`)}


module.exports = class FatecAService{

    static async listaAcervoFatecA(req, res){
        try {
            const livros = await acervo.db('fatec1').collection('acervo').find().toArray() // Chamo a conexão, indico o banco, a colection 
            //console.log(livros);
            return res.json(livros); // Vai no banco em cima e retornar os dados localizados
        } catch(err) {
            console.log(err)
        } finally {
            await acervo.close(); // Fechando a conexão com o banco de dados
            console.log('Conexão fechada com o MongoDB')
        }
    }

}