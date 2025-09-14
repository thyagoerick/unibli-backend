const sequelize = require('../db/conn.js');
const cursoDao = require('../models/dao/CursoDao.js');
const fatecCursoDao = require('../models/dao/FatecCursoDao.js'); // Importe este
const UniBliService = require('../services/UniBliService.js');


module.exports = class CursoController {

    static async listarCursos(req, res){
        try {
            const cursos = await cursoDao.listarCursos()
        
            if (!cursos || cursos.length === 0) {
                return res.status(204).send();// No Content = Sem cursos cadastrados
            }
        
            // Captura os parâmetros da query
            const { nome } = req.query;
            //console.log('Query recebida (req.query):', req.query);

            // Filtragem local dos livros
            if(nome){
                const cursosFiltrados = cursos.filter(curso =>
                curso.nome.toLowerCase().includes(nome.toLowerCase())
                );
                return res.status(200).json(cursosFiltrados);
            }else{
                return res.status(200).json(cursos);
            }
        } catch (error) {
            console.error('Erro ao listar cursos:', error);
            return res.status(500).json({ error: 'Erro ao listar cursos', details: error.message });
        }        
    }



    static async cadastrarCursos(req, res) {
        const cursosIntegrados = await UniBliService.integraCursos();
        const t = await sequelize.transaction();

        try {
            for (const curso of cursosIntegrados) {
                try {
                    if (!curso || !curso.nome || !curso.fatec) {
                        console.warn("Curso com dados incompletos (nome ou fatec faltando), pulando:", curso);
                        continue;
                    }

                    // ETAPA 1: GARANTIR QUE O CURSO EXISTE NA TABELA PRINCIPAL 'CURSOS'
                    let cursoCadastrado = await cursoDao.buscaCursoPorNome(curso.nome, { transaction: t });

                    if (!cursoCadastrado) {
                        // Se não existe, cadastra na tabela principal
                        cursoCadastrado = await cursoDao.cadastrarCurso(
                            { nome: curso.nome /* adicione outros campos se houver */ },
                            { transaction: t }
                        );
                    }

                    // ETAPA 2: GARANTIR QUE A ASSOCIAÇÃO EXISTE NA TABELA 'FATECS_CURSOS'
                    const associacaoExistente = await fatecCursoDao.buscaCursoFatec(
                        cursoCadastrado.id_curso,
                        curso.fatec,
                        { transaction: t }
                    );

                    if (!associacaoExistente) {
                        // Se a associação não existe, cria
                        await fatecCursoDao.cadastrarCursoFatec(
                            {
                                fk_id_curso: cursoCadastrado.id_curso,
                                fk_id_fatec: curso.fatec
                            },
                            { transaction: t }
                        );
                    }
                    // Se a associação já existe, não fazemos nada, apenas pulamos.

                } catch (error) {
                    console.error(`Erro ao processar o curso "${curso.nome}" para a Fatec ${curso.fatec}:`, error);
                    throw error; // Joga o erro para o catch principal para reverter a transação
                }
            }

            await t.commit();
            res.status(201).json({ message: "Cursos e suas associações cadastrados com sucesso!" });

        } catch (error) {
            await t.rollback();
            console.error("Erro geral ao cadastrar cursos. A transação foi revertida:", error);
            res.status(500).json({ error: "Erro ao cadastrar cursos", details: error.message });
        }
    }

    static async buscaCursoPorId(req, res) {
        try {
            const cursoId = req.params.id;
            if (!cursoId) {
                return res.status(400).json({ error: "ID do curso não fornecido." });
            }

            // Busca o curso principal
            const curso = await cursoDao.buscaCursoPorId(cursoId); // Você precisará criar este método no DAO

            if (!curso) {
                return res.status(404).json({ message: "Curso não encontrado." });
            }

            // Opcional, mas muito útil: Buscar as Fatecs associadas a este curso
            const associacoes = await fatecCursoDao.listarFatecsPorCurso(cursoId); // Crie este método também

            // Monta a resposta final
            const resposta = {
                ...curso,
                fatecs: associacoes.map(assoc => assoc.fk_id_fatec) // Exemplo: [1, 2]
            };

            res.status(200).json(resposta);

        } catch (error) {
            console.error(`Erro ao buscar curso por ID:`, error);
            res.status(500).json({ error: "Erro interno ao buscar curso." });
        }
    }

    static async buscarFatecsDeCurso(req, res) {
    try {
        const { id } = req.params; // Pega o ID do curso da URL (ex: /cursos/5/fatecs)

        // 1. Verifica se o curso realmente existe
        const curso = await cursoDao.buscaCursoPorId(id);
        if (!curso) {
            return res.status(404).json({ message: "Curso não encontrado." });
        }

        // 2. Usa o novo método do DAO para encontrar as Fatecs
        const fatecs = await fatecCursoDao.buscarFatecsPorCurso(id);

        // 3. Monta a resposta final
        const resposta = {
            curso: {
                id_curso: curso.id_curso,
                nome: curso.nome
            },
            fatecs: fatecs // O método do DAO já retorna a lista de objetos da Fatec
        };

        return res.status(200).json(resposta);

    } catch (error) {
        console.error("Erro ao buscar Fatecs por curso:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

}