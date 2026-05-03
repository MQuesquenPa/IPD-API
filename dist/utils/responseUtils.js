"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const errorUtils_1 = require("./errorUtils");
const sendSuccess = (res, status, data, message) => {
    res.status(status).json(Object.assign(Object.assign({ status }, (message ? { message } : {})), { data }));
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error, fallbackMessage = 'Error interno del servidor') => {
    const status = (0, errorUtils_1.getHttpStatusCode)(error);
    res.status(status).json(Object.assign({ status, message: status === 500 ? fallbackMessage : (0, errorUtils_1.getErrorMessage)(error) }, (status === 500 ? {} : { detail: (0, errorUtils_1.getErrorMessage)(error) })));
};
exports.sendError = sendError;
