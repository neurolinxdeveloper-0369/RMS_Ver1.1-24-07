import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import windStreamLogo from '../assets/WindStream.png';

/* ─── Inject keyframes + focus styles once ─── */
if (!document.getElementById('login-styles')) {
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatOrb {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -20px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
      100% { transform: translate(0, 0) scale(1); }
    }
    .login-input:focus {
      border-color: #00A1E6 !important;
      box-shadow: 0 0 0 3px rgba(0,161,230,0.14) !important;
      outline: none;
    }
    .login-submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0,161,230,0.45) !important;
    }
    .login-submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .login-forgot:hover { text-decoration: underline; }
    .login-footer-link:hover { text-decoration: underline; }
  `;
  document.head.appendChild(s);
}

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Password validation: required 1 capital, 1 number, 1 special character, min 8 chars
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
    if (!passRegex.test(password)) {
      setErrorMsg('Password requires 1 uppercase, 1 number, 1 special char, and min 8 characters.');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', email); // or data.username if available
        localStorage.setItem('token', data.token); // Store JWT token
        navigate('/dashboard');
      } else {
        setErrorMsg(data.message || 'Invalid User ID or password.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── Outer page: full viewport, dark bg so nothing bleeds ── */
    <div style={S.page}>

      {/* ══════════════════════════════════════════════
          Main card — rounded, clipped, shadow, flex row
         ══════════════════════════════════════════════ */}
      <div style={S.card}>

        {/* ─────────────────────────────────────
            LEFT  80%  — Brand / imagery panel
           ───────────────────────────────────── */}
        <div style={S.brand}>

          {/* Full-bleed background image */}
          <div style={S.brandBg} />

          {/* Lighter overlay: only bottom-left corner darkened for text legibility */}
          <div style={S.brandOverlay} />

          {/* Top-left Logo */}
          <div style={S.logoRow}>
            <img src={windStreamLogo} alt="WindStream" style={S.logo} />
            <div>
              <div style={S.brandName}>WindStream</div>
              <div style={S.brandTagline}>Remote Monitoring System</div>
            </div>
          </div>

          {/* Content sits on top */}
          <div style={S.brandContent}>

            {/* Hero text */}
            <div style={S.heroBlock}>
              <h1 style={S.heroTitle}>
                Intelligent Energy<br />
                <span style={S.heroAccent}>Monitoring at Scale</span>
              </h1>
              <p style={S.heroDesc}>
                Real-time telemetry, predictive analytics, and smart alarm management
                for hybrid wind &amp; solar assets — all in one unified platform.
              </p>
            </div>



            {/* Feature pills */}
            <div style={S.pills}>
              {['⚡ Hybrid Energy', '📡 Real-Time Telemetry', '🔔 Smart Alarms', '📊 Analytics'].map((f, i) => (
                <span key={i} style={S.pill}>{f}</span>
              ))}
            </div>
          </div>

          {/* Bottom-left watermark */}
          <div style={S.watermark}>
            Hybrid — V 1.1 &nbsp;·&nbsp; Neurolinx Private Limited
          </div>
        </div>

        {/* ─────────────────────────────────────
            RIGHT  20%  — Login form panel
           ───────────────────────────────────── */}
        <div style={S.formPanel}>

          {/* Animated Ambient Background for Form Panel */}
          <div style={S.formPanelBg} />
          <div style={S.formPanelGlow1} />
          <div style={S.formPanelGlow2} />
          <div style={S.formPanelGrid} />

          {/* Vector Diagram (Solar & Wind) */}
          <div style={S.formPanelVector}>
            <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMaxYMax meet" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Ground */}
              <line x1="10" y1="180" x2="190" y2="180" strokeWidth="2" strokeLinecap="round" />

              {/* Solar Panel */}
              <polygon points="30,170 50,140 100,140 80,170" strokeLinejoin="round" />
              <line x1="40" y1="155" x2="90" y2="155" />
              <line x1="43" y1="140" x2="36" y2="170" />
              <line x1="60" y1="140" x2="53" y2="170" />
              <line x1="77" y1="140" x2="70" y2="170" />
              <line x1="65" y1="170" x2="65" y2="180" />
              <line x1="50" y1="175" x2="80" y2="175" />

              {/* Wind Turbine */}
              <polygon points="145,180 150,80 154,80 159,180" strokeLinejoin="round" />
              <circle cx="152" cy="80" r="5" fill="currentColor" />
              {/* Blades */}
              <path d="M152,75 C150,40 152,30 155,30 C154,40 154,75 152,75" fill="currentColor" />
              <path d="M156,82 C185,100 195,105 190,110 C180,100 156,85 156,82" fill="currentColor" />
              <path d="M148,82 C119,100 109,105 114,110 C124,100 148,85 148,82" fill="currentColor" />
            </svg>
          </div>

          <div style={S.formCard}>

            {/* Header */}
            <div style={S.formHeader}>
              <img src={windStreamLogo} alt="WindStream Logo" style={S.formLogo} />
              <h2 style={S.formTitle}>Welcome Back</h2>
              <p style={S.formSub}>Sign in to your RMS portal</p>
              {errorMsg && (
                <div style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 500, background: '#FEF2F2', padding: '0.5rem', borderRadius: '6px', border: '1px solid #FEE2E2' }}>
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={S.form}>

              {/* User ID */}
              <div style={S.field}>
                <label htmlFor="rms-userid" style={S.label}>User ID</label>
                <div style={S.inputWrap}>
                  <svg style={S.icon} width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="rms-userid"
                    type="text"
                    className="login-input"
                    style={S.input}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter User ID"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div style={S.field}>
                <label htmlFor="rms-password" style={S.label}>Password</label>
                <div style={S.inputWrap}>
                  <svg style={S.icon} width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="rms-password"
                    type={showPass ? 'text' : 'password'}
                    className="login-input"
                    style={{ ...S.input, paddingRight: '2.8rem' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" style={S.eyeBtn}
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1} aria-label="Toggle password visibility">
                    {showPass ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={S.rememberRow}>
                <label style={S.rememberLabel}>
                  <input type="checkbox" style={S.checkbox}
                    checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <a href="#" className="login-forgot" style={S.forgotLink}>Forgot password?</a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
                style={{ ...S.submitBtn, ...(loading ? { opacity: 0.75, cursor: 'not-allowed' } : {}) }}
              >
                {loading ? (
                  <span style={S.spinner} />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p style={S.formFooter}>
              By signing in you agree to our{' '}
              <a href="#" className="login-footer-link" style={S.footerLink}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="login-footer-link" style={S.footerLink}>Privacy Policy</a>
            </p>
          </div>

          {/* Copyright */}
          <div style={S.copyright}>
            © 2026 Neurolinx Private Limited &nbsp;·&nbsp; V 1.1
          </div>
        </div>

      </div>{/* end card */}
    </div>
  );
};

/* ════════════════════════════════════════
   Styles
   ════════════════════════════════════════ */
const S = {

  /* Full-page wrapper */
  page: {
    width: '100vw',
    height: '100vh',
    background: '#F5F7F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },

  /* Main rounded card — clips both panels */
  card: {
    width: '100%',
    height: 'calc(100vh - 40px)',
    display: 'flex',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
  },

  /* ── BRAND PANEL ── */
  brand: {
    flex: '0 0 78%',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Full-bleed image — covers every pixel of the brand panel */
  brandBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url(/rms_login_brand.png)',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    zIndex: 0,
  },

  /* Overlay — fully opaque at top to completely erase image watermark text */
  brandOverlay: {
    position: 'absolute',
    inset: 0,
    background: [
      'linear-gradient(to bottom, rgba(5,12,25,1.00) 0%, rgba(5,12,25,1.00) 28%, rgba(5,12,25,0.30) 45%, rgba(5,12,25,0.00) 65%)',
      'linear-gradient(to right,  rgba(5,15,30,0.60) 0%, rgba(5,15,30,0.05) 65%)',
    ].join(', '),
    zIndex: 1,
  },

  brandContent: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '3rem 4rem',
    gap: '2rem',
    animation: 'fadeUp 0.7s ease both',
  },

  logoRow: {
    position: 'absolute',
    top: '3rem',
    left: '4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    zIndex: 3,
    animation: 'fadeUp 0.7s ease both',
  },

  logo: {
    width: '50px', height: '50px',
    objectFit: 'contain',
    borderRadius: '12px',
    background: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    border: '1px solid #E2E8F0',
    padding: '6px',
  },

  brandName: {
    fontSize: '1.45rem', fontWeight: 800,
    color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.1,
  },

  brandTagline: {
    fontSize: '0.72rem', fontWeight: 500,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: '2px',
  },

  heroBlock: { maxWidth: '560px' },

  heroTitle: {
    fontSize: 'clamp(2rem, 3.2vw, 3rem)',
    fontWeight: 800, color: '#FFFFFF',
    lineHeight: 1.18, margin: '0 0 0.9rem 0',
    letterSpacing: '-0.025em',
    textShadow: '0 2px 16px rgba(0,0,0,0.3)',
  },

  heroAccent: {
    color: '#38D9FF',
    textShadow: '0 0 30px rgba(56,217,255,0.4)',
  },

  heroDesc: {
    fontSize: '0.97rem', color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.75, margin: 0, fontWeight: 400,
  },

  statsStrip: { display: 'flex', gap: '2.5rem', flexWrap: 'wrap' },

  statItem: { display: 'flex', flexDirection: 'column', gap: '3px' },

  statValue: {
    fontSize: '1.6rem', fontWeight: 800,
    color: '#FFFFFF', lineHeight: 1,
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },

  statLabel: {
    fontSize: '0.68rem', fontWeight: 500,
    color: 'rgba(255,255,255,0.60)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  },

  pills: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },

  pill: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: '20px',
    padding: '0.28rem 0.8rem',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.90)',
    fontWeight: 500,
  },

  watermark: {
    position: 'absolute', bottom: '1.4rem', left: '4rem', zIndex: 2,
    fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)',
    fontWeight: 500, letterSpacing: '0.04em',
  },

  /* ── FORM PANEL ── */
  formPanel: {
    flex: '0 0 22%',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 2rem',
    position: 'relative',
    boxShadow: '-4px 0 32px rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },

  formPanelBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
    zIndex: 0,
  },

  formPanelGlow1: {
    position: 'absolute',
    top: '-15%',
    right: '-20%',
    width: '280px',
    height: '280px',
    background: 'radial-gradient(circle, rgba(0,161,230,0.07) 0%, rgba(0,161,230,0) 70%)',
    borderRadius: '50%',
    animation: 'floatOrb 14s infinite ease-in-out',
    zIndex: 0,
  },

  formPanelGlow2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-20%',
    width: '320px',
    height: '320px',
    background: 'radial-gradient(circle, rgba(56,217,255,0.06) 0%, rgba(56,217,255,0) 70%)',
    borderRadius: '50%',
    animation: 'floatOrb 18s infinite ease-in-out reverse',
    zIndex: 0,
  },

  formPanelGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0, 161, 230, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 161, 230, 0.03) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 100%)',
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 100%)',
    zIndex: 0,
  },

  formPanelVector: {
    position: 'absolute',
    top: '70%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    color: '#00A1E6',
    opacity: 0.12,
    zIndex: 1,
    pointerEvents: 'none',
  },

  formCard: {
    width: '100%',
    maxWidth: '300px',
    position: 'relative',
    zIndex: 2,
    animation: 'fadeUp 0.55s 0.15s ease both',
  },

  formHeader: { textAlign: 'center', marginBottom: '1.8rem' },

  formLogo: {
    width: '64px', height: '64px',
    objectFit: 'contain',
    borderRadius: '16px',
    background: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1.5px solid #E2E8F0',
    padding: '8px',
    margin: '0 auto 1.2rem auto',
    display: 'block',
  },

  formTitle: {
    fontSize: '1.35rem', fontWeight: 800,
    color: '#0F172A', margin: '0 0 0.25rem 0',
    letterSpacing: '-0.015em',
  },

  formSub: { fontSize: '0.8rem', color: '#64748B', margin: 0 },

  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },

  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },

  label: {
    fontSize: '0.75rem', fontWeight: 600,
    color: '#374151', letterSpacing: '0.01em',
  },

  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },

  icon: {
    position: 'absolute', left: '0.75rem',
    color: '#94A3B8', pointerEvents: 'none', flexShrink: 0,
  },

  input: {
    width: '100%',
    padding: '0.65rem 0.75rem 0.65rem 2.35rem',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '0.85rem',
    color: '#0F172A',
    background: '#F8FAFC',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  },

  eyeBtn: {
    position: 'absolute', right: '0.65rem',
    background: 'none', border: 'none',
    cursor: 'pointer', color: '#94A3B8',
    display: 'flex', alignItems: 'center', padding: '0.2rem',
    borderRadius: '4px',
  },

  rememberRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.75rem', marginTop: '-0.15rem',
  },

  rememberLabel: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    color: '#475569', cursor: 'pointer', fontWeight: 500,
    userSelect: 'none',
  },

  checkbox: { accentColor: '#00A1E6', width: '14px', height: '14px', cursor: 'pointer' },

  forgotLink: {
    color: '#00A1E6', textDecoration: 'none',
    fontWeight: 600, fontSize: '0.75rem',
  },

  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    width: '100%',
    padding: '0.78rem',
    background: 'linear-gradient(135deg, #0082C8 0%, #00A1E6 55%, #00C0FF 100%)',
    color: '#FFFFFF',
    border: 'none', borderRadius: '11px',
    fontSize: '0.9rem', fontWeight: 700,
    cursor: 'pointer', letterSpacing: '0.01em',
    marginTop: '0.2rem',
    boxShadow: '0 4px 16px rgba(0,161,230,0.38)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
  },

  spinner: {
    width: '18px', height: '18px',
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
    display: 'inline-block',
  },

  formFooter: {
    fontSize: '0.68rem', color: '#94A3B8',
    textAlign: 'center', marginTop: '1.4rem', lineHeight: 1.65,
  },

  footerLink: { color: '#00A1E6', textDecoration: 'none', fontWeight: 600 },

  copyright: {
    position: 'absolute', bottom: '1.1rem',
    fontSize: '0.65rem', color: '#94A3B8',
    fontWeight: 500, letterSpacing: '0.03em', textAlign: 'center',
    zIndex: 2,
  },
};

export default Login;
