import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { inventoryTable, pool } from '../config/db';
import { Warehouse } from '../models/warehouseModel';
import { createSqlAppError } from '../utils/errorUtils';

const warehouseTable = inventoryTable('almacen');

const warehouseColumns = `
    id,
    ruc,
    codigo,
    nombre,
    estado
`;

export const getAllWarehouses = async (): Promise<Warehouse[]> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT ${warehouseColumns} FROM ${warehouseTable} ORDER BY nombre`
        );

        return rows as Warehouse[];
    } catch (error) {
        throw createSqlAppError(error);
    }
};

export const getWarehouseById = async (id: number): Promise<Warehouse | null> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT ${warehouseColumns} FROM ${warehouseTable} WHERE id = ? LIMIT 1`,
            [id]
        );

        return rows.length ? rows[0] as Warehouse : null;
    } catch (error) {
        throw createSqlAppError(error);
    }
};

export const createWarehouse = async (warehouse: Warehouse): Promise<number> => {
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO ${warehouseTable} (
                ruc,
                codigo,
                nombre,
                estado
            ) VALUES (?, ?, ?, ?)`,
            [
                warehouse.ruc,
                warehouse.codigo,
                warehouse.nombre,
                warehouse.estado
            ]
        );

        return result.insertId;
    } catch (error) {
        throw createSqlAppError(error);
    }
};
