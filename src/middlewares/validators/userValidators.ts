import { body } from 'express-validator';
import { UserRole, UserStatus } from '../../models/userModel';

export const validateUser = [
    body('email')
        .isEmail().withMessage('Correo no cuenta con el formato correcto')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

    body('role')
        .optional()
        .isIn(Object.values(UserRole)).withMessage(`Rol no válido. Valores permitidos: ${Object.values(UserRole).join(', ')}`),

    body('status')
        .optional()
        .isIn(Object.values(UserStatus)).withMessage(`Estado no válido. Valores permitidos: ${Object.values(UserStatus).join(', ')}`)
];
