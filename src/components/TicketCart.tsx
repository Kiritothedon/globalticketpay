import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard, Trash2, Plus, Loader2 } from "lucide-react";
import { Ticket } from "@/lib/supabase";

interface TicketCartProps {
  tickets: Ticket[];
  onTicketsUpdate: (tickets: Ticket[]) => void;
  onCheckout: (selectedTickets: Ticket[], total: number) => void;
}

export function TicketCart({
  tickets,
  onTicketsUpdate,
  onCheckout,
}: TicketCartProps) {
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(
    new Set()
  );
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const serviceFeeRate = 0.1; // 10% service fee
  const flatServiceFee = 10; // $10 flat fee

  const selectedTicketsList = tickets.filter((ticket) =>
    selectedTickets.has(ticket.id)
  );
  const subtotal = selectedTicketsList.reduce(
    (sum, ticket) => sum + ticket.amount,
    0
  );
  const serviceFee = Math.max(subtotal * serviceFeeRate, flatServiceFee);
  const total = subtotal + serviceFee;

  const handleTicketSelect = (ticketId: string, checked: boolean) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(ticketId);
    } else {
      newSelected.delete(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(new Set(tickets.map((ticket) => ticket.id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleRemoveTicket = (ticketId: string) => {
    onTicketsUpdate(tickets.filter((ticket) => ticket.id !== ticketId));
    const newSelected = new Set(selectedTickets);
    newSelected.delete(ticketId);
    setSelectedTickets(newSelected);
  };

  const handleCheckout = async () => {
    if (selectedTicketsList.length === 0) return;

    setIsCheckoutLoading(true);
    try {
      await onCheckout(selectedTicketsList, total);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "disputed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600 mb-4">
              Add tickets to get started with payment processing
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard/add-ticket")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Ticket Cart ({selectedTicketsList.length} selected)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select tickets to pay and proceed to checkout
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedTickets.size === tickets.length && tickets.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Select All
              </Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className={`transition-all ${
              selectedTickets.has(ticket.id)
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                : ""
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  id={`ticket-${ticket.id}`}
                  checked={selectedTickets.has(ticket.id)}
                  onCheckedChange={(checked) =>
                    handleTicketSelect(ticket.id, checked as boolean)
                  }
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.ticket_number}
                        </h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p>
                            <span className="font-medium">Court:</span>{" "}
                            {ticket.court}
                          </p>
                          <p>
                            <span className="font-medium">Violation:</span>{" "}
                            {ticket.violation}
                          </p>
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {ticket.due_date}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">State:</span>{" "}
                            {ticket.state}
                          </p>
                          <p>
                            <span className="font-medium">County:</span>{" "}
                            {ticket.county}
                          </p>
                          <p>
                            <span className="font-medium">Amount:</span>{" "}
                            <span className="font-semibold text-green-600">
                              ${ticket.amount.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTicket(ticket.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checkout Summary */}
      {selectedTicketsList.length > 0 && (
        <Card className="sticky bottom-0 bg-white dark:bg-gray-900 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({selectedTicketsList.length} tickets):</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>
                  Service Fee ({Math.round(serviceFeeRate * 100)}% or min $10):
                </span>
                <span className="font-medium">${serviceFee.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full"
                size="lg"
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
