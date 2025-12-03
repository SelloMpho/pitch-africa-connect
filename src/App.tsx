import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RegisterEntrepreneur from "./pages/auth/RegisterEntrepreneur";
import RegisterInvestor from "./pages/auth/RegisterInvestor";
import AdminDashboard from "./pages/AdminDashboard";
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import UserManagement from "./pages/admin/UserManagement";
import Verifications from "./pages/admin/Verifications";
import PlatformAnalytics from "./pages/admin/PlatformAnalytics";
import ReportsFraud from "./pages/admin/ReportsFraud";
import ContentManagement from "./pages/admin/ContentManagement";
import Messages from "./pages/admin/Messages";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/register/entrepreneur" element={<RegisterEntrepreneur />} />
          <Route path="/auth/register/investor" element={<RegisterInvestor />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<UserManagement />} />
          <Route path="/dashboard/admin/verifications" element={<Verifications />} />
          <Route path="/dashboard/admin/analytics" element={<PlatformAnalytics />} />
          <Route path="/dashboard/admin/reports" element={<ReportsFraud />} />
          <Route path="/dashboard/admin/content" element={<ContentManagement />} />
          <Route path="/dashboard/admin/messages" element={<Messages />} />
          <Route path="/dashboard/admin/settings" element={<Settings />} />
          <Route path="/dashboard/entrepreneur" element={<EntrepreneurDashboard />} />
          <Route path="/dashboard/investor" element={<InvestorDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
