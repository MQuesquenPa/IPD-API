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
exports.upsertProductByCodeAndRuc = exports.updateProductFields = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const db_1 = require("../config/db");
const errorUtils_1 = require("../utils/errorUtils");
const productColumns = `
    id,
    ruc,
    codigo,
    codigo_alterno,
    descripcion,
    categoria,
    peso,
    ubicacion,
    precio_unitario,
    precio_venta,
    imagen,
    estado
`;
const getAllProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.pool.execute(`SELECT ${productColumns} FROM producto ORDER BY descripcion`);
        return rows;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.pool.execute(`SELECT ${productColumns} FROM producto WHERE id = ? LIMIT 1`, [id]);
        return rows.length ? rows[0] : null;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.getProductById = getProductById;
const createProduct = (product) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield db_1.pool.execute(`INSERT INTO producto (
                ruc,
                codigo,
                codigo_alterno,
                descripcion,
                categoria,
                peso,
                ubicacion,
                precio_unitario,
                precio_venta,
                imagen,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            product.ruc,
            product.codigo,
            product.codigo_alterno,
            product.descripcion,
            product.categoria,
            product.peso,
            product.ubicacion,
            product.precio_unitario,
            product.precio_venta,
            product.imagen,
            product.estado
        ]);
        return result.insertId;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.createProduct = createProduct;
const updateProduct = (product) => __awaiter(void 0, void 0, void 0, function* () {
    if (!product.id) {
        throw new errorUtils_1.AppError('El id del producto es obligatorio para actualizar');
    }
    try {
        const [result] = yield db_1.pool.execute(`UPDATE producto SET
                ruc = ?,
                codigo = ?,
                codigo_alterno = ?,
                descripcion = ?,
                categoria = ?,
                peso = ?,
                ubicacion = ?,
                precio_unitario = ?,
                precio_venta = ?,
                imagen = ?,
                estado = ?
            WHERE id = ?`, [
            product.ruc,
            product.codigo,
            product.codigo_alterno,
            product.descripcion,
            product.categoria,
            product.peso,
            product.ubicacion,
            product.precio_unitario,
            product.precio_venta,
            product.imagen,
            product.estado,
            product.id
        ]);
        return result.affectedRows;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.updateProduct = updateProduct;
const updateProductFields = (id, fields) => __awaiter(void 0, void 0, void 0, function* () {
    const entries = Object.entries(fields);
    if (!entries.length) {
        throw new errorUtils_1.AppError('Debe enviar al menos un campo para actualizar');
    }
    try {
        const setClause = entries.map(([field]) => `${field} = ?`).join(', ');
        const values = entries.map(([, value]) => value);
        const [result] = yield db_1.pool.execute(`UPDATE producto SET ${setClause} WHERE id = ?`, [...values, id]);
        return result.affectedRows;
    }
    catch (error) {
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
});
exports.updateProductFields = updateProductFields;
const upsertProductByCodeAndRuc = (product) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.pool.getConnection();
    try {
        yield connection.beginTransaction();
        const [rows] = yield connection.execute('SELECT id FROM producto WHERE ruc = ? AND codigo = ? LIMIT 1 FOR UPDATE', [product.ruc, product.codigo]);
        if (!rows.length) {
            yield connection.execute(`INSERT INTO producto (
                    ruc,
                    codigo,
                    codigo_alterno,
                    descripcion,
                    categoria,
                    peso,
                    ubicacion,
                    precio_unitario,
                    precio_venta,
                    imagen,
                    estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                product.ruc,
                product.codigo,
                product.codigo_alterno,
                product.descripcion,
                product.categoria,
                product.peso,
                product.ubicacion,
                product.precio_unitario,
                product.precio_venta,
                product.imagen,
                product.estado
            ]);
        }
        else {
            yield connection.execute(`UPDATE producto SET
                    codigo_alterno = ?,
                    descripcion = ?,
                    categoria = ?,
                    peso = ?,
                    ubicacion = ?,
                    precio_unitario = ?,
                    precio_venta = ?,
                    imagen = ?,
                    estado = ?
                WHERE id = ?`, [
                product.codigo_alterno,
                product.descripcion,
                product.categoria,
                product.peso,
                product.ubicacion,
                product.precio_unitario,
                product.precio_venta,
                product.imagen,
                product.estado,
                rows[0].id
            ]);
        }
        yield connection.commit();
    }
    catch (error) {
        yield connection.rollback();
        throw new errorUtils_1.AppError((0, errorUtils_1.getSqlErrorMessage)(error), 500);
    }
    finally {
        connection.release();
    }
});
exports.upsertProductByCodeAndRuc = upsertProductByCodeAndRuc;
