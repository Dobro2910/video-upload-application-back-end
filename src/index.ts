import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import pool from './config/postgresdb';
import dotenv from "dotenv";

// Authentication
import { AuthenticationRepositoryImplPostgres } from './repository/authentication/postgresDB';
import { AuthenticationService } from './service/authentication_service';
import { AuthenticationController } from './controller/authentication_controller';

// Authentication
import { ProductRepositoryImplPostgres } from './repository/product/postgresDB';
import { ProductService } from './service/product_service';
import { ProductController } from './controller/product_controller';

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

app.get('/', (req: Request, res: Response) => {res.send('Hello, TypeScript Node.js Backend!');});

// Authentication
const authenticationRepository = new AuthenticationRepositoryImplPostgres(pool);
const authenticationService = new AuthenticationService(authenticationRepository);
const authenticationController = new AuthenticationController(authenticationService);

app.post("/authentication/login", (req: Request, res: Response) => authenticationController.login(req, res));
app.get("/authentication/:userEmail", (req: Request, res: Response) => authenticationController.findUserByEmail(req, res));
app.post("/authentication/createuser", (req: Request, res: Response) => authenticationController.createUser(req, res));
app.put("/authentication/updatePassword/:userEmail", (req: Request, res: Response) => authenticationController.updateUserPassword(req, res));

// Product
const productRepository = new ProductRepositoryImplPostgres(pool);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

app.get("/product/:productId", (req: Request, res: Response) => productController.getProductInfo(req, res));
app.get("/product/filter", (req: Request, res: Response) => productController.findProductByFilter(req, res));
app.post("/product/createproduct", (req: Request, res: Response) => productController.createProduct(req, res));
app.put("/product/updateProductStock/:productId", (req: Request, res: Response) => productController.updateProductStock(req, res));
app.delete("/product/delete/:productId", (req: Request, res: Response) => productController.deleteProduct(req, res));

app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});
