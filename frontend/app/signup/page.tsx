'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';

type SignupRole = 'customer' | 'employee';

function dashboardForRole(role?: string) {
  switch (role) {
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/dashboard';
  }
}

export default function SignupPage() {
  const { navigate, prefetch } = useOptimizedNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignupRole>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    prefetch('/login');
    prefetch('/homepage');
  }, [prefetch]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (!normalizedName || !normalizedEmail || !password) {
      toast.error('Full name, email, and password are required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
            role,
          },
        },
      });

      if (error) {
        toast.error(error.message ?? 'Sign up failed');
        return;
      }

      if (data.user) {
        const { createProfile } = await import('../actions/auth');
        const profileResult = await createProfile({
          id: data.user.id,
          fullName: normalizedName,
          role,
        });

        if (!profileResult.success) {
          throw new Error(profileResult.error || 'Failed to create profile');
        }
      }

      if (data.session) {
        toast.success('Account created successfully');
        navigate(dashboardForRole(role));
        return;
      }

      toast.success('Account created. Check your email to finish verification.');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .signup-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
          font-family: var(--font);
        }
        .signup-panel-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: var(--md-space-12) 48px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          overflow: hidden;
        }
        .signup-panel-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 28%),
            url("data:image/svg+xml,%3Csvg width='64' height='64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 64L64 0' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/svg%3E") repeat;
          pointer-events: none;
        }
        .left-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          position: relative;
          z-index: 1;
        }
        .left-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .left-brand-name { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .left-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 0;
          position: relative;
          z-index: 1;
        }
        .left-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: var(--md-space-4);
        }
        .left-headline {
          font-family: var(--md-font-display);
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 700;
          line-height: 1.12;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 var(--md-space-6);
        }
        .left-body-text {
          font-size: 14px;
          color: rgba(255,255,255,0.68);
          line-height: 1.7;
          max-width: 360px;
          margin-bottom: var(--md-space-8);
        }
        .left-points {
          display: grid;
          gap: 12px;
          max-width: 360px;
        }
        .left-point {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.8);
          font-size: 14px;
        }
        .left-point svg { flex: 0 0 auto; }
        .signup-panel-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--md-space-12) 48px;
          background: var(--surface);
        }
        .signup-form-wrap {
          width: 100%;
          max-width: 420px;
          animation: md-fade-in var(--md-duration-medium) var(--md-motion-decelerate) both;
        }
        .signup-form-header { margin-bottom: var(--md-space-8); }
        .signup-form-title {
          font-family: var(--md-font-display);
          font-size: var(--md-text-headline-md);
          font-weight: 700;
          color: var(--text-1);
          margin: 0 0 var(--md-space-2);
          letter-spacing: -0.3px;
          line-height: 1.15;
        }
        .signup-form-sub { font-size: var(--md-text-body-md); color: var(--text-3); margin: 0; }
        .signup-field { margin-bottom: var(--md-space-4); }
        .signup-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-2);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: var(--md-space-2);
        }
        .signup-input-wrap { position: relative; }
        .signup-input {
          width: 100%;
          height: 46px;
          background: var(--surface-2);
          border: 1.5px solid var(--divider);
          border-radius: var(--r-md);
          color: var(--text-1);
          font-family: var(--font);
          font-size: 14px;
          padding: 0 46px 0 14px;
          outline: none;
          box-sizing: border-box;
        }
        .signup-input:focus {
          border-color: var(--blue-400);
          background: var(--surface);
          box-shadow: 0 0 0 3px rgba(33,150,243,0.12);
        }
        .signup-input-icon {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-3);
          display: flex;
          align-items: center;
        }
        .signup-role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .signup-role-button {
          border: 1.5px solid var(--divider);
          border-radius: var(--r-md);
          background: var(--surface-2);
          color: var(--text-2);
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .signup-role-button.active {
          border-color: var(--blue-400);
          background: rgba(33,150,243,0.08);
          color: var(--text-1);
        }
        .signup-role-title {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .signup-role-desc {
          display: block;
          font-size: 12px;
          line-height: 1.4;
          color: var(--text-3);
        }
        .signup-submit {
          width: 100%;
          height: 46px;
          background: #0f172a;
          border: none;
          border-radius: var(--r-md);
          font-family: var(--font);
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          margin-top: var(--md-space-4);
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .signup-submit:hover:not(:disabled) { background: #1e293b; }
        .signup-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes signup-spin { to { transform: rotate(360deg); } }
        .signup-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: signup-spin 0.65s linear infinite;
        }
        .signup-footer {
          margin-top: var(--md-space-5);
          font-size: 13px;
          color: var(--text-3);
          text-align: center;
        }
        .signup-footer a {
          color: var(--blue-600);
          font-weight: 600;
          text-decoration: none;
        }
        .signup-footer a:hover { text-decoration: underline; }
        .signup-note {
          margin-top: var(--md-space-4);
          font-size: 12px;
          line-height: 1.6;
          color: var(--text-3);
          text-align: center;
        }
        @media (max-width: 768px) {
          .signup-shell { grid-template-columns: 1fr; }
          .signup-panel-left { display: none; }
          .signup-panel-right { padding: 40px 24px; }
          .signup-role-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="signup-shell">
        <div className="signup-panel-left">
          <Link href="/homepage" className="left-brand">
            <div className="left-brand-icon">
              <ShieldCheck width="20" height="20" strokeWidth="2" />
            </div>
            <span className="left-brand-name">CleanOps</span>
          </Link>

          <div className="left-content">
            <p className="left-eyebrow">Create an account</p>
            <h1 className="left-headline">
              Start using<br />
              <span>CleanOps</span>
            </h1>
            <p className="left-body-text">
              Create a customer or employee account directly on the web.
              Admin accounts are still managed separately.
            </p>

            <div className="left-points">
              <div className="left-point">
                <User width="16" height="16" />
                Full access to your account dashboard
              </div>
              <div className="left-point">
                <BriefcaseBusiness width="16" height="16" />
                Employee jobs and customer booking flows
              </div>
              <div className="left-point">
                <Lock width="16" height="16" />
                Secure sign-in with Supabase auth
              </div>
            </div>
          </div>
        </div>

        <div className="signup-panel-right">
          <div className="signup-form-wrap">
            <div className="signup-form-header">
              <h2 className="signup-form-title">Create account</h2>
              <p className="signup-form-sub">
                Choose your role and set up your CleanOps profile
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="signup-field">
                <label className="signup-label" htmlFor="full-name">Full name</label>
                <div className="signup-input-wrap">
                  <input
                    id="full-name"
                    className="signup-input"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <span className="signup-input-icon">
                    <User width="16" height="16" />
                  </span>
                </div>
              </div>

              <div className="signup-field">
                <label className="signup-label" htmlFor="email">Email</label>
                <div className="signup-input-wrap">
                  <input
                    id="email"
                    className="signup-input"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="signup-input-icon">
                    <Mail width="16" height="16" />
                  </span>
                </div>
              </div>

              <div className="signup-field">
                <label className="signup-label">Account type</label>
                <div className="signup-role-grid">
                  <button
                    type="button"
                    className={`signup-role-button ${role === 'customer' ? 'active' : ''}`}
                    onClick={() => setRole('customer')}
                  >
                    <span className="signup-role-title">Customer</span>
                    <span className="signup-role-desc">Book jobs and manage requests</span>
                  </button>
                  <button
                    type="button"
                    className={`signup-role-button ${role === 'employee' ? 'active' : ''}`}
                    onClick={() => setRole('employee')}
                  >
                    <span className="signup-role-title">Employee</span>
                    <span className="signup-role-desc">Accept jobs and manage work</span>
                  </button>
                </div>
              </div>

              <div className="signup-field">
                <label className="signup-label" htmlFor="password">Password</label>
                <div className="signup-input-wrap">
                  <input
                    id="password"
                    className="signup-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="signup-input-icon clickable"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <Lock width="16" height="16" />
                  </span>
                </div>
              </div>

              <button type="submit" className="signup-submit" disabled={loading}>
                {loading ? <div className="signup-spinner" /> : 'Create account'}
              </button>
            </form>

            <p className="signup-note">
              By creating an account, you agree to use CleanOps in accordance with the platform policies.
            </p>

            <div className="signup-footer">
              Already have an account? <Link href="/login">Sign in</Link>
            </div>

            <Link
              href="/homepage"
              className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
