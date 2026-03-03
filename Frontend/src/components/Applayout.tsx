import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                TalentFinder
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <Link key={item.to} to={item.to} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'text-indigo-600'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-2 right-2 -bottom-1 h-[2px] rounded-full bg-indigo-600" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-foreground">
                {user?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Recruiter
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

    </div>
  );
};

export default AppLayout;