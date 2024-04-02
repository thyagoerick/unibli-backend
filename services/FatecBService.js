// Aqui será consumido o banco oracle Hélio
require('dotenv').config()

const BASE_URL_FATEC2 = process.env.OCI_BASE_URL_FATEC2

module.exports = class FatecBService {
  
    static async listaAcervoFatec(req, res) {
        try {
            const response = await fetch(`${BASE_URL_FATEC2}/livro`)
            const data = await response.json()
            const livros = data.items
            //console.log(livros);

           return res.json(livros);

        } catch(err) {
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

};