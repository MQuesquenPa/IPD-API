export enum UserStatus {
    ACTIVE = 'A',
    INACTIVE = 'I'
}

export interface User {
    ruc: string;
    correo: string;
    password: string;
    estado?: UserStatus | string;
    fecha_creacion?: Date;
    fecha_modificacion?: Date;
}
