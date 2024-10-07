import { PaymentRepository } from "../repository/payment_repository";
import { PaymentOrder } from "../model/payment_model";

export class PaymentService {
    // this is used to insert existing product Repo inside so as not to create a new Product Repo everytime
    private paymentRepository: PaymentRepository;

    constructor(paymentRepository: PaymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async savePaymentOrder(paymentOrder: PaymentOrder): Promise<string | null> {
        return await this.paymentRepository.savePaymentOrder(paymentOrder);
    }
}
