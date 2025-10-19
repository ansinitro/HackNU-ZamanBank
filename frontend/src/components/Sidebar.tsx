"use client";
import Link from "next/link";
import { User, Target, Bot, BarChart3, Menu, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/aims", label: "Personal Aims", icon: Target },
  { href: "/chat", label: "AI Chat Bot", icon: Bot },
  { href: "/charts", label: "Expense/Income", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username");
    setHasToken(!!token);
    setUsername(storedUsername || "User");

    // Load saved sidebar state
    const savedCollapsed = localStorage.getItem("sidebar_collapsed");
    if (savedCollapsed !== null) {
      setDesktopCollapsed(savedCollapsed === "true");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    setHasToken(false);
    router.push("/login");
  };

  const toggleDesktopSidebar = () => {
    const newState = !desktopCollapsed;
    setDesktopCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", newState.toString());
  };

  if (!isClient || !hasToken) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          backgroundColor: ZamanColors.Solar,
          color: ZamanColors.PersianGreen,
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle mobile menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col shadow-2xl transition-all duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
        `}
        style={{
          width: desktopCollapsed ? '80px' : '288px',
          background: `linear-gradient(180deg, ${ZamanColors.PersianGreen} 0%, ${ZamanColors.DarkTeal} 100%)`,
        }}
      >
        {/* Header with gradient accent */}
        <div 
          className="p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.DarkTeal}, ${ZamanColors.PersianGreen})`,
          }}
        >
          {/* Decorative circle */}
          <div 
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
            style={{ backgroundColor: ZamanColors.Solar }}
          />
          
          {!desktopCollapsed ? (
            <>
              <h1 
                className="text-3xl font-bold mb-2 relative z-10 transition-opacity duration-300"
                style={{ color: ZamanColors.Solar }}
              >
                Zaman Bank
              </h1>
              <p 
                className="text-sm opacity-90 relative z-10 transition-opacity duration-300" 
                style={{ color: ZamanColors.LightTeal }}
              >
                Welcome, {username}!
              </p>
            </>
          ) : (
            <div className="flex justify-center relative z-10">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: ZamanColors.Solar,
                }}
              >
                <span className="text-xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: isActive ? ZamanColors.Solar : 'transparent',
                  color: isActive ? ZamanColors.DarkTeal : ZamanColors.Cloud,
                  fontWeight: isActive ? '700' : '500',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                  justifyContent: desktopCollapsed ? 'center' : 'flex-start',
                }}
                onClick={() => setMobileOpen(false)}
                title={desktopCollapsed ? label : undefined}
              >
                {/* Hover background */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${ZamanColors.Solar}20, transparent)`,
                  }}
                />
                
                {/* Active indicator */}
                {isActive && !desktopCollapsed && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: ZamanColors.PersianGreen }}
                  />
                )}
                
                {/* Icon */}
                <div 
                  className="relative z-10 p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: isActive ? `${ZamanColors.PersianGreen}20` : 'transparent',
                  }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ 
                      color: isActive ? ZamanColors.PersianGreen : ZamanColors.Solar 
                    }} 
                  />
                </div>
                
                {/* Label */}
                {!desktopCollapsed && (
                  <>
                    <span className="relative z-10 text-base">{label}</span>
                    
                    {/* Arrow indicator for active */}
                    {isActive && (
                      <div 
                        className="relative z-10 ml-auto text-xl"
                        style={{ color: ZamanColors.PersianGreen }}
                      >
                        →
                      </div>
                    )}
                  </>
                )}

                {/* Collapsed active indicator */}
                {isActive && desktopCollapsed && (
                  <div 
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: ZamanColors.PersianGreen }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout Button */}
        <div className="p-4 border-t" style={{ borderColor: `${ZamanColors.LightTeal}30` }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            style={{
              background: `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
              color: ZamanColors.DarkTeal,
              fontWeight: '600',
              boxShadow: `0 4px 12px ${ZamanColors.Solar}40`,
              justifyContent: desktopCollapsed ? 'center' : 'flex-start',
            }}
            title={desktopCollapsed ? "Logout" : undefined}
          >
            <div 
              className="p-2 rounded-lg transition-all duration-300 group-hover:rotate-12"
              style={{ backgroundColor: `${ZamanColors.PersianGreen}20` }}
            >
              <LogOut className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
            </div>
            {!desktopCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Decorative bottom accent */}
        <div 
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${ZamanColors.Solar}, ${ZamanColors.LightTeal}, ${ZamanColors.Solar})`,
          }}
        />

        {/* Desktop Toggle Button */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 items-center justify-center rounded-r-xl shadow-lg transition-all duration-300 hover:scale-110 z-50"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
            color: ZamanColors.DarkTeal,
          }}
          aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {desktopCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Custom scrollbar for navigation */
        nav::-webkit-scrollbar {
          width: 6px;
        }

        nav::-webkit-scrollbar-track {
          background: ${ZamanColors.DarkTeal};
          border-radius: 10px;
        }

        nav::-webkit-scrollbar-thumb {
          background: ${ZamanColors.Solar};
          border-radius: 10px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: ${ZamanColors.LightTeal};
        }
      `}</style>
    </>
  );
}