import { ProductInCart } from "./product_model";

export interface PaymentOrder {
    productsInCart: ProductInCart[];

    deliveryLocation: string;
    buyerEmail: string;
    // colorVarietyId: string;
    // orderDelivered: boolean;
    totalPrice: number;
}

export function validatePaymentOrder(paymentOrder: PaymentOrder): string {
    // Validate productsInCart array
    if (!paymentOrder.productsInCart || paymentOrder.productsInCart.length === 0) {
        return "At least one product is required.";
    }

    for (let i = 0; i < paymentOrder.productsInCart.length; i++) {
        const product = paymentOrder.productsInCart[i];

        if (!product.productId || product.productId.length === 0) {
            return `Product ID is required for product at index ${i}.`;
        }

        if (!product.productName || product.productName.length === 0) {
            return `Product name is required for product at index ${i}.`;
        }

        if (!product.productDescription || product.productDescription.length === 0) {
            return `Product description is required for product at index ${i}.`;
        }

        if (!product.productPrice || isNaN(product.productPrice) || product.productPrice <= 0) {
            return `Invalid product price for product at index ${i}.`;
        }

        if (!product.productGender || product.productGender.length === 0) {
            return `Product gender is required for product at index ${i}.`;
        }

        if (!product.productImage || product.productImage.length === 0) {
            return `Product image is required for product at index ${i}.`;
        }

        if (product.productColor !== null && product.productColor.length === 0) {
            return `Product color must be specified if provided for product at index ${i}.`;
        }

        if (product.productSize !== null && product.productSize.length === 0) {
            return `Product size must be specified if provided for product at index ${i}.`;
        }

        if (!product.productQuantity || isNaN(product.productQuantity) || product.productQuantity <= 0) {
            return `Invalid product quantity for product at index ${i}.`;
        }
    }

    // Validate deliveryLocation
    if (!paymentOrder.deliveryLocation || paymentOrder.deliveryLocation.trim().length === 0) {
        return "Delivery location is required.";
    }

    // Validate buyerEmail
    if (!paymentOrder.buyerEmail || paymentOrder.buyerEmail.trim().length === 0) {
        return "Buyer email is required.";
    }

    return "";
}