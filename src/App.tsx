import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import JobCards from "./pages/JobCards";
import ProductLibrary from "./pages/ProductLibrary";
import ReturnInventory from "./pages/ReturnInventory";
import ReadyInventory from "./pages/ReadyInventory";
import PurchaseOrders from "./pages/PurchaseOrders";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean; error: any }> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-700">Something went wrong.</h1>
            <p className="text-red-600 mb-2">{this.state.error?.toString()}</p>
            <p className="text-gray-500">Please refresh the page or contact support.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/job-cards" element={<Layout><JobCards /></Layout>} />
            <Route path="/product-library" element={<Layout><ProductLibrary /></Layout>} />
            <Route path="/return-inventory" element={<Layout><ReturnInventory /></Layout>} />
            <Route path="/ready-inventory" element={<Layout><ReadyInventory /></Layout>} />
            <Route path="/purchase-orders" element={<Layout><PurchaseOrders /></Layout>} />
            <Route path="/admin" element={<Layout><Admin /></Layout>} />
            <Route path="*" element={<div className="text-center py-8">Page not found</div>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
