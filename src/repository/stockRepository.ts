import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { inventoryTable, pool } from '../config/db';
import { StockMovement, StockProduct } from '../models/stockModel';
import { AppError, createSqlAppError } from '../utils/errorUtils';

type DbExecutor = typeof pool | PoolConnection;

const stockProductTable = inventoryTable('stock_producto');
const stockMovementTable = inventoryTable('movimiento_stock');

const stockColumns = `
    id,
    producto_id,
    almacen_id,
    cantidad
`;

const execute = async <T extends RowDataPacket[] | ResultSetHeader>(
    executor: DbExecutor,
    sql: string,
    values: any[] = []
): Promise<T> => {
    try {
        const [result] = await executor.execute<T>(sql, values);
        return result;
    } catch (error) {
        throw createSqlAppError(error);
    }
};

export const getStockByProduct = async (productoId: number): Promise<StockProduct[]> => {
    const rows = await execute<RowDataPacket[]>(
        pool,
        `SELECT ${stockColumns}
        FROM ${stockProductTable}
        WHERE producto_id = ?
        ORDER BY almacen_id`,
        [productoId]
    );

    return rows as StockProduct[];
};

export const getStockByWarehouse = async (almacenId: number): Promise<StockProduct[]> => {
    const rows = await execute<RowDataPacket[]>(
        pool,
        `SELECT ${stockColumns}
        FROM ${stockProductTable}
        WHERE almacen_id = ?
        ORDER BY producto_id`,
        [almacenId]
    );

    return rows as StockProduct[];
};

export const getStockByProductAndWarehouse = async (
    productoId: number,
    almacenId: number,
    connection: PoolConnection
): Promise<StockProduct | null> => {
    const rows = await execute<RowDataPacket[]>(
        connection,
        `SELECT ${stockColumns}
        FROM ${stockProductTable}
        WHERE producto_id = ? AND almacen_id = ?
        FOR UPDATE`,
        [productoId, almacenId]
    );

    return rows.length ? rows[0] as StockProduct : null;
};

export const ensureStockProductForUpdate = async (
    productoId: number,
    almacenId: number,
    connection: PoolConnection
): Promise<StockProduct> => {
    const currentStock = await getStockByProductAndWarehouse(productoId, almacenId, connection);

    if (currentStock) {
        return currentStock;
    }

    try {
        const [result] = await connection.execute<ResultSetHeader>(
            `INSERT INTO ${stockProductTable} (
                producto_id,
                almacen_id,
                cantidad
            ) VALUES (?, ?, ?)`,
            [productoId, almacenId, 0]
        );

        return {
            id: result.insertId,
            producto_id: productoId,
            almacen_id: almacenId,
            cantidad: 0
        };
    } catch (error: any) {
        if (error.code !== 'ER_DUP_ENTRY') {
            throw createSqlAppError(error);
        }

        const createdByAnotherTransaction = await getStockByProductAndWarehouse(productoId, almacenId, connection);

        if (!createdByAnotherTransaction) {
            throw new AppError('No se pudo bloquear el stock del producto', 500);
        }

        return createdByAnotherTransaction;
    }
};

export const updateStockProduct = async (
    stock: StockProduct,
    connection: PoolConnection
): Promise<number> => {
    const result = await execute<ResultSetHeader>(
        connection,
        `UPDATE ${stockProductTable}
        SET cantidad = ?
        WHERE producto_id = ? AND almacen_id = ?`,
        [
            stock.cantidad,
            stock.producto_id,
            stock.almacen_id
        ]
    );

    return result.affectedRows;
};

export const createStockMovement = async (
    movement: StockMovement,
    connection: PoolConnection
): Promise<number> => {
    const result = await execute<ResultSetHeader>(
        connection,
        `INSERT INTO ${stockMovementTable} (
            producto_id,
            almacen_id,
            tipo,
            cantidad,
            stock_anterior,
            stock_nuevo,
            observacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            movement.producto_id,
            movement.almacen_id,
            movement.tipo,
            movement.cantidad,
            movement.stock_anterior,
            movement.stock_nuevo,
            movement.observacion
        ]
    );

    return result.insertId;
};
