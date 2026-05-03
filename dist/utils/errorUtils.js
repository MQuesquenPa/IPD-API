"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSqlErrorMessage = exports.getHttpStatusCode = exports.getErrorMessage = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};
exports.getErrorMessage = getErrorMessage;
const getHttpStatusCode = (error) => {
    if (error instanceof AppError) {
        return error.statusCode;
    }
    return 500;
};
exports.getHttpStatusCode = getHttpStatusCode;
const getSqlErrorMessage = (error) => {
    const sqlError = error;
    if (sqlError.code === 'ER_DUP_ENTRY') {
        return 'Ya existe un registro con los datos enviados';
    }
    if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        return 'El registro relacionado no existe';
    }
    if (sqlError.code === 'ER_BAD_FIELD_ERROR' || sqlError.code === 'ER_NO_SUCH_TABLE') {
        return 'Error en la estructura de la base de datos';
    }
    return (0, exports.getErrorMessage)(error);
};
exports.getSqlErrorMessage = getSqlErrorMessage;
