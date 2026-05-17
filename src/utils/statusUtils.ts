import { AppError } from './errorUtils';

export const normalizeEntityStatus = (estado?: string): string => {
    if (!estado) {
        return 'A';
    }

    const normalizedStatus = estado.trim().toLowerCase();

    if (normalizedStatus === 'a' || normalizedStatus === 'activo') {
        return 'A';
    }

    if (normalizedStatus === 'i' || normalizedStatus === 'inactivo') {
        return 'I';
    }

    throw new AppError('El estado debe ser A, I, activo o inactivo');
};

export const isActiveStatus = (estado?: string): boolean => {
    return normalizeEntityStatus(estado) === 'A';
};
