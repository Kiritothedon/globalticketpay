import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CreditCard, CheckCircle, Lock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CourtSupportModal } from "@/components/CourtSupportModal";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCourtSupportModalOpen, setIsCourtSupportModalOpen] = useState(false);

  const handleCheckTickets = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleSignUp = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Beta Signup Banner */}
      <div className="bg-blue-600 text-white py-3 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm px-4">
            {user
              ? "🚀 Welcome to Beta! You're part of our early users. Thank you for joining us!"
              : "🚀 This site is currently in Beta. Sign up now to be part of our early users and receive updates."}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Pay all your traffic tickets in one place
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Skip the courthouse lines and late fees. Submit your ticket
            information, view all outstanding tickets, and pay securely online
            in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={handleCheckTickets}
            >
              {user ? "View My Tickets" : "Check My Tickets"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 px-8 py-3 bg-transparent"
              onClick={user ? handleCheckTickets : handleSignUp}
            >
              {user ? "Dashboard" : "Sign Up / Log In"}
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>SSL encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>50,000+ tickets paid</span>
            </div>
          </div>

          {/* Beta Version Indicator */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Beta v0.1</span>
              <span className="text-green-600">•</span>
              <span>
                {new Date().toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                })}{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your tickets resolved in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Submit Info
                </h3>
                <p className="text-muted-foreground">
                  Enter your ticket number, license plate, or personal
                  information. We'll search across multiple counties to find
                  your tickets.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  See Tickets
                </h3>
                <p className="text-muted-foreground">
                  View all your outstanding tickets in one dashboard. See
                  amounts due, due dates, and court information all in one
                  place.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Pay Securely
                </h3>
                <p className="text-muted-foreground">
                  Pay with credit card, debit card, or bank transfer. Get
                  instant confirmation and email receipts for your records.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section id="security" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your security is our priority
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We use industry-leading security measures to protect your personal
              and payment information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                256-bit SSL
              </h3>
              <p className="text-sm text-muted-foreground">
                Bank-level encryption for all data transmission
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Stripe Powered
              </h3>
              <p className="text-sm text-muted-foreground">
                Secure payments powered by Stripe
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                PCI Compliant
              </h3>
              <p className="text-sm text-muted-foreground">
                Meets all payment card industry standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Verified</h3>
              <p className="text-sm text-muted-foreground">
                Trusted by courts and government agencies
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 bg-muted rounded-lg px-6 py-4">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <strong>Secure payments powered by Stripe</strong> • Your
                payment information is never stored on our servers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to pay your tickets?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of drivers who have simplified their ticket payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3"
              onClick={handleCheckTickets}
            >
              {user ? "View My Tickets" : "Check My Tickets"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 bg-transparent"
              onClick={user ? handleCheckTickets : handleSignUp}
            >
              {user ? "Dashboard" : "Create Account"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 bg-transparent"
              onClick={() => window.open("#courts", "_self")}
            >
              View Supported Courts
            </Button>
          </div>
        </div>
      </section>

      {/* Supported Courts Section */}
      <section id="courts" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Supported Courts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We work with courts across the United States to make ticket
              payments easier
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground mb-2">New York</h3>
              <p className="text-sm text-muted-foreground">All 62 counties</p>
            </div>
            <div className="text-center p-6 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground mb-2">California</h3>
              <p className="text-sm text-muted-foreground">
                Major metropolitan areas
              </p>
            </div>
            <div className="text-center p-6 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground mb-2">Texas</h3>
              <p className="text-sm text-muted-foreground">
                Harris, Dallas, Tarrant counties, San Antonio
              </p>
            </div>
            <div className="text-center p-6 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground mb-2">Florida</h3>
              <p className="text-sm text-muted-foreground">
                Miami-Dade, Broward, Orange counties
              </p>
            </div>
            <div className="text-center p-6 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground mb-2">Illinois</h3>
              <p className="text-sm text-muted-foreground">
                Cook County and surrounding areas
              </p>
            </div>
            <div className="text-center p-6 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground mb-2">
                More Coming Soon
              </h3>
              <p className="text-sm text-muted-foreground">
                We're expanding nationwide
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Don't see your court? Contact us to request support for your area.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsCourtSupportModalOpen(true)}
            >
              Request Court Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-foreground">
                  TicketPay
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The easiest way to pay traffic tickets online. Fast, secure, and
                reliable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 TicketPay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Court Support Modal */}
      <CourtSupportModal
        isOpen={isCourtSupportModalOpen}
        onClose={() => setIsCourtSupportModalOpen(false)}
      />
    </div>
  );
}
