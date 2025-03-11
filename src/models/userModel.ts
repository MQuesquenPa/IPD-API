export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest'
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned'
}

export interface User {
    email: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
    created_at?: Date;
    updated_at?: Date;
    last_login?: Date;
}