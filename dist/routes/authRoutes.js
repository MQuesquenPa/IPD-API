"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userValidators_1 = require("../middlewares/validators/userValidators");
const productController_1 = require("../controllers/productController");
const warehouseController_1 = require("../controllers/warehouseController");
const stockController_1 = require("../controllers/stockController");
const errorUtils_1 = require("../utils/errorUtils");
const responseUtils_1 = require("../utils/responseUtils");
const router = (0, express_1.Router)();
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
    fileFilter: (_req, file, callback) => {
        var _a;
        const fileName = String((_a = file.originalname) !== null && _a !== void 0 ? _a : '').toLowerCase();
        const hasValidExtension = allowedExcelExtensions.some(extension => fileName.endsWith(extension));
        const hasValidMimeType = allowedExcelMimeTypes.includes(file.mimetype);
        if (!hasValidExtension || !hasValidMimeType) {
            callback(new errorUtils_1.AppError('Solo se permiten archivos Excel .xlsx o .xls'));
            return;
        }
        callback(null, true);
    }
});
const uploadProductsExcel = (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (!error) {
            next();
            return;
        }
        console.error('Error al cargar archivo Excel:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            (0, responseUtils_1.sendError)(res, new errorUtils_1.AppError('El archivo Excel no debe superar 5MB'));
            return;
        }
        (0, responseUtils_1.sendError)(res, error instanceof errorUtils_1.AppError ? error : new errorUtils_1.AppError('El archivo Excel no es valido'));
    });
};
router.post('/login', authController_1.login);
router.get('/users', authMiddleware_1.authenticateToken, authController_1.getUsers);
router.post('/save/user', authMiddleware_1.authenticateToken, userValidators_1.validateUser, authController_1.saveUsers);
//////////////////////////////////////////////////////
//////////////////PRODUCTS////////////////////////////
//////////////////////////////////////////////////////
router.get('/productos', authMiddleware_1.authenticateToken, productController_1.getProducts);
router.post('/productos', authMiddleware_1.authenticateToken, productController_1.saveProducts);
router.put('/productos/:id', authMiddleware_1.authenticateToken, productController_1.updateProducts);
router.get('/products', authMiddleware_1.authenticateToken, productController_1.getProducts);
router.post('/save/product', authMiddleware_1.authenticateToken, productController_1.saveProducts);
router.put('/update/product', authMiddleware_1.authenticateToken, productController_1.updateProducts);
router.post('/import/products', authMiddleware_1.authenticateToken, uploadProductsExcel, productController_1.importProducts);
//////////////////////////////////////////////////////
//////////////////WAREHOUSES//////////////////////////
//////////////////////////////////////////////////////
router.get('/almacenes', authMiddleware_1.authenticateToken, warehouseController_1.getWarehouses);
router.post('/almacenes', authMiddleware_1.authenticateToken, warehouseController_1.saveWarehouse);
//////////////////////////////////////////////////////
//////////////////STOCK///////////////////////////////
//////////////////////////////////////////////////////
router.get('/stock/producto/:productoId', authMiddleware_1.authenticateToken, stockController_1.getStockByProduct);
router.get('/stock/almacen/:almacenId', authMiddleware_1.authenticateToken, stockController_1.getStockByWarehouse);
router.post('/stock/entrada', authMiddleware_1.authenticateToken, stockController_1.saveStockEntry);
router.post('/stock/salida', authMiddleware_1.authenticateToken, stockController_1.saveStockExit);
exports.default = router;
