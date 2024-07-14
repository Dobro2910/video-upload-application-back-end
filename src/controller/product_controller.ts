import { Request, Response } from 'express';
import { Product } from '../model/product_model';
import { ProductService } from "../service/product_service";
import logger from '../utils/logger';

export class ProductController {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private productService: ProductService;

    constructor(productService: ProductService) {
        this.productService = productService;
    }

    async getProductInfo(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            const product: Product | null =  await this.productService.getProductInfo(productId);

            if (!product) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(200).json({ product });
            }

        } catch (error) {
            logger.error(`Error logging in: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
    }

    async findProductByFilter(req: Request, res: Response) {
        try {
            const productPrice: number | undefined = req.params.productPrice ? parseFloat(req.params.productPrice) : undefined;
            const productCategory: string | null = req.params.productCategory;
            const productGender: string | null = req.params.productGender;
            const productBrand: string | null = req.params.productBrand;
            const productSize: number | undefined = req.params.productSize ? parseFloat(req.params.productSize) : undefined;

            const products: Product[] | null =  await this.productService.findProductByFilter(productPrice, productCategory, productGender, productBrand, productSize);

            if (!products) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(200).json({ products });
            }

        } catch (error) {
            logger.error(`Error logging in: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
    }

    async createProduct(req: Request, res: Response) {
        try {
            const {
                productName,
                productBrand,
                productCategory,
                productColor,
                productDescription,
                productGender,
                productImage,
                productPrice,
                productSize,
                productStock,
                productAmountSold
            } = req.body;
    
            const productCreatedAt: Date = new Date();
    
            // Call ProductService to create the product
            const result = await this.productService.createProduct({
                productName,
                productBrand,
                productCategory,
                productColor,
                productDescription,
                productGender,
                productImage,
                productPrice,
                productSize,
                productStock,
                productCreatedAt,
                productAmountSold
            });
    
            if (!result) {
                res.status(401).json({ error: 'Create product failed: Validation fail' });
            } else {
                res.status(200).json({ message: 'Successful Registration' });
            }
        } catch(error) {
            logger.error(`Error logging in: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateProductStock(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            const productStock = req.body.productStock;
            await this.productService.updateProductStock(productId, productStock);

            res.status(200).send("OK");
        } catch(error) {
            logger.error(`Error updating product stock: ${(error as Error).message}`)
            res.status(500).send('Internal Server Error');
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            await this.productService.deleteProduct(productId);

            res.status(200).send("OK");
        } catch(error) {
            logger.error(`Error updating product stock: ${(error as Error).message}`)
            res.status(500).send('Internal Server Error');
        }
    }
}