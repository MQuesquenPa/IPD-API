import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { Product } from '../models/productsModel';
import { AppError, getSqlErrorMessage } from '../utils/errorUtils';

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

export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT ${productColumns} FROM producto ORDER BY descripcion`
        );

        return rows as Product[];
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT ${productColumns} FROM producto WHERE id = ? LIMIT 1`,
            [id]
        );

        return rows.length ? rows[0] as Product : null;
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const createProduct = async (product: Product): Promise<number> => {
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO producto (
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
            ]
        );

        return result.insertId;
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const updateProduct = async (product: Product): Promise<number> => {
    if (!product.id) {
        throw new AppError('El id del producto es obligatorio para actualizar');
    }

    try {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE producto SET
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
            WHERE id = ?`,
            [
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
            ]
        );

        return result.affectedRows;
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const updateProductFields = async (
    id: number,
    fields: Partial<Omit<Product, 'id'>>
): Promise<number> => {
    const entries = Object.entries(fields);

    if (!entries.length) {
        throw new AppError('Debe enviar al menos un campo para actualizar');
    }

    try {
        const setClause = entries.map(([field]) => `${field} = ?`).join(', ');
        const values = entries.map(([, value]) => value);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE producto SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        return result.affectedRows;
    } catch (error) {
        throw new AppError(getSqlErrorMessage(error), 500);
    }
};

export const upsertProductByCodeAndRuc = async (product: Product): Promise<void> => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM producto WHERE ruc = ? AND codigo = ? LIMIT 1 FOR UPDATE',
            [product.ruc, product.codigo]
        );

        if (!rows.length) {
            await connection.execute<ResultSetHeader>(
                `INSERT INTO producto (
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
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
                ]
            );
        } else {
            await connection.execute<ResultSetHeader>(
                `UPDATE producto SET
                    codigo_alterno = ?,
                    descripcion = ?,
                    categoria = ?,
                    peso = ?,
                    ubicacion = ?,
                    precio_unitario = ?,
                    precio_venta = ?,
                    imagen = ?,
                    estado = ?
                WHERE id = ?`,
                [
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
                ]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw new AppError(getSqlErrorMessage(error), 500);
    } finally {
        connection.release();
    }
};
