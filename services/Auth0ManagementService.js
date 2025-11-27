require('dotenv').config();
const {
    AUTH0_BASE_URL,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET
} = process.env;

module.exports = class Auth0ManagementService {

    // Usado como endpoint HTTP
    // static async getToken(req, res, next) {
    //     try {
    //         const response = await fetch(`${AUTH0_BASE_URL}/oauth/token`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 client_id: AUTH0_CLIENT_ID,
    //                 client_secret: AUTH0_CLIENT_SECRET,
    //                 audience: `${AUTH0_BASE_URL}/api/v2/`,
    //                 grant_type: 'client_credentials'
    //             })
    //         });

    //         const data = await response.json();
    //         return res.json(data);

    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // Usado INTERNAMENTE no backend (para excluir, atualizar etc)
    static async getToken() {
        try {
            const response = await fetch(`${AUTH0_BASE_URL}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: AUTH0_CLIENT_ID,
                    client_secret: AUTH0_CLIENT_SECRET,
                    audience: `${AUTH0_BASE_URL}/api/v2/`,
                    grant_type: 'client_credentials'
                })
            });

            const data = await response.json();

            if (!data.access_token) {
                console.error("Erro ao obter token Auth0:", data);
                throw new Error("Não foi possível obter token de gerenciamento Auth0");
            }

            return data;

        } catch (error) {
            console.error("Erro ao buscar token do Auth0:", error);
            throw error;
        }
    }
}
