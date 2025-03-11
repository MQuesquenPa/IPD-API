import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (email: string, role: string) => {
    return jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization as string | undefined;

    if (!authHeader) {
        return res.status(401).json({ status: 401, message: 'Acceso denegado. No hay token.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 401, message: 'Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.body.user = decoded;
        next();
    } catch (error) {
        console.error('Token inválido:', error);
        return res.status(401).json({ status: 401, message: 'Token inválido.' });
    }
};
