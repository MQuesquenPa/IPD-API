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
exports.createWarehouse = exports.getWarehouseById = exports.getAllWarehouses = void 0;
const db_1 = require("../config/db");
const errorUtils_1 = require("../utils/errorUtils");
const warehouseColumns = `
    id,
    ruc,
    codigo,
    nombre,
    estado
`;
const getAllWarehouses = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.pool.execute(`SELECT ${warehouseColumns} FROM almacen ORDER BY nombre`);
        return rows;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.getAllWarehouses = getAllWarehouses;
const getWarehouseById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.pool.execute(`SELECT ${warehouseColumns} FROM almacen WHERE id = ? LIMIT 1`, [id]);
        return rows.length ? rows[0] : null;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.getWarehouseById = getWarehouseById;
const createWarehouse = (warehouse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield db_1.pool.execute(`INSERT INTO almacen (
                ruc,
                codigo,
                nombre,
                estado
            ) VALUES (?, ?, ?, ?)`, [
            warehouse.ruc,
            warehouse.codigo,
            warehouse.nombre,
            warehouse.estado
        ]);
        return result.insertId;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.createWarehouse = createWarehouse;
