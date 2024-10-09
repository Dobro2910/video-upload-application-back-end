import { Order } from "../model/order_model";
import { OrderRepository } from "../repository/order_repository";

export class OrderService {
    // this is used to insert existing product Repo inside so as not to create a new Product Repo everytime
    private orderRepository: OrderRepository;

    constructor(orderRepository: OrderRepository) {
        this.orderRepository = orderRepository;
    }

    async getPaginatedOrders(page: number, sellerEmail: string): Promise<Order[] | null> {
        return await this.orderRepository.getPaginatedOrders(page, sellerEmail);
    }
}