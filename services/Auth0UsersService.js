const axios = require('axios');
require('dotenv').config();

const { AUTH0_BASE_URL } = process.env;

class Auth0UsersService {

    static async deletarUsuario(userId, accessToken) {
        try {
            await axios.delete(`${AUTH0_BASE_URL}/api/v2/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return true;

        } catch (error) {
            console.error("Erro ao deletar usuário no Auth0:", error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = Auth0UsersService;
