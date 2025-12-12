import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Table, 
  Bell,
  CreditCard,
  GraduationCap,
  Cog,
  TrendingUp,
  LogIn, 
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const navItems = [
  {
    title: "Ventas",
    href: "/dashboard",
    icon: LayoutDashboard,
    hasSubmenu: true,
    submenu: [
      {
        title: "Facturación",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Informe de Pagos",
        href: "/payment-report",
        icon: TrendingUp,
      },
    ]
  },
  {
    title: "Cotizaciones",
    href: "/quotations",
    icon: FileText,
  },
  // Hidden menus - available for future use
  // {
  //   title: "Capacitaciones",
  //   href: "/capacitaciones",
  //   icon: GraduationCap,
  // },
  // {
  //   title: "Servicios Industriales",
  //   href: "/servicios-industriales",
  //   icon: Cog,
  // },
  // Other hidden menus - available for future use
  // {
  //   title: "Profile",
  //   href: "/profile",
  //   icon: User,
  // },
  // {
  //   title: "Tables",
  //   href: "/tables",
  //   icon: Table,
  // },
  // {
  //   title: "Notifications",
  //   href: "/notifications",
  //   icon: Bell,
  // },
  // {
  //   title: "Subscriptions",
  //   href: "/subscriptions",
  //   icon: CreditCard,
  // },
];

const authItems = [
  {
    title: "Sign In",
    href: "/auth/sign-in",
    icon: LogIn,
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isSubmenuExpanded = (title: string) => expandedMenus.includes(title);

  const isActiveRoute = (href: string) => location.pathname === href;

  return (
    <aside className="w-60 bg-white lg:bg-transparent flex flex-col relative z-10 h-full border-r border-stone-200 lg:border-0">
      {/* Brand Header */}
      <div className="p-6 pb-0 relative z-10 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">
          Reportes Varcus 
        </h1>
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.hasSubmenu;
          const isExpanded = isSubmenuExpanded(item.title);
          const isActive = isActiveRoute(item.href) || (hasSubmenu && item.submenu?.some(sub => isActiveRoute(sub.href)));
          
          return (
            <div key={item.title}>
              {hasSubmenu ? (
                <div>
                  <div
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex items-center justify-between text-sm font-normal rounded-lg cursor-pointer",
                      isActive
                        ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                        : "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-3 w-4 h-4" />
                      {item.title}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Submenu */}
                  {isExpanded && item.submenu && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = isActiveRoute(subItem.href);
                        
                        return (
                          <NavLink key={subItem.href} to={subItem.href}>
                            <div
                              className={cn(
                                "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                                isSubActive
                                  ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                                  : "px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors duration-200 border border-transparent"
                              )}
                            >
                              <SubIcon className="mr-3 w-4 h-4" />
                              {subItem.title}
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink to={item.href}>
                  <div
                    className={cn(
                      "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                      isActive
                        ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                        : "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent"
                    )}
                  >
                    <Icon className="mr-3 w-4 h-4" />
                    {item.title}
                  </div>
                </NavLink>
              )}
            </div>
          );
        })}

        {/* Authentication Section - Conditional based on user state */}
        {!user ? (
          /* Show Sign In when not authenticated */
          <div className="pt-4 border-t border-stone-200 mt-4">
            <p className="px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
              AUTH PAGES
            </p>
            {authItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink key={item.href} to={item.href}>
                  <div
                    className={cn(
                      "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                      isActive
                        ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                        : "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent"
                    )}
                  >
                    <Icon className="mr-3 w-4 h-4" />
                    {item.title}
                  </div>
                </NavLink>
              );
            })}
          </div>
        ) : (
          /* Show User Info and Logout when authenticated */
          <div className="mt-auto pt-4 border-t border-stone-200">
            <div className="px-4 py-3 mb-2">
              <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                Usuario Conectado
              </div>
              <div className="text-sm font-medium text-stone-900 truncate">
                {user.name}
              </div>
              <div className="text-xs text-stone-500 truncate">
                {user.username}
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-stone-700 hover:bg-stone-100 hover:text-stone-900"
            >
              <LogOut className="mr-3 w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        )}

      </nav>

    </aside>
  );
}
