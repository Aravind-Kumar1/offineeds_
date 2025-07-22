import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll main content to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - Full height without header */}
      <div className={`
        h-full flex flex-col transition-all duration-300
        ${isMobile ? 'ml-0' : 'ml-0 lg:ml-72'}
      `}>
        {/* Scrollable Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}