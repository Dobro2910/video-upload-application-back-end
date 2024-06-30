import { AuthenticationRepository } from "../repository/authentication_repository";
import { User } from "../model/user_model";
import { JwtUtils } from "../utils/jwt";

export class AuthenticationService {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private authenticationRepository: AuthenticationRepository;

    constructor(authenticationRepository: AuthenticationRepository) {
        this.authenticationRepository = authenticationRepository;
    }

    async findUserByEmail(userEmail: string): Promise<User | null> {
        return await this.authenticationRepository.findUserByEmail(userEmail);
    };

    async createUser(user: User): Promise<string> {
        const newUser: User | null = await this.authenticationRepository.createUser(user);

        // just to ensure that newUser will never be null
        if (!newUser) {
            throw new Error('Failed to create user');
        }

        const token = JwtUtils.generateToken({ id: newUser.userId, email: newUser.userEmail });
        return token;
    }

    async updateUserPassword(userEmail: string, newPassword: string): Promise<void> {
        await this.authenticationRepository.updateUserPassword(userEmail, newPassword);
    };
}
