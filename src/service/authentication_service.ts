import { AuthenticationRepository } from "../repository/authentication_repository";
import { User } from "../model/user_model";

export class AuthenticationService {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private authenticationRepository: AuthenticationRepository;

    constructor(authenticationRepository: AuthenticationRepository) {
        this.authenticationRepository = authenticationRepository;
    }

    async login(userEmail: string, newPassword: string): Promise<string | null> {
        return await this.authenticationRepository.login(userEmail, newPassword);
    }

    async findUserByEmail(userEmail: string): Promise<User | null> {
        return await this.authenticationRepository.findUserByEmail(userEmail);
    };

    async createUser(user: User): Promise<string | null> {
        return await this.authenticationRepository.createUser(user);

        // const newUser: string | null = 
        // just to ensure that newUser will never be null
        // if (!newUser) {
        //     throw new Error('Failed to create user');
        // }

        // return newUser;
    }

    async updateUserPassword(userEmail: string, newPassword: string): Promise<void> {
        await this.authenticationRepository.updateUserPassword(userEmail, newPassword);
    };
}
