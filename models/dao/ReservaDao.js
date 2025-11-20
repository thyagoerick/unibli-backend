const { Op } = require('sequelize'); // ADICIONE ESTA LINHA
const Reserva = require('../Reserva')
const Livro = require('../Livro') 
const Fatec = require('../Fatec')
const sequelize = require('../../db/conn')
const Usuario = require('../Usuario') // Adicionado para buscar o e-mail do usuário
const { sendEmail } = require('../../services/EmailService'); // Adicionado para envio de e-mail (caminho corrigido)

// ADICIONE ESTAS IMPORTACOES
const livroDao = require('./LivroDao')
const livroFatecDao = require('./LivroFatecDao')

module.exports = {
    async listarReservas() {
        return await Reserva.findAll({ raw: true })
    },

    async listarReservasPorUsuario(id) {
        return await Reserva.findAll({ 
            where: { fk_id_usuario: id },
            include: [
                {
                    model: Livro,
                    attributes: ['id_livro', 'titulo']
                },
                {
                    model: Fatec,
                    attributes: ['id_fatec', 'nome']
                }
            ],
            raw: false
        });
    },

    async buscaReservaPorId(id, options = {}) {
        const reserva = await Reserva.findByPk(id, options)
        if (!reserva) {
            throw new Error('Reserva não encontrada')
        }
        return reserva
    },

    // NOVO: Verificar limite de reservas por usuário
    async verificarLimiteReservas(usuarioId, options = {}) {
        const reservasAtivas = await Reserva.count({
            where: {
                fk_id_usuario: usuarioId,
                status: 'ativa'
            }
        }, options);
        
        return reservasAtivas >= 3; // Retorna true se atingiu o limite
    },

    async reservar(usuarioId, livroId, fatecId, options = {}) {
        if (!usuarioId || !livroId || !fatecId) {
            throw new Error('Dados obrigatórios não fornecidos')
        }
        
        // Verifica se usuário já atingiu o limite de reservas
        const limiteAtingido = await this.verificarLimiteReservas(usuarioId, options);
        if (limiteAtingido) {
            throw new Error('Limite de 3 reservas ativas por usuário atingido');
        }
        
        // Calcula a data de expiração para 3 dias
        const dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + 3);
        
        return await Reserva.create({
            dataDaReserva: new Date(),
            dataExpiracao: dataExpiracao,
            fk_id_livro: livroId,
            fk_id_usuario: usuarioId, 
            fk_id_fatec: fatecId,
            status: 'ativa'
        }, options)
    },

    async atualizarReserva(id, dadosAtualizados) {
        try {
            const reserva = await Reserva.findByPk(id)
            if (!reserva) {
                throw new Error('Reserva não encontrada')
            }

            await reserva.update(dadosAtualizados)
            return reserva;
        } catch (error) {
            throw new Error('Erro ao atualizar a reserva: ' + error.message)
        }
    },

    // ATUALIZADO: Cancelar reserva (muda status em vez de deletar)
    async cancelarReserva(id, options = {}) {
        try {
            const reserva = await Reserva.findByPk(id, options)
            if (!reserva) {
                throw new Error('Reserva não encontrada')
            }
            
            // Atualiza status para cancelada em vez de deletar
            await reserva.update({ status: 'cancelada' }, options)
            return { message: 'Reserva cancelada com sucesso' }
        } catch (error) {
            throw new Error('Erro ao cancelar a reserva: ' + error.message)
        }
    },

    // NOVO: Marcar reserva como retirada
    async marcarComoRetirada(id, options = {}) {
        try {
            const reserva = await Reserva.findByPk(id, options)
            if (!reserva) {
                throw new Error('Reserva não encontrada')
            }
            
            await reserva.update({ status: 'retirada' }, options)
            return { message: 'Reserva marcada como retirada com sucesso' }
        } catch (error) {
            throw new Error('Erro ao marcar reserva como retirada: ' + error.message)
        }
    },

    // Expirar reservas com transação
    async expirarReservas(options = {}) {
        try {
            const resultado = await Reserva.update(
                { status: 'expirada' },
                {
                    where: {
                        status: 'ativa',
                        dataExpiracao: {
                            [Op.lt]: new Date() // CORRIGIDO: Usando Op diretamente
                        }
                    },
                    ...options
                }
            );
            
            return resultado[0];
        } catch (error) {
            throw new Error('Erro ao expirar reservas: ' + error.message);
        }
    },

    // Contar reservas por status
    async contarReservasPorStatus(status) {
        try {
            return await Reserva.count({
                where: { status: status }
            });
        } catch (error) {
            throw new Error('Erro ao contar reservas por status: ' + error.message);
        }
    },

    // Contar reservas ativas
    async contarReservasAtivas() {
        try {
            return await Reserva.count({
                where: { status: 'ativa' }
            });
        } catch (error) {
            throw new Error('Erro ao contar reservas ativas: ' + error.message);
        }
    },

    // Liberar livros com transação - CORRIGIDO
    async liberarLivrosReservasExpiradas(options = {}) {
        // Se options já contém uma transação, usa ela. Se não, cria uma nova.
        const transaction = options.transaction || await sequelize.transaction();
        let shouldCommit = !options.transaction; // Só faz commit se criou a transação
        
        try {
            // Busca reservas expiradas que ainda não foram processadas
            const reservasExpiradas = await Reserva.findAll({
                where: {
                    status: 'expirada'
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            let livrosLiberados = 0;

            // Para cada reserva expirada, libera o livro
            for (const reserva of reservasExpiradas) {
                try {
                    // 1. Busca dados adicionais para notificação e liberação
                    const [livro, fatec, usuario] = await Promise.all([
                        livroDao.buscaLivroPorId(reserva.fk_id_livro, { transaction }),
                        Fatec.findByPk(reserva.fk_id_fatec, { transaction }),
                        Usuario.findByPk(reserva.fk_id_usuario, { transaction })
                    ]);

                    if (!livro || !fatec || !usuario) {
                        console.warn(`Dados incompletos para reserva expirada ID: ${reserva.id_reserva}. Pulando liberação.`);
                        continue;
                    }

                    // Busca o relacionamento livro-fatec
                    const livroFatec = await livroFatecDao.buscaLivroFatecPorId(
                        reserva.fk_id_livro, 
                        reserva.fk_id_fatec,
                        { transaction }
                    );
                    
                    if (!livroFatec) {
                        console.warn(`Relacionamento livro-fatec não encontrado para reserva ID: ${reserva.id_reserva}. Pulando liberação.`);
                        continue;
                    }

                    // 2. Libera o acervo (Incrementa a quantidade)
                    // Incrementa a quantidade disponível na Fatec
                    await livroFatecDao.atualizarLivroFatec(
                        reserva.fk_id_livro, 
                        reserva.fk_id_fatec, 
                        { 
                            quantidadeLivro: livroFatec.quantidadeLivro + 1 
                        }, 
                        { transaction }
                    );

                    // Incrementa a disponibilidade geral do livro
                    const novaDisponibilidade = (livro.disponibilidadeLivro || 0) + 1;
                    await livroDao.atualizarLivro(
                        reserva.fk_id_livro, 
                        { 
                            disponibilidadeLivro: novaDisponibilidade 
                        }, 
                        { transaction }
                    );

                    // 3. Envia a notificação de expiração
                    const assunto = `Reserva Expirada - Livro: ${livro.titulo}`;
                    const corpoEmail = `
                        <p>Prezado(a) ${usuario.nome},</p>
                        <p>Informamos que sua reserva para o livro <strong>${livro.titulo}</strong> na Fatec <strong>${fatec.nome}</strong> expirou.</p>
                        <p>O prazo de 3 dias para retirada foi excedido e o livro foi devolvido ao acervo.</p>
                        <p>Se ainda deseja o livro, por favor, realize uma nova reserva.</p>
                        <p>Obrigado por utilizar o UniBli.</p>
                    `;

                    await sendEmail(usuario.email, assunto, corpoEmail, corpoEmail);

                    livrosLiberados++;
                    console.log(`📚 Livro liberado e notificação enviada: Reserva ID ${reserva.id_reserva}, Livro: ${livro.titulo}`);

                } catch (error) {
                    console.error(`❌ Erro ao processar reserva expirada ID ${reserva.id_reserva}:`, error);
                    // O erro de envio de e-mail não deve impedir a liberação do livro
                    // Se o erro for de banco de dados, o rollback será tratado no bloco catch externo
                    continue;
                }
            }

            if (shouldCommit) {
                await transaction.commit();
            }
            
            console.log(`✅ Processamento de reservas expiradas concluído: ${livrosLiberados} livros liberados`);
            return livrosLiberados;
            
        } catch (error) {
            if (shouldCommit) {
                await transaction.rollback();
            }
            console.error('❌ Erro ao liberar livros de reservas expiradas:', error);
            throw new Error('Erro ao liberar livros de reservas expiradas: ' + error.message);
        }
    },

    // MÉTODO PARA VERIFICAR RESERVAS PRÓXIMAS DA EXPIRAÇÃO - CORRIGIDO
    async verificarReservasProximasExpiracao(horasAntecedencia = 24) {
        try {
            const dataLimite = new Date();
            dataLimite.setHours(dataLimite.getHours() + horasAntecedencia);

            const reservasProximas = await Reserva.findAll({
                where: {
                    status: 'ativa',
                    dataExpiracao: {
                        [Op.lte]: dataLimite // CORRIGIDO: Usando Op diretamente
                    }
                },
                include: [
                    {
                        model: Livro,
                        attributes: ['id_livro', 'titulo']
                    },
                    {
                        model: Fatec,
                        attributes: ['id_fatec', 'nome']
                    }
                ]
            });

            return reservasProximas;
        } catch (error) {
            throw new Error('Erro ao verificar reservas próximas da expiração: ' + error.message);
        }
    },

    async verificaReservaAtiva(usuarioId, livroId, options = {}) {
        try {
            const reservaExistente = await Reserva.findOne({
                where: {
                    fk_id_usuario: usuarioId,
                    fk_id_livro: livroId,
                    status: 'ativa'
                },
                ...options
            });

            return !!reservaExistente;
        } catch (error) {
            throw new Error('Erro ao verificar reserva existente: ' + error.message);
        }
    },

    // Remover reservas antigas (para limpeza)
    async removerReservasAntigas(dataLimite, options = {}) {
        try {
            const resultado = await Reserva.destroy({
                where: {
                    status: 'expirada',
                    dataExpiracao: {
                        [Op.lt]: dataLimite // CORRIGIDO: Usando Op diretamente
                    }
                },
                ...options
            });

            return resultado;
        } catch (error) {
            throw new Error('Erro ao remover reservas antigas: ' + error.message);
        }
    },

    // Método para teste - criar reserva de teste que expira em 1 minuto
    async criarReservaTeste(usuarioId, livroId, fatecId, options = {}) {
        const dataExpiracao = new Date();
        dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 1); // Expira em 1 minuto
        
        return await Reserva.create({
            dataDaReserva: new Date(),
            dataExpiracao: dataExpiracao,
            fk_id_livro: livroId,
            fk_id_usuario: usuarioId, 
            fk_id_fatec: fatecId,
            status: 'ativa'
        }, options);
    }
}