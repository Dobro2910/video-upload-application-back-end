import { ProductRepository } from '../product_repository';
import { Product, validateProduct, ProductColorVarietyDetail, validateProductColorVarietyDetail, ProductDisplay } from '../../model/product_model';
import { Pool } from 'pg';

export class ProductRepositoryImplPostgres implements ProductRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getPaginatedProducts(page: number): Promise<ProductDisplay[] | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const limit = 18;
            // calculate the 18 products we need to take for n pages
            const pageRange = (page - 1) * limit;
            const query = `
                        SELECT 
                            p.product_id AS "productId", 
                            p.product_name AS "productName", 
                            p.product_description AS "productDescription", 
                            p.product_price AS "productPrice", 
                            p.product_gender AS "productGender", 
                            p.product_image AS "productImage", 
                            p.product_amount_sold AS "productAmountSold",
                            json_agg(json_build_object(
                                'productColor', pcvd.product_color,
                                'productSize', pcvd.product_size,
                                'productStock', pcvd.product_stock
                            )) AS "productColorVarietyDetail"
                        FROM 
                            products_prod p 
                        LEFT JOIN 
                            products_color_variety_detail_prod pcvd ON p.product_id = pcvd.product_id 
                        GROUP BY 
                            p.product_id
                        ORDER BY 
                            p.product_id 
                        LIMIT $1 OFFSET $2
                        `;
            const result = await this.pool.query(query,[limit, pageRange]);

            if (result.rowCount === 0) {
                return null;
            }

            return result.rows;

            // console.log(result.rows);
    
            // // Transform the data to match the ProductDisplay interface
            // const products = result.rows.map(row => {
            //     const productColorVarietyDetailMap: { [key: string]: ProductColorVarietyDetail } = {};
    
            //     row.productcolorvarietydetail.forEach((productDetail: any) => {
            //         // if there are no color, insert the product detail in the map
            //         if (!productColorVarietyDetailMap[productDetail.productColor]) {
            //             productColorVarietyDetailMap[productDetail.productColor] = {
            //                 productColor: productDetail.productColor,
            //                 productSize: productDetail.productSize,
            //                 productStock: productDetail.productStock
            //             };
            //         } else {
            //             productColorVarietyDetailMap[productDetail.productColor].productSize.push(...productDetail.productSize);
            //             productColorVarietyDetailMap[productDetail.productColor].productStock.push(...productDetail.productStock);
            //         }
            //     });
    
            //     return {
            //         productId: row.product_id,
            //         productName: row.product_name,
            //         productDescription: row.product_description,
            //         productPrice: row.product_price,
            //         productGender: row.product_gender,
            //         productImage: row.product_image,
            //         productAmountSold: row.product_amount_sold,
            //         productColorVarietyDetail: Object.values(productColorVarietyDetailMap)
            //     };
            // });
    
            // return products;
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async getPaginatedProductsByFilter(
        filterPage: number,
        productPrice: number | undefined,
        productSize?: string | null,
        productCategory?: string | null,
        productGender?: string | null,
        productBrand?: string | null): Promise<ProductDisplay[] | null> {
        let postgresDB;
        try {
            // if there are no input, return pagination of all products
            if (!productPrice && !productSize && !productCategory && !productGender && !productBrand) {
                return await this.getPaginatedProducts(filterPage);
            }
            postgresDB = await this.pool.connect();
            const conditions: string[] = [];
            const values: (string | number)[] = [];
            let index = 0;

            if (productPrice !== undefined) {
                index++;
                conditions.push('p.product_price = $' + (index).toString());
                values.push(productPrice);
            }

            if (productSize) {
                index++;
                // conditions.push('pcvd.product_size = $' + (index).toString() + ' = ANY (product_size)');
                conditions.push('$' + (index).toString() + ' = ANY (p.product_size)');
                values.push(productSize);
            }

            if (productCategory) {
                index++;
                conditions.push('p.product_category = $' + (index).toString());
                values.push(productCategory);
            }

            if (productGender) {
                index++;
                conditions.push('p.product_gender = $' + (index).toString());
                values.push(productGender);
            }

            if (productBrand) {
                index++;
                conditions.push('p.product_brand = $' + (index).toString());
                values.push(productBrand);
            }

            let query = `
                        SELECT 
                            p.product_id AS "productId", 
                            p.product_name AS "productName", 
                            p.product_description AS "productDescription", 
                            p.product_price AS "productPrice", 
                            p.product_gender AS "productGender", 
                            p.product_image AS "productImage", 
                            p.product_amount_sold AS "productAmountSold",
                            json_agg(json_build_object(
                                'productColor', pcvd.product_color,
                                'productSize', pcvd.product_size,
                                'productStock', pcvd.product_stock
                            )) AS "productColorVarietyDetail"
                        FROM 
                            products_prod p 
                        LEFT JOIN 
                            products_color_variety_detail_prod pcvd ON p.product_id = pcvd.product_id
                        `;
            const limit = 18; 
            // calculate the 18 products we need to take for n pages
            const pageRange = (filterPage - 1) * limit;

            query += 'WHERE ' + conditions.join(' AND ') + `
                        `;
            query += `GROUP BY p.product_id
                        ORDER BY p.product_id
                        ` + 'LIMIT $' + (++index).toString() + ' OFFSET $' + (++index).toString();
            values.push(limit)
            values.push(pageRange)

            const result = await postgresDB.query(query, values);

            if (result.rowCount === 0) {
                return null;
            }

            return result.rows;
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    // // Protected Endpoint
    // async createProduct(product: Product): Promise<string | null> {
    //     let postgresDB;
    //     try {
    //         postgresDB = await this.pool.connect();
    //         const validationError = validateProduct(product);
    //         if (validationError) {
    //             throw new Error(validationError);
    //         }

    //         await postgresDB.query(
    //             'INSERT INTO products (product_name, product_brand, product_category, product_color, ' +
    //             'product_description, product_gender, product_image, product_price, product_size, ' +
    //             'product_stock, product_created_at, product_amount_sold) ' +
    //             'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
    //             [
    //                 product.productName,
    //                 product.productBrand,
    //                 product.productCategory,
    //                 product.productColor,
    //                 product.productDescription,
    //                 product.productGender,
    //                 product.productImage,
    //                 product.productPrice,
    //                 product.productSize,
    //                 product.productStock,
    //                 product.productCreatedAt,
    //                 product.productAmountSold
    //             ]
    //         );

    //         return 'Successful Create Product';
    //     } catch (error) {
    //         throw error;
    //     } finally {
    //         if (postgresDB) {
    //             postgresDB.release();
    //         }
    //     }
    // }

    // async updateProductColorVarietyDetail(productId: string, productColorVarietyDetail: ProductColorVarietyDetail): Promise<void> {
    //     let postgresDB;
    //     try {
    //         postgresDB = await this.pool.connect();
    //         await postgresDB.query('UPDATE products SET product_stock = $1 WHERE product_id = $2', [productStock, productId]);
    //     } catch (error) {
    //         throw error;
    //     } finally {
    //         if (postgresDB) {
    //             postgresDB.release();
    //         }
    //     }
    // }
    
    // async deleteProduct(productId: string): Promise<void> {
    //     let postgresDB;
    //     try {
    //         postgresDB = await this.pool.connect();
    //         await postgresDB.query('DELETE FROM products WHERE product_id = $1', [productId]);
    //     } catch (error) {
    //         throw error;
    //     } finally {
    //         if (postgresDB) {
    //             postgresDB.release();
    //         }
    //     }
    // }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // async getAllProduct(): Promise<Product[] | null> {
    //     let postgresDB;
    //     try {
    //         postgresDB = await this.pool.connect();
    //         const result = await postgresDB.query('SELECT * FROM products');

    //         if (!result) {
    //             return null;
    //         }

    //         // Transform the data to match the Product interface
    //         const products = result.rows.map(row => ({
    //             productId: row.product_id,
    //             productName: row.product_name,
    //             productDescription: row.product_description,
    //             productPrice: row.product_price,
    //             productBrand: row.product_brand,
    //             productCategory: row.product_category,
    //             productColor: row.product_color,
    //             productCreatedAt: row.product_created_at,
    //             productGender: row.product_gender,
    //             productImage: row.product_image,
    //             productSize: row.product_size,
    //             productStock: row.product_stock,
    //             productAmountSold: row.product_amount_sold,
    //             productUpdatedAt: row.product_updated_at,
    //         }));

    //         return products;
    //     } catch (error) {
    //         throw error;
    //     } finally {
    //         if (postgresDB) {
    //             postgresDB.release();
    //         }
    //     }
    // }

    // Not Protected Endpoint
    // async getProductInfo(productId: string): Promise<Product | null> {
    //     let postgresDB;
    //     try {
    //         postgresDB = await this.pool.connect();
    //         const result = await postgresDB.query('SELECT * FROM products WHERE product_id = $1', [productId]);

    //         // if result = null, return null else return the product
    //         return result.rows.length ? result.rows[0] : null;
    //     } catch (error) {
    //         throw error;
    //     } finally {
    //         if (postgresDB) {
    //             postgresDB.release();
    //         }
    //     }
    // }
}
