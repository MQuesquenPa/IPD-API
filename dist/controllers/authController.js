"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUsers = exports.getUsers = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokenUtils_1 = require("../utils/tokenUtils");
const userRepository_1 = require("../repository/userRepository");
const express_validator_1 = require("express-validator");
const userService_1 = require("../services/userService");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const rows = yield (0, userRepository_1.verifyLogin)(email);
        const users = rows;
        if (users.length === 0) {
            res.status(401).json({ status: res.status, message: 'Credenciales inválidas' });
            return;
        }
        const user = users[0];
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ status: res.statusCode, message: 'Credenciales inválidas' });
            return;
        }
        const token = (0, tokenUtils_1.generateToken)(user.email, user.role || 'user');
        (0, userRepository_1.updateLastLogin)(email);
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ status: res.status, message: 'Error interno del servidor', detail: error.toString() });
    }
});
exports.login = login;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield (0, userRepository_1.getAllUsers)();
        if (!rows.length) {
            res.status(404).json({ status: 404, message: 'No se encontraron usuarios' });
            return;
        }
        res.status(200).json({ status: 200, data: rows });
        return;
    }
    catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ status: 500, message: 'Error interno del servidor', detail: error.toString() });
    }
});
exports.getUsers = getUsers;
const saveUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ status: 400, errors: errors.array() });
            return;
        }
        const user = yield (0, userService_1.createUser)(req.body);
        if (!user)
            throw new Error;
        res.status(201).json({
            status: 201,
            message: `El usuario con correo ${user.email} se guardó exitosamente`,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({ status: 500, message: 'Error interno del servidor', detail: error.message });
    }
});
exports.saveUsers = saveUsers;
