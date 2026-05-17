import { body } from 'express-validator';
import { UserStatus } from '../../models/userModel';

export const validateUser = [
    body('ruc')
        .notEmpty().withMessage('El RUC es obligatorio')
        .isLength({ max: 20 }).withMessage('El RUC no debe superar 20 caracteres'),

    body('correo')
        .optional()
        .isEmail().withMessage('Correo no cuenta con el formato correcto')
        .normalizeEmail(),

    body('email')
        .optional()
        .isEmail().withMessage('Correo no cuenta con el formato correcto')
        .normalizeEmail(),

    body()
        .custom((value) => {
            if (!value.correo && !value.email) {
                throw new Error('El correo es obligatorio');
            }

            return true;
        }),

    body('password')
        .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),

    body('estado')
        .optional()
        .isIn(Object.values(UserStatus)).withMessage(`Estado no valido. Valores permitidos: ${Object.values(UserStatus).join(', ')}`)
];
