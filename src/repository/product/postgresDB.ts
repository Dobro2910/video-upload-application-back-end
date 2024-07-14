import { ProductRepository } from '../product_repository';
import { Product, validate } from '../../model/product_model';
import { Pool } from 'pg';
// import bcrypt from 'bcrypt';
// import { JwtUtils } from "../../utils/jwt";

export class ProductRepositoryImplPostgres implements ProductRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getProductInfo(productId: string): Promise<Product | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT * FROM products WHERE product_id = $1', [productId]);

            // if result = null, return null else return the product
            return result.rows.length ? result.rows[0] : null;
            // const product: Product | null = result.rows.length ? result.rows[0] : null;
            
        } catch (error) {
            throw new Error('Internal Server Error');
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async findProductByFilter(productPrice?: number, 
                        productCategory?: string, 
                        productGender?: string, 
                        productBrand?: string, 
                        productSize?: string): Promise<Product[] | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const searchKeywordMap: Map<string, string> = new Map();

            if (productPrice) {
                const productPriceString = productPrice?.toString();
                searchKeywordMap.set('product_price', productPriceString);
            } else if (productCategory) {
                searchKeywordMap.set('product_category', productCategory);
            } else if (productGender) {
                searchKeywordMap.set('product_gender', productGender);
            } else if (productBrand) {
                searchKeywordMap.set('product_brand', productBrand);
            } else if (productSize) {
                searchKeywordMap.set('product_size', productSize);
            }

            const searchKeywordMapSize = searchKeywordMap.size;
            const entriesArray = Array.from(searchKeywordMap.entries());

            let query = 'SELECT * FROM products WHERE ';
            const conditions: string[] = [];
            const values: (string | number)[] = [];

            if (searchKeywordMapSize > 0) {
                entriesArray.forEach(([key, value], index) => {
                    if (key == 'product_price') {
                        values.push(Number(value)); // Convert to number if necessary
                    }
                    conditions.push(`${key} = $${index + 1}`);
                    values.push(value);
                });

                query += conditions.join(' AND ');

                const result = await postgresDB.query(query, values);
                return result.rows.length ? result.rows : null;
            } else {
                // If no filters are provided, return null or handle accordingly
                return null;
            }
        } catch (error) {
            throw new Error('Internal Server Error');
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async createProduct(product: Product): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const validationError = validate(product);
            if (validationError) {
                throw new Error(validationError);
            }

            const productCreatedAt: Date = new Date();

            await postgresDB.query(
                'INSERT INTO products (product_name, product_brand, product_category, product_color, ' +
                'product_description, product_gender, product_image, product_price, product_size, ' +
                'product_stock, product_created_at, product_amount_sold) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                [
                    product.productName,
                    product.productBrand,
                    product.productCategory,
                    product.productColor,
                    product.productDescription,
                    product.productGender,
                    product.productImage,
                    product.productPrice,
                    product.productSize,
                    product.productStock,
                    productCreatedAt, // Assuming productCreatedAt is correctly formatted for PostgreSQL date type
                    0
                ]
            );

            return 'Successful Create Product';
        } catch (error) {
            throw new Error('Internal Server Error');
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async updateProductStock(productId: string, productStock: number): Promise<void> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            await postgresDB.query('UPDATE products SET user_stock = $1 WHERE product_id = $2', [productStock, productId]);
        } catch (error) {
            throw new Error('Internal Server Error');
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }
    
    async deleteProduct(productId: string): Promise<void> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            await postgresDB.query('DELETE FROM products WHERE product_id = $1', [productId]);
        } catch (error) {
            throw new Error('Internal Server Error');
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }
}
