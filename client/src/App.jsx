import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import CustomerHome from './pages/customer/Home';
import CustomerFindLabour from './pages/customer/FindLabour';
import CustomerWorkerProfile from './pages/customer/WorkerProfile';
import CustomerMyBookings from './pages/customer/MyBookings';
import CustomerBookingDetails from './pages/customer/BookingDetails';
import CustomerTrackBooking from './pages/customer/TrackBooking';
import CustomerMessages from './pages/customer/Messages';
import CustomerReviews from './pages/customer/Reviews';
import CustomerProfile from './pages/customer/Profile';
import CustomerFavouriteWorkers from './pages/customer/FavouriteWorkers';
import CustomerSavedAddresses from './pages/customer/SavedAddresses';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerPayment from './pages/customer/Payment';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerJobRequests from './pages/worker/JobRequests';
import WorkerJobDetails from './pages/worker/JobDetails';
import WorkerTodayJobs from './pages/worker/TodayJobs';
import WorkerMessages from './pages/worker/Messages';
import WorkerEarnings from './pages/worker/Earnings';
import WorkerAnalytics from './pages/worker/Analytics';
import WorkerReviews from './pages/worker/Reviews';
import WorkerProfile from './pages/worker/Profile';
import WorkerPortfolio from './pages/worker/Portfolio';
import WorkerSettings from './pages/worker/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminWorkers from './pages/admin/Workers';
import AdminBookings from './pages/admin/Bookings';
import AdminReviews from './pages/admin/Reviews';
import AdminReports from './pages/admin/Reports';

const FindWork = () => <div className="p-20 text-center text-2xl text-gray-700 bg-slate-900 min-h-screen text-slate-350">Find Work Page (Coming Soon)</div>;

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find-labour" element={<CustomerFindLabour />} />
          <Route path="/find-work" element={<FindWork />} />

          {/* Root Level Redirects based on roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer', 'user', 'labour', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['customer', 'user', 'labour', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Customer Protected Routes */}
          <Route path="/customer/home" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerHome /></ProtectedRoute>} />
          <Route path="/customer/find" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerFindLabour /></ProtectedRoute>} />
          <Route path="/customer/worker-profile/:id" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerWorkerProfile /></ProtectedRoute>} />
          <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerMyBookings /></ProtectedRoute>} />
          <Route path="/customer/booking-details/:id" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerBookingDetails /></ProtectedRoute>} />
          <Route path="/customer/track/:id" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerTrackBooking /></ProtectedRoute>} />
          <Route path="/customer/messages" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerMessages /></ProtectedRoute>} />
          <Route path="/customer/reviews" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerReviews /></ProtectedRoute>} />
          <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerProfile /></ProtectedRoute>} />
          <Route path="/customer/favourites" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerFavouriteWorkers /></ProtectedRoute>} />
          <Route path="/customer/addresses" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerSavedAddresses /></ProtectedRoute>} />
          <Route path="/customer/notifications" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerNotifications /></ProtectedRoute>} />
          <Route path="/customer/payment" element={<ProtectedRoute allowedRoles={['customer', 'user']}><CustomerPayment /></ProtectedRoute>} />

          {/* Worker Protected Routes */}
          <Route path="/worker/dashboard" element={<ProtectedRoute allowedRoles={['labour']}><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/worker/requests" element={<ProtectedRoute allowedRoles={['labour']}><WorkerJobRequests /></ProtectedRoute>} />
          <Route path="/worker/job-details/:id" element={<ProtectedRoute allowedRoles={['labour']}><WorkerJobDetails /></ProtectedRoute>} />
          <Route path="/worker/today-jobs" element={<ProtectedRoute allowedRoles={['labour']}><WorkerTodayJobs /></ProtectedRoute>} />
          <Route path="/worker/messages" element={<ProtectedRoute allowedRoles={['labour']}><WorkerMessages /></ProtectedRoute>} />
          <Route path="/worker/earnings" element={<ProtectedRoute allowedRoles={['labour']}><WorkerEarnings /></ProtectedRoute>} />
          <Route path="/worker/analytics" element={<ProtectedRoute allowedRoles={['labour']}><WorkerAnalytics /></ProtectedRoute>} />
          <Route path="/worker/reviews" element={<ProtectedRoute allowedRoles={['labour']}><WorkerReviews /></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['labour']}><WorkerProfile /></ProtectedRoute>} />
          <Route path="/worker/portfolio" element={<ProtectedRoute allowedRoles={['labour']}><WorkerPortfolio /></ProtectedRoute>} />
          <Route path="/worker/settings" element={<ProtectedRoute allowedRoles={['labour']}><WorkerSettings /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/workers" element={<ProtectedRoute allowedRoles={['admin']}><AdminWorkers /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
