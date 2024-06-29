import express, { Express, Request, Response } from 'express';
import pool from './config/postgresdb';
import dotenv from "dotenv";

// Authentication
import { AuthenticationRepositoryImpl } from './repository/authentication/postgresDB';
import { AuthenticationService } from './service/authentication_service';
import { AuthenticationController } from './controller/authentication_controller';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

const port = process.env.PORT || 3001;

const authenticationRepository = new AuthenticationRepositoryImpl(pool);
const authenticationService = new AuthenticationService(authenticationRepository);
const authenticationController = new AuthenticationController(authenticationService);

app.get('/', (req: Request, res: Response) => {res.send('Hello, TypeScript Node.js Backend!');});

// Authentication
app.get("/authentication/:userEmail", (req: Request, res: Response) => authenticationController.findUserByEmail(req, res));
app.post("/authentication/createuser", (req: Request, res: Response) => authenticationController.createUser(req, res));
app.put("/authentication/updatePassword/:userEmail", (req: Request, res: Response) => authenticationController.updateUserPassword(req, res));


app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});
