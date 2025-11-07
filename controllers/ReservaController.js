const sequelize = require('../db/conn.js')
const fatecDao = require('../models/dao/FatecDao.js')
const livroDao = require('../models/dao/LivroDao.js')
const usuarioDao = require('../models/dao/UsuarioDao.js')
const reservaDao = require('../models/dao/ReservaDao.js')
const livroFatecDao = require('../models/dao/LivroFatecDao.js')

module.exports = class ReservaController {

    static async listarReservas(req, res) {
        try {
            const reservas = await reservaDao.listarReservas();

            if (!reservas || reservas.length === 0) {
                return res.status(204).send(); // No Content = Sem reservas cadastradas
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

            // Converter para número e validar
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
        const t = await sequelize.transaction(); // Inicia uma transação

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

             // Verifica se já existe uma reserva ativa para o usuário e o livro
            const reservaExistente = await reservaDao.verificaReservaAtiva(usuarioId, livroId);
            if (reservaExistente) {
                return res.status(409).json({ error: 'Já existe uma reserva ativa para este usuário e livro.' });
            }else if (reservaExistente === null) {
                // Se não existe reserva ativa, continua o processo de reserva
                console.log('Nenhuma reserva ativa encontrada para o usuário e livro.');
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

            await t.commit(); // Confirma a transação

            return res.status(201).json({ message: 'Reserva cadastrada com sucesso!' });

        } catch (error) {
            console.error('Erro ao cadastrar reserva:', error);
            return res.status(500).json({ error: 'Erro ao cadastrar reserva', details: error.message });
        }
    }

    // Método para cancelar uma reserva
    static async cancelarReserva(req, res) {
        const t = await sequelize.transaction(); // Inicia uma transação
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


            // Atualiza a quantidade do livro na Fatec
            await livroFatecDao.atualizarLivroFatec(livroFatec.fk_id_livro, livroFatec.fk_id_fatec, { quantidadeLivro: livroFatec.quantidadeLivro + 1 }, { transaction: t });
            // Atualiza a quantidade do livro na tabela Livro
            await livroDao.atualizarLivro(livro.id_livro, { disponibilidadeLivro: livro.disponibilidadeLivro + 1 }, { transaction: t });

            // Cancela a reserva
            await reservaDao.cancelarReserva(reservaID, { transaction: t });

            await t.commit(); // Confirma a transação

            return res.status(200).json({ message: 'Reserva cancelada com sucesso!' });

        } catch (error) {
            await t.rollback(); // Desfaz a transação em caso de erro
            console.error('Erro ao cancelar reserva:', error);
            return res.status(500).json({ error: 'Erro ao cancelar reserva', details: error.message });
        }
    }
}