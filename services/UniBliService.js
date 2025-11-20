require('dotenv').config()

const Livro = require('../models/Livro')

const FatecAService = require('./FatecAService')
const FatecBService = require('./FatecBService')

const  { requestOptionsGET } = require('../config/requestOptions')


/**********************************************************/
// Verifica se está executando localmente com base em uma variável de ambiente
const urlFatec1 =  
    (process.env.NODE_ENV === 'development')
        ? `${process.env.UNIBLI_SERVER_LOCALHOST}/fatecs/1`
        : `${process.env.UNIBLI_SERVER_HTTPS}/fatecs/1`;

//const urlFatec2 = `${process.env.OCI_BASE_URL_FATEC2}/livro`
const urlFatec2 =  
    (process.env.NODE_ENV === 'development')
        ? `${process.env.UNIBLI_SERVER_LOCALHOST}/fatecs/2`
        : `${process.env.UNIBLI_SERVER_HTTPS}/fatecs/2`;

/**********************************************************/
const unibli_base_url = 
    (process.env.NODE_ENV === 'development')
        ? `${process.env.UNIBLI_SERVER_LOCALHOST}/unibli`
        : `${process.env.UNIBLI_SERVER_HTTPS}/unibli`;




module.exports = class UniBliService {

    static async transformarDadosAcervo(livros) {        
        const structAcervo =  await Promise.all( // faz o map esperar que todas as promissese sejam resolvidas
                livros?.map( async livro => // torna a função dentro do map assincrona
            {   
                let editoraFatecB = livro?.fk_editora_editora_id ? await FatecBService.buscarEditoraFatecB(livro?.fk_editora_editora_id) : null;      

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
                    titulo: livro?.titulo || "",
                    autor: livro?.autor || "",
                    genero: livro?.genero || null,
                    edicao: livro?.edicao || null,
                    descricao: livro?.descricao || null,
                    quantidadePaginas: livro?.numero_pagina || livro?.numeroPagina || null,
                    editora: livro?.editora || editoraFatecB?.nome_editora || null,
                    idioma: livro?.idioma || null,
                    quantidadeLivro: livro?.quantidade_livro || livro?.quantidadeLivro || null,
                    disponibilidadeLivro: livro?.quantidadeDisponivel === null ? livro?.quantidadeLivro : livro?.quantidadeDisponivel || null,
                    imagem: imagemFatecA || imagemFatecB || null,
                    fatec: livro?.fatec || null
                };
                return structLivro;
        }));
        return structAcervo;
    }
    static async integraAcervo(){
        
        let dataFatec1, dataFatec2;
        let livros = []

        try {
            const responseFatec1 = await fetch(`${urlFatec1}/acervo`, requestOptionsGET)
            dataFatec1 = await responseFatec1.json();
             
            const acervofatec1 = dataFatec1?.map(data => {
                return {...data, fatec: 1}
            })
            livros.push(...acervofatec1)
        }catch(err){
            console.error('Erro ao buscar acervo da Fatec1:', err);
        }

        try {    
            const responseFatec2 = await fetch(`${urlFatec2}/acervo`)
            dataFatec2 = await responseFatec2.json();


            const acervofatec2 = dataFatec2?.map(data => {
                return {...data, fatec: 2}
            })

             livros.push(...acervofatec2)
        } catch(err){
            console.error('Erro ao buscar acervo da Fatec2:', err);
        }
        
        const basesAcervosIntegradas = await UniBliService.transformarDadosAcervo(livros)

        
        return basesAcervosIntegradas;
    }



    static async transformarDadosCursos(cursos) {        
        const structCursos =  await Promise.all( // faz o map esperar que todas as promissese sejam resolvidas
                cursos?.map( async curso => // torna a função dentro do map assincrona
        { 
            // 1. Unifica o nome do curso.
            //    Usa o operador '??' (nullish coalescing) para pegar o primeiro valor que não seja null/undefined.
            const nomeDoCurso = curso.curso ?? curso.nome_curso;

            // 2. Unifica o ID do curso (opcional, mas útil para depuração).
            const idOriginal = curso._id ?? curso.curso_id;

            // 3. Monta a estrutura padronizada.
            const structCurso = {
                nome: nomeDoCurso,
                fatec: curso.fatec, // A 'fatec' já foi adicionada no método 'integraCursos'
                idOriginal: idOriginal // Guardamos o ID original para referência
            };

            return structCurso;
        }));
        return structCursos.filter(c => c.nome);
    }
    
    static async integraCursos() {
        let cursos = [];

        // --- Etapa 1: Buscar dados da Fatec 1 ---
        try {
            console.log("Buscando cursos da Fatec 1...");
            const responseFatec1 = await fetch(`${urlFatec1}/cursos`, requestOptionsGET);
            const dataFatec1 = await responseFatec1.json();

            // Verifica se a resposta é um array antes de processar
            if (Array.isArray(dataFatec1)) {
                // Adiciona a propriedade 'fatec: 1' a cada objeto de curso
                const cursosfatec1 = dataFatec1.map(data => ({ ...data, fatec: 1 }));
                // Adiciona os cursos processados ao array principal
                cursos.push(...cursosfatec1);
            } else {
                console.warn("Aviso: A resposta da Fatec 1 não era um array ou estava vazia.");
            }

        } catch (err) {
            console.error('ERRO GRAVE ao buscar ou processar cursos da Fatec 1:', err);
        }

        // --- Etapa 2: Buscar dados da Fatec 2 ---
        try {
            console.log("Buscando cursos da Fatec 2...");
            const responseFatec2 = await fetch(`${urlFatec2}/cursos`);
            const dataFatec2 = await responseFatec2.json();

            const listaDeCursosFatec2 = dataFatec2;

            if (Array.isArray(listaDeCursosFatec2)) {
                const cursosfatec2 = listaDeCursosFatec2.map(data => ({ ...data, fatec: 2 }));
                cursos.push(...cursosfatec2);
            } else {
                console.warn("Aviso: A resposta da Fatec 2 não era um array ou estava vazia.");
            }

        } catch (err) {
            console.error('ERRO GRAVE ao buscar ou processar cursos da Fatec 2:', err);
        }

        // --- Etapa 3: Transformar e retornar os dados consolidados ---
        console.log(`Total de cursos integrados antes da transformação: ${cursos.length}`);

        // Chama a função que padroniza os nomes dos campos (ex: 'curso' e 'nome_curso' para 'nome')
        const basesCursosIntegrados = await UniBliService.transformarDadosCursos(cursos);
        
        console.log(`Total de cursos após padronização: ${basesCursosIntegrados.length}`);

        return basesCursosIntegrados;
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






    
    
}