import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import OrganisateurDashboard from "./pages/OrganisateurDashboard";
import VisiteurDashboard from "./pages/VisiteurDashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleSuccess from "./pages/GoogleSuccess";
import EventList from "./pages/EventList";
import EventCreate from "./pages/EventCreate";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetails />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/create"
          element={
            <ProtectedRoute allowedRoles={["organisateur", "admin"]}>
              <EventCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organisateur-dashboard"
          element={
            <ProtectedRoute allowedRoles={["organisateur"]}>
              <OrganisateurDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visiteur-dashboard"
          element={
            <ProtectedRoute allowedRoles={["visiteur"]}>
              <VisiteurDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/create"
          element={
            <ProtectedRoute roles={["organisateur", "admin"]}>
              <EventCreate />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
