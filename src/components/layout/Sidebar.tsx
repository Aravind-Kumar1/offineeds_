import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package2, 
  PackageCheck, 
  ShoppingCart, 
  Settings,
  Library,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

// Define the order of sidebar items explicitly
const sidebarOrder = [
  "Dashboard",
  "JobCards",
  "ReturnInventory",
  "ReadyInventory",
  "PurchaseOrders",
  "ProductLibrary",
  "Admin"
];

const navigationItems = {
  Dashboard: { path: "/", icon: LayoutDashboard },
  JobCards: { path: "/job-cards", icon: ClipboardList },
  ProductLibrary: { path: "/product-library", icon: Library },
  ReturnInventory: { path: "/return-inventory", icon: Package2 },
  ReadyInventory: { path: "/ready-inventory", icon: PackageCheck },
  PurchaseOrders: { path: "/purchase-orders", icon: ShoppingCart },
  Admin: { path: "/admin", icon: Settings }
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isCollapsed]);

  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isCollapsed]);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed top-4 left-4 z-[60] lg:hidden",
          "bg-white/80 backdrop-blur-sm border border-gray-200",
          "text-gray-700 hover:text-gray-900 hover:bg-white",
          "transition-all duration-200 shadow-lg",
          !isCollapsed && "opacity-0 pointer-events-none"
        )}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? (isMobile ? 0 : 80) : 280,
          x: isMobile && isCollapsed ? -280 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "fixed left-0 top-0 z-[50] h-screen",
          "bg-white/95 backdrop-blur-xl border-r-2 border-gray-300/50",
          "overflow-hidden shadow-2xl",
          "lg:translate-x-0",
          isMobile && "shadow-2xl"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header: OMS Dashboard text should be immediately below the logo, no gap from the top. */}
          <div className="flex flex-col items-center border-b-2 border-gray-200/50 flex-shrink-0 bg-white" style={{paddingTop: 0, paddingBottom: 8}}>
            <div className="w-32 h-24 rounded-xl flex items-center justify-center overflow-hidden bg-white" style={{marginTop: 0, marginBottom: 0}}>
              <img 
                src="/logo.png" 
                alt="OffiNeeds Logo" 
                className="w-full h-24 object-contain"
              />
            </div>
            <h1 className="text-base font-bold text-black" style={{marginTop: 0, paddingTop: 0}}>OMS Dashboard</h1>
          </div>
          <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
            {sidebarOrder.map((componentName) => {
              const item = navigationItems[componentName as keyof typeof navigationItems];
              if (!item) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={componentName}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50",
                      "group relative overflow-hidden border border-transparent hover:border-gray-200/50",
                      isActive && "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105 border-blue-400"
                    )
                  }
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    "group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {componentName === "JobCards" ? "Job Cards" :
                     componentName === "ProductLibrary" ? "Product Library" :
                     componentName === "ReturnInventory" ? "Return Inventory" :
                     componentName === "ReadyInventory" ? "Ready Inventory" :
                     componentName === "PurchaseOrders" ? "Purchase Orders" :
                     componentName === "AdminOnboarding" ? "Employee Onboarding" :
                     componentName}
                  </span>
                  <ChevronRight className={cn(
                    "h-4 w-4 ml-auto transition-all duration-200",
                    "group-hover:translate-x-1",
                    isCollapsed ? "hidden" : "block"
                  )} />
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}