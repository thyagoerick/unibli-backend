const Usuario = require('../Usuario')

module.exports = {
     
    async listarUsuarios(){
        return await Usuario.findAll({raw: true})
        // raw:true -> serve para converter o objeto especial, em um array de objetos
    },

    async cadastrarUsuario(nome){     
        return await Usuario.create({nome}) // espera o usuário ser criado para só depois redirecioná-lo
    },
    
}