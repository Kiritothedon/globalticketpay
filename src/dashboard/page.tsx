import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  CreditCard,
  ShoppingCart,
  CheckCircle,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Ticket } from "@/lib/supabase";
import { SupabaseService } from "@/lib/supabaseService";
import { PaymentModal } from "@/components/PaymentModal";
import { TicketCart } from "@/components/TicketCart";
import { StripeCheckout } from "@/components/StripeCheckout";
import { TicketLookup } from "@/components/TicketLookup";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    ticket: Ticket | null;
  }>({ isOpen: false, ticket: null });
  const [showCart, setShowCart] = useState(false);
  const [checkoutTickets, setCheckoutTickets] = useState<Ticket[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showLookup, setShowLookup] = useState(false);

  // Load user tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userTickets = await SupabaseService.getUserTickets(user.id);
        setTickets(userTickets);
      } catch (err) {
        console.error("Error loading tickets:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "disputed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "court_date_scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleTicketsUpdate = (updatedTickets: Ticket[]) => {
    setTickets(updatedTickets);
  };

  const handleCheckout = (selectedTickets: Ticket[]) => {
    setCheckoutTickets(selectedTickets);
    setShowCheckout(true);
  };

  const handleCheckoutPaymentSuccess = (_paymentIntentId: string) => {
    setPaymentSuccess(true);
    setShowCheckout(false);
    setShowCart(false);
    // Reload tickets to show updated status
    loadTickets();
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  const handleLookupTicketsFound = async (foundTickets: Ticket[]) => {
    if (!user) return;

    try {
      // Add user_id to found tickets
      const ticketsWithUserId = foundTickets.map((ticket) => ({
        ...ticket,
        user_id: user.id,
      }));

      // Save tickets to database
      for (const ticket of ticketsWithUserId) {
        await SupabaseService.createTicket({
          user_id: ticket.user_id,
          ticket_number: ticket.ticket_number,
          violation_date: ticket.violation_date,
          due_date: ticket.due_date,
          amount: ticket.amount,
          state: ticket.state,
          county: ticket.county,
          court: ticket.court,
          violation: ticket.violation,
          violation_code: ticket.violation_code,
          violation_description: ticket.violation_description,
          driver_license_number: ticket.driver_license_number,
          driver_license_state: ticket.driver_license_state,
          date_of_birth: ticket.date_of_birth,
          license_expiration_date: ticket.license_expiration_date,
          vehicle_plate: ticket.vehicle_plate,
          vehicle_make: ticket.vehicle_make,
          vehicle_model: ticket.vehicle_model,
          vehicle_year: ticket.vehicle_year,
          vehicle_color: ticket.vehicle_color,
          officer_name: ticket.officer_name,
          officer_badge_number: ticket.officer_badge_number,
          status: ticket.status,
          notes: ticket.notes,
          court_date: ticket.court_date,
          court_location: ticket.court_location,
          payment_date: ticket.payment_date,
          payment_method: ticket.payment_method,
          payment_reference: ticket.payment_reference,
          ticket_image_url: ticket.ticket_image_url,
        });
      }

      // Reload tickets
      await loadTickets();
      setShowLookup(false);
    } catch (error) {
      console.error("Error adding found tickets:", error);
      setError("Failed to add found tickets. Please try again.");
    }
  };

  const loadTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userTickets = await SupabaseService.getUserTickets(user.id);
      setTickets(userTickets);
    } catch (err) {
      console.error("Error loading tickets:", err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate stats
  const totalOutstanding = tickets
    .filter((t) => t.status !== "paid" && t.status !== "dismissed")
    .reduce((sum, t) => sum + t.amount, 0);

  const overdueAmount = tickets
    .filter((t) => t.status === "overdue")
    .reduce((sum, t) => sum + t.amount, 0);

  const paidAmount = tickets
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const overdueCount = tickets.filter((t) => t.status === "overdue").length;
  const paidCount = tickets.filter((t) => t.status === "paid").length;

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await SupabaseService.deleteTicket(ticketId);
      setTickets(tickets.filter((t) => t.id !== ticketId));
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("Failed to delete ticket");
    }
  };

  const handlePayTicket = (ticket: Ticket) => {
    setPaymentModal({ isOpen: true, ticket });
  };

  const handlePaymentSuccess = async () => {
    if (!paymentModal.ticket) return;

    try {
      // Update ticket status to paid
      await SupabaseService.updateTicket(paymentModal.ticket.id, {
        status: "paid",
        payment_date: new Date().toISOString(),
        payment_method: "credit_card",
      });

      // Refresh tickets
      const updatedTickets = await SupabaseService.getUserTickets(user!.id);
      setTickets(updatedTickets);

      setPaymentModal({ isOpen: false, ticket: null });
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setError("Payment processed but failed to update ticket status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                My Tickets
              </h1>
              <p className="text-muted-foreground">
                Manage and track your traffic tickets
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowLookup(!showLookup)}
                className="w-full sm:w-auto"
              >
                <Search className="w-4 h-4 mr-2" />
                {showLookup ? "Hide Search" : "Search Tickets"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCart(!showCart)}
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {showCart ? "Hide Cart" : "View Cart"}
              </Button>
              <Link to="/dashboard/add-ticket">
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Ticket
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 mx-4 sm:mx-6 mt-4 rounded">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Outstanding</CardDescription>
                <CardTitle className="text-xl sm:text-2xl text-foreground">
                  {formatCurrency(totalOutstanding)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {pendingCount} ticket{pendingCount !== 1 ? "s" : ""} pending
                  payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overdue Amount</CardDescription>
                <CardTitle className="text-xl sm:text-2xl text-red-600">
                  {formatCurrency(overdueAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-red-500">
                  {overdueCount} ticket{overdueCount !== 1 ? "s" : ""} overdue
                </p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardDescription>Paid This Year</CardDescription>
                <CardTitle className="text-xl sm:text-2xl text-green-600">
                  {formatCurrency(paidAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-green-500">
                  {paidCount} ticket{paidCount !== 1 ? "s" : ""} paid
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tickets Table - Now takes up more space */}
          <Card className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Your Tickets</CardTitle>
              <CardDescription>
                All your traffic tickets in one place
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No tickets found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first ticket
                  </p>
                  <Link to="/dashboard/add-ticket">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Ticket
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto h-full">
                  <table className="w-full min-w-full">
                    <thead className="sticky top-0 bg-background z-10">
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base">
                          Ticket Number
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base">
                          Violation
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base hidden sm:table-cell">
                          Location
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base">
                          Amount
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base hidden md:table-cell">
                          Due Date
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base">
                          Status
                        </th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground text-sm sm:text-base">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <div className="font-medium text-foreground text-sm sm:text-base">
                              {ticket.ticket_number}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {ticket.court}
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-foreground">
                            <div className="text-sm sm:text-base">
                              {ticket.violation}
                            </div>
                            {ticket.violation_code && (
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                Code: {ticket.violation_code}
                              </div>
                            )}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-foreground hidden sm:table-cell">
                            <div className="text-sm sm:text-base">
                              {ticket.county}, {ticket.state}
                            </div>
                            {ticket.violation_date && (
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {formatDate(ticket.violation_date)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <span className="font-medium text-foreground text-sm sm:text-base">
                              {formatCurrency(ticket.amount)}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-muted-foreground hidden md:table-cell">
                            <span className="text-sm sm:text-base">
                              {formatDate(ticket.due_date)}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <Badge
                              className={`${getStatusColor(
                                ticket.status
                              )} border-0 text-xs sm:text-sm`}
                            >
                              {ticket.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              {ticket.status === "pending" ||
                              ticket.status === "overdue" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePayTicket(ticket)}
                                  className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                                  title="Pay Ticket"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                              ) : null}
                              {ticket.ticket_image_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      ticket.ticket_image_url,
                                      "_blank"
                                    )
                                  }
                                  className="h-8 w-8 p-0"
                                  title="View Ticket Image"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Lookup Section */}
        {showLookup && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <TicketLookup
              onTicketsFound={handleLookupTicketsFound}
              onClose={() => setShowLookup(false)}
            />
          </div>
        )}

        {/* Cart Section */}
        {showCart && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <TicketCart
              tickets={tickets}
              onTicketsUpdate={handleTicketsUpdate}
              onCheckout={handleCheckout}
            />
          </div>
        )}

        {/* Payment Success Message */}
        {paymentSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your tickets have been marked as paid and will be processed.
                  </p>
                  <Button
                    onClick={() => setPaymentSuccess(false)}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <StripeCheckout
                tickets={checkoutTickets}
                total={
                  checkoutTickets.reduce(
                    (sum, ticket) => sum + ticket.amount,
                    0
                  ) +
                  Math.max(
                    checkoutTickets.reduce(
                      (sum, ticket) => sum + ticket.amount,
                      0
                    ) * 0.1,
                    10
                  )
                }
                onSuccess={handleCheckoutPaymentSuccess}
                onCancel={handleCheckoutCancel}
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal.ticket && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, ticket: null })}
          ticketAmount={paymentModal.ticket.amount}
          ticketNumber={paymentModal.ticket.ticket_number}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
