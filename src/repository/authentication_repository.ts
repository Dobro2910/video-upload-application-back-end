import { User } from "../model/user_model";

// This is the repository layer. It is responsible for handling database operations.
export interface AuthenticationRepository {
    login(userEmail: string, newPassword: string): Promise<String | null>;
    findUserByEmail(userEmail: string): Promise<User | null>;
    createUser(user: User): Promise<object | null>;
    updateUserPassword(userEmail: string, newPassword: string): Promise<void>;
}