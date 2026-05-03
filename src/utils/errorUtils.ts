import { QueryError } from 'mysql2';

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
};

export const getHttpStatusCode = (error: unknown): number => {
    if (error instanceof AppError) {
        return error.statusCode;
    }

    return 500;
};

export const getSqlErrorMessage = (error: unknown): string => {
    const sqlError = error as Partial<QueryError>;

    if (sqlError.code === 'ER_DUP_ENTRY') {
        return 'Ya existe un registro con los datos enviados';
    }

    if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        return 'El registro relacionado no existe';
    }

    if (sqlError.code === 'ER_BAD_FIELD_ERROR' || sqlError.code === 'ER_NO_SUCH_TABLE') {
        return 'Error en la estructura de la base de datos';
    }

    return getErrorMessage(error);
};
