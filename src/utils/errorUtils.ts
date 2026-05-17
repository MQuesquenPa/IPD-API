import { QueryError } from 'mysql2';

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
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
    const sqlError = error as Partial<QueryError> & { sqlMessage?: string };

    if (sqlError.code === 'ER_DUP_ENTRY') {
        return 'Ya existe un registro con los datos enviados';
    }

    if (sqlError.code === 'ER_DATA_TOO_LONG' || sqlError.code === 'WARN_DATA_TRUNCATED') {
        const columnMatch = sqlError.sqlMessage?.match(/column '([^']+)'/i);
        const columnName = columnMatch?.[1];

        if (columnName) {
            return `El valor enviado para ${columnName} excede el tamaño permitido`;
        }

        return 'Uno de los valores enviados excede el tamaño permitido';
    }

    if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        return 'El registro relacionado no existe';
    }

    if (sqlError.code === 'ER_BAD_FIELD_ERROR' || sqlError.code === 'ER_NO_SUCH_TABLE') {
        return 'Error en la estructura de la base de datos';
    }

    return getErrorMessage(error);
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
