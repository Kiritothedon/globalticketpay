import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Bell } from "lucide-react";

export default function DashboardPage() {
  // Mock data for tickets
  const tickets = [
    {
      id: "TK-001",
      county: "Los Angeles County",
      amount: "$285.00",
      status: "pending",
      dueDate: "2024-02-15",
      violation: "Speeding",
      court: "Beverly Hills Municipal Court",
    },
    {
      id: "TK-002",
      county: "Orange County",
      amount: "$150.00",
      status: "overdue",
      dueDate: "2024-01-20",
      violation: "Red Light",
      court: "Anaheim Municipal Court",
    },
    {
      id: "TK-003",
      county: "San Diego County",
      amount: "$95.00",
      status: "paid",
      dueDate: "2024-01-10",
      violation: "Parking",
      court: "San Diego Traffic Court",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                Manage and pay your traffic tickets
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket Request
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Outstanding</CardDescription>
                <CardTitle className="text-2xl">$435.00</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  2 tickets pending payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overdue Amount</CardDescription>
                <CardTitle className="text-2xl text-red-600">$150.00</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-red-500">1 ticket overdue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Paid This Year</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  $95.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-green-500">1 ticket paid</p>
              </CardContent>
            </Card>
          </div>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets Submitted</CardTitle>
              <CardDescription>
                All your traffic tickets in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Ticket ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        County
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Violation
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
                            {ticket.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.court}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.county}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.violation}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">
                            {ticket.amount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {ticket.dueDate}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`${getStatusColor(
                              ticket.status
                            )} border-0`}
                          >
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {ticket.status === "paid" ? (
                            <Button variant="ghost" size="sm" disabled>
                              Paid
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Pay Now
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tickets.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tickets found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by adding your first ticket request
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ticket Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
