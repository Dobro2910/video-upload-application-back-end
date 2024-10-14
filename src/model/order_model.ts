export interface Order {
    orderId: string;
    productId: string[];
    productName: string[];
    productDescription: string[];
    productPrice: number[];
    productGender: string[];
    productImage: string[];
    productColor: string[];
    productSize: string[];
    productQuantity: number[];
    deliveryLocation: string;
    buyerEmail: string;
    totalPrice: number;
    orderDelivered: boolean[];

    productIndexArray: number[] | null;
}

export function validatePaymentOrder(order: Order): string {
    // Validate arrays in the order object
    if (!order.productName || order.productName.length === 0) {
        return "At least one product is required.";
    }

    for (let i = 0; i < order.productName.length; i++) {
        if (!order.productName[i] || order.productName[i].length === 0) {
            return `Product name is required for product at index ${i}.`;
        }

        if (!order.productDescription[i] || order.productDescription[i].length === 0) {
            return `Product description is required for product at index ${i}.`;
        }

        if (!order.productPrice[i] || isNaN(order.productPrice[i]) || order.productPrice[i] <= 0) {
            return `Invalid product price for product at index ${i}.`;
        }

        if (!order.productGender[i] || order.productGender[i].length === 0) {
            return `Product gender is required for product at index ${i}.`;
        }

        if (!order.productImage[i] || order.productImage[i].length === 0) {
            return `Product image is required for product at index ${i}.`;
        }

        if (order.productColor[i] !== null && order.productColor[i].length === 0) {
            return `Product color must be specified if provided for product at index ${i}.`;
        }

        if (order.productSize[i] !== null && order.productSize[i].length === 0) {
            return `Product size must be specified if provided for product at index ${i}.`;
        }

        if (!order.productQuantity[i] || isNaN(order.productQuantity[i]) || order.productQuantity[i] <= 0) {
            return `Invalid product quantity for product at index ${i}.`;
        }
    }

    // Validate deliveryLocation
    if (!order.deliveryLocation || order.deliveryLocation.trim().length === 0) {
        return "Delivery location is required.";
    }

    // Validate buyerEmail
    if (!order.buyerEmail || order.buyerEmail.trim().length === 0) {
        return "Buyer email is required.";
    }

    return "";
}
