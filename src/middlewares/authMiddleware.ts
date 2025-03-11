import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY no está definida en las variables de entorno.');
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ status: 401, message: 'Acceso denegado' });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ status: 403, message: 'Token inválido' });
    }
};