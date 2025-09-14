const Curso = require('../Curso');

module.exports = {
    async listarCursos() {
        return await Curso.findAll({ raw: true });
        // raw:true -> serve para converter o objeto especial, em um array de objetos
    },

    async buscaCursoPorNome(nome, options = {}) { // Recebe 'nome' e 'options'
        return await Curso.findOne({ where: { nome: nome }, ...options }); // Usa 'nome' e passa 'options'
    },

    async buscaCursoPorId(id) {
        return await Curso.findByPk(id, { raw: true });
    },

   async cadastrarCurso(dadosDoCurso, options = {}) {
        // Agora ele recebe um objeto 'dadosDoCurso' e as 'options' da transação
        return await Curso.create(dadosDoCurso, options);
    },

    async atualizarCurso(id, dadosAtualizados) {
        try {
            const Curso = await Curso.findByPk(id);
            if (!Curso) {
                throw new Error('Curso não encontrado');
            }

            await Curso.update(dadosAtualizados);
            return Curso;
        } catch (error) {
            throw new Error('Erro ao atualizar o Curso: ' + error.message);
        }
    }
};