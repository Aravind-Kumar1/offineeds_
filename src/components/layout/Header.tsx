import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export function Header() {
  const { role, setRole } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);

    // Get current user email
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getCurrentUser();
  }, []);

  // Scroll to top on route change
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      setRole(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <header className={`
      fixed top-0 right-0 z-[40] bg-white border-b border-border
      transition-all duration-300
      ${isMobile ? 'py-1 pb-2 border-t-0' : 'py-4 pb-5'}
      ${isMobile ? 'left-0' : 'left-0 lg:left-72'}
    `}>
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <div className={`
               flex flex-col
               font-bold text-gray-900 transition-all duration-300
               ${isMobile ? 'ml-10' : 'ml-0'}
             `}>
               <span className={isMobile ? 'text-lg' : 'text-2xl'}>OffiNeeds</span>
               <span className="text-xs font-normal text-gray-500">OMS Dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User size={16} />
            <span>{userEmail || 'User'}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {role || 'Loading...'}
            </span>
          </div>
          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
          {/* Role Switcher for Demo */}
          <Select value={role || ""} onValueChange={setRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="procurement">Procurement</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
