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

    async getAllProduct(req: Request, res: Response) {
        try {
            const products: Product[] | null =  await this.productService.getAllProduct();

            if (!products) {
                res.status(404).json({ error: 'There are no product' });
            } else {
                res.status(200).json({ products });
            }

        } catch (error) {
            logger.error(`Error getting all product: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getPaginatedProducts(req: Request, res: Response) {
        try {
            const page: number = parseInt(req.query.page as string);
            const products: Product[] | null =  await this.productService.getPaginatedProducts(page);

            if (!products) {
                res.status(404).json({ error: 'There are no product' });
            } else {
                res.status(200).json({ products });
            }

        } catch (error) {
            logger.error(`Error getting products: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
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
            logger.error(`Error getting product info: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async findProductByFilter(req: Request, res: Response) {
        try {
            const filterPage: number = parseInt(req.query.filterPage as string);
            const productPrice: number | undefined = req.query.productPrice ? parseFloat(req.query.productPrice as string) : undefined;
            const productSize: string | null = req.query.productSize ? req.query.productSize as string : null;
            const productCategory: string | null = req.query.productCategory ? req.query.productCategory as string : null;
            const productGender: string | null = req.query.productGender ? req.query.productGender as string : null;
            const productBrand: string | null = req.query.productBrand ? req.query.productBrand as string : null;

            const products: Product[] | null =  await this.productService.findProductByFilter(filterPage, productPrice, productSize, productCategory, productGender, productBrand);

            if (!products) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(200).json({ products });
            }

        } catch (error) {
            logger.error(`Error finding product by filter: ${(error as Error).message}`);
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
                productStock
            } = req.body;
            
            const productCreatedAt: Date = new Date();
            const productAmountSold: number = 0;

            // Create the Product object
            const product: Product = {
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
            };
    
            // Call ProductService to create the product
            const result = await this.productService.createProduct(product);
    
            if (!result) {
                res.status(401).json({ error: 'Create product failed: Validation fail' });
            } else {
                res.status(200).json({ message: 'Successful Registration' });
            }
        } catch(error) {
            logger.error(`Error creating product: ${(error as Error).message}`);
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
            logger.error(`Error deleting product: ${(error as Error).message}`)
            res.status(500).send('Internal Server Error');
        }
    }
}