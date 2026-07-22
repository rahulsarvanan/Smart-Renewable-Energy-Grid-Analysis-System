import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Mail, ArrowRight, AlertCircle, Loader2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, isDemoMode, enableDemoMode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created successfully! You can now log in.');
          setIsSignUp(false); // Switch to login view
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    enableDemoMode();
    navigate('/ops');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-body text-on-surface">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-tertiary-fixed/20 rounded-full blur-[150px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 bg-surface-container-low/60 backdrop-blur-2xl border border-outline-variant/30 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10 hover:shadow-[0_8px_40px_rgba(87,191,255,0.15)] transition-shadow duration-500"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(87,191,255,0.4)]">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">GridPulse</h1>
          <p className="text-sm font-label tracking-widest uppercase text-on-surface-variant mt-2">Enterprise Authentication</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-xs flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <label htmlFor="firstName" className="text-xs font-label uppercase tracking-wider text-on-surface-variant ml-1 cursor-pointer">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    id="firstName"
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full h-12 bg-surface-container-high/50 border border-outline-variant/50 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-on-surface outline-none"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <label htmlFor="lastName" className="text-xs font-label uppercase tracking-wider text-on-surface-variant ml-1 cursor-pointer">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    id="lastName"
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full h-12 bg-surface-container-high/50 border border-outline-variant/50 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-on-surface outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-label uppercase tracking-wider text-on-surface-variant ml-1 cursor-pointer">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@gridpulse.app"
                className="w-full h-12 bg-surface-container-high/50 border border-outline-variant/50 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-on-surface outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="security-key" className="text-xs font-label uppercase tracking-wider text-on-surface-variant ml-1 cursor-pointer">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input 
                id="security-key"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 bg-surface-container-high/50 border border-outline-variant/50 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-on-surface outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                id="remember"
                type="checkbox" 
                className="rounded bg-surface-container-high border-outline-variant text-primary focus:ring-primary/50 w-4 h-4 cursor-pointer" 
              />
              <span className="text-on-surface-variant select-none">Remember device</span>
            </label>
            <button type="button" className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer outline-none focus-visible:underline">
              Reset Protocol?
            </button>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(87,191,255,0.3)] hover:shadow-[0_0_25px_rgba(87,191,255,0.5)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Authenticate'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-4 text-center border-t border-outline-variant/20 pt-4 flex flex-col items-center gap-2">
          <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
            {isDemoMode ? 'Running in Local Demo Mode' : 'Secured by Supabase SSO'}
          </p>
          <button
            onClick={handleDemoAccess}
            className="text-xs text-primary hover:underline font-medium"
          >
            Continue as Guest / Demo Operator &rarr;
          </button>
        </div>
      </motion.div>
    </div>
  );
}
