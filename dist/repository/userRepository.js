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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = exports.updateLastLogin = exports.getAllUsers = exports.verifyLogin = void 0;
const db_1 = require("../config/db");
const verifyLogin = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.pool.execute('SELECT * FROM user WHERE email = ?', [email]);
    return rows;
});
exports.verifyLogin = verifyLogin;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.pool.execute('SELECT EMAIL, ROLE, STATUS FROM user');
    return rows;
});
exports.getAllUsers = getAllUsers;
const updateLastLogin = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.pool.execute('UPDATE user SET last_login = NOW() WHERE email = ?', [email]);
    return rows;
});
exports.updateLastLogin = updateLastLogin;
const saveUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.pool.execute('INSERT INTO user (email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?)', [req.email, req.password, req.role, req.status, req.created_at]);
    return rows;
});
exports.saveUser = saveUser;
