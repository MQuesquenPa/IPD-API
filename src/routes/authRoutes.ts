import { NextFunction, Request, Response, Router } from 'express';
import { getUsers, login, saveUsers } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateUser } from '../middlewares/validators/userValidators';
import { getProducts, importProducts, saveProducts, updateProducts } from '../controllers/productController';
import { getWarehouses, saveWarehouse } from '../controllers/warehouseController';
import {
    getStockByProduct,
    getStockByWarehouse,
    saveStockEntry,
    saveStockExit
} from '../controllers/stockController';
import { AppError } from '../utils/errorUtils';
import { sendError } from '../utils/responseUtils';

const router = Router();
const multer = require('multer');
const allowedExcelMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
];
const allowedExcelExtensions = ['.xlsx', '.xls'];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req: Request, file: any, callback: any) => {
        const fileName = String(file.originalname ?? '').toLowerCase();
        const hasValidExtension = allowedExcelExtensions.some(extension => fileName.endsWith(extension));
        const hasValidMimeType = allowedExcelMimeTypes.includes(file.mimetype);

        if (!hasValidExtension || !hasValidMimeType) {
            callback(new AppError('Solo se permiten archivos Excel .xlsx o .xls'));
            return;
        }

        callback(null, true);
    }
});
const uploadProductsExcel = (req: Request, res: Response, next: NextFunction): void => {
    upload.single('file')(req, res, (error: unknown) => {
        if (!error) {
            next();
            return;
        }

        console.error('Error al cargar archivo Excel:', error);

        if ((error as any).code === 'LIMIT_FILE_SIZE') {
            sendError(res, new AppError('El archivo Excel no debe superar 5MB'));
            return;
        }

        sendError(res, error instanceof AppError ? error : new AppError('El archivo Excel no es valido'));
    });
};

router.post('/login', login);

router.get('/users', authenticateToken, getUsers);

router.post('/save/user', authenticateToken, validateUser, saveUsers);

//////////////////////////////////////////////////////
//////////////////PRODUCTS////////////////////////////
//////////////////////////////////////////////////////

router.get('/productos', authenticateToken, getProducts)

router.post('/productos', authenticateToken, saveProducts)

router.put('/productos/:id', authenticateToken, updateProducts)

router.get('/products', authenticateToken, getProducts)

router.post('/save/product', authenticateToken, saveProducts)

router.put('/update/product', authenticateToken, updateProducts)

router.post('/import/products', authenticateToken, uploadProductsExcel, importProducts)

//////////////////////////////////////////////////////
//////////////////WAREHOUSES//////////////////////////
//////////////////////////////////////////////////////

router.get('/almacenes', authenticateToken, getWarehouses)

router.post('/almacenes', authenticateToken, saveWarehouse)

//////////////////////////////////////////////////////
//////////////////STOCK///////////////////////////////
//////////////////////////////////////////////////////

router.get('/stock/producto/:productoId', authenticateToken, getStockByProduct)

router.get('/stock/almacen/:almacenId', authenticateToken, getStockByWarehouse)

router.post('/stock/entrada', authenticateToken, saveStockEntry)

router.post('/stock/salida', authenticateToken, saveStockExit)

export default router;
