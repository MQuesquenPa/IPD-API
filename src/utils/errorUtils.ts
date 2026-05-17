import { QueryError } from 'mysql2';

export class AppError extends Error {
    statusCode: number;
    details?: unknown;

    constructor(message: string, statusCode = 400, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

type ErrorWithStatus = Error & {
    statusCode?: number;
    status?: number;
    details?: unknown;
};

const isValidHttpStatus = (status: unknown): status is number => {
    return typeof status === 'number' && Number.isInteger(status) && status >= 400 && status <= 599;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

export const isAppError = (error: unknown): error is AppError => {
    return error instanceof AppError
        || (
            error instanceof Error
            && error.name === 'AppError'
            && isValidHttpStatus((error as ErrorWithStatus).statusCode)
        );
};

const getErrorStatus = (error: unknown): number | undefined => {
    if (!isObject(error)) {
        return undefined;
    }

    const statusError = error as Partial<ErrorWithStatus>;

    if (isValidHttpStatus(statusError.statusCode)) {
        return statusError.statusCode;
    }

    if (isValidHttpStatus(statusError.status)) {
        return statusError.status;
    }

    return undefined;
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    if (isObject(error) && typeof error.message === 'string') {
        return error.message;
    }

    return String(error);
};

export const getHttpStatusCode = (error: unknown): number => {
    return getErrorStatus(error) ?? 500;
};

export const getErrorDetails = (error: unknown): unknown => {
    if (!isObject(error)) {
        return undefined;
    }

    return (error as Partial<ErrorWithStatus>).details;
};

export const getSqlErrorMessage = (error: unknown): string => {
    const sqlError = error as Partial<QueryError> & { sqlMessage?: string };

    if (sqlError.code === 'ER_DUP_ENTRY') {
        return 'Ya existe un registro con los datos enviados';
    }

    if (sqlError.code === 'ER_DATA_TOO_LONG' || sqlError.code === 'WARN_DATA_TRUNCATED') {
        const columnMatch = sqlError.sqlMessage?.match(/column '([^']+)'/i);
        const columnName = columnMatch?.[1];

        if (columnName) {
            return `El valor enviado para ${columnName} excede el tamano permitido`;
        }

        return 'Uno de los valores enviados excede el tamano permitido';
    }

    if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        return 'El registro relacionado no existe';
    }

    if (sqlError.code === 'ER_BAD_FIELD_ERROR' || sqlError.code === 'ER_NO_SUCH_TABLE') {
        return 'Error en la estructura de la base de datos';
    }

    return 'Error interno del servidor';
};

export const getSqlErrorStatusCode = (error: unknown): number => {
    const sqlError = error as Partial<QueryError>;

    if (sqlError.code === 'ER_DUP_ENTRY') {
        return 409;
    }

    if (sqlError.code === 'ER_DATA_TOO_LONG' || sqlError.code === 'WARN_DATA_TRUNCATED') {
        return 400;
    }

    if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        return 404;
    }

    return 500;
};

export const createSqlAppError = (error: unknown): AppError => {
    return new AppError(getSqlErrorMessage(error), getSqlErrorStatusCode(error));
};
