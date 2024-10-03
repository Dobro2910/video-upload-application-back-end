import { Request, Response } from 'express';
import { UpdateProfile, User, UserRole } from '../model/user_model';
import { AuthenticationService } from "../service/authentication_service";
import { uploadImageToS3 } from '../third_party_service/aws_service';
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
            
            if (!token) {
                res.status(401).json({ error: 'Authentication failed: Invalid credentials' });
            } else {
                res.status(200).json({ token });
            }
        } catch (error) {
            logger.error(`Error logging in: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getUserByEmail(req: Request, res: Response) {
        try {
            const userEmail = req.params.userEmail;
            const user: UpdateProfile | null = await this.authenticationService.getUserByEmail(userEmail);

            if (user) {
                res.status(200).json({ user });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch(error) {
            logger.error(`Error finding user: ${(error as Error).message}`);
            res.status(500).send('Internal Server Error');
        }
    }

    async createUserRole(req: Request, res: Response) {
        try {
            const userName = req.body.userName;
            const userEmail = req.body.userEmail;
            const userPassword = req.body.userPassword;

            const newUser: User = {
                userName: userName,
                userEmail: userEmail,
                userPassword: userPassword,
                userRole: UserRole.User
            };
            
            const createdUser: string | null = await this.authenticationService.createUser(newUser);

            if (!createdUser) {
                res.status(401).json({ error: 'Authentication failed: Email Already Exist' });
            } else {
                res.status(200).json({ message: 'Successful Registration' });
            }

        } catch(error) {
            logger.error(`Error creating user: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createAdminRole(req: Request, res: Response) {
        try {
            const userName = req.body.userName;
            const userEmail = req.body.userEmail;
            const userPassword = req.body.userPassword;
            const userRole = req.body.userRole;

            const newUser: User = {
                userName: userName,
                userEmail: userEmail,
                userPassword: userPassword,
                userRole: userRole
            };
            
            const createdUser: string | null = await this.authenticationService.createUser(newUser);

            if (!createdUser) {
                res.status(401).json({ error: 'Authentication failed: Email Already Exist' });
            } else {
                res.status(200).json({ message: 'Successful Registration' });
            }

        } catch(error) {
            logger.error(`Error creating user: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
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

    async updateUserProfile(req: Request, res: Response) {
        try {
            const userEmail = req.params.userEmail;
            const userName = req.body.userName;
            const userUpdateEmail = req.body.userEmail;
            const userImage = req.file;

            const newUserProfile: UpdateProfile = {
                userName: userName,
                userEmail: userUpdateEmail,
                userImage: undefined
            };

            if (userImage) {
                const userImageURL = await uploadImageToS3(`userProfiles`, userImage);
                newUserProfile.userImage = userImageURL;
            } 

            const updatedUser: string | null = await this.authenticationService.updateUserProfile(newUserProfile, userEmail);

            if (!updatedUser) {
                res.status(401).json({ error: 'Authentication failed: Current email doesnt exist' });
            } else {
                res.status(200).json({ message: 'Update User Successful' });
            }

        } catch(error) {
            logger.error(`Error updating user Profile: ${(error as Error).message}`)
            res.status(500).send('Internal Server Error');
        }
    };
}