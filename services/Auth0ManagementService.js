require('dotenv').config()
const {
    AUTH0_BASE_URL,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET
} = process.env


module.exports = class Auth0ManagementService {


    static async getToken(req, res, next) {
        try {
            const response = await fetch(`${AUTH0_BASE_URL}/oauth/token`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: `${AUTH0_CLIENT_ID}`,
                    client_secret: `${AUTH0_CLIENT_SECRET}`,
                    audience: `${AUTH0_BASE_URL}/api/v2/`,
                    grant_type: 'client_credentials'
                })
            });

            const data = await response.json();
            // Envia os dados de volta como resposta para o navegador
            //console.log(data);
            res.json(data);
        } catch (error) {
            // Se houver um erro, repassa para o próximo middleware de erro
            next(error);
        }
    }
}
