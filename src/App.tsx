import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./home";
import AuthPage from "./auth/page";
import DashboardPage from "./dashboard/page";
import AddTicketPage from "./dashboard/add-ticket/page";
import Loading from "./dashboard/add-ticket/loading";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";

function App() {
  // Initialize Supabase Auth listener
  useSupabaseAuth();

  return (
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
