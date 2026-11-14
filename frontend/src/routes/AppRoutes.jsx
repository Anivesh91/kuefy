import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RisingBallLoader } from '@/components/ui/rising-ball';

// Dynamic code-split chunks for optimized client bundle loading
const LandingPage = lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const CustomerHomePage = lazy(() =>
  import('../pages/customer/CustomerHomePage').then((m) => ({ default: m.CustomerHomePage }))
);
const SearchResultsPage = lazy(() =>
  import('../pages/customer/SearchResultsPage').then((m) => ({ default: m.SearchResultsPage }))
);
const PublicOrgPage = lazy(() =>
  import('../pages/customer/PublicOrgPage').then((m) => ({ default: m.PublicOrgPage }))
);
const ServiceQueuePage = lazy(() =>
  import('../pages/customer/ServiceQueuePage').then((m) => ({ default: m.ServiceQueuePage }))
);
const TicketTrackerPage = lazy(() =>
  import('../pages/customer/TicketTrackerPage').then((m) => ({ default: m.TicketTrackerPage }))
);
const LoginPage = lazy(() =>
  import('../pages/organization/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const OrgSetupPage = lazy(() =>
  import('../pages/organization/OrgSetupPage').then((m) => ({ default: m.OrgSetupPage }))
);
const DashboardPage = lazy(() =>
  import('../pages/organization/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ProfilePage = lazy(() =>
  import('../pages/organization/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const ServicesPage = lazy(() =>
  import('../pages/organization/ServicesPage').then((m) => ({ default: m.ServicesPage }))
);
const QueueConsolePage = lazy(() =>
  import('../pages/organization/QueueConsolePage').then((m) => ({ default: m.QueueConsolePage }))
);

const RouteLoadingFallback = () => (
  <div className="min-h-screen w-full bg-[#F5F2EB] flex flex-col items-center justify-center p-6 text-[#1C2520]">
    <RisingBallLoader text="Loading Kuefy..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Customer / Guest Routes */}
        <Route path="/customer" element={<CustomerHomePage />} />
        <Route path="/customer/organizations" element={<SearchResultsPage />} />
        <Route path="/customer/organizations/:slug" element={<PublicOrgPage />} />
        <Route path="/customer/services/:serviceId" element={<ServiceQueuePage />} />
        <Route path="/customer/tickets/:publicToken" element={<TicketTrackerPage />} />

        {/* Public Organization Auth Routes */}
        <Route path="/organization" element={<Navigate to="/organization/login" replace />} />
        <Route path="/organization/register" element={<LoginPage initialMode="register" />} />
        <Route path="/organization/login" element={<LoginPage initialMode="login" />} />

        {/* Protected Owner Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/organization/setup" element={<OrgSetupPage />} />
          <Route path="/organization/dashboard" element={<DashboardPage />} />
          <Route path="/organization/profile" element={<ProfilePage />} />
          <Route path="/organization/services" element={<ServicesPage />} />
          <Route path="/organization/queues/:serviceId" element={<QueueConsolePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
