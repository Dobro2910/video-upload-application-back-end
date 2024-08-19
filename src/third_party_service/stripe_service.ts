import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20',
});

export const createPaymentIntent = async (amount: number, currency: string) => {
    return await stripe.paymentIntents.create({
        amount, // Amount in the smallest currency unit (e.g., cents for USD)
        currency, // Currency (e.g., 'usd')
        payment_method_types: ['card'], // Specify payment methods
    });
};
