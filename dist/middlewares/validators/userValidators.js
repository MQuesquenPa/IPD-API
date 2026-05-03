"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const express_validator_1 = require("express-validator");
const userModel_1 = require("../../models/userModel");
exports.validateUser = [
    (0, express_validator_1.body)('email')
        .isEmail().withMessage('Correo no cuenta con el formato correcto')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(Object.values(userModel_1.UserRole)).withMessage(`Rol no válido. Valores permitidos: ${Object.values(userModel_1.UserRole).join(', ')}`),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(userModel_1.UserStatus)).withMessage(`Estado no válido. Valores permitidos: ${Object.values(userModel_1.UserStatus).join(', ')}`)
];
