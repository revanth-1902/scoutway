import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Map, Mail, Lock } from 'lucide-react';
import { login as apiLogin, guestLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AUTH_IMG = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&auto=format&q=80';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const res = await guestLogin();
      login(res.data.user, res.data.token);
      toast.success('Continuing as guest — sign up to post stories!');
      navigate('/home');
    } catch {
      toast.error('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Left Image Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950">
        <img src={AUTH_IMG} alt="Travel" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20">
              <Map size={28} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight font-outfit">
              ScoutWay
            </span>
          </div>
          <blockquote className="text-white text-2xl font-extrabold leading-relaxed max-w-sm font-outfit">
            "Where every trip becomes a story."
          </blockquote>
          <p className="text-slate-300 text-sm mt-3 max-w-xs leading-relaxed font-normal">
            Join thousands of travelers sharing their adventures across the globe.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-md my-auto animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md">
              <Map size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-outfit">ScoutWay</span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight font-outfit">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm font-medium">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />

                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />

                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Enter your password"
                  className="input-field !pl-11 !pr-12"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center"
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>


          {/* Divider */}
          <div className="auth-divider">
            <span>Or</span>
          </div>

          {/* Social / Alt logins */}
          <div className="flex flex-col gap-3">
            <Link to="/register" className="btn-secondary w-full">
              <span>Create Account</span>
            </Link>

            <button onClick={handleGoogle} className="social-btn">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button onClick={handleGuest} className="guest-btn">
              <span>Continue as Guest</span>
            </button>
          </div>

          {/* Bottom link */}
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-8">
            New here?{' '}
            <Link to="/register" className="font-extrabold text-sky-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



