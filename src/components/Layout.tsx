import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, BarChart3, MessageSquarePlus, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getAdminSession, clearAdminSession } from "@/lib/feedbackStore";
import { preloadRoute } from "@/lib/preload";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: "/", label: "Beranda", icon: GraduationCap },
  { to: "/feedback", label: "Beri Feedback", icon: MessageSquarePlus },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: Shield },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const local = getAdminSession();
      if (local) {
        setIsLoggedIn(true);
        return;
      }
      supabase.auth.getSession().then(({ data }) => {
        setIsLoggedIn(!!data?.session);
      }).catch(() => {});
    };

    checkAuth();

    const handleAuthChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setIsLoggedIn(true);
      } else {
        checkAuth();
      }
    };

    window.addEventListener("pkkmb-auth-change", handleAuthChange);
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) setIsLoggedIn(true);
      else checkAuth();
    });

    return () => {
      window.removeEventListener("pkkmb-auth-change", handleAuthChange);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    clearAdminSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
            <div className="h-9 w-9 rounded-lg bg-gradient-hero flex items-center justify-center shadow-elegant">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-sm leading-tight">
              Evaluasi PKKMB
              <span className="block text-xs font-normal text-muted-foreground">
                Analisis Sentimen
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onMouseEnter={() => {
                    if (item.to === "/feedback") preloadRoute("feedback");
                    else if (item.to === "/dashboard") preloadRoute("dashboard");
                    else if (item.to === "/admin") preloadRoute("admin");
                  }}
                  onTouchStart={() => {
                    if (item.to === "/feedback") preloadRoute("feedback");
                    else if (item.to === "/dashboard") preloadRoute("dashboard");
                    else if (item.to === "/admin") preloadRoute("admin");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            {isLoggedIn && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="ml-1 text-muted-foreground hover:text-foreground"
                id="navbar-logout-btn"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline ml-1.5">Keluar</span>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card mt-auto">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Sistem Evaluasi Kepuasan Mahasiswa Terhadap Kegiatan PKKMB
          </p>
          <p>Berbasis Analisis Sentimen · Powered by Team CC26-PSU342</p>
        </div>
      </footer>
    </div>
  );
};
