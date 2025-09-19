import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddTicketPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState("ticket-number");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder for ticket search logic
    setTimeout(() => {
      setIsLoading(false);
      // Would redirect to results or dashboard
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add Ticket Request
              </h1>
              <p className="text-gray-600">Search for your traffic tickets</p>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            {/* Info Card */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      How to find your tickets
                    </h3>
                    <p className="text-sm text-blue-700">
                      You can search using your ticket number, license plate, or
                      personal information. We'll search across multiple
                      counties to find all your outstanding tickets.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle>Search for Tickets</CardTitle>
                <CardDescription>
                  Choose your preferred search method below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Search Method Selection */}
                  <div className="space-y-3">
                    <Label>Search Method</Label>
                    <Select
                      value={searchMethod}
                      onValueChange={setSearchMethod}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose how to search" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ticket-number">
                          Ticket Number
                        </SelectItem>
                        <SelectItem value="license-plate">
                          License Plate
                        </SelectItem>
                        <SelectItem value="personal-info">
                          Personal Information
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional Form Fields */}
                  {searchMethod === "ticket-number" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-number">Ticket Number</Label>
                        <Input
                          id="ticket-number"
                          type="text"
                          placeholder="Enter your ticket number (e.g., 1234567890)"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="county">County (Optional)</Label>
                        <Select>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select county if known" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="los-angeles">
                              Los Angeles County
                            </SelectItem>
                            <SelectItem value="orange">
                              Orange County
                            </SelectItem>
                            <SelectItem value="san-diego">
                              San Diego County
                            </SelectItem>
                            <SelectItem value="riverside">
                              Riverside County
                            </SelectItem>
                            <SelectItem value="san-bernardino">
                              San Bernardino County
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {searchMethod === "license-plate" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="license-plate">
                          License Plate Number
                        </Label>
                        <Input
                          id="license-plate"
                          type="text"
                          placeholder="Enter your license plate number"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ca">California</SelectItem>
                            <SelectItem value="ny">New York</SelectItem>
                            <SelectItem value="tx">Texas</SelectItem>
                            <SelectItem value="fl">Florida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {searchMethod === "personal-info" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="Your first name"
                            required
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Your last name"
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-of-birth">Date of Birth</Label>
                        <Input
                          id="date-of-birth"
                          type="date"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drivers-license">
                          Driver's License Number (Optional)
                        </Label>
                        <Input
                          id="drivers-license"
                          type="text"
                          placeholder="Your driver's license number"
                          className="h-11"
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <Label htmlFor="additional-info">
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="additional-info"
                      placeholder="Any additional details that might help us find your tickets..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500">
                      We'll search across multiple counties and jurisdictions
                    </p>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 px-8"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Search className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search Tickets
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Can't find your ticket number?
                    </h4>
                    <p className="text-gray-600">
                      Try searching with your license plate or personal
                      information. We can often find tickets even without the
                      ticket number.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Multiple counties?
                    </h4>
                    <p className="text-gray-600">
                      Our system searches across multiple jurisdictions
                      automatically. You don't need to submit separate requests
                      for each county.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Still having trouble?
                    </h4>
                    <p className="text-gray-600">
                      Contact our support team at{" "}
                      <a
                        href="mailto:support@ticketpay.com"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        support@ticketpay.com
                      </a>{" "}
                      or call (555) 123-4567.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
