import bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../models/userModel';
import { saveUser } from '../repository/userRepository';

export const createUser = async (userData: Partial<User>): Promise<User> => {
    
    const hashedPassword = await bcrypt.hash(userData.password as string, 10);

    const user: User = {
        email: userData.email as string,
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        created_at: new Date(),
    };

    await saveUser(user);

    return user;
};
