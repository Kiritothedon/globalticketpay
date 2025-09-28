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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Upload,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  User,
  CreditCard,
} from "lucide-react";
import {
  TicketIntakeService,
  UnifiedTicketData,
  TicketIntakeOptions,
} from "@/lib/ticketIntakeService";

interface EnhancedTicketIntakeProps {
  onTicketsFound: (tickets: UnifiedTicketData[]) => void;
  onClose: () => void;
}

export function EnhancedTicketIntake({
  onTicketsFound,
  onClose,
}: EnhancedTicketIntakeProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundTickets, setFoundTickets] = useState<UnifiedTicketData[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Scraping state
  const [scrapeSources, setScrapeSources] = useState<
    Array<"shavano" | "cibolo">
  >([]);
  const [scrapeParams, setScrapeParams] = useState({
    dlNumber: "",
    state: "",
    dob: "",
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

  const availableSources = TicketIntakeService.getAvailableSources();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScrapeSourceToggle = (
    source: "shavano" | "cibolo",
    checked: boolean
  ) => {
    if (checked) {
      setScrapeSources((prev) => [...prev, source]);
    } else {
      setScrapeSources((prev) => prev.filter((s) => s !== source));
    }
  };

  const handleScrapeParamChange = (field: string, value: string) => {
    setScrapeParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleProcessTickets = async () => {
    setError(null);
    setSuccess(null);
    setFoundTickets([]);
    setSelectedTickets(new Set());

    const options: TicketIntakeOptions = {
      imageFile: selectedImage || undefined,
      scrapeSources: scrapeSources.length > 0 ? scrapeSources : undefined,
      scrapeParams: scrapeSources.length > 0 ? scrapeParams : undefined,
    };

    // Validate options
    const validation = TicketIntakeService.validateIntakeOptions(options);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    setIsProcessing(true);
    try {
      const results = await TicketIntakeService.processTicketIntake(options);
      setFoundTickets(results);

      if (results.length === 0) {
        setError(
          "No tickets found. Please try different search criteria or upload a clearer image."
        );
      } else {
        setSuccess(
          `Found ${results.length} ticket(s). Select the ones you want to add.`
        );
      }
    } catch (err) {
      console.error("Ticket processing failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process tickets. Please try again."
      );
    } finally {
      setIsProcessing(false);
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
        new Set(foundTickets.map((ticket) => ticket.citation_no))
      );
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleAddSelectedTickets = () => {
    const selectedTicketsList = foundTickets.filter((ticket) =>
      selectedTickets.has(ticket.citation_no)
    );

    if (selectedTicketsList.length === 0) {
      setError("Please select at least one ticket to add.");
      return;
    }

    onTicketsFound(selectedTicketsList);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (confidence >= 0.7)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "ocr":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "shavano":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "cibolo":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Ticket Image (Optional)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a photo of your ticket for automatic data extraction
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${isProcessing ? "opacity-50" : ""}`}
              >
                {isProcessing ? (
                  <div className="space-y-2">
                    <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                ) : imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Ticket preview"
                      className="mx-auto h-32 w-auto rounded-lg object-cover"
                    />
                    <p className="text-sm text-gray-600">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload ticket image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, or PDF up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* County Scraping Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search County Databases
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search for tickets in supported county databases
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Source Selection */}
          <div>
            <Label className="text-sm font-medium">Available Sources</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {availableSources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source.id}`}
                    checked={scrapeSources.includes(source.id)}
                    onCheckedChange={(checked) =>
                      handleScrapeSourceToggle(source.id, checked as boolean)
                    }
                    disabled={isProcessing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`source-${source.id}`}
                      className="text-sm font-medium"
                    >
                      {source.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {source.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scraping Parameters */}
          {scrapeSources.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Search Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dlNumber">Driver License Number *</Label>
                    <Input
                      id="dlNumber"
                      value={scrapeParams.dlNumber}
                      onChange={(e) =>
                        handleScrapeParamChange(
                          "dlNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="D123456789"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={scrapeParams.state}
                      onValueChange={(value) =>
                        handleScrapeParamChange("state", value)
                      }
                      disabled={isProcessing}
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
                {scrapeSources.includes("cibolo") && (
                  <div>
                    <Label htmlFor="dob">
                      Date of Birth (Required for Cibolo) *
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={scrapeParams.dob}
                      onChange={(e) =>
                        handleScrapeParamChange("dob", e.target.value)
                      }
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Process Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleProcessTickets}
          disabled={
            isProcessing || (!selectedImage && scrapeSources.length === 0)
          }
          size="lg"
          className="w-full md:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Process Tickets
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Found Tickets */}
      {foundTickets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Found Tickets ({foundTickets.length})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select tickets to add to your dashboard
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-tickets"
                  checked={
                    selectedTickets.size === foundTickets.length &&
                    foundTickets.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="select-all-tickets"
                  className="text-sm font-medium"
                >
                  Select All
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {foundTickets.map((ticket) => {
              const display =
                TicketIntakeService.formatTicketForDisplay(ticket);
              return (
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
                        id={`ticket-${ticket.citation_no}`}
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
                                className={getConfidenceColor(
                                  ticket.confidence
                                )}
                              >
                                {display.confidence}
                              </Badge>
                              <Badge className={getSourceColor(ticket.source)}>
                                {display.source}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="space-y-1">
                                <p className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span className="font-medium">
                                    Violation:
                                  </span>{" "}
                                  {ticket.violation || "Not specified"}
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span className="font-medium">
                                    Court:
                                  </span>{" "}
                                  {ticket.court_name || "Not specified"}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">
                                    Due Date:
                                  </span>{" "}
                                  {display.dueDate}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium">Amount:</span>
                                  <span className="font-semibold text-green-600">
                                    {display.amount}
                                  </span>
                                </p>
                                {ticket.name && (
                                  <p className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">
                                      Name:
                                    </span>{" "}
                                    {ticket.name}
                                  </p>
                                )}
                                {ticket.dl_no && (
                                  <p className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="font-medium">
                                      DL:
                                    </span>{" "}
                                    {ticket.dl_no}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {selectedTickets.size > 0 && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleAddSelectedTickets}>
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
