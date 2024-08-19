import { PaymentOrder } from "../model/payment_model";

// This is the repository layer. It is responsible for handling database operations.
export interface PaymentRepository {
    savePaymentOrder(paymentsOrder: PaymentOrder[]): Promise<string | null>;
}