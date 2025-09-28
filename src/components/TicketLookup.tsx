import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Plus,
} from "lucide-react";
import {
  TicketLookupService,
  TicketLookupResult,
  LookupCriteria,
} from "@/lib/ticketLookupService";
import { Ticket } from "@/lib/supabase";

interface TicketLookupProps {
  onTicketsFound: (tickets: Ticket[]) => void;
  onClose: () => void;
}

export function TicketLookup({ onTicketsFound, onClose }: TicketLookupProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TicketLookupResult[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  const [criteria, setCriteria] = useState<LookupCriteria>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    driverLicenseNumber: "",
    driverLicenseState: "",
    zipCode: "",
    radius: 25,
  });

  const states = [
    "TX",
    "CA",
    "NY",
    "FL",
    "IL",
    "PA",
    "OH",
    "GA",
    "NC",
    "MI",
    "NJ",
    "VA",
    "WA",
    "AZ",
    "MA",
    "TN",
    "IN",
    "MO",
    "MD",
    "WI",
  ];

  const handleInputChange = (
    field: keyof LookupCriteria,
    value: string | number
  ) => {
    setCriteria((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    setError(null);
    setSearchResults([]);
    setSelectedTickets(new Set());

    // Additional common sense validation
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(criteria.dateOfBirth).getFullYear();
    const age = currentYear - birthYear;

    if (age < 16 || age > 120) {
      setError(
        "Please enter a valid date of birth (age must be between 16-120)"
      );
      return;
    }

    if (
      criteria.driverLicenseNumber.length < 6 ||
      criteria.driverLicenseNumber.length > 12
    ) {
      setError("Driver license number must be between 6-12 characters");
      return;
    }

    // Validate criteria
    const validation = await TicketLookupService.validateLookupCriteria(
      criteria
    );
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    setIsSearching(true);
    try {
      const results = await TicketLookupService.lookupTickets(criteria);
      setSearchResults(results);

      if (results.length === 0) {
        setError("No tickets found. You can still add tickets manually.");
      }
    } catch (err) {
      console.error("Lookup failed:", err);
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

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
      setSelectedTickets(
        new Set(searchResults.map((ticket) => ticket.ticket_number))
      );
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleAddSelectedTickets = () => {
    const selectedResults = searchResults.filter((ticket) =>
      selectedTickets.has(ticket.ticket_number)
    );

    if (selectedResults.length === 0) {
      setError("Please select tickets to add");
      return;
    }

    // Convert lookup results to Ticket format
    const tickets: Ticket[] = selectedResults.map((result) => ({
      id: `lookup_${result.ticket_number}`,
      user_id: "", // Will be set by the parent component
      ticket_number: result.ticket_number,
      violation_date:
        result.violation_date || new Date().toISOString().split("T")[0],
      due_date:
        result.due_date ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 30 days from now
      amount: result.amount,
      state: result.state,
      county: result.county,
      court: result.court,
      violation: result.violation,
      violation_code: "",
      violation_description: result.violation,
      driver_license_number: criteria.driverLicenseNumber,
      driver_license_state: criteria.driverLicenseState,
      date_of_birth: criteria.dateOfBirth,
      license_expiration_date: "",
      vehicle_plate: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: 0,
      vehicle_color: "",
      officer_name: "",
      officer_badge_number: "",
      status: result.status as any,
      notes: `Found via ticket lookup (${result.source})`,
      court_date: "",
      court_location: result.court,
      payment_date: undefined,
      payment_method: undefined,
      payment_reference: undefined,
      ticket_image_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    onTicketsFound(tickets);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (confidence >= 0.7)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Lookup Tickets
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search for tickets using your personal information across local
            counties
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={criteria.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={criteria.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={criteria.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="driverLicenseState">Driver License State *</Label>
              <Select
                value={criteria.driverLicenseState}
                onValueChange={(value) =>
                  handleInputChange("driverLicenseState", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="driverLicenseNumber">
                Driver License Number *
              </Label>
              <Input
                id="driverLicenseNumber"
                value={criteria.driverLicenseNumber}
                onChange={(e) =>
                  handleInputChange(
                    "driverLicenseNumber",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="D123456789"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
              <Input
                id="zipCode"
                value={criteria.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="77001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="radius">Search Radius (miles)</Label>
            <Select
              value={criteria.radius?.toString()}
              onValueChange={(value) =>
                handleInputChange("radius", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 miles</SelectItem>
                <SelectItem value="50">50 miles</SelectItem>
                <SelectItem value="100">100 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search for Tickets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Found Tickets ({searchResults.length})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select tickets to add to your dashboard.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-found"
                  checked={
                    selectedTickets.size === searchResults.length &&
                    searchResults.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="select-all-found"
                  className="text-sm font-medium"
                >
                  Select All
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map((ticket) => (
              <Card
                key={ticket.ticket_number}
                className={`transition-all ${
                  selectedTickets.has(ticket.ticket_number)
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                    : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      id={`found-${ticket.ticket_number}`}
                      checked={selectedTickets.has(ticket.ticket_number)}
                      onCheckedChange={(checked) =>
                        handleTicketSelect(
                          ticket.ticket_number,
                          checked as boolean
                        )
                      }
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {ticket.ticket_number}
                            </h3>
                            <Badge
                              className={getConfidenceColor(ticket.confidence)}
                            >
                              {Math.round(ticket.confidence * 100)}% match
                            </Badge>
                            <Badge variant="outline">{ticket.source}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-1">
                              <p className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">
                                  Violation:
                                </span>{" "}
                                {ticket.violation}
                              </p>
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">
                                  Location:
                                </span>{" "}
                                {ticket.county}, {ticket.state}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  Due Date:
                                </span>{" "}
                                {ticket.due_date}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">Amount:</span>
                                <span className="font-semibold text-green-600">
                                  ${ticket.amount.toFixed(2)}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Court:</span>{" "}
                                {ticket.court}
                              </p>
                              <p>
                                <span className="font-medium">Status:</span>{" "}
                                {ticket.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedTickets.size > 0 && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleAddSelectedTickets}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Selected Tickets ({selectedTickets.size})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
