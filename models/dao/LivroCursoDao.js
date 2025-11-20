const LivroCurso = require('../LivroCurso');
const sequelize = require('../../db/conn');   // instância Sequelize
const { QueryTypes } = require('sequelize');

module.exports = {
    async listarLivrosAgrupadosNoCurso() {
        const registros = await sequelize.query(
            `SELECT l.*, c.id_curso, c.nome AS nomeCurso
             FROM Livros l
             INNER JOIN Livros_Cursos lc ON lc.fk_id_livro = l.id_livro
             INNER JOIN Cursos c ON c.id_curso = lc.fk_id_curso
             ORDER BY c.id_curso, l.id_livro`,
            { type: QueryTypes.SELECT }
        );

        console.log('Registros SQL:', registros);

        const listCursosLivros = new Map();
        registros.forEach(row => {
            const idCurso = row.id_curso;
            const livro = { ...row };
            delete livro.id_curso;
            delete livro.nomeCurso;

            if (!listCursosLivros.has(idCurso)) listCursosLivros.set(idCurso, []);
            listCursosLivros.get(idCurso).push(livro);
        });

        const resultado = [];
        for (const [id, livros] of listCursosLivros.entries()) {
            resultado.push({ [id]: livros });
        }

        return resultado;
    },

    async listarLivrosPorCursoIds(idsCursos) {
        if (!idsCursos || !Array.isArray(idsCursos) || idsCursos.length === 0) {
            return {};
        }

        const registros = await sequelize.query(
            `SELECT l.*, c.id_curso, c.nome AS nomeCurso
             FROM Livros l
             INNER JOIN Livros_Cursos lc ON lc.fk_id_livro = l.id_livro
             INNER JOIN Cursos c ON c.id_curso = lc.fk_id_curso
             WHERE c.id_curso IN (:ids)
             ORDER BY c.id_curso, l.id_livro`,
            {
                replacements: { ids: idsCursos },
                type: QueryTypes.SELECT
            }
        );

        // Agrupa como no método 1
        const listCursosLivros = new Map();
        registros.forEach(row => {
            const idCurso = row.id_curso;
            const livro = { ...row };
            delete livro.id_curso;
            delete livro.nomeCurso;

            if (!listCursosLivros.has(idCurso)) listCursosLivros.set(idCurso, []);
            listCursosLivros.get(idCurso).push(livro);
        });

        const resultado = {};
        for (const [id, livros] of listCursosLivros.entries()) {
            resultado[id] = livros;
        }

        return resultado;
    }
};