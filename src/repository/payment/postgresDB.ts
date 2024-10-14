import { PaymentRepository } from '../payment_repository';
import { PaymentOrder, validatePaymentOrder } from '../../model/payment_model';
import { Pool } from 'pg';

export class PaymentRepositoryImplPostgres implements PaymentRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // BEGIN:
    // This statement starts a new transaction. All subsequent SQL statements will be part of this transaction until a COMMIT or ROLLBACK is issued.
    
    // COMMIT:
    // This statement ends the transaction and makes all changes made during the transaction permanent in the database. Once committed, the changes cannot be undone.

    // ROLLBACK:
    // If an error occurs during the transaction, ROLLBACK undoes all the changes made during the transaction, leaving the database in its previous state. 
    // This is useful to prevent partial updates that could lead to data corruption or inconsistency.
    async savePaymentOrder(paymentOrder: PaymentOrder): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            
            // Begin transaction
            await postgresDB.query('BEGIN');
            // Validate each product order
            const validationError = validatePaymentOrder(paymentOrder);
            if (validationError) {
                throw new Error(validationError);
            }

            const productIdArray = [];
            const productNameArray = [];
            const productDescriptionArray = [];
            const productPriceArray: number[] = [];
            const productGenderArray = [];
            const productImageArray = [];
            const productColorArray = [];
            const productSizeArray = [];
            const productQuantityArray: number[] = [];
            const sellerEmailArray = [];
            const orderDeliveredArray: boolean[] = [];

            for (const productInCart of paymentOrder.productsInCart) {
                productIdArray.push(productInCart.productId);
                productNameArray.push(productInCart.productName);
                productDescriptionArray.push(productInCart.productDescription);
                productPriceArray.push(Number(productInCart.productPrice)); 
                productGenderArray.push(productInCart.productGender);
                productImageArray.push(productInCart.productImage);
                productColorArray.push(productInCart.productColor);
                productSizeArray.push(productInCart.productSize);
                productQuantityArray.push(Number(productInCart.productQuantity)); 
                sellerEmailArray.push(productInCart.sellerEmail);
                orderDeliveredArray.push(false);

                // Update productAmountSold in the products table
                await postgresDB.query(
                    `UPDATE products_prod 
                    SET product_amount_sold = product_amount_sold + $1 
                    WHERE product_id = $2`,
                    [productInCart.productQuantity, productInCart.productId]
                );
    
                // Update productStock in the products_color_variety_detail_prod table
                await postgresDB.query(
                    `UPDATE products_color_variety_detail_prod 
                    SET product_stock[ARRAY_POSITION(product_size, $4)] = product_stock[ARRAY_POSITION(product_size, $4)] - $1
                    WHERE product_id = $2 AND product_color = $3 AND $4 = ANY(product_size);`,
                    [productInCart.productQuantity, productInCart.productId, productInCart.productColor, productInCart.productSize]
                );
            }

            // Insert the product order into the customer orders table
            await postgresDB.query(
                `INSERT INTO products_customer_order
                (product_id, product_name, product_description, product_price, product_gender, product_image, product_color, product_size, product_quantity, seller_email, delivery_location, buyer_email, total_price, order_delivered)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    productIdArray,
                    productNameArray,
                    productDescriptionArray,
                    productPriceArray,
                    productGenderArray,
                    productImageArray,
                    productColorArray,
                    productSizeArray,
                    productQuantityArray,
                    sellerEmailArray,
                    paymentOrder.deliveryLocation,
                    paymentOrder.buyerEmail,
                    paymentOrder.totalPrice,
                    orderDeliveredArray
                    // paymentOrder.orderDelivered,
                ]
            );
    
            // Commit transaction
            await postgresDB.query('COMMIT');
    
            return 'Order Successful';
        } catch (error) {
            if (postgresDB) {
                await postgresDB.query('ROLLBACK');  // Rollback transaction in case of error
            }
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }
}
