import { Request, Response } from 'express';
import { User } from '../model/user_model';
import { AuthenticationService } from "../service/authentication_service";

export class AuthenticationController {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private authenticationService: AuthenticationService;

    constructor(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService;
    }

    async findUserByEmail(req: Request, res: Response) {
        const userEmail = req.params.userEmail;

        const user: User | null = await this.authenticationService.findUserByEmail(userEmail);

        if (user) {
            res.send(user);
        } else {
            res.status(404).send('User not found');
        }
    }

    async createUser(req: Request, res: Response) {
        const userName = req.params.userName;
        const userEmail = req.params.userEmail;
        const userPassword = req.params.userPassword;

        const newUser: User = {
            userName: userName,
            userEmail: userEmail,
            userPassword: userPassword // Make sure to hash this before storing it in the database
        };
        
        const token = await this.authenticationService.createUser(newUser);

        if (token) {
            res.send(token);
        } else {
            res.status(404).send('User have not been created');
        }
    }

    async updateUserPassword(req: Request, res: Response) {
        const userEmail = req.params.userEmail;
        const newPassword = req.params.userPassword;

        await this.authenticationService.updateUserPassword(userEmail, newPassword);
    };
}