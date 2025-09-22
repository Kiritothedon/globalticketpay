import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, MapPin, Clock, Users } from "lucide-react";

export default function SiteListPage() {
  const sites = [
    {
      name: "Los Angeles County",
      url: "https://www.lacourt.org",
      description: "Los Angeles County Superior Court - Traffic Division",
      location: "Los Angeles, CA",
      lastUpdated: "September 22, 2025",
      status: "Active"
    },
    {
      name: "Orange County",
      url: "https://www.occourts.org",
      description: "Orange County Superior Court - Traffic Division",
      location: "Orange County, CA",
      lastUpdated: "September 22, 2025",
      status: "Active"
    },
    {
      name: "San Diego County",
      url: "https://www.sdcourt.ca.gov",
      description: "San Diego County Superior Court - Traffic Division",
      location: "San Diego, CA",
      lastUpdated: "September 22, 2025",
      status: "Active"
    },
    {
      name: "Riverside County",
      url: "https://www.riverside.courts.ca.gov",
      description: "Riverside County Superior Court - Traffic Division",
      location: "Riverside, CA",
      lastUpdated: "September 22, 2025",
      status: "Active"
    },
    {
      name: "San Bernardino County",
      url: "https://www.sb-court.org",
      description: "San Bernardino County Superior Court - Traffic Division",
      location: "San Bernardino, CA",
      lastUpdated: "September 22, 2025",
      status: "Active"
    },
    {
      name: "Ventura County",
      url: "https://www.ventura.courts.ca.gov",
      description: "Ventura County Superior Court - Traffic Division",
      location: "Ventura, CA",
      lastUpdated: "September 22, 2025",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Last Updated */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-2">
          <p className="text-sm text-muted-foreground">
            Last Updated: September 22, 2025
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Supported Court Sites
              </h1>
              <p className="text-muted-foreground">
                List of court websites where you can pay traffic tickets
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{site.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {site.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {site.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {site.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    Updated: {site.lastUpdated}
                  </div>
                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full"
                      variant="outline"
                    >
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Court Website
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                About This List
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This list contains court websites where you can pay traffic tickets online. 
                Each site has been verified and updated regularly to ensure accuracy.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Important Notes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Always verify ticket information before making payment</li>
                  <li>• Some courts may have different payment processing systems</li>
                  <li>• Contact the court directly if you have questions about your specific ticket</li>
                  <li>• Payment deadlines and late fees vary by jurisdiction</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
