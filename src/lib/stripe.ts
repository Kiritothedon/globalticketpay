import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };

// Stripe configuration
export const STRIPE_CONFIG = {
  // You can add more configuration here as needed
  currency: 'usd',
  mode: 'payment' as const,
};

// Payment intent creation (this would typically be done on your backend)
export const createPaymentIntent = async (amount: number, ticketId: string) => {
  // This is a placeholder - in a real app, you'd call your backend API
  // which would create a payment intent with Stripe
  console.log(`Creating payment intent for $${amount} for ticket ${ticketId}`);
  
  // For now, return a mock payment intent
  return {
    clientSecret: 'mock_client_secret',
    amount: amount * 100, // Stripe expects amounts in cents
    currency: 'usd',
  };
};
