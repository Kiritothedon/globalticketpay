import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-lg md:text-xl font-semibold text-foreground">
            GlobalTicketPay.com
          </span>
        </Link>

        {/* Navigation Links - Only show on home page */}
        {location.pathname === "/" && (
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Security
            </a>
            {!user && (
              <Link
                to="/auth"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        )}

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt={user.user_metadata?.full_name || ""}
                          />
                          <AvatarFallback>
                            {user.user_metadata?.first_name?.charAt(0) ||
                              user.email?.charAt(0)}
                            {user.user_metadata?.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.first_name}{" "}
                            {user.user_metadata?.last_name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Profile Button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.full_name || ""}
                      />
                      <AvatarFallback>
                        {user.user_metadata?.first_name?.charAt(0) ||
                          user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button
                  variant="ghost"
                  asChild
                  className="text-sm md:text-base px-2 md:px-4"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="text-sm md:text-base px-2 md:px-4">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.full_name || ""}
                />
                <AvatarFallback>
                  {user.user_metadata?.first_name?.charAt(0) ||
                    user.email?.charAt(0)}
                  {user.user_metadata?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user.user_metadata?.first_name}{" "}
                  {user.user_metadata?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>

            <Button
              variant="ghost"
              asChild
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to="/dashboard" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
