import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/tokenUtils';
import { getAllUsers, updateLastLogin, verifyLogin } from '../repository/userRepository';
import { validationResult } from 'express-validator';
import { createUser } from '../services/userService';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const rows = await verifyLogin(email);
        const users = rows as any[];

        if (users.length === 0) {
            res.status(401).json({status: res.status, message: 'Credenciales inválidas' });
            return;
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({status: res.statusCode, message: 'Credenciales inválidas' });
            return;
        }

        const token = generateToken(user.email, user.role || 'user');

        updateLastLogin(email)
        res.json({ token });

    } catch (error:any) {
        res.status(500).json({ status: res.status, message: 'Error interno del servidor', detail: error.toString() });
    }
};


export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const rows = await getAllUsers();

        if (!rows.length) {
            res.status(404).json({ status: 404, message: 'No se encontraron usuarios' });
            return
        }

        res.status(200).json({ status: 200, data: rows });
        return 
    } catch (error:any) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ status: 500, message: 'Error interno del servidor', detail: error.toString() });
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


        if (!user) throw new Error

        res.status(201).json({ 
            status: 201, 
            message: `El usuario con correo ${user.email} se guardó exitosamente`, 
            data: user 
        });
    } catch (error: any) {
        res.status(500).json({ status: 500, message: 'Error interno del servidor', detail: error.message });
    }
};