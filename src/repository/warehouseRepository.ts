import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { Warehouse } from '../models/warehouseModel';
import { AppError, getSqlErrorMessage } from '../utils/errorUtils';

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
            `SELECT ${warehouseColumns} FROM almacen ORDER BY nombre`
        );

        return rows as Warehouse[];
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const getWarehouseById = async (id: number): Promise<Warehouse | null> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT ${warehouseColumns} FROM almacen WHERE id = ? LIMIT 1`,
            [id]
        );

        return rows.length ? rows[0] as Warehouse : null;
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const createWarehouse = async (warehouse: Warehouse): Promise<number> => {
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO almacen (
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
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};
