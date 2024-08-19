import { Request, Response } from 'express';
import { createPaymentIntent } from '../third_party_service/stripe_service';

export class StripeController {
    public static async createPaymentIntent(req: Request, res: Response) {
        const { amount, currency } = req.body;

        try {
            const paymentIntent = await createPaymentIntent(amount, currency);
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}
