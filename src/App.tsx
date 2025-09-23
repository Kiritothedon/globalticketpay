import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./home";
import AuthPage from "./auth/page";
import DashboardPage from "./dashboard/page";
import AddTicketPage from "./dashboard/add-ticket/page";
import Loading from "./dashboard/add-ticket/loading";
import ProfilePage from "./profile/page";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/add-ticket"
                element={
                  <ProtectedRoute>
                    <AddTicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/add-ticket/loading"
                element={
                  <ProtectedRoute>
                    <Loading />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
