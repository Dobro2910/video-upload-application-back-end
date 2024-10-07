import { PaymentOrder } from "../model/payment_model";

// This is the repository layer. It is responsible for handling database operations.
export interface PaymentRepository {
    savePaymentOrder(paymentOrder: PaymentOrder): Promise<string | null>;
}