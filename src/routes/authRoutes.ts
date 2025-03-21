import { Router } from 'express';
import { getUsers, login, saveUsers } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateUser } from '../middlewares/validators/userValidators';
import { getProducts, saveProducts } from '../controllers/productController';

const router = Router();

router.post('/login', login);

router.get('/users', authenticateToken, getUsers);

router.post('/save/user', authenticateToken, validateUser, saveUsers);

//////////////////////////////////////////////////////
//////////////////PRODUCTS////////////////////////////
//////////////////////////////////////////////////////

router.get('/products', authenticateToken,  getProducts)

router.post('/save/product', authenticateToken,  saveProducts)

export default router;
