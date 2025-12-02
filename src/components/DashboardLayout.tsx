import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  userRole: "admin" | "entrepreneur" | "investor";
  userName?: string;
}

const roleConfig = {
  admin: {
    gradient: "from-primary via-primary-light to-secondary",
    icon: Users,
    navItems: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
      { label: "Users", icon: Users, href: "/dashboard/admin/users" },
      { label: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
    ],
  },
  entrepreneur: {
    gradient: "from-secondary via-secondary-light to-accent",
    icon: Building2,
    navItems: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/entrepreneur" },
      { label: "My Company", icon: Building2, href: "/dashboard/entrepreneur/company" },
      { label: "Investors", icon: TrendingUp, href: "/dashboard/entrepreneur/investors" },
      { label: "Settings", icon: Settings, href: "/dashboard/entrepreneur/settings" },
    ],
  },
  investor: {
    gradient: "from-accent via-primary to-primary-dark",
    icon: TrendingUp,
    navItems: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/investor" },
      { label: "Startups", icon: Building2, href: "/dashboard/investor/startups" },
      { label: "Portfolio", icon: TrendingUp, href: "/dashboard/investor/portfolio" },
      { label: "Settings", icon: Settings, href: "/dashboard/investor/settings" },
    ],
  },
};

const DashboardLayout = ({
  children,
  title,
  subtitle,
  userRole,
  userName,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const config = roleConfig[userRole];
  const RoleIcon = config.icon;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold text-lg">PitchPoint</span>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-card border-r shadow-lg">
          {/* Sidebar Header */}
          <div className={cn("p-6 bg-gradient-to-br", config.gradient)}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <RoleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">PitchPoint</h2>
                <p className="text-white/80 text-sm capitalize">{userRole} Portal</p>
              </div>
            </div>
            {userName && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/80 text-xs">Welcome back,</p>
                <p className="text-white font-semibold truncate">{userName}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {config.navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {userName?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
