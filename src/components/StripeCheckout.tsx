import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, XCircle, CreditCard } from "lucide-react";
import { Ticket } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeCheckoutProps {
  tickets: Ticket[];
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

function CheckoutForm({
  tickets,
  total,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent
    createPaymentIntent();
  }, [tickets, total]);

  const createPaymentIntent = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if Stripe is properly configured
      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe is not configured. Please contact support.");
      }

      // In a real app, this would call your backend API
      // For now, we'll create a mock payment intent
      const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setClientSecret(mockClientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to initialize payment. Please try again."
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // In a real app, you would confirm the payment with your backend
      // For now, we'll simulate a successful payment
      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Test User", // In real app, get from user profile
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Mark tickets as paid in database
      await markTicketsAsPaid(tickets);

      onSuccess(clientSecret);
    } catch (error) {
      console.error("Payment failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const markTicketsAsPaid = async (tickets: Ticket[]) => {
    try {
      const ticketIds = tickets.map((ticket) => ticket.id);

      const { error } = await supabase
        .from("tickets")
        .update({
          status: "paid",
          payment_date: new Date().toISOString(),
          payment_method: "stripe",
        })
        .in("id", ticketIds);

      if (error) {
        throw new Error("Failed to update ticket status");
      }
    } catch (error) {
      console.error("Error updating tickets:", error);
      throw error;
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </CardTitle>
          {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mt-2">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Development Mode:</strong> Stripe is not configured.
                This is a demo payment form.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal ({tickets.length} tickets):</span>
              <span>
                $
                {tickets
                  .reduce((sum, ticket) => sum + ticket.amount, 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Service Fee:</span>
              <span>
                $
                {(
                  total -
                  tickets.reduce((sum, ticket) => sum + ticket.amount, 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total:</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function StripeCheckout({
  tickets,
  total,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    mode: "payment",
    amount: Math.round(total * 100), // Convert to cents
    currency: "usd",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        tickets={tickets}
        total={total}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
