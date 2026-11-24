import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    const result = await login(email, password);
    if (result.success) {
      if (['admin', 'pharmacist'].includes(result.user.role)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setLocalError(result.error);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    login(demoEmail, demoPassword).then((res) => {
      if (res.success) {
        if (['admin', 'pharmacist'].includes(res.user.role)) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-8 shadow-xl space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to MediStore</h2>
          <p className="text-xs text-slate-500">Access customer medicine orders & pharmacy operations</p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
          <p className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Instant Demo Logins:</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@medistore.health', 'Password@123')}
              className="py-2 px-1 bg-white hover:bg-brand-50 text-brand-800 border border-slate-200 rounded-xl font-bold text-[11px] transition-colors shadow-2xs"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('pharmacist@medistore.health', 'Password@123')}
              className="py-2 px-1 bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 rounded-xl font-bold text-[11px] transition-colors shadow-2xs"
            >
              Pharmacist
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@medistore.health', 'Password@123')}
              className="py-2 px-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-[11px] transition-colors shadow-2xs"
            >
              Customer
            </button>
          </div>
        </div>

        {/* Error message */}
        {(localError || error) && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@medistore.health"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register for Free
          </Link>
        </div>

      </div>
    </div>
  );
}
