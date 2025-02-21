require('dotenv').config()
const FatecAService = require('./FatecAService')
const  { requestOptionsGET } = require('../config/requestOptions')

const urlFatec2 = `${process.env.OCI_BASE_URL_FATEC2}/livro`
/**********************************************************/
// Verifica se está executando localmente com base em uma variável de ambiente
const urlFatec1 =  
    (process.env.NODE_ENV === 'development')
        ? `${process.env.UNIBLI_SERVER_LOCALHOST}/teste/fatec1/acervo`
        : `${process.env.UNIBLI_SERVER_HTTPS}/teste/fatec1/acervo`;

const unibli_base_url = 
    (process.env.NODE_ENV === 'development')
        ? `${process.env.UNIBLI_SERVER_LOCALHOST}/unibli`
        : `${process.env.UNIBLI_SERVER_HTTPS}/unibli`;
/**********************************************************/



module.exports = class UniBliService {

    // Função para buscar dados periodicamente
    static async atualizaUnibli() {
        // Defino o intervalo de tempo em milissegundos (por exemplo, a cada 5 minutos)
        const intervaloDeTempo = 5 * 60 * 1000;

        // Chamo a função de busca de dados
        FatecAService.listaAcervoFatecA()
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

    static async transformarDadosAcervo(fatec) {
        







        const modeloLivro = {
            //isbn10: '',
            //isbn13: '',
            titulo: '',
            subTitulo: '',
            autor: '',
            genero: '',
            edicao: '',
            descricao: '',
            quantidadePaginas: '',
            volume: '',
            editora: '',
            idioma: ''
        };
    }

    static async integraBases(req, res){
        let dataFatec1, dataFatec2;
        let livros = []

        try {
            const responseFatec1 = await fetch(`${urlFatec1}`, requestOptionsGET)
             dataFatec1 = await responseFatec1.json();
             livros.push(...dataFatec1)
        }catch(err){
            console.error('Erro ao buscar acervo da Fatec1:', err);
        }

        try {
            const responseFatec2 = await fetch(`${urlFatec2}`)
             dataFatec2 = await responseFatec2.json();
             livros.push(...dataFatec2.items)
        } catch(err){
            console.error('Erro ao buscar acervo da Fatec2:', err);
        }


        

        //----------------------------------------------------------------------
        //Não mexer aqui, só em cima que mexe agora

        // Captura os parâmetros da query
        const { titulo } = req.query;
        console.log('Query recebida (req.query):', req.query);
        //console.log('Livros recebidos (livros):', livros);
        console.log('Título da query (titulo):', titulo);

        // Filtragem local dos livros
        if(titulo){
            const livrosFiltrados = livros.filter(livro =>
               livro.titulo.toLowerCase().includes(titulo.toLowerCase())
            );
            return res.json(livrosFiltrados);
        }else{
            return res.json(livros);
        }
    }




    
    static async buscaLivroPorId(req, res){
        const id = req.params.id
        
        try {
            const response = await fetch(`${unibli_base_url}/acervo`, requestOptionsGET);
            const data = await response.json();
    
            const book = data.find(book => String(book._id || book.livro_id) === String(id));
    
            book ? res.json(book) : res.status(404).json({ message: "Livro não encontrado" });

        } catch (error) {
            console.error('Erro ao buscar livro por ID:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
    
}