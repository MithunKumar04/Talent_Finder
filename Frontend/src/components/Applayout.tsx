import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAppDispatch,useAppSelector } from '../store';
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
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">TalentFinder</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-2 text-muted-foreground',
                      location.pathname === item.to && 'bg-secondary text-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
