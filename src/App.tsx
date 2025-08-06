import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"

import DashboardPage from "./pages/dashboard"
import PackagesPage from "../app/dashboard/packagesform"
import PackageFormPage from "../app/dashboard/packagesform/page"
import GuidesPage from "./pages/guides"
import TreksPage from "./pages/treks"
import CharDhamPage from "./pages/char-dham"
import BookingsPage from "./pages/bookings"
import CustomersPage from "../app/dashboard/customers/page"
import LeadsPage from "../app/dashboard/leads/page"
import AdsPage from "./pages/ads"
import CouponsPage from "../app/dashboard/coupons/page"
import SettingsPage from "./pages/settings"
import { AuthProvider } from "../contexts/auth-context"
import ProtectedRoute from "./components/protected-route"
import LoginPage from "@/app/login/page"

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/packages"
            element={
              <ProtectedRoute>
                <PackagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/packages/new"
            element={
              <ProtectedRoute>
                <PackageFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/packages/edit/:id"
            element={
              <ProtectedRoute>
                <PackageFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/guides"
            element={
              <ProtectedRoute>
                <GuidesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treks"
            element={
              <ProtectedRoute>
                <TreksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/char-dham"
            element={
              <ProtectedRoute>
                <CharDhamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ads"
            element={
              <ProtectedRoute>
                <AdsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <CouponsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </>
  )
}

export default App

