const cron = require('node-cron');
const reservaDao = require('../models/dao/ReservaDao');

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
            
            const reservasProximas = await reservaDao.verificarReservasProximasExpiracao(24);
            if (reservasProximas.length > 0) {
                console.log(`📧 ${reservasProximas.length} reservas próximas da expiração para notificar`);
                // Aqui você pode implementar o envio de emails/notificações
                // await enviarNotificacoesReservasProximas(reservasProximas);
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
            
            const resultado = await reservaDao.removerReservasAntigas(dataLimite);
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