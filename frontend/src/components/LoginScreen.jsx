import React, { useState } from 'react';
import { Instagram, Eye, EyeOff } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@capeneto.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleSubmit = async (e, customEmail, customPass) => {
    if (e) e.preventDefault();
    const em = customEmail || email;
    const pw = customPass || password;
    setLoading(true);
    setError(null);
    try {
      await onLogin(em, pw);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div
        className={`relative bg-white/[0.97] backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20
          transition-all duration-700 ease-out
          ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl mb-5 mx-auto shadow-lg shadow-indigo-500/25">
          <Instagram className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 tracking-tight">Cape Neto CRM</h1>
        <p className="text-slate-500 text-sm text-center mt-1 mb-6">
          Instagram-Native Agency Management
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5 rounded-xl mb-4 animate-[shake_0.4s_ease-in-out]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Agency Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-slate-50/50 text-sm"
              placeholder="you@capeneto.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-slate-50/50 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-400 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In to Workspace'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 text-center">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Admin', email: 'admin@capeneto.com', pass: 'admin123', icon: '🛡️' },
              { label: 'Sales Rep', email: 'sarah.rep@capeneto.com', pass: 'rep123', icon: '💼' },
              { label: 'Viewer', email: 'auditor@capeneto.com', pass: 'viewer123', icon: '👁️' },
            ].map(cred => (
              <button
                key={cred.email}
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(null, cred.email, cred.pass)}
                className="text-xs bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 py-2.5 px-2 rounded-xl font-medium transition-all duration-150 text-center border border-slate-100 hover:border-slate-200 active:scale-[0.97]"
              >
                <span className="block text-base mb-0.5">{cred.icon}</span>
                {cred.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

