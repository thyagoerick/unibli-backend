// Aqui será consumido o banco oracle Hélio
require('dotenv').config()

const BASE_URL_FATEC2 = process.env.OCI_BASE_URL_FATEC2

module.exports = class FatecBService {
  
    static async listaAcervoFatec(req, res) {
        try {
            const response = await fetch(`${BASE_URL_FATEC2}/livro`)

            const data = await response.json()
            const livros = data.items
            console.log(livros);

           return res.json(livros);

        } catch(err) {
            console.log(livros);
            console.log(err)
        } 
    }

    static async buscaLivroPorId (req, res) {
        const id = req.params.id
        console.log(id);
        try {
            const response = await fetch(`${BASE_URL_FATEC2}/livro/${id}`)
            const data = await response.json()
            const livros = data
            //console.log(livros);

           return res.json(livros);

        } catch(err) {
            console.log(err)
        } 
    }

    static async buscarEditoraFatecB(editoraId){
        const resp = await fetch(`${BASE_URL_FATEC2}/editora/${editoraId}`)
        const editora = await resp.json();  
        return editora;
    }

    static async listaCursosFatec(req, res) {
        try {
            const response = await fetch(`${BASE_URL_FATEC2}/curso`)

            const data = await response.json()
            const cursos = data.items
            //console.log(cursos);

           return res.json(cursos);

        } catch(err) {
            console.log(err)
        } 
    }

    static async buscaCursoPorId (req, res) {
        const id = req.params.id
        console.log(id);
        try {
            const response = await fetch(`${BASE_URL_FATEC2}/curso/${id}`)
            const data = await response.json()
            const cursos = data
            //console.log(cursos);

           return res.json(cursos);

        } catch(err) {
            console.log(err)
        } 
    }



};