import { ProductRepository } from '../product_repository';
import { Product, validate } from '../../model/product_model';
import { Pool } from 'pg';

export class ProductRepositoryImplPostgres implements ProductRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Not Protected Endpoint
    async getProductInfo(productId: string): Promise<Product | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT * FROM products WHERE product_id = $1', [productId]);

            // if result = null, return null else return the product
            return result.rows.length ? result.rows[0] : null;
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async findProductByFilter(productPrice: number | undefined,
        productSize: number | undefined,
        productCategory?: string | null,
        productGender?: string | null,
        productBrand?: string | null): Promise<Product[] | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const conditions: string[] = [];
            const values: (string | number)[] = [];
            let index = 0;

            if (productPrice !== undefined) {
                index++;
                conditions.push('product_price = $' + (index).toString());
                values.push(productPrice);
            }

            if (productSize !== undefined) {
                index++;
                conditions.push('product_size = $' + (index).toString());
                values.push(productSize);
            }

            if (productCategory) {
                index++;
                conditions.push('product_category = $' + (index).toString());
                values.push(productCategory);
            }

            if (productGender) {
                index++;
                conditions.push('product_gender = $' + (index).toString());
                values.push(productGender);
            }

            if (productBrand) {
                index++;
                conditions.push('product_brand = $' + (index).toString());
                values.push(productBrand);
            }

            let query = 'SELECT * FROM products';
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');

                // console.log(query);
                const result = await postgresDB.query(query, values);
                return result.rows.length ? result.rows : null;
            } else {
                // If no filters are provided, return null or handle accordingly
                return null;
            }
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }


    // Protected Endpoint
    async createProduct(product: Product): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const validationError = validate(product);
            if (validationError) {
                throw new Error(validationError);
            }

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
                    product.productCreatedAt,
                    product.productAmountSold
                ]
            );

            return 'Successful Create Product';
        } catch (error) {
            throw error;
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
            await postgresDB.query('UPDATE products SET product_stock = $1 WHERE product_id = $2', [productStock, productId]);
        } catch (error) {
            throw error;
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
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }
}
