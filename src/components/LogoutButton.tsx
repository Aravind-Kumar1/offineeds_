import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuthStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
}
