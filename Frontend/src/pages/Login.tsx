import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store/authSlice';
import { mockLogin, DEFAULT_CREDENTIALS } from '../lib/mockApi';
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* LEFT PANEL (Brand / Marketing) */}
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700" />
        <div className="absolute inset-0 bg-black/20" />

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md p-12 text-white"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              TalentFinder
            </h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Hire smarter.<br />
            Faster. Better.
          </h2>

          <p className="text-white/80 text-lg leading-relaxed">
            Manage job postings, rank candidates, and track hiring progress
            with confidence — all in one dashboard.
          </p>
        </motion.div>
      </div>

      {/* RIGHT PANEL (Login Form) */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              TalentFinder
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            Sign in
          </h2>
          <p className="text-muted-foreground mb-8">
            Enter your credentials to access the dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
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

            {/* Password */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Default Credentials Box */}
          <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium mb-1">
              Default credentials
            </p>
            <p className="text-muted-foreground">
              Email: <span className="font-mono">{DEFAULT_CREDENTIALS.email}</span>
            </p>
            <p className="text-muted-foreground">
              Password: <span className="font-mono">{DEFAULT_CREDENTIALS.password}</span>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;