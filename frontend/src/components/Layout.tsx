import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Package, 
  Plus,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../utils';

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Check In/Out',
    href: '/checkin-checkout',
    icon: ArrowLeftRight,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    name: 'Add Item',
    href: '/add-item',
    icon: Plus,
  },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'auto' | 'desktop' | 'mobile'>(() => {
    const saved = localStorage.getItem('displayMode');
    return (saved === 'desktop' || saved === 'mobile') ? (saved as any) : 'auto';
  });

  useEffect(() => {
    localStorage.setItem('displayMode', displayMode);
  }, [displayMode]);

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const desktopSidebarClasses = displayMode === 'desktop'
    ? 'fixed inset-y-0 flex w-64 flex-col'
    : displayMode === 'mobile'
    ? 'hidden'
    : 'hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col';

  const mainContentClasses = cn('flex flex-col flex-1', 
    displayMode === 'desktop' ? 'pl-64' : 
    displayMode === 'mobile' ? '' : 'lg:pl-64'
  );

  const mobileHeaderWrapperClasses = displayMode === 'desktop' ? 'hidden' : 
    displayMode === 'mobile' ? 'block' : 'lg:hidden';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={desktopSidebarClasses}>
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Inventory System
              </span>
            </div>
            <div className="px-4 mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Display mode</label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as any)}
              >
                <option value="auto">Auto</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActiveRoute(item.href)
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        isActiveRoute(item.href)
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={mobileHeaderWrapperClasses}>
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">
              Inventory System
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="sr-only">Display mode</label>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as any)}
              >
                <option value="auto">Auto</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Package className="h-8 w-8 text-primary-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    Inventory System
                  </span>
                </div>
                <nav className="mt-8 px-2 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors',
                          isActiveRoute(item.href)
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon
                          className={cn(
                            'mr-4 flex-shrink-0 h-5 w-5',
                            isActiveRoute(item.href)
                              ? 'text-primary-600'
                              : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className={mainContentClasses}>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 