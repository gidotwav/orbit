import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { ChartsPage } from "./pages/ChartsPage";
import { LoginPage } from "./pages/LoginPage";
import { LibraryPage } from "./pages/LibraryPage";
import { StatsPage } from "./pages/StatsPage";
import { ArtistDashboardPage } from "./pages/ArtistDashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { ArtistProfilePage } from "./pages/ArtistProfilePage";
import { SongPage } from "./pages/SongPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/artist/:id" element={<ArtistProfilePage />} />
          <Route path="/song/:id" element={<SongPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage personalized />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ArtistDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;

  return children;
}
