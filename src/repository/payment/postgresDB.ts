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
    async savePaymentOrder(paymentsOrder: PaymentOrder[]): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            
            // Begin transaction
            await postgresDB.query('BEGIN');
    
            for (const paymentOrder of paymentsOrder) {
                // Validate each product order
                const validationError = validatePaymentOrder(paymentOrder);
                if (validationError) {
                    throw new Error(validationError);
                }
    
                // Insert the product order into the customer orders table
                await postgresDB.query(
                    `INSERT INTO products_customer_order
                    (product_id, product_name, product_description, product_price, product_gender, product_image, product_color, product_size, product_quantity, delivery_location, buyer_email, seller_email)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [
                        paymentOrder.productId,
                        paymentOrder.productName,
                        paymentOrder.productDescription,
                        paymentOrder.productPrice,
                        paymentOrder.productGender,
                        paymentOrder.productImage,
                        paymentOrder.productColor,
                        paymentOrder.productSize,
                        paymentOrder.productQuantity,
                        paymentOrder.deliveryLocation,
                        paymentOrder.buyerEmail,
                        paymentOrder.sellerEmail
                    ]
                );
    
                // Update productAmountSold in the products table
                await postgresDB.query(
                    `UPDATE products_prod 
                    SET product_amount_sold = product_amount_sold + $1 
                    WHERE product_id = $2`,
                    [paymentOrder.productQuantity, paymentOrder.productId]
                );
    
                // Update productStock in the products_color_variety_detail_prod table
                await postgresDB.query(
                    `UPDATE products_color_variety_detail_prod 
                    SET product_stock[ARRAY_POSITION(product_size, $4)] = product_stock[ARRAY_POSITION(product_size, $4)] - $1
                    WHERE product_id = $2 AND product_color = $3 AND $4 = ANY(product_size);`,
                    [paymentOrder.productQuantity, paymentOrder.productId, paymentOrder.productColor, paymentOrder.productSize]
                );
            }
    
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
