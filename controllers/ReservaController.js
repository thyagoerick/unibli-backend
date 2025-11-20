const sequelize = require('../db/conn.js')
const fatecDao = require('../models/dao/FatecDao.js')
const livroDao = require('../models/dao/LivroDao.js')
const usuarioDao = require('../models/dao/UsuarioDao.js')
const reservaDao = require('../models/dao/ReservaDao.js')
const livroFatecDao = require('../models/dao/LivroFatecDao.js')

const Reserva = require('../models/Reserva')
const { sendEmail } = require('../services/EmailService.js'); 


module.exports = class ReservaController {

    static async listarReservas(req, res) {
        try {
            const reservas = await reservaDao.listarReservas();

            if (!reservas || reservas.length === 0) {
                return res.status(204).send();
            }
            return res.status(200).json({ reservas });
            
        } catch (error) {
            console.error('Erro ao listar reservas:', error);
            return res.status(500).json({ error: 'Erro ao listar reservas' });
        }
    }

    static async listarReservasPorUsuario(req, res) {
        try {
            const { id } = req.params;

            const idUsuario = parseInt(id);
            if (!id || isNaN(idUsuario)) {
                return res.status(400).json({ error: 'ID do usuário inválido' });
            }

            const reservas = await reservaDao.listarReservasPorUsuario(idUsuario);

            if (!reservas || reservas.length === 0) {
                return res.status(204).send();
            }

            return res.status(200).json({ reservas });
            
        } catch (error) {
            console.error('Erro ao listar reservas do usuário:', error);
            return res.status(500).json({ error: 'Erro ao listar reservas do usuário' });
        }
    }

    static async reservar(req, res) {
        const { usuarioId, livroId, fatecId } = req.body;

        if (!fatecId || !usuarioId || !livroId) {
            return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
        }

        try {
            // Usa a transação gerenciada do Sequelize. Se houver erro, ele faz rollback automaticamente.
            const resultado = await sequelize.transaction(async (t) => {

                // 1. Validações iniciais (sem bloqueio, pois são apenas leituras)
                const usuario = await usuarioDao.buscaUsuarioPorId(usuarioId, { transaction: t });
                if (!usuario) {
                    throw new Error('Usuário não encontrado');
                }

                const fatec = await fatecDao.buscaFatecPorId(fatecId, { transaction: t });
                if (!fatec) {
                    throw new Error('Fatec não encontrada');
                }

                // 2. Verifica limite de reservas (sem bloqueio, pois é apenas contagem)
                const limiteAtingido = await reservaDao.verificarLimiteReservas(usuarioId, { transaction: t });
                if (limiteAtingido) {
                    throw new Error('Limite de 3 reservas ativas por usuário atingido');
                }

                // 3. Verifica se já existe uma reserva ativa para o usuário e o livro
                const reservaExistente = await reservaDao.verificaReservaAtiva(usuarioId, livroId, { transaction: t });
                if (reservaExistente) {
                    throw new Error('Já existe uma reserva ativa para este usuário e livro.');
                }

                // 4. BLOQUEIO DE LINHA: Busca o livro e o LivroFatec com bloqueio de atualização (FOR UPDATE)
                // Isso impede que outras transações leiam ou modifiquem esses registros até o commit.
                const livro = await livroDao.buscaLivroPorId(livroId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!livro) {
                    throw new Error('Livro não encontrado');
                }

                const livroFatec = await livroFatecDao.buscaLivroFatecPorId(livroId, fatecId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                console.log('livroFatec (com lock)', livroFatec);

                // 5. Verifica disponibilidade e realiza a reserva
                if (!livroFatec || livroFatec.quantidadeLivro <= 0) {
                    throw new Error('Livro não disponível na Fatec.');
                }

                // Atualiza a quantidade do livro na Fatec
                await livroFatecDao.atualizarLivroFatec(livroId, fatecId, { quantidadeLivro: livroFatec.quantidadeLivro - 1 }, { transaction: t });

                // Atualiza a quantidade do livro na tabela Livro
                // A lógica de disponibilidadeLivro precisa ser ajustada para usar o valor atual do livro
                const novaDisponibilidade = (livro.disponibilidadeLivro || livro.quantidadeLivro) - 1;
                await livroDao.atualizarLivro(livroId, {
                    disponibilidadeLivro: novaDisponibilidade
                }, { transaction: t });

                   // Cadastra a reserva
                const novaReserva = await reservaDao.reservar(usuarioId, livroId, fatecId, { transaction: t });

                // 6. Envia a notificação de reserva realizada
                const dataReservaFormatada = novaReserva.dataDaReserva.toLocaleString('pt-BR');
                const dataExpiracaoFormatada = novaReserva.dataExpiracao.toLocaleDateString('pt-BR');
                
                const assunto = `Confirmação de Reserva - Livro: ${livro.titulo}`;
                const corpoEmail = `
                    <p>Prezado(a) ${usuario.nome},</p>
                    <p>Sua reserva foi realizada com sucesso!</p>
                    <p>Detalhes da Reserva:</p>
                    <ul>
                        <li><strong>Data da Reserva:</strong> ${dataReservaFormatada}</li>
                        <li><strong>Livro:</strong> ${livro.titulo}</li>
                        <li><strong>Fatec:</strong> ${fatec.nome}</li>
                        <li><strong>Data Limite para Retirada:</strong> ${dataExpiracaoFormatada}</li>
                    </ul>
                    <p>Lembre-se: Você tem até <strong>${dataExpiracaoFormatada}</strong> para retirar o livro, caso contrário, a reserva será cancelada automaticamente.</p>
                    <p>Obrigado por utilizar o UniBli.</p>
                `;

                // O e-mail do usuário está no objeto 'usuario'
                await sendEmail(usuario.email, assunto, corpoEmail, corpoEmail);

                // O commit é feito automaticamente pelo `sequelize.transaction(async (t) => { ... })`
                return { message: 'Reserva cadastrada com sucesso!' };
            });

            return res.status(201).json(resultado);

        } catch (error) {
            // O rollback é feito automaticamente pelo `sequelize.transaction` se um erro for lançado.
            console.error('Erro ao cadastrar reserva:', error);

            // Tratamento de erros para retornar o status HTTP correto
            let statusCode = 500;
            if (error.message.includes('não encontrado')) {
                statusCode = 404;
            } else if (error.message.includes('Limite de 3 reservas') || error.message.includes('não disponível')) {
                statusCode = 400;
            } else if (error.message.includes('Já existe uma reserva ativa')) {
                statusCode = 409;
            }

            return res.status(statusCode).json({ error: error.message || 'Erro ao cadastrar reserva' });
        }
    }

    // ATUALIZADO: Cancelar reserva (agora muda status)
    static async cancelarReserva(req, res) {
        const { reservaID } = req.params;

        try {
            // Usa a transação gerenciada do Sequelize
            const resultado = await sequelize.transaction(async (t) => {
                // 1. Busca a reserva com bloqueio
                const reserva = await reservaDao.buscaReservaPorId(reservaID, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!reserva) {
                    throw new Error('Reserva não encontrada');
                }

                // 2. Verifica se a reserva já está cancelada ou retirada
                if (reserva.status !== 'ativa') {
                    throw new Error(`A reserva ID ${reservaID} já está ${reserva.status}.`);
                }

                // 3. Busca o livro e o LivroFatec com bloqueio
                const livro = await livroDao.buscaLivroPorId(reserva.fk_id_livro, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!livro) {
                    throw new Error('Livro não encontrado');
                }

                const livroFatec = await livroFatecDao.buscaLivroFatecPorId(reserva.fk_id_livro, reserva.fk_id_fatec, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!livroFatec) {
                    throw new Error('Livro na Fatec não encontrado');
                }

                // 4. Libera o livro (incrementa a quantidade)
                // Atualiza a quantidade do livro na Fatec
                await livroFatecDao.atualizarLivroFatec(livroFatec.fk_id_livro, livroFatec.fk_id_fatec, { quantidadeLivro: livroFatec.quantidadeLivro + 1 }, { transaction: t });

                // Atualiza a quantidade do livro na tabela Livro
                await livroDao.atualizarLivro(livro.id_livro, { disponibilidadeLivro: livro.disponibilidadeLivro + 1 }, { transaction: t });

                // 5. Cancela a reserva (muda status)
                await reservaDao.cancelarReserva(reservaID, { transaction: t });

                // 6. Envia a notificação de cancelamento
                const usuario = await usuarioDao.buscaUsuarioPorId(reserva.fk_id_usuario, { transaction: t });
                const fatec = await fatecDao.buscaFatecPorId(reserva.fk_id_fatec, { transaction: t });
                
                const assunto = `Confirmação de Cancelamento de Reserva - Livro: ${livro.titulo}`;
                const corpoEmail = `
                    <p>Prezado(a) ${usuario.nome},</p>
                    <p>Sua reserva para o livro <strong>${livro.titulo}</strong> na Fatec <strong>${fatec.nome}</strong> foi cancelada com sucesso.</p>
                    <p>O livro foi devolvido ao acervo e está novamente disponível para reserva.</p>
                    <p>Obrigado por utilizar o UniBli.</p>
                `;

                await sendEmail(usuario.email, assunto, corpoEmail, corpoEmail);

                return { message: 'Reserva cancelada com sucesso!' };
            });

            return res.status(200).json(resultado);

        } catch (error) {
            console.error('Erro ao cancelar reserva:', error);
            
            let statusCode = 500;
            if (error.message.includes('não encontrada')) {
                statusCode = 404;
            } else if (error.message.includes('já está')) {
                statusCode = 400;
            }

            return res.status(statusCode).json({ error: error.message || 'Erro ao cancelar reserva' });
        }
    }

    // NOVO: Marcar reserva como retirada
    static async marcarComoRetirada(req, res) {
        try {
            const { reservaID } = req.params;

            const reserva = await reservaDao.buscaReservaPorId(reservaID);
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            await reservaDao.marcarComoRetirada(reservaID);

            return res.status(200).json({ message: 'Reserva marcada como retirada com sucesso!' });

        } catch (error) {
            console.error('Erro ao marcar reserva como retirada:', error);
            return res.status(500).json({ error: 'Erro ao marcar reserva como retirada', details: error.message });
        }
    }

    // NOVO: Expirar reservas automaticamente (para ser chamado por um job/cron)
    static async expirarReservas(req, res) {
        try {
            const reservasExpiradas = await reservaDao.expirarReservas();
            const livrosLiberados = await reservaDao.liberarLivrosReservasExpiradas();

            return res.status(200).json({ 
                message: 'Reservas expiradas processadas com sucesso',
                reservasExpiradas: reservasExpiradas,
                livrosLiberados: livrosLiberados
            });

        } catch (error) {
            console.error('Erro ao expirar reservas:', error);
            return res.status(500).json({ error: 'Erro ao expirar reservas', details: error.message });
        }
    }

    // Endpoint para debug do sistema de expiração
    static async debugExpirarReservas(req, res) {
        const t = await sequelize.transaction();
        
        try {
            const { forcarExpiracao, apenasVerificar } = req.query;
            
            console.log('🔧 Iniciando debug do sistema de expiração...');
            
            let resultado = {
                timestamp: new Date().toISOString(),
                reservasAtivas: 0,
                reservasExpiradas: 0,
                livrosLiberados: 0,
                reservasProximas: [],
                detalhes: {}
            };

            // Conta reservas ativas
            resultado.reservasAtivas = await Reserva.count({
                where: { status: 'ativa' }
            });

            // Verifica reservas próximas da expiração
            resultado.reservasProximas = await reservaDao.verificarReservasProximasExpiracao(24);

            // Se forçar expiração, expira reservas com mais de 1 minuto (para teste)
            if (forcarExpiracao === 'true') {
                console.log('⚡ Forçando expiração de reservas antigas...');
                
                // Força expiração de reservas com mais de 1 minuto
                const [reservasForcadas] = await sequelize.query(
                    `UPDATE Reservas SET status = 'expirada' 
                    WHERE status = 'ativa' 
                    AND dataExpiracao <= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
                    { transaction: t }
                );
                
                resultado.detalhes.reservasForcadas = reservasForcadas;
                console.log(`📝 ${reservasForcadas} reservas forçadas à expiração`);
            }

            // Se não for apenas verificação, processa as expirações
            if (apenasVerificar !== 'true') {
                // Processa reservas expiradas
                resultado.reservasExpiradas = await reservaDao.expirarReservas({ transaction: t });
                console.log(`📊 ${resultado.reservasExpiradas} reservas expiradas processadas`);

                // Libera livros das reservas expiradas
                resultado.livrosLiberados = await reservaDao.liberarLivrosReservasExpiradas({ transaction: t });
                console.log(`📚 ${resultado.livrosLiberados} livros liberados`);
            }

            await t.commit();

            // Log detalhado
            console.log('📋 Resultado do debug:');
            console.log(`   - Reservas ativas: ${resultado.reservasAtivas}`);
            console.log(`   - Reservas expiradas: ${resultado.reservasExpiradas}`);
            console.log(`   - Livros liberados: ${resultado.livrosLiberados}`);
            console.log(`   - Reservas próximas: ${resultado.reservasProximas.length}`);

            return res.status(200).json({
                message: 'Debug do sistema de expiração executado com sucesso',
                ...resultado
            });

        } catch (error) {
            await t.rollback();
            console.error('❌ Erro no debug de expiração:', error);
            return res.status(500).json({ 
                error: 'Erro no debug de expiração', 
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Endpoint para status do sistema de reservas
    static async statusSistemaReservas(req, res) {
        try {
            const status = {
                timestamp: new Date().toISOString(),
                reservas: {
                    ativas: await Reserva.count({ where: { status: 'ativa' } }),
                    canceladas: await Reserva.count({ where: { status: 'cancelada' } }),
                    expiradas: await Reserva.count({ where: { status: 'expirada' } }),
                    retiradas: await Reserva.count({ where: { status: 'retirada' } }),
                    concluidas: await Reserva.count({ where: { status: 'concluida' } })
                },
                proximasExpiracao: await reservaDao.verificarReservasProximasExpiracao(24),
                jobs: {
                    expiracao: 'ativo',
                    notificacao: 'ativo',
                    limpeza: 'ativo'
                }
            };

            return res.status(200).json({
                message: 'Status do sistema de reservas',
                ...status
            });

        } catch (error) {
            console.error('Erro ao obter status do sistema:', error);
            return res.status(500).json({ 
                error: 'Erro ao obter status do sistema', 
                details: error.message 
            });
        }
    }
}