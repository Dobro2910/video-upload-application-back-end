import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import pool from './config/postgresdb';
import dotenv from "dotenv";

// Authentication
import { AuthenticationRepositoryImplPostgres } from './repository/authentication/postgresDB';
import { AuthenticationService } from './service/authentication_service';
import { AuthenticationController } from './controller/authentication_controller';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Configure CORS middleware
app.use(cors({
    origin: 'http://localhost:4200', // Allow requests from this origin
    credentials: true, // Enable CORS credentials if needed (cookies, authorization headers)
}));

const port = process.env.PORT || 3000;

const authenticationRepository = new AuthenticationRepositoryImplPostgres(pool);
const authenticationService = new AuthenticationService(authenticationRepository);
const authenticationController = new AuthenticationController(authenticationService);

app.get('/', (req: Request, res: Response) => {res.send('Hello, TypeScript Node.js Backend!');});

// Authentication
app.post("/authentication/login", (req: Request, res: Response) => authenticationController.login(req, res));
app.get("/authentication/:userEmail", (req: Request, res: Response) => authenticationController.findUserByEmail(req, res));
app.post("/authentication/createuser", (req: Request, res: Response) => authenticationController.createUser(req, res));
app.put("/authentication/updatePassword/:userEmail", (req: Request, res: Response) => authenticationController.updateUserPassword(req, res));

app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});
