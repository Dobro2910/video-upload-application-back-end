import { User, UserProfile } from "../model/user_model";

// This is the repository layer. It is responsible for handling database operations.
export interface AuthenticationRepository {
    login(userEmail: string, newPassword: string): Promise<string | null>;
    getUserByEmail(userEmail: string): Promise<UserProfile | null>;
    createUser(user: User): Promise<string | null>;
    updateUserPassword(userEmail: string, newPassword: string): Promise<void>;
    updateUserProfile(user: UserProfile, userEmail: string): Promise<void>;
}