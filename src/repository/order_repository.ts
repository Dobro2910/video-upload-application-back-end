import { Order } from "../model/order_model";

// This is the repository layer. It is responsible for handling database operations.
export interface OrderRepository {
    getPaginatedOrders(page: number, sellerEmail: string): Promise<Order[] | null>;
    completeOrder(orderId: string): Promise<string | null>;
}