import { Router } from 'express';
import { getUsers, login, saveUsers } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateUser } from '../middlewares/validators/userValidators';

const router = Router();

router.post('/login', login);

router.get('/users', authenticateToken, getUsers);

router.post('/save/user', authenticateToken, validateUser, saveUsers);

export default router;
