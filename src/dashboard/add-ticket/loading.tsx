import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Search className="w-8 h-8 animate-spin text-blue-600" />
            <h3 className="text-lg font-medium text-foreground">
              Searching for tickets...
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              We're searching across multiple counties and jurisdictions to find
              your tickets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
