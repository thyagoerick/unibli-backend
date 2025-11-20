const nodemailer = require('nodemailer');

// Configuração do Nodemailer
// Usaremos variáveis de ambiente para o host, porta, usuário e senha
// O usuário deve configurar estas variáveis no seu ambiente:
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Exemplo: 'smtp.gmail.com'
    port: process.env.EMAIL_PORT || 465, // Exemplo: 465 (SSL) ou 587 (TLS)
    secure: process.env.EMAIL_PORT == 465, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail (ex: seu.email@gmail.com)
        pass: process.env.EMAIL_PASS, // Sua senha ou App Password (para Gmail)
    },
    // Descomente se estiver usando um ambiente de desenvolvimento sem certificado válido
    tls: {
         rejectUnauthorized: false
    }
});

/**
 * Envia um e-mail transacional usando o Nodemailer.
 * @param {string} to - E-mail do destinatário.
 * @param {string} subject - Assunto do e-mail.
 * @param {string} text - Conteúdo do e-mail em texto puro.
 * @param {string} html - Conteúdo do e-mail em HTML.
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, text, html) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'no-reply@unibli.com', // O remetente será o mesmo usuário de autenticação
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail enviado com sucesso para: ${to}`);
        console.log('Mensagem ID:', info.messageId);
    } catch (error) {
        console.error(`❌ Erro ao enviar e-mail para ${to}:`, error.message);
        // Em um ambiente de produção, você pode querer relançar o erro ou logar em um sistema de monitoramento
        throw new Error('Falha ao enviar e-mail via Nodemailer.');
    }
}

module.exports = {
    sendEmail
};