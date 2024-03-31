const express = require('express')
const router = express.Router()
const base_url_teste = 'http://132.226.251.219:3307/teste'


const FatecAService = require('../services/FatecAService')

// GET ALL BOOKS
router.get('/fetec1/acervo', FatecAService.listaAcervoFatecA)

// GET ONLY ONE BOOK
router.get('/fetec1/acervo/:id', async (req, res, next ) =>{
    const id = req.params.id
    console.log(id);

    try {
        const response = await fetch(`${base_url_teste}/fetec1/acervo`)
        console.log(response);
        const data = await response.json();
        console.log(data)
        
        const book = data.find(book => book._id === id)
        console.log(book);
        
        // Sempre fazer a verificação se foi encontrado o que está sendo buscado
        // tratativa de retorno
        book 
        ? res.json(book) // Envia os dados de volta como resposta para o navegador
        : res.status(404).json({ message: "Livro não encontrado" });
    
    } catch (error) {
        // Se houver um erro, repassa para o próximo middleware de erro
        next(error);
    }
})



module.exports = router