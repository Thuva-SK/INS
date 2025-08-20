import React from 'react';
import { Menu, Bell, Moon, Sun, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import logo from '@/assets/log.png';

interface AdminTopbarProps {
  setSidebarOpen: (open: boolean) => void;
  pageTitle: string;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-md lg:ml-64">
      {/* Left side: Branding */}
      <div className="flex items-center gap-4 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logo} alt="INS Online College Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-sidebar-foreground font-bold text-xs xs:text-sm sm:text-base truncate max-w-[80px] xs:max-w-[140px] sm:max-w-[220px] md:max-w-[400px] lg:max-w-none whitespace-nowrap">
            INS ONLINE COLLEGE (PVT) LTD - கல்வியால் சிறந்த சமூகத்தை கட்டியெழுப்புவோம்
          </span>
        </div>
      </div>
      {/* Right side: Controls */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        {/* User Info */}
        <div className="flex flex-col items-end">
          <span className="font-semibold text-base text-foreground">{user?.name || 'User'}</span>
          <span className="text-xs text-muted-foreground">{user?.role || 'Admin'}</span>
              </div>
      </div>
    </header>
  );
};

export default AdminTopbar;