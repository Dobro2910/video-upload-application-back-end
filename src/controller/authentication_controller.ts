import { Request, Response } from 'express';
import { User } from '../model/user_model';
import { AuthenticationService } from "../service/authentication_service";
import logger from '../utils/logger';

export class AuthenticationController {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private authenticationService: AuthenticationService;

    constructor(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService;
    }

    async login(req: Request, res: Response) {
        try {
            const userEmail = req.body.userEmail;
            const userPassword = req.body.userPassword;
            const token = await this.authenticationService.login(userEmail, userPassword);
            
            // if (!token) {
            //     res.status(401).send('Authentication failed: Invalid credentials');
            // } else {
            //     res.status(200).send(token);
            // }
            if (!token) {
                res.status(401).json({ error: 'Authentication failed: Invalid credentials' });
            } else {
                res.status(200).json({ token });
            }
        } catch (error) {
            logger.error(`Error logging in: ${(error as Error).message}`);
            // res.status(500).send('Internal Server Error');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async findUserByEmail(req: Request, res: Response) {
        try {
            const userEmail = req.params.userEmail;
            const user: User | null = await this.authenticationService.findUserByEmail(userEmail);

            if (user) {
                res.status(200).send(user);
            } else {
                res.status(404).send('User not found');
            }
        } catch(error) {
            logger.error(`Error finding user: ${(error as Error).message}`);
            res.status(500).send('Internal Server Error');
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const userName = req.body.userName;
            const userEmail = req.body.userEmail;
            const userPassword = req.body.userPassword;

            const newUser: User = {
                userName: userName,
                userEmail: userEmail,
                userPassword: userPassword
            };
            
            const createdUser: Object | null = await this.authenticationService.createUser(newUser);
            res.status(200).send(createdUser);
        } catch(error) {
            logger.error(`Error creating user: ${(error as Error).message}`)
            res.status(500).send('Internal Server Error');
        }
    }

    async updateUserPassword(req: Request, res: Response) {
        try {
            const userEmail = req.params.userEmail;
            const newPassword = req.body.userPassword;
            await this.authenticationService.updateUserPassword(userEmail, newPassword);

            res.status(200).send("OK");
        } catch(error) {
            logger.error(`Error updating password: ${(error as Error).message}`)
            res.status(500).send('Internal Server Error');
        }
    };
}