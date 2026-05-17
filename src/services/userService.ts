import bcrypt from 'bcrypt';
import { User, UserStatus } from '../models/userModel';
import { saveUser } from '../repository/userRepository';

export const createUser = async (userData: Partial<User> & { email?: string }): Promise<User> => {
    const correo = userData.correo ?? userData.email ?? '';
    const hashedPassword = await bcrypt.hash(userData.password as string, 10);

    const user: User = {
        ruc: userData.ruc as string,
        correo,
        password: hashedPassword,
        estado: userData.estado ?? UserStatus.ACTIVE
    };

    await saveUser(user);

    return user;
};
