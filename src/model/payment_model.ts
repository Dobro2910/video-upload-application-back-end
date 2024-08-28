export interface PaymentOrder {
    productId: string;
    productName: string;
    productDescription: string;
    productPrice: number;
    productGender: string;
    productImage: string;
    productColor: string | null;
    productSize: string | null;
    productQuantity: number;
}

export function validatePaymentOrder(paymentOrder: PaymentOrder): string {
    if (!paymentOrder.productId || paymentOrder.productId.length === 0) {
        return "Product ID is required.";
    }

    if (!paymentOrder.productName || paymentOrder.productName.length === 0) {
        return "Product name is required.";
    }

    if (!paymentOrder.productDescription || paymentOrder.productDescription.length === 0) {
        return "Product description is required.";
    }

    if (!paymentOrder.productPrice || isNaN(paymentOrder.productPrice) || paymentOrder.productPrice <= 0) {
        return "Invalid product price.";
    }

    if (!paymentOrder.productGender || paymentOrder.productGender.length === 0) {
        return "Product gender is required.";
    }

    if (!paymentOrder.productImage || paymentOrder.productImage.length === 0) {
        return "Product image is required.";
    }

    if (paymentOrder.productColor !== null && paymentOrder.productColor.length === 0) {
        return "Product color must be specified if provided.";
    }

    if (paymentOrder.productSize !== null && paymentOrder.productSize.length === 0) {
        return "Product size must be specified if provided.";
    }

    if (!paymentOrder.productQuantity || isNaN(paymentOrder.productQuantity) || paymentOrder.productQuantity <= 0) {
        return "Invalid product quantity.";
    }

    return "";
}
