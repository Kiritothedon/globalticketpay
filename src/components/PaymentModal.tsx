import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketAmount: number;
  ticketNumber: string;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  ticketAmount, 
  ticketNumber, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
      onClose();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ticket #{ticketNumber}</span>
                <span className="font-semibold">${ticketAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card Details Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardholder-name">Cardholder Name</Label>
              <Input
                id="cardholder-name"
                placeholder="John Doe"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails(prev => ({ 
                  ...prev, 
                  cardNumber: formatCardNumber(e.target.value) 
                }))}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    expiryDate: formatExpiryDate(e.target.value) 
                  }))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                  }))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName}
            >
              {isProcessing ? 'Processing...' : `Pay $${ticketAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
