import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { SupabaseService } from "@/lib/supabaseService";
import { Ticket } from "@/lib/supabase";
import { EnhancedOCRService, ParsedTicketData } from "@/lib/enhancedOcrService";

export default function AddTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<ParsedTicketData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic ticket information
    ticket_number: "",
    violation_date: "",
    due_date: "",
    amount: "",

    // Location information
    state: "",
    county: "",
    court: "",

    // Violation details
    violation: "",
    violation_code: "",
    violation_description: "",

    // Driver information
    driver_license_number: "",
    driver_license_state: "",
    date_of_birth: "",
    license_expiration_date: "",

    // Vehicle information
    vehicle_plate: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_color: "",

    // Officer information
    officer_name: "",
    officer_badge_number: "",

    // Additional information
    notes: "",
    court_date: "",
    court_location: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setOcrError(null);
      setOcrResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Process OCR
      await processImageWithOCR(file);
    }
  };

  const processImageWithOCR = async (file: File) => {
    setIsProcessingOCR(true);
    setOcrError(null);

    try {
      const result = await EnhancedOCRService.parseTicketImage(file);
      setOcrResult(result);

      // Auto-fill form with extracted data
      if (result.citation_no)
        setFormData((prev) => ({
          ...prev,
          ticket_number: result.citation_no!,
        }));
      if (result.court_name)
        setFormData((prev) => ({ ...prev, court: result.court_name! }));
      if (result.violation)
        setFormData((prev) => ({ ...prev, violation: result.violation! }));
      if (result.due_date)
        setFormData((prev) => ({ ...prev, due_date: result.due_date! }));
      if (result.fine_amount)
        setFormData((prev) => ({
          ...prev,
          amount: result.fine_amount!.toString(),
        }));

      // Validate the parsed data
      const validation = EnhancedOCRService.validateParsedData(result);
      if (!validation.isValid) {
        setOcrError(
          `Some fields couldn't be extracted automatically: ${validation.missingFields.join(
            ", "
          )}. Please fill them manually.`
        );
      }
    } catch (error) {
      console.error("OCR processing failed:", error);
      setOcrError(
        error instanceof Error ? error.message : "Failed to process image"
      );
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create ticket data
      const ticketData: Omit<Ticket, "id" | "created_at" | "updated_at"> = {
        user_id: user.id,
        ticket_number: formData.ticket_number,
        violation_date: formData.violation_date || undefined,
        due_date: formData.due_date,
        amount: parseFloat(formData.amount),
        state: formData.state,
        county: formData.county,
        court: formData.court,
        violation: formData.violation,
        violation_code: formData.violation_code || undefined,
        violation_description: formData.violation_description || undefined,
        driver_license_number: formData.driver_license_number || undefined,
        driver_license_state: formData.driver_license_state || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        license_expiration_date: formData.license_expiration_date || undefined,
        vehicle_plate: formData.vehicle_plate || undefined,
        vehicle_make: formData.vehicle_make || undefined,
        vehicle_model: formData.vehicle_model || undefined,
        vehicle_year: formData.vehicle_year
          ? parseInt(formData.vehicle_year)
          : undefined,
        vehicle_color: formData.vehicle_color || undefined,
        officer_name: formData.officer_name || undefined,
        officer_badge_number: formData.officer_badge_number || undefined,
        status: "pending",
        notes: formData.notes || undefined,
        court_date: formData.court_date || undefined,
        court_location: formData.court_location || undefined,
      };

      // Create ticket
      const newTicket = await SupabaseService.createTicket(ticketData);

      // Upload image if provided
      if (selectedImage) {
        const imageData = await SupabaseService.uploadTicketImage(
          selectedImage,
          newTicket.id,
          user.id
        );

        // Update ticket with image info
        await SupabaseService.updateTicket(newTicket.id, {
          ticket_image_url: imageData.url,
          ticket_image_path: imageData.path,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ticket Created Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Your ticket has been added to your dashboard.
              </p>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Add New Ticket
              </h1>
              <p className="text-muted-foreground">
                Enter your traffic ticket information
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload with OCR */}
            <Card>
              <CardHeader>
                <CardTitle>Submit Image for Auto-Fill</CardTitle>
                <CardDescription>
                  Upload a photo of your ticket to automatically extract key
                  information
                </CardDescription>
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
                      disabled={isProcessingOCR}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer ${
                        isProcessingOCR ? "opacity-50" : ""
                      }`}
                    >
                      {isProcessingOCR ? (
                        <div className="space-y-2">
                          <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                          <p className="text-sm text-gray-600">
                            Processing image with OCR...
                          </p>
                          <p className="text-xs text-gray-500">
                            This may take a few moments
                          </p>
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
                          <Camera className="w-12 h-12 text-gray-400 mx-auto" />
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

                  {/* OCR Results */}
                  {ocrResult && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                            OCR Processing Complete
                          </h4>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Confidence: {Math.round(ocrResult.confidence)}% •
                            Extracted fields have been auto-filled below
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OCR Error */}
                  {ocrError && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            OCR Processing Issue
                          </h4>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            {ocrError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Ticket Information</CardTitle>
                <CardDescription>
                  Enter the essential details from your ticket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket_number">Ticket Number *</Label>
                    <Input
                      id="ticket_number"
                      value={formData.ticket_number}
                      onChange={(e) =>
                        handleInputChange("ticket_number", e.target.value)
                      }
                      placeholder="e.g., TK-123456"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="violation_date">Violation Date</Label>
                    <Input
                      id="violation_date"
                      type="date"
                      value={formData.violation_date}
                      onChange={(e) =>
                        handleInputChange("violation_date", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        handleInputChange("due_date", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="violation">Violation *</Label>
                  <Input
                    id="violation"
                    value={formData.violation}
                    onChange={(e) =>
                      handleInputChange("violation", e.target.value)
                    }
                    placeholder="e.g., Speeding, Red Light Violation"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="violation_code">Violation Code</Label>
                    <Input
                      id="violation_code"
                      value={formData.violation_code}
                      onChange={(e) =>
                        handleInputChange("violation_code", e.target.value)
                      }
                      placeholder="e.g., 22349(a) VC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="violation_description">Description</Label>
                    <Input
                      id="violation_description"
                      value={formData.violation_description}
                      onChange={(e) =>
                        handleInputChange(
                          "violation_description",
                          e.target.value
                        )
                      }
                      placeholder="Additional violation details"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
                <CardDescription>Where the violation occurred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      value={formData.county}
                      onChange={(e) =>
                        handleInputChange("county", e.target.value)
                      }
                      placeholder="e.g., Los Angeles County"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="court">Court *</Label>
                    <Input
                      id="court"
                      value={formData.court}
                      onChange={(e) =>
                        handleInputChange("court", e.target.value)
                      }
                      placeholder="e.g., Beverly Hills Municipal Court"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Information</CardTitle>
                <CardDescription>Your driver's license details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driver_license_number">
                      Driver's License Number
                    </Label>
                    <Input
                      id="driver_license_number"
                      value={formData.driver_license_number}
                      onChange={(e) =>
                        handleInputChange(
                          "driver_license_number",
                          e.target.value
                        )
                      }
                      placeholder="e.g., D1234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver_license_state">License State</Label>
                    <Select
                      value={formData.driver_license_state}
                      onValueChange={(value) =>
                        handleInputChange("driver_license_state", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleInputChange("date_of_birth", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_expiration_date">
                      License Expiration
                    </Label>
                    <Input
                      id="license_expiration_date"
                      type="date"
                      value={formData.license_expiration_date}
                      onChange={(e) =>
                        handleInputChange(
                          "license_expiration_date",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>
                  Details about the vehicle involved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_plate">License Plate</Label>
                    <Input
                      id="vehicle_plate"
                      value={formData.vehicle_plate}
                      onChange={(e) =>
                        handleInputChange("vehicle_plate", e.target.value)
                      }
                      placeholder="e.g., ABC123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_year">Year</Label>
                    <Input
                      id="vehicle_year"
                      type="number"
                      value={formData.vehicle_year}
                      onChange={(e) =>
                        handleInputChange("vehicle_year", e.target.value)
                      }
                      placeholder="e.g., 2020"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicle_make">Make</Label>
                    <Input
                      id="vehicle_make"
                      value={formData.vehicle_make}
                      onChange={(e) =>
                        handleInputChange("vehicle_make", e.target.value)
                      }
                      placeholder="e.g., Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_model">Model</Label>
                    <Input
                      id="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={(e) =>
                        handleInputChange("vehicle_model", e.target.value)
                      }
                      placeholder="e.g., Camry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_color">Color</Label>
                    <Input
                      id="vehicle_color"
                      value={formData.vehicle_color}
                      onChange={(e) =>
                        handleInputChange("vehicle_color", e.target.value)
                      }
                      placeholder="e.g., Silver"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Officer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Officer Information</CardTitle>
                <CardDescription>
                  Details about the citing officer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officer_name">Officer Name</Label>
                    <Input
                      id="officer_name"
                      value={formData.officer_name}
                      onChange={(e) =>
                        handleInputChange("officer_name", e.target.value)
                      }
                      placeholder="e.g., Officer Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="officer_badge_number">Badge Number</Label>
                    <Input
                      id="officer_badge_number"
                      value={formData.officer_badge_number}
                      onChange={(e) =>
                        handleInputChange(
                          "officer_badge_number",
                          e.target.value
                        )
                      }
                      placeholder="e.g., 12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Any additional notes or court information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional information about the ticket..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="court_date">Court Date</Label>
                    <Input
                      id="court_date"
                      type="date"
                      value={formData.court_date}
                      onChange={(e) =>
                        handleInputChange("court_date", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="court_location">Court Location</Label>
                    <Input
                      id="court_location"
                      value={formData.court_location}
                      onChange={(e) =>
                        handleInputChange("court_location", e.target.value)
                      }
                      placeholder="e.g., 123 Main St, City, State"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {isLoading ? "Creating Ticket..." : "Create Ticket"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
