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
exports.createStockMovement = exports.updateStockProduct = exports.ensureStockProductForUpdate = exports.getStockByProductAndWarehouse = exports.getStockByWarehouse = exports.getStockByProduct = void 0;
const db_1 = require("../config/db");
const errorUtils_1 = require("../utils/errorUtils");
const stockColumns = `
    id,
    producto_id,
    almacen_id,
    cantidad
`;
const execute = (executor_1, sql_1, ...args_1) => __awaiter(void 0, [executor_1, sql_1, ...args_1], void 0, function* (executor, sql, values = []) {
    try {
        const [result] = yield executor.execute(sql, values);
        return result;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
const getStockByProduct = (productoId) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield execute(db_1.pool, `SELECT ${stockColumns}
        FROM stock_producto
        WHERE producto_id = ?
        ORDER BY almacen_id`, [productoId]);
    return rows;
});
exports.getStockByProduct = getStockByProduct;
const getStockByWarehouse = (almacenId) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield execute(db_1.pool, `SELECT ${stockColumns}
        FROM stock_producto
        WHERE almacen_id = ?
        ORDER BY producto_id`, [almacenId]);
    return rows;
});
exports.getStockByWarehouse = getStockByWarehouse;
const getStockByProductAndWarehouse = (productoId, almacenId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield execute(connection, `SELECT ${stockColumns}
        FROM stock_producto
        WHERE producto_id = ? AND almacen_id = ?
        FOR UPDATE`, [productoId, almacenId]);
    return rows.length ? rows[0] : null;
});
exports.getStockByProductAndWarehouse = getStockByProductAndWarehouse;
const ensureStockProductForUpdate = (productoId, almacenId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const currentStock = yield (0, exports.getStockByProductAndWarehouse)(productoId, almacenId, connection);
    if (currentStock) {
        return currentStock;
    }
    try {
        const [result] = yield connection.execute(`INSERT INTO stock_producto (
                producto_id,
                almacen_id,
                cantidad
            ) VALUES (?, ?, ?)`, [productoId, almacenId, 0]);
        return {
            id: result.insertId,
            producto_id: productoId,
            almacen_id: almacenId,
            cantidad: 0
        };
    }
    catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') {
            throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
        }
        const createdByAnotherTransaction = yield (0, exports.getStockByProductAndWarehouse)(productoId, almacenId, connection);
        if (!createdByAnotherTransaction) {
            throw new errorUtils_1.AppError('No se pudo bloquear el stock del producto', 500);
        }
        return createdByAnotherTransaction;
    }
});
exports.ensureStockProductForUpdate = ensureStockProductForUpdate;
const updateStockProduct = (stock, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield execute(connection, `UPDATE stock_producto
        SET cantidad = ?
        WHERE producto_id = ? AND almacen_id = ?`, [
        stock.cantidad,
        stock.producto_id,
        stock.almacen_id
    ]);
    return result.affectedRows;
});
exports.updateStockProduct = updateStockProduct;
const createStockMovement = (movement, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield execute(connection, `INSERT INTO movimiento_stock (
            producto_id,
            almacen_id,
            tipo,
            cantidad,
            stock_anterior,
            stock_nuevo,
            observacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        movement.producto_id,
        movement.almacen_id,
        movement.tipo,
        movement.cantidad,
        movement.stock_anterior,
        movement.stock_nuevo,
        movement.observacion
    ]);
    return result.insertId;
});
exports.createStockMovement = createStockMovement;
