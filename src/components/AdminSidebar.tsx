import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar,
  Images,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import logo from '@/assets/log.png';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [programsOpen, setProgramsOpen] = React.useState(true);

  const navItems = [
    { 
      title: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      exact: true
    },
    { 
      title: 'Instructors', 
      href: '/admin/instructors', 
      icon: UserCheck 
    },
    { 
      title: 'Staff', 
      href: '/admin/staffs', 
      icon: Users 
    },
    { 
      title: 'Gallery', 
      href: '/admin/gallery', 
      icon: Images 
    },
    { 
      title: 'Announcements', 
      href: '/admin/announcements', 
      icon: Megaphone 
    },
    { 
      title: 'Social Service', 
      href: '/admin/social-service', 
      icon: Users // Changed from Megaphone to Users
    },
    { 
      title: 'Kids Camp', 
      href: '/admin/kids-camp', 
      icon: Calendar 
    },
    { 
      title: 'Settings', 
      href: '/admin/settings', 
      icon: Settings 
    }
  ];

  const programItems = [
    { 
      title: 'Courses', 
      href: '/admin/courses', 
      icon: BookOpen 
    },
    { 
      title: 'Classes', 
      href: '/admin/classes', 
      icon: Calendar 
    }
  ];

  const isActiveRoute = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    // Only match Dashboard for exact /admin
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    // For other items, match if path starts with href and is not exactly /admin
    return location.pathname.startsWith(href) && location.pathname !== '/admin';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Removed logo/title section */}
        <div className="flex flex-col h-full">
          {/* Logo at the top */}
          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-1">
            {/* Main Navigation Items */}
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={`
                  sidebar-nav-item
                  ${isActiveRoute(item.href, item.exact) ? 'sidebar-nav-item-active' : ''}
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            ))}

            {/* Programs Section */}
            <Collapsible open={programsOpen} onOpenChange={setProgramsOpen}>
              <CollapsibleTrigger className="sidebar-nav-item w-full justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">Programs</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${programsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-8 mt-2 space-y-2">
                {programItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) => `
                      sidebar-nav-item text-sm
                      ${isActive ? 'sidebar-nav-item-active' : ''}
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </nav>

          {/* Footer */}
          <div className="px-2 py-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;