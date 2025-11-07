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
