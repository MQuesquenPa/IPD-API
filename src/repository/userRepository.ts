import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { User } from '../models/userModel';
import { createSqlAppError } from '../utils/errorUtils';

export const verifyLogin = async (correo: string): Promise<User[]> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT ruc, correo, password, estado, fecha_creacion, fecha_modificacion FROM usuario WHERE correo = ?',
            [correo]
        );

        return rows as User[];
    } catch (error) {
        throw createSqlAppError(error);
    }
};

export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT ruc, correo, estado, fecha_creacion, fecha_modificacion FROM usuario'
        );

        return rows as Omit<User, 'password'>[];
    } catch (error) {
        throw createSqlAppError(error);
    }
};

export const saveUser = async (user: User): Promise<number> => {
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO usuario (
                ruc,
                correo,
                password,
                estado,
                fecha_creacion,
                fecha_modificacion
            ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [
                user.ruc,
                user.correo,
                user.password,
                user.estado
            ]
        );

        return result.affectedRows;
    } catch (error) {
        throw createSqlAppError(error);
    }
};
