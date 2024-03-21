module.exports = class Auth0ManagementService {

    static async getToken(req, res, next) {
        try {
            const response = await fetch('https://unibli.us.auth0.com/oauth/token', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: 'XJeGZKEIvLbqrjdIAP3LYzKjSRduEklc',
                    client_secret: 'j1bwRPuAH46947Bj2MtJIbQO86t5RLkHvz0vYL1sBEgdSvDrAxwQWM5k3xBjiBuk',
                    audience: 'https://unibli.us.auth0.com/api/v2/',
                    grant_type: 'client_credentials'
                })
            });

            const data = await response.json();
            // Envia os dados de volta como resposta para o navegador
            res.json(data);
        } catch (error) {
            // Se houver um erro, repassa para o próximo middleware de erro
            next(error);
        }
    }
}
