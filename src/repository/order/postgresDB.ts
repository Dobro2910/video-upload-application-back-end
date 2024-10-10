
import { Pool } from 'pg';
import { Order } from '../../model/order_model';
import { OrderRepository } from '../order_repository';

export class OrderRepositoryImplPostgres implements OrderRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getPaginatedOrders(page: number, sellerEmail: string): Promise<Order[] | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const limit = 15; 
            // calculate the 18 products we need to take for n pages
            const pageRange = (page - 1) * limit;
            // use unnest function to "expand" arrays into a set of rows
            const query = `
                        WITH expanded AS (
                            SELECT 
                                unnest(p.seller_email) AS sellerEmail,
                                unnest(p.product_id) AS productId,
                                unnest(p.product_name) AS productName,
                                unnest(p.product_description) AS productDescription,
                                unnest(p.product_price) AS productPrice,
                                unnest(p.product_gender) AS productGender,
                                unnest(p.product_image) AS productImage,
                                unnest(p.product_quantity) AS productQuantity,
                                unnest(p.product_color) AS productColor,
                                unnest(p.product_size) AS productSize,
                                p.product_order_id as orderId,
                                p.delivery_location AS deliveryLocation,
                                p.buyer_email AS buyerEmail,
                                p.total_price AS totalPrice,
                                p.order_delivered AS orderDelivered
                            FROM 
                                products_customer_order p
                        )
                        SELECT 
                            ARRAY_AGG(productId) AS "productId", 
                            ARRAY_AGG(productName) AS "productName", 
                            ARRAY_AGG(productDescription) AS "productDescription", 
                            ARRAY_AGG(productPrice) AS "productPrice", 
                            ARRAY_AGG(productGender) AS "productGender", 
                            ARRAY_AGG(productImage) AS "productImage", 
                            ARRAY_AGG(productQuantity) AS "productQuantity",
                            ARRAY_AGG(productColor) AS "productColor",
                            ARRAY_AGG(productSize) AS "productSize",
                            orderId AS "orderId",
                            deliveryLocation AS "deliveryLocation", 
                            buyerEmail AS "buyerEmail", 
                            totalPrice AS "totalPrice",
                            orderDelivered AS "orderDelivered"
                        FROM 
                            expanded
                        WHERE 
                            sellerEmail = $1
                        GROUP BY 
                            orderId, deliveryLocation, buyerEmail, totalPrice, orderDelivered
                        ORDER BY 
                            totalPrice
                        LIMIT $2 OFFSET $3;
                        `;
            const result = await this.pool.query(query,[sellerEmail, limit, pageRange]);

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

    async completeOrder(orderId: string): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            
            // Update the specific order using an order ID to avoid updating all rows.
            const result = await postgresDB.query(
                `UPDATE products_customer_order 
                SET order_delivered = true 
                WHERE product_order_id = $1`,
                [orderId]
            );

            // Check if any rows were updated
            if (result.rowCount && result.rowCount > 0) {
                return "Order Completed!";
            } else {
                console.log("Order not found or no updates made.");
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
}
