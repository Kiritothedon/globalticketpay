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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Ticket } from "@/lib/supabase";
import { SupabaseService } from "@/lib/supabaseService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
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
      </div>
    </div>
  );
}
