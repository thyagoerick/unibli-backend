const sequelize = require('../db/conn.js')
const fatecDao = require('../models/dao/FatecDao.js')
const livroDao = require('../models/dao/LivroDao.js')
const usuarioDao = require('../models/dao/UsuarioDao.js')
const reservaDao = require('../models/dao/ReservaDao.js')
const livroFatecDao = require('../models/dao/LivroFatecDao.js')

const Reserva = require('../models/Reserva')

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
        const t = await sequelize.transaction();

        try {
            const {usuarioId, livroId, fatecId } = req.body;

            if (!fatecId || !usuarioId || !livroId) {
                return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
            }

            // Verifica se o usuário existe
            const usuario = await usuarioDao.buscaUsuarioPorId(usuarioId);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Verifica se o livro existe
            const livro = await livroDao.buscaLivroPorId(livroId);
            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            // Verifica se a Fatec existe
            const fatec = await fatecDao.buscaFatecPorId(fatecId); 
            if (!fatec) {
                return res.status(404).json({ error: 'Fatec não encontrada' });
            }

            // NOVO: Verifica limite de reservas
            const limiteAtingido = await reservaDao.verificarLimiteReservas(usuarioId);
            if (limiteAtingido) {
                return res.status(400).json({ error: 'Limite de 3 reservas ativas por usuário atingido' });
            }

            // Verifica se já existe uma reserva ativa para o usuário e o livro
            const reservaExistente = await reservaDao.verificaReservaAtiva(usuarioId, livroId);
            if (reservaExistente) {
                return res.status(409).json({ error: 'Já existe uma reserva ativa para este usuário e livro.' });
            }

            // Verifica se o livro está disponível na Fatec
            const livroFatec = await livroFatecDao.buscaLivroFatecPorId(livroId, fatecId);
            console.log('livroFatec', livroFatec);
            
            if (!livroFatec || livroFatec.quantidadeLivro <= 0) {
                return res.status(400).json({ mensagem: 'Livro não disponível na Fatec.' });
            } else if (livroFatec.quantidadeLivro >=1 ) {
                // Atualiza a quantidade do livro na Fatec
                await livroFatecDao.atualizarLivroFatec(livroId, fatecId, { quantidadeLivro: livroFatec.quantidadeLivro - 1 }, { transaction: t });
                // Atualiza a quantidade do livro na tabela Livro
                await livroDao.atualizarLivro(livroId, { 
                    disponibilidadeLivro: livro?.disponibilidadeLivro != 0 ? livro?.disponibilidadeLivro - 1 : livro?.quantidadeLivro - 1              
                }, { transaction: t });
            }

            // Cadastra a reserva
            await reservaDao.reservar(usuarioId, livroId, fatecId, { transaction: t });

            await t.commit();

            return res.status(201).json({ message: 'Reserva cadastrada com sucesso!' });

        } catch (error) {
            await t.rollback();
            console.error('Erro ao cadastrar reserva:', error);
            
            if (error.message.includes('Limite de 3 reservas')) {
                return res.status(400).json({ error: error.message });
            }
            
            return res.status(500).json({ error: 'Erro ao cadastrar reserva', details: error.message });
        }
    }

    // ATUALIZADO: Cancelar reserva (agora muda status)
    static async cancelarReserva(req, res) {
        const t = await sequelize.transaction();
        try {
            const { reservaID } = req.params;

            // Verifica se a reserva existe
            const reserva = await reservaDao.buscaReservaPorId(reservaID);
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            // Verifica se o livro existe
            const livro = await livroDao.buscaLivroPorId(reserva.fk_id_livro);
            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            // Busca o livro e a Fatec associados à reserva
            const livroFatec = await livroFatecDao.buscaLivroFatecPorId(reserva.fk_id_livro, reserva.fk_id_fatec);
            if (!livroFatec) {
                return res.status(404).json({ error: 'Livro na Fatec não encontrado' });
            }

            // Só libera o livro se a reserva estava ativa
            if (reserva.status === 'ativa') {
                // Atualiza a quantidade do livro na Fatec
                await livroFatecDao.atualizarLivroFatec(livroFatec.fk_id_livro, livroFatec.fk_id_fatec, { quantidadeLivro: livroFatec.quantidadeLivro + 1 }, { transaction: t });
                // Atualiza a quantidade do livro na tabela Livro
                await livroDao.atualizarLivro(livro.id_livro, { disponibilidadeLivro: livro.disponibilidadeLivro + 1 }, { transaction: t });
            }

            // Cancela a reserva (muda status)
            await reservaDao.cancelarReserva(reservaID, { transaction: t });

            await t.commit();

            return res.status(200).json({ message: 'Reserva cancelada com sucesso!' });

        } catch (error) {
            await t.rollback();
            console.error('Erro ao cancelar reserva:', error);
            return res.status(500).json({ error: 'Erro ao cancelar reserva', details: error.message });
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