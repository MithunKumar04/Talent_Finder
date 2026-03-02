import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store/authSlice';
import { mockLogin,DEFAULT_CREDENTIALS } from '../lib/mockApi';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState(DEFAULT_CREDENTIALS.email);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await mockLogin(email, password);
      dispatch(loginSuccess(data));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold">TalentFinder</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage your jobs<br />with confidence.
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Track, create, and manage job postings all in one powerful dashboard.
          </p>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">JobFlow</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-muted-foreground mb-8">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-secondary text-sm">
            <p className="font-medium text-foreground mb-1">Default credentials:</p>
            <p className="text-muted-foreground">Email: {DEFAULT_CREDENTIALS.email}</p>
            <p className="text-muted-foreground">Password: {DEFAULT_CREDENTIALS.password}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
