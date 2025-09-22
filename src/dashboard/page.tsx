import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, Plus, AlertCircle, Eye, Edit, Trash2, Upload } from "lucide-react";
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
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-blue-100 text-blue-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      case "court_date_scheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const totalOutstanding = tickets
    .filter(t => t.status !== 'paid' && t.status !== 'dismissed')
    .reduce((sum, t) => sum + t.amount, 0);

  const overdueAmount = tickets
    .filter(t => t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);

  const paidAmount = tickets
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const overdueCount = tickets.filter(t => t.status === 'overdue').length;
  const paidCount = tickets.filter(t => t.status === 'paid').length;

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    
    try {
      await SupabaseService.deleteTicket(ticketId);
      setTickets(tickets.filter(t => t.id !== ticketId));
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("Failed to delete ticket");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600">
                Manage and track your traffic tickets
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/add-ticket">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Ticket
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-6 mt-4 rounded">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Outstanding</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalOutstanding)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  {pendingCount} ticket{pendingCount !== 1 ? 's' : ''} pending payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overdue Amount</CardDescription>
                <CardTitle className="text-2xl text-red-600">{formatCurrency(overdueAmount)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-red-500">{overdueCount} ticket{overdueCount !== 1 ? 's' : ''} overdue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Paid This Year</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {formatCurrency(paidAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-green-500">{paidCount} ticket{paidCount !== 1 ? 's' : ''} paid</p>
              </CardContent>
            </Card>
          </div>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
              <CardDescription>
                All your traffic tickets in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tickets found
                  </h3>
                  <p className="text-gray-600 mb-4">
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Ticket Number
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Violation
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Location
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Due Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {ticket.ticket_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.court}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            <div>{ticket.violation}</div>
                            {ticket.violation_code && (
                              <div className="text-sm text-gray-500">
                                Code: {ticket.violation_code}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            <div>{ticket.county}, {ticket.state}</div>
                            {ticket.violation_date && (
                              <div className="text-sm text-gray-500">
                                {formatDate(ticket.violation_date)}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(ticket.amount)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(ticket.due_date)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={`${getStatusColor(
                                ticket.status
                              )} border-0`}
                            >
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {ticket.ticket_image_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(ticket.ticket_image_url, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="text-red-600 hover:text-red-700"
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