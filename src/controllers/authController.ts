import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { generateToken } from '../utils/tokenUtils';
import { getAllUsers, verifyLogin } from '../repository/userRepository';
import { createUser } from '../services/userService';
import { sendError, sendSuccess } from '../utils/responseUtils';

export const login = async (req: Request, res: Response): Promise<void> => {
    const correo = req.body.correo ?? req.body.email;
    const { password } = req.body;

    try {
        const users = await verifyLogin(correo);

        if (users.length === 0) {
            res.status(401).json({ status: 401, message: 'Credenciales invalidas' });
            return;
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch || user.estado !== 'A') {
            res.status(401).json({ status: 401, message: 'Credenciales invalidas' });
            return;
        }

        const token = generateToken(user.correo, 'user');

        res.json({ token });
    } catch (error: any) {
        console.error('Error en login:', error);
        sendError(res, error);
    }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rows = await getAllUsers();

        if (!rows.length) {
            res.status(404).json({ status: 404, message: 'No se encontraron usuarios' });
            return;
        }

        sendSuccess(res, 200, rows);
    } catch (error: any) {
        console.error('Error al obtener usuarios:', error);
        sendError(res, error);
    }
};

export const saveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ status: 400, errors: errors.array() });
            return;
        }

        const user = await createUser(req.body);

        sendSuccess(res, 201, {
            ruc: user.ruc,
            correo: user.correo,
            estado: user.estado
        }, `El usuario con correo ${user.correo} se guardo exitosamente`);
    } catch (error: any) {
        console.error('Error al guardar usuario:', error);
        sendError(res, error);
    }
};
