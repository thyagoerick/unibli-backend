const cron = require('node-cron');
const reservaDao = require('../models/dao/ReservaDao');
const { sendEmail } = require('../services/EmailService'); // Importa o serviço de e-mail (caminho corrigido)
const Usuario = require('../models/Usuario'); // Importa o modelo de Usuário
const Livro = require('../models/Livro'); // Importa o modelo de Livro
const Fatec = require('../models/Fatec'); // Importa o modelo de Fatec

function iniciarJobReservas() {
    // Job principal: expira reservas e libera livros (executa a cada hora)
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🔄 Executando job de expiração de reservas...');
            
            // 1. Primeiro expira as reservas (muda status para 'expirada')
            const reservasExpiradas = await reservaDao.expirarReservas();
            console.log(`📊 ${reservasExpiradas} reservas marcadas como expiradas`);
            
            // 2. Libera os livros das reservas expiradas
            const livrosLiberados = await reservaDao.liberarLivrosReservasExpiradas();
            console.log(`📚 ${livrosLiberados} livros liberados`);
            
            console.log('✅ Job de expiração de reservas concluído com sucesso');
            
        } catch (error) {
            console.error('❌ Erro no job de expiração de reservas:', error);
        }
    });

    // Job de notificação: verifica reservas próximas da expiração (executa a cada 6 horas)
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('🔔 Executando job de notificação de reservas...');
            
            // A função verificarReservasProximasExpiracao já retorna os dados de Livro e Fatec
            const reservasProximas = await reservaDao.verificarReservasProximasExpiracao(24);
            
            if (reservasProximas.length > 0) {
                console.log(`📧 ${reservasProximas.length} reservas próximas da expiração para notificar`);
                
                for (const reserva of reservasProximas) {
                    try {
                        // Busca o usuário para obter o e-mail
                        // Os dados de Livro e Fatec já devem vir do DAO, mas o usuário precisa ser buscado
                        const usuario = await Usuario.findByPk(reserva.fk_id_usuario);
                        
                        if (!usuario) {
                            console.warn(`Usuário não encontrado para reserva ID: ${reserva.id_reserva}. Pulando notificação.`);
                            continue;
                        }

                        // Garante que dataExpiracao é um objeto Date antes de formatar
                        const dataExpiracao = new Date(reserva.dataExpiracao);
                        const dataExpiracaoFormatada = dataExpiracao.toLocaleDateString('pt-BR');
                        
                        // O DAO deve retornar os includes, mas para garantir a robustez, vamos usar o que está disponível
                        const tituloLivro = reserva.Livro ? reserva.Livro.titulo : 'Livro Desconhecido';
                        const nomeFatec = reserva.Fatec ? reserva.Fatec.nome : 'Fatec Desconhecida';

                        const assunto = `Lembrete: Sua Reserva Expira em Breve - Livro: ${tituloLivro}`;
                        const corpoEmail = `
                            <p>Prezado(a) ${usuario.nome},</p>
                            <p>Este é um lembrete amigável de que sua reserva para o livro <strong>${tituloLivro}</strong> na Fatec <strong>${nomeFatec}</strong> está prestes a expirar.</p>
                            <p>O prazo final para retirada é <strong>${dataExpiracaoFormatada}</strong>.</p>
                            <p>Por favor, dirija-se à Fatec para retirar o livro antes que a reserva seja cancelada automaticamente e o livro retorne ao acervo.</p>
                            <p>Obrigado por utilizar o UniBli.</p>
                        `;

                        await sendEmail(usuario.email, assunto, corpoEmail, corpoEmail);
                        console.log(`✅ Notificação enviada para o usuário ${usuario.nome} (Reserva ID: ${reserva.id_reserva})`);

                    } catch (error) {
                        console.error(`❌ Erro ao notificar reserva ID ${reserva.id_reserva}:`, error);
                    }
                }
                
            } else {
                console.log('✅ Nenhuma reserva próxima da expiração para notificar');
            }
            
        } catch (error) {
            console.error('❌ Erro no job de notificação:', error);
        }
    });

    // Job de limpeza: remove reservas expiradas antigas (executa uma vez por dia à meia-noite)
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('🧹 Executando job de limpeza de reservas antigas...');
            
            // Remove reservas expiradas há mais de 30 dias
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 30);
            
            // Remove reservas com status 'cancelada' ou 'expirada_processada' há mais de 30 dias
            const resultado = await reservaDao.removerReservasAntigas(dataLimite, ['cancelada', 'expirada_processada']);
            console.log(`🗑️ ${resultado} reservas antigas removidas`);
            
        } catch (error) {
            console.error('❌ Erro no job de limpeza:', error);
        }
    });
    
    console.log('✅ Jobs de reservas agendados:');
    console.log('   - Expiração: a cada hora');
    console.log('   - Notificação: a cada 6 horas'); 
    console.log('   - Limpeza: diariamente à meia-noite');
}

module.exports = { iniciarJobReservas };