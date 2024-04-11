const Curso = require('../Curso');

module.exports = {
    async listarCurso() {
        return await Curso.findAll({ raw: true });
        // raw:true -> serve para converter o objeto especial, em um array de objetos
    },

    async cadastrarCurso(nome) {
        return await Curso.create({nome})
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