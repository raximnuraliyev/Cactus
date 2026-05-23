import { Router } from 'express';
import { TournamentController } from '../controllers/tournamentController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.post('/lobby', TournamentController.createLobby);
router.get('/lobby/:id', TournamentController.getLobby);
router.post('/lobby/:id/join', TournamentController.joinLobby);
router.post('/lobby/:id/leave', TournamentController.leaveLobby);

router.post('/lobby/:id/start', TournamentController.startGame);
router.post('/lobby/:id/finishTour', TournamentController.finishTour);
router.post('/lobby/:id/message', TournamentController.sendMessage);
router.post('/lobby/:id/end', TournamentController.endGame);
router.post('/lobby/:id/task', TournamentController.completeTask);

export default router;
