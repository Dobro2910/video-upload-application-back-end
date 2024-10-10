// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// import multer to handle uploading files in the backend to aws S3
import multer from 'multer';
const upload = multer(); // Use memory storage for uploading to S3

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import pool from './config/postgresdb';

// JWT Protected Route
import jwtMiddleware from './middleware/jwtMiddleware'

// Authentication
import { AuthenticationRepositoryImplPostgres } from './repository/authentication/postgresDB';
import { AuthenticationService } from './service/authentication_service';
import { AuthenticationController } from './controller/authentication_controller';

// Authentication
import { ProductRepositoryImplPostgres } from './repository/product/postgresDB';
import { ProductService } from './service/product_service';
import { ProductController } from './controller/product_controller';

// import stripe payment
import { StripeController } from './third_party_controller/stripe_controller';
import { PaymentRepositoryImplPostgres } from './repository/payment/postgresDB';
import { PaymentService } from './service/payment_service';
import { PaymentController } from './controller/payment_controller';
import { OrderService } from "./service/order_service";
import { OrderController } from "./controller/order_controller";
import { OrderRepositoryImplPostgres } from "./repository/order/postgresDB";

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
app.post("/authentication/createuser", (req: Request, res: Response) => authenticationController.createUserRole(req, res));
app.put("/authentication/updatePassword/:userEmail", (req: Request, res: Response) => authenticationController.updateUserPassword(req, res));
app.put("/authentication/updateProfile/:userEmail", jwtMiddleware(['User', 'Seller', 'Admin']), upload.single('userImage'), (req: Request, res: Response) => authenticationController.updateUserProfile(req, res));
app.get("/authentication/getprofile/:userEmail", jwtMiddleware(['User', 'Seller', 'Admin']), (req: Request, res: Response) => authenticationController.getUserByEmail(req, res));
app.post("/authentication/createadminrole", jwtMiddleware(['Admin']), (req: Request, res: Response) => authenticationController.createAdminRole(req, res));

// Product
const productRepository = new ProductRepositoryImplPostgres(pool);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

app.get("/product/getpaginatedproduct", (req: Request, res: Response) => productController.getPaginatedProducts(req, res));
app.get("/product/search/filter", (req: Request, res: Response) => productController.getPaginatedProductsByFilter(req, res));
// app.get("/product/allproduct", (req: Request, res: Response) => productController.getAllProduct(req, res));
// app.get("/product/:productId", (req: Request, res: Response) => productController.getProductInfo(req, res));

app.post("/product/createproduct", jwtMiddleware(['Seller', 'Admin']), upload.single('productImage'), (req: Request, res: Response) => productController.createProduct(req, res));
// app.put("/product/updateproductcolorvarietydetail/:productId", jwtMiddleware, (req: Request, res: Response) => productController.updateProductStock(req, res));
// app.delete("/product/delete/:productId", jwtMiddleware(['Seller', 'Admin']), (req: Request, res: Response) => productController.deleteProduct(req, res));

// Payment
const paymentRepository = new PaymentRepositoryImplPostgres(pool);
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

app.post("/payment/saveorder", jwtMiddleware(['User', 'Seller', 'Admin']), (req: Request, res: Response) => paymentController.saveProductsOrder(req, res));

// Order
const orderRepository = new OrderRepositoryImplPostgres(pool);
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

app.get("/order/getpaginatedorders", jwtMiddleware(['Seller', 'Admin']), (req: Request, res: Response) => orderController.getPaginatedOrders(req, res));
app.put("/order/completeorder", jwtMiddleware(['Seller', 'Admin']), (req: Request, res: Response) => orderController.completeOrder(req, res));

// Stripe Payment
app.post('/create-payment-intent', (req: Request, res: Response) => StripeController.createPaymentIntent(req, res));

app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});
