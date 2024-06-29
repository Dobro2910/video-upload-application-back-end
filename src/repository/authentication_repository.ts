import { User } from "../model/user_model";

// This is the repository layer. It is responsible for handling database operations.
export interface AuthenticationRepository {
    findUserByEmail(userEmail: string): Promise<User | null>;
    createUser(user: User): Promise<User | null>;
    updateUserPassword(userEmail: string, newPassword: string): Promise<void>;
}