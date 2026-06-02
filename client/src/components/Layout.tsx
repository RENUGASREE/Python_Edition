import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  FolderKanban,
  BarChart3,
  MessageCircle,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/compiler", label: "Compiler", icon: Code2 },
    { href: "/challenges", label: "Challenges", icon: Zap },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "/assistant", label: "AI Assistant", icon: MessageCircle },
    { href: "/profile", label: "Profile", icon: User },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar/85 backdrop-blur">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Terminal className="w-6 h-6" />
          <span>Python Edition</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed md:sticky top-0 z-40 w-64 h-screen bg-sidebar/85 text-sidebar-foreground backdrop-blur-xl border-r border-sidebar-border transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-3 font-display font-bold text-xl text-primary mb-8">
            <div className="bg-primary/15 p-2 rounded-xl">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div>Python Edition</div>
              <div className="text-[10px] font-normal text-muted-foreground tracking-wide">
                Adaptive Learning
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/15"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border pt-4 space-y-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
