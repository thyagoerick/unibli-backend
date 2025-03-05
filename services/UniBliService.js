require('dotenv').config()

const Livro = require('../models/Livro')

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

    static async buscarEditoraFateB(editoraId){
        const resp = await fetch(`https://g4cd95dfc23d355-fatecb.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/editora/${editoraId}`)
        const editora = await resp.json();  
        return editora;
    }

    static async transformarDadosAcervo(livros) {        
        const structAcervo =  await Promise.all( // faz o map esperar que todas as promissese sejam resolvidas
                livros?.map( async livro => // torna a função dentro do map assincrona
            {   
                let editoraFateB = livro?.fk_editora_editora_id ? await UniBliService.buscarEditoraFateB(livro?.fk_editora_editora_id) : null;      

                let isbn = String(livro?.isbn).replaceAll('-','');
                let isbn13fatecA;
                let isbn10fatecA;

                livro?.isbn 
                    && (
                        isbn13fatecA = isbn.length === 13 &&  String(isbn),
                        isbn10fatecA = isbn.length === 10 &&  String(isbn)
                    )
             
                let isbn10fatecB = livro?.isbn_10 && String(livro?.isbn_10);
                let isbn13fatecB = livro?.isbn_13 && String(livro?.isbn_13);

                let imagemFatecA = String(livro?.imageLinks).includes('http') && livro?.imageLinks;
                let imagemFatecB = String(livro?.imagem_link).includes('http') && livro?.imagem_link;

                const structLivro = {
                    isbn10: isbn10fatecA || isbn10fatecB || null,
                    isbn13: isbn13fatecA || isbn13fatecB || null,
                    titulo: livro?.titulo || null,
                    autor: livro?.autor || null,
                    genero: livro?.genero || null,
                    edicao: livro?.edicao || null,
                    descricao: livro?.descricao || null,
                    quantidadePaginas: livro?.numero_pagina || livro?.numeroPagina || null,
                    editora: livro?.editora || editoraFateB?.nome_editora || null,
                    idioma: livro?.idioma || null,
                    quantidadeLivro: livro?.quantidade_livro || livro?.quantidadeLivro || 1,
                    disponibilidadeLivro: null,
                    imagem: imagemFatecA || imagemFatecB || null,
                    fatec: livro?.fatec || null
                };
                return structLivro;
        }));
        return structAcervo;
    }

    static async integraBases(){
        
        let dataFatec1, dataFatec2;
        let livros = []

        try {
            const responseFatec1 = await fetch(`${urlFatec1}`, requestOptionsGET)
             dataFatec1 = await responseFatec1.json();
             
             const acervofatec1 = dataFatec1?.map(data => {
                return {...data, fatec: 1}
             })
             livros.push(...acervofatec1)
        }catch(err){
            console.error('Erro ao buscar acervo da Fatec1:', err);
        }

        try {
            const responseFatec2 = await fetch(`${urlFatec2}`)
             dataFatec2 = await responseFatec2.json();
             const acervofatec2 = dataFatec2?.items?.map(data => {
                return {...data, fatec: 2}
             })

             livros.push(...acervofatec2)
        } catch(err){
            console.error('Erro ao buscar acervo da Fatec2:', err);
        }
        
        const basesAcervosIntegradas = await UniBliService.transformarDadosAcervo(livros)
        
        return basesAcervosIntegradas;
    }








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