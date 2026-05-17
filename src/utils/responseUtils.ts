import { Response } from 'express';
import { getErrorDetails, getErrorMessage, getHttpStatusCode } from './errorUtils';

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
    const message = status === 500 ? fallbackMessage : getErrorMessage(error);
    const details = status === 500 ? undefined : getErrorDetails(error);

    res.status(status).json({
        status,
        message,
        ...(details ? { details } : {})
    });
};
