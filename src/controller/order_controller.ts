import { Request, Response } from 'express';
import { OrderService } from '../service/order_service';
import { Order } from '../model/order_model';
import logger from '../utils/logger';

export class OrderController {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.orderService = orderService;
    }

    async getPaginatedOrders(req: Request, res: Response) {
        try {
            const sellerEmail: string = req.query.sellerEmail as string;
            const page: number = parseInt(req.query.page as string);
            const orders: Order[] | null =  await this.orderService.getPaginatedOrders(page, sellerEmail);

            console.log(orders);

            if (!orders) {
                res.status(404).json({ error: 'There are no order' });
            } else {
                res.status(200).json({ orders });
            }

        } catch (error) {
            logger.error(`Error getting orders: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}