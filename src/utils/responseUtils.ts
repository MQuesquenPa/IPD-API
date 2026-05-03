import { Response } from 'express';
import { getErrorMessage, getHttpStatusCode } from './errorUtils';

export const sendSuccess = (
    res: Response,
    status: number,
    data: unknown,
    message?: string
): void => {
    res.status(status).json({
        status,
        ...(message ? { message } : {}),
        data
    });
};

export const sendError = (
    res: Response,
    error: unknown,
    fallbackMessage = 'Error interno del servidor'
): void => {
    const status = getHttpStatusCode(error);

    res.status(status).json({
        status,
        message: status === 500 ? fallbackMessage : getErrorMessage(error),
        ...(status === 500 ? {} : { detail: getErrorMessage(error) })
    });
};
