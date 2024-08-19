import { Request, Response } from 'express';
import { PaymentOrder } from '../model/payment_model';
import { PaymentService } from '../service/payment_service';
import logger from '../utils/logger';

export class PaymentController {
    // this is used to insert existing authentication Repo inside so as not to create a new Authentication Repo everytime
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    async saveProductsOrder(req: Request, res: Response) {
        try {
            const paymentsOrder: PaymentOrder[] = req.body;  // Assuming the array of orders is sent in the body
            
            const savedOrder: string | null = await this.paymentService.savePaymentOrder(paymentsOrder);
    
            // Check if the order was saved successfully
            if (savedOrder) {
                res.status(200).json({ message: 'Order Successful' });
            } else {
                res.status(400).json({ error: 'Order could not be processed' });
            }
        } catch(error) {
            logger.error(`Error saving payment order: ${(error as Error).message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}