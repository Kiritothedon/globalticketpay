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
  ShavanoScraper,
  ShavanoTicketData,
  ShavanoSearchParams,
} from "@/lib/shavanoScraper";
import { Ticket } from "@/lib/supabase";

interface TicketLookupProps {
  onTicketsFound: (tickets: Ticket[]) => void;
  onClose: () => void;
}

export function TicketLookup({ onTicketsFound, onClose }: TicketLookupProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ShavanoTicketData[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useState<ShavanoSearchParams>({
    driverLicenseNumber: "",
    state: "",
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
    field: keyof ShavanoSearchParams,
    value: string
  ) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    setError(null);
    setSearchResults([]);
    setSelectedTickets(new Set());

    // Validate search parameters
    const validation = ShavanoScraper.validateSearchParams(searchParams);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    setIsSearching(true);
    try {
      const results = await ShavanoScraper.searchTickets(searchParams);
      setSearchResults(results);

      if (results.length === 0) {
        setError(
          "No tickets found in Shavano Park. This could be because:\n• The ticket data is not available in their system\n• The website structure has changed\n• There are no tickets for this license number\n\nYou can still add tickets manually using the form below."
        );
      }
    } catch (err) {
      console.error("Shavano search failed:", err);
      setError(
        "Failed to search for tickets. This could be due to:\n• Network connectivity issues\n• The Shavano Park website being temporarily unavailable\n• Changes to their website structure\n\nPlease try again or add tickets manually using the form below."
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
        new Set(searchResults.map((ticket) => ticket.citation_no))
      );
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleAddSelectedTickets = () => {
    const selectedResults = searchResults.filter((ticket) =>
      selectedTickets.has(ticket.citation_no)
    );

    if (selectedResults.length === 0) {
      setError("Please select tickets to add");
      return;
    }

    // Convert Shavano tickets to Ticket format
    const tickets: Ticket[] = selectedResults.map((result) => ({
      id: `shavano_${result.citation_no}`,
      user_id: "", // Will be set by the parent component
      ticket_number: result.citation_no,
      violation_date: new Date().toISOString().split("T")[0],
      due_date: result.due_date,
      amount: result.fine_amount,
      state: searchParams.state,
      county: "Shavano Park",
      court: result.court_name,
      violation: result.violation,
      violation_code: "",
      violation_description: result.violation,
      driver_license_number: searchParams.driverLicenseNumber,
      driver_license_state: searchParams.state,
      date_of_birth: "",
      license_expiration_date: "",
      vehicle_plate: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: 0,
      vehicle_color: "",
      officer_name: "",
      officer_badge_number: "",
      status: "pending" as any,
      notes: `Found via Shavano Park lookup (${result.source})`,
      court_date: "",
      court_location: result.court_address,
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
            Search Tickets
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search for your traffic tickets using your driver's license
            information
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="driverLicenseNumber">
                Driver License Number *
              </Label>
              <Input
                id="driverLicenseNumber"
                value={searchParams.driverLicenseNumber}
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
              <Label htmlFor="driverLicenseState">Driver License State *</Label>
              <Select
                value={searchParams.state}
                onValueChange={(value) => handleInputChange("state", value)}
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
                Searching Shavano Park...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Shavano Park
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
                key={ticket.citation_no}
                className={`transition-all ${
                  selectedTickets.has(ticket.citation_no)
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                    : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      id={`found-${ticket.citation_no}`}
                      checked={selectedTickets.has(ticket.citation_no)}
                      onCheckedChange={(checked) =>
                        handleTicketSelect(
                          ticket.citation_no,
                          checked as boolean
                        )
                      }
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {ticket.citation_no}
                            </h3>
                            <Badge
                              className={getConfidenceColor(ticket.confidence)}
                            >
                              {Math.round(ticket.confidence * 100)}% match
                            </Badge>
                            <Badge variant="outline">Shavano Park</Badge>
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
                                <span className="font-medium">Court:</span>{" "}
                                {ticket.court_name}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  Due Date:
                                </span>{" "}
                                {new Date(ticket.due_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">Amount:</span>
                                <span className="font-semibold text-green-600">
                                  ${ticket.fine_amount.toFixed(2)}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Location:</span>{" "}
                                {ticket.court_address}
                              </p>
                              <p>
                                <span className="font-medium">Status:</span>{" "}
                                Pending
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
