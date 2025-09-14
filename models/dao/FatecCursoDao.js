const FatecCurso = require('../FatecCurso')
const Fatec = require('../Fatec');
const Curso = require('../Curso'); // Importante para a busca inicial

module.exports = {
    // Método assíncrono para listar todos os cursos da Fatec
    async listarCursosFatec() {
        // Retorna todos os cursos da Fatec no banco de dados
        return await FatecCurso.findAll({ raw: true })
    },

    async listarFatecsPorCurso(id_curso) {
        return await FatecCurso.findAll({
            where: { fk_id_curso: id_curso },
            raw: true
        });
    },

    // Método assíncrono para cadastrar um novo curso da Fatec
    async cadastrarCursoFatec(dados, options = {}) {
        return await FatecCurso.create(dados, options);
    },

    // Método assíncrono para atualizar os dados de um curso da Fatec existente
    async atualizarCursoFatec(id, dadosAtualizados) {
        try {
            // Busca o curso da Fatec pelo ID fornecido
            const cursoFatec = await FatecCurso.findByPk(id)
            // Verifica se o curso da Fatec foi encontrado
            if (!cursoFatec) {
                throw new Error('Curso da Fatec não encontrado')
            }

            // Atualiza os dados do curso da Fatec com os dados fornecidos
            await cursoFatec.update(dadosAtualizados)
            // Retorna o curso da Fatec atualizado
            return cursoFatec
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao atualizar o curso da Fatec: ' + error.message)
        }
    },

    // Método assíncrono para deletar um curso da Fatec
    async deletarCursoFatec(id) {
        try {
            // Busca o curso da Fatec pelo ID fornecido
            const cursoFatec = await FatecCurso.findByPk(id)
            // Verifica se o curso da Fatec foi encontrado
            if (!cursoFatec) {
                throw new Error('Curso da Fatec não encontrado')
            }

            // Deleta o curso da Fatec do banco de dados
            await cursoFatec.destroy()
            // Retorna true para indicar que a operação foi bem-sucedida
            return true;
        } catch (error) {
            // Captura e relança qualquer erro ocorrido durante o processo
            throw new Error('Erro ao deletar o curso da Fatec: ' + error.message)
        }
    },

    async buscaCursoFatec(id_curso, id_fatec, options = {}) {
        return await FatecCurso.findOne({
            where: {
                fk_id_curso: id_curso,
                fk_id_fatec: id_fatec
            },
            ...options
        });
    },

     async buscarFatecsPorCurso(id_curso) {
        const associacoes = await FatecCurso.findAll({
            where: { fk_id_curso: id_curso },
            // O 'include' é a parte mais importante. Ele diz ao Sequelize:
            // "Quando encontrar as associações, traga também os dados completos da Fatec relacionada".
            include: [{
                model: Fatec, // O modelo a ser incluído
                required: true // Garante que só traga associações com uma Fatec válida (INNER JOIN)
            }],
            raw: true, // Retorna dados puros, mais fáceis de manipular
            nest: true // Organiza os dados do 'include' em um objeto aninhado
        });

        // O resultado será uma lista de objetos, onde cada um tem os dados da associação
        // e um sub-objeto 'Fatec' com os detalhes da Fatec.
        // Ex: [{ id_fatec_curso: 1, fk_id_curso: 5, fk_id_fatec: 1, Fatec: { id_fatec: 1, nome: 'Fatec São Paulo', ... } }]

        // Como quero apenas a  parte da Fatec, então vou extrair isso.
        return associacoes.map(assoc => assoc.Fatec);
    }


}