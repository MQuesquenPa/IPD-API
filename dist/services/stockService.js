"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStockExit = exports.registerStockEntry = exports.listStockByWarehouse = exports.listStockByProduct = void 0;
const db_1 = require("../config/db");
const productRepository_1 = require("../repository/productRepository");
const stockRepository_1 = require("../repository/stockRepository");
const warehouseRepository_1 = require("../repository/warehouseRepository");
const errorUtils_1 = require("../utils/errorUtils");
const isActive = (estado) => {
    return (estado !== null && estado !== void 0 ? estado : '').toLowerCase() === 'activo';
};
const validateStockOperation = (operation) => {
    if (!operation.producto_id) {
        throw new errorUtils_1.AppError('El producto_id es obligatorio');
    }
    if (!operation.almacen_id) {
        throw new errorUtils_1.AppError('El almacen_id es obligatorio');
    }
    const cantidad = Number(operation.cantidad);
    if (Number.isNaN(cantidad) || cantidad <= 0) {
        throw new errorUtils_1.AppError('La cantidad debe ser mayor a cero');
    }
    return Object.assign(Object.assign({}, operation), { producto_id: Number(operation.producto_id), almacen_id: Number(operation.almacen_id), cantidad });
};
const validateStockEntities = (operation) => __awaiter(void 0, void 0, void 0, function* () {
    const [product, warehouse] = yield Promise.all([
        (0, productRepository_1.getProductById)(operation.producto_id),
        (0, warehouseRepository_1.getWarehouseById)(operation.almacen_id)
    ]);
    if (!product) {
        throw new errorUtils_1.AppError('El producto no existe', 404);
    }
    if (!isActive(product.estado)) {
        throw new errorUtils_1.AppError('El producto no esta activo');
    }
    if (!warehouse) {
        throw new errorUtils_1.AppError('El almacen no existe', 404);
    }
    if (!isActive(warehouse.estado)) {
        throw new errorUtils_1.AppError('El almacen no esta activo');
    }
});
const listStockByProduct = (productoId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!productoId) {
        throw new errorUtils_1.AppError('El producto_id es obligatorio');
    }
    return (0, stockRepository_1.getStockByProduct)(productoId);
});
exports.listStockByProduct = listStockByProduct;
const listStockByWarehouse = (almacenId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!almacenId) {
        throw new errorUtils_1.AppError('El almacen_id es obligatorio');
    }
    return (0, stockRepository_1.getStockByWarehouse)(almacenId);
});
exports.listStockByWarehouse = listStockByWarehouse;
const registerStockMovement = (operation, type) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const normalizedOperation = validateStockOperation(operation);
    yield validateStockEntities(normalizedOperation);
    const connection = yield db_1.pool.getConnection();
    try {
        yield connection.beginTransaction();
        const currentStock = yield (0, stockRepository_1.ensureStockProductForUpdate)(normalizedOperation.producto_id, normalizedOperation.almacen_id, connection);
        const stockAnterior = Number(currentStock.cantidad);
        const stockNuevo = type === 'entrada'
            ? stockAnterior + normalizedOperation.cantidad
            : stockAnterior - normalizedOperation.cantidad;
        if (stockNuevo < 0) {
            throw new errorUtils_1.AppError('La salida no puede dejar stock negativo');
        }
        const stockProduct = {
            id: currentStock.id,
            producto_id: normalizedOperation.producto_id,
            almacen_id: normalizedOperation.almacen_id,
            cantidad: stockNuevo
        };
        yield (0, stockRepository_1.updateStockProduct)(stockProduct, connection);
        yield (0, stockRepository_1.createStockMovement)({
            producto_id: normalizedOperation.producto_id,
            almacen_id: normalizedOperation.almacen_id,
            tipo: type,
            cantidad: normalizedOperation.cantidad,
            stock_anterior: stockAnterior,
            stock_nuevo: stockNuevo,
            observacion: (_a = normalizedOperation.observacion) !== null && _a !== void 0 ? _a : null
        }, connection);
        yield connection.commit();
        return stockProduct;
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
const registerStockEntry = (operation) => __awaiter(void 0, void 0, void 0, function* () {
    return registerStockMovement(operation, 'entrada');
});
exports.registerStockEntry = registerStockEntry;
const registerStockExit = (operation) => __awaiter(void 0, void 0, void 0, function* () {
    return registerStockMovement(operation, 'salida');
});
exports.registerStockExit = registerStockExit;
