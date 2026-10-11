import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import {
  loginAccount,
  registerAccount,
  fetchCurrentUser,
  exportAccountData,
  deleteAccount
} from '../services/api';

const SESSION_KEY = 'forgekit_auth_session';
const TOKEN_KEY = 'forgekit_auth_token';

const StudioAuthContext = createContext(null);

export function useStudioAuth() {
  return useContext(StudioAuthContext);
}

export function LegalDocumentContent({ type }) {
  const isPrivacy = type === 'privacy';
  return (
    <div className="legal-doc-body">
      <span className="eyebrow">{isPrivacy ? 'DATA GOVERNANCE & PRIVACY' : 'STUDIO TERMS OF SERVICE'}</span>
      <h2 className="legal-doc-title">
        {isPrivacy ? 'Privacy Policy & Data Handling Notice' : 'Terms of Service & Developer Aid Agreement'}
      </h2>
      <div className="legal-todo-banner" role="note">
        <strong>TODO(LEGAL): Supply official organization legal copy</strong>
        <p>
          This section is a structural placeholder awaiting final review and formal legal text from organization counsel.
        </p>
      </div>

      {isPrivacy ? (
        <div className="legal-sections">
          <section>
            <h3>1. Wireframe &amp; Prompt Processing</h3>
            <p>
              <code>TODO(LEGAL): Supply official organization legal copy</code> — Specify retention windows, third-party LLM inference routing (Groq API), and handling of uploaded wireframe sketches and text prompts.
            </p>
          </section>
          <section>
            <h3>2. Generated UI Sections &amp; CMS Storage</h3>
            <p>
              <code>TODO(LEGAL): Supply official organization legal copy</code> — Detail how generated React JSX, CSS tokens, and CMS element fields are stored in MongoDB / local session storage and linked to your studio account.
            </p>
          </section>
          <section>
            <h3>3. User Rights: Export &amp; Account Deletion</h3>
            <p>
              Authenticated users may export all stored account metadata, generated sections, and CMS fields in machine-readable JSON format at any time via <strong>Export My Data</strong>, or permanently purge their account and associated records via <strong>Delete Account &amp; Data</strong>.
            </p>
          </section>
        </div>
      ) : (
        <div className="legal-sections">
          <section>
            <h3>1. Developer Aid &amp; Output Review Disclaimer</h3>
            <p>
              <code>TODO(LEGAL): Supply official organization legal copy</code> — Generated React/Tailwind code and heuristic WCAG 2.1 AA scores are automated developer aids and do not constitute certified accessibility compliance or production-audited software.
            </p>
          </section>
          <section>
            <h3>2. Acceptable Studio Usage</h3>
            <p>
              <code>TODO(LEGAL): Supply official organization legal copy</code> — Define acceptable inputs, intellectual property ownership of generated UI code, and API rate-limit policies.
            </p>
          </section>
          <section>
            <h3>3. Limitation of Liability</h3>
            <p>
              <code>TODO(LEGAL): Supply official organization legal copy</code> — Insert standard organizational warranty disclaimers and liability clauses prior to commercial deployment.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export function LegalDocumentPage({ type }) {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-page-card">
        <div className="legal-page-header">
          <Link to="/wireframe" className="legal-back-link">
            ← Return to ForgeKit Studio
          </Link>
          <div className="legal-page-switch">
            <Link to="/privacy" className={`preset-chip ${type === 'privacy' ? 'active' : ''}`}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={`preset-chip ${type === 'terms' ? 'active' : ''}`}>
              Terms of Service
            </Link>
          </div>
        </div>
        <LegalDocumentContent type={type} />
      </div>
    </div>
  );
}

function BlueprintLoadingScreen({ progress, stepLabel }) {
  return (
    <div className="blueprint-loader-overlay" role="status" aria-live="polite" aria-label="Loading ForgeKit Studio">
      <div className="blueprint-loader-card">
        <div className="blueprint-loader-badge">FORGEKIT ARCHITECTURAL ENGINE</div>

        <div className="blueprint-svg-stage" aria-hidden="true">
          <svg
            viewBox="0 0 360 190"
            className="blueprint-draft-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Blueprint Frame & Corner Crosshairs */}
            <rect x="12" y="12" width="336" height="166" rx="8" stroke="#2a6f6f" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.45" />
            <path d="M8 20 H20 M14 14 V26 M340 20 H352 M346 14 V26 M8 170 H20 M14 164 V176 M340 170 H352 M346 164 V176" stroke="#2a6f6f" strokeWidth="1.5" />

            {/* Wireframe Sketch Layer (Dashed) */}
            <g className="draft-wireframe-layer">
              <rect x="28" y="26" width="304" height="22" rx="4" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="3 3" />
              <circle cx="42" cy="37" r="4" stroke="#8a847a" strokeWidth="1.25" />
              <line x1="250" y1="37" x2="318" y2="37" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="3 3" />

              <rect x="28" y="58" width="185" height="62" rx="5" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="4 3" />
              <line x1="40" y1="74" x2="155" y2="74" stroke="#8a847a" strokeWidth="2" />
              <line x1="40" y1="88" x2="190" y2="88" stroke="#8a847a" strokeWidth="1.25" />
              <rect x="40" y="99" width="68" height="14" rx="3" stroke="#2a6f6f" strokeWidth="1.25" />

              <rect x="223" y="58" width="109" height="62" rx="5" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="4 3" />
              <path d="M235 110 L262 82 L284 100 L302 76 L320 110 Z" stroke="#8a847a" strokeWidth="1.2" />

              <rect x="28" y="130" width="95" height="34" rx="4" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="3 3" />
              <rect x="132" y="130" width="95" height="34" rx="4" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="3 3" />
              <rect x="237" y="130" width="95" height="34" rx="4" stroke="#8a847a" strokeWidth="1.25" strokeDasharray="3 3" />
            </g>

            {/* Crystallized Component Layer (Solid Teal & Warm Card Fills) */}
            <g className="draft-solid-layer">
              <rect x="28" y="26" width="304" height="22" rx="4" fill="#fffdf8" stroke="#2a6f6f" strokeWidth="1.5" />
              <circle cx="42" cy="37" r="4" fill="#2a6f6f" />
              <rect x="54" y="33" width="52" height="8" rx="2" fill="#161c1b" />
              <rect x="268" y="32" width="52" height="10" rx="3" fill="#2a6f6f" />

              <rect x="28" y="58" width="185" height="62" rx="5" fill="#fffdf8" stroke="#2a6f6f" strokeWidth="1.5" />
              <rect x="40" y="69" width="122" height="9" rx="2" fill="#161c1b" />
              <rect x="40" y="83" width="152" height="6" rx="2" fill="#5c5952" opacity="0.65" />
              <rect x="40" y="97" width="74" height="15" rx="3" fill="#2a6f6f" />

              <rect x="223" y="58" width="109" height="62" rx="5" fill="#e6f2f0" stroke="#2a6f6f" strokeWidth="1.5" />
              <circle cx="250" cy="76" r="7" fill="#2a6f6f" opacity="0.35" />
              <path d="M233 112 L262 84 L284 101 L303 78 L322 112 Z" fill="#2a6f6f" opacity="0.75" />

              <rect x="28" y="130" width="95" height="34" rx="4" fill="#fffdf8" stroke="#2a6f6f" strokeWidth="1.5" />
              <rect x="38" y="139" width="55" height="6" rx="2" fill="#2a6f6f" />
              <rect x="38" y="150" width="72" height="5" rx="2" fill="#8a847a" opacity="0.5" />

              <rect x="132" y="130" width="95" height="34" rx="4" fill="#fffdf8" stroke="#2a6f6f" strokeWidth="1.5" />
              <rect x="142" y="139" width="55" height="6" rx="2" fill="#2a6f6f" />
              <rect x="142" y="150" width="72" height="5" rx="2" fill="#8a847a" opacity="0.5" />

              <rect x="237" y="130" width="95" height="34" rx="4" fill="#fffdf8" stroke="#2a6f6f" strokeWidth="1.5" />
              <rect x="247" y="139" width="55" height="6" rx="2" fill="#2a6f6f" />
              <rect x="247" y="150" width="72" height="5" rx="2" fill="#8a847a" opacity="0.5" />
            </g>

            {/* Laser Drafting Beam */}
            <g className="draft-laser-beam">
              <line x1="16" y1="24" x2="344" y2="24" stroke="#0f766e" strokeWidth="2.5" />
              <rect x="16" y="24" width="328" height="14" fill="#2a6f6f" opacity="0.16" />
              <circle cx="24" cy="24" r="3.5" fill="#0f766e" />
              <circle cx="336" cy="24" r="3.5" fill="#0f766e" />
            </g>
          </svg>
        </div>

        <h3 className="blueprint-loader-title">Drafting Studio Workspace</h3>
        <p className="blueprint-loader-step">{stepLabel}</p>

        <div className="blueprint-progress-track" aria-hidden="true">
          <div
            className="blueprint-progress-fill"
            style={{ transform: `scaleX(${Math.min(1, Math.max(0.08, progress / 100))})` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StudioAuthGate({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.consentAccepted && parsed.disclaimerAccepted && parsed.user) {
        return parsed;
      }
    } catch {}
    return null;
  });

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null
  const [actionToast, setActionToast] = useState('');

  // Loading transition state upon login/consent completion
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(15);
  const [stepLabel, setStepLabel] = useState('Calibrating Wireframe Vision Grid...');

  // Verify stored token on mount if user is authenticated
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && session && !session.isGuest) {
      fetchCurrentUser()
        .then(({ data }) => {
          if (active && data?.ok && data.user) {
            setSession((prev) => {
              if (!prev) return prev;
              const updated = { ...prev, user: data.user };
              try {
                localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        })
        .catch((err) => {
          if (active && err?.response?.status === 401) {
            try {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(SESSION_KEY);
            } catch {}
            setSession(null);
          }
        });
    }
    return () => {
      active = false;
    };
  }, []);

  // Close legal modal on Escape key
  useEffect(() => {
    if (!legalModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLegalModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [legalModal]);

  const startStudioTransition = useCallback((nextSession, tokenValue = null) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      if (tokenValue) {
        localStorage.setItem(TOKEN_KEY, tokenValue);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion) {
      setSession(nextSession);
      return;
    }

    setIsTransitioning(true);
    setProgress(22);
    setStepLabel('Calibrating Wireframe Vision Grid...');

    const t1 = setTimeout(() => {
      setProgress(64);
      setStepLabel('Mounting AST & Heuristic WCAG Critic...');
    }, 360);

    const t2 = setTimeout(() => {
      setProgress(96);
      setStepLabel('Synchronizing Studio Stage...');
    }, 740);

    const t3 = setTimeout(() => {
      setIsTransitioning(false);
      setSession(nextSession);
    }, 1080);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const bothConsentsAccepted = consentChecked && disclaimerChecked;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bothConsentsAccepted) {
      setError('Please accept both the Data Processing Consent and Developer Aid Disclaimer checkboxes before entering the Studio.');
      return;
    }

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 2) {
      setError('Please enter a valid username (at least 2 characters).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        const { data } = await registerAccount({
          username: cleanUser,
          password,
          display_name: displayName.trim() || cleanUser,
          consent_accepted: true
        });
        if (!data.ok) throw new Error(data.error || 'Registration failed.');
        startStudioTransition(
          {
            user: data.user,
            isGuest: false,
            consentAccepted: true,
            disclaimerAccepted: true,
            authenticatedAt: new Date().toISOString()
          },
          data.token
        );
      } else {
        const { data } = await loginAccount({
          username: cleanUser,
          password
        });
        if (!data.ok) throw new Error(data.error || 'Sign in failed.');
        startStudioTransition(
          {
            user: data.user,
            isGuest: false,
            consentAccepted: true,
            disclaimerAccepted: true,
            authenticatedAt: new Date().toISOString()
          },
          data.token
        );
      }
    } catch (err) {
      // If backend is unreachable (network error), provide graceful local fallback
      if (!err.response) {
        startStudioTransition(
          {
            user: {
              username: cleanUser,
              display_name: displayName.trim() || cleanUser,
              offlineMode: true
            },
            isGuest: false,
            consentAccepted: true,
            disclaimerAccepted: true,
            authenticatedAt: new Date().toISOString()
          },
          null
        );
      } else {
        setError(err.response?.data?.error || err.message || 'Authentication failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestAccess = () => {
    setError('');
    if (!bothConsentsAccepted) {
      setError('Please accept both mandatory consent and disclaimer checkboxes above to launch Guest Studio Architect mode.');
      return;
    }
    startStudioTransition(
      {
        user: {
          username: 'guest_architect',
          display_name: 'Guest Architect'
        },
        isGuest: true,
        consentAccepted: true,
        disclaimerAccepted: true,
        authenticatedAt: new Date().toISOString()
      },
      null
    );
  };

  const handleSignOut = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
    setPassword('');
    setError('');
  }, []);

  const handleExportData = useCallback(async () => {
    setActionToast('Preparing data export...');
    let exportPayload = null;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const { data } = await exportAccountData();
        if (data?.ok) {
          exportPayload = data;
        }
      }
    } catch {}

    if (!exportPayload) {
      let cachedSession = null;
      try {
        const raw = localStorage.getItem('forgekit_latest_session');
        if (raw) cachedSession = JSON.parse(raw);
      } catch {}
      exportPayload = {
        ok: true,
        user: session?.user || { username: 'guest_architect' },
        sections: cachedSession?.sectionId
          ? [{ sectionId: cachedSession.sectionId, pageName: cachedSession.pageName || 'Home', jsx: cachedSession.jsx, css: cachedSession.css }]
          : [],
        elements: cachedSession?.elements || [],
        exportedAt: new Date().toISOString()
      };
    }

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forgekit-data-export-${session?.user?.username || 'studio'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActionToast('Exported account & studio JSON!');
    setTimeout(() => setActionToast(''), 2800);
  }, [session]);

  const handleDeleteAccount = useCallback(async () => {
    const confirmed = window.confirm(
      'Delete your ForgeKit account and purge all saved sections, CMS elements, and local studio cache? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await deleteAccount();
      }
    } catch {}

    try {
      const keysToRemove = [TOKEN_KEY, SESSION_KEY, 'forgekit_latest_session'];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cms_elements_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    setSession(null);
    setUsername('');
    setDisplayName('');
    setPassword('');
    setConsentChecked(false);
    setDisclaimerChecked(false);
  }, []);

  if (isTransitioning) {
    return <BlueprintLoadingScreen progress={progress} stepLabel={stepLabel} />;
  }

  if (!session) {
    return (
      <div className="auth-gate-shell">
        <div className="auth-gate-card">
          <div className="auth-gate-header">
            <div className="navbar-brand" style={{ justifyContent: 'center', marginBottom: '0.35rem' }}>
              <span>ForgeKit</span>
              <span className="navbar-brand-badge">AI STUDIO</span>
            </div>
            <span className="eyebrow">ARCHITECTURAL UI SYNTHESIS &amp; WCAG CRITIC</span>
            <h1 className="auth-gate-title">
              Sketch or prompt.<br /><em>Compile to production JSX.</em>
            </h1>
            <p className="auth-gate-subtitle">
              Sign in or launch Guest Architect mode after reviewing the data processing consent and developer aid notice below.
            </p>
          </div>

          <div className="input-mode-toggle" role="tablist" aria-label="Authentication Mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`input-mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`input-mode-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-gate-form">
            <div className="field-group">
              <label className="field-label" htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                type="text"
                autoComplete="username"
                className="field-input"
                placeholder="e.g., ada_lovelace"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {mode === 'register' && (
              <div className="field-group">
                <label className="field-label" htmlFor="auth-display-name">Display Name (Optional)</label>
                <input
                  id="auth-display-name"
                  type="text"
                  autoComplete="name"
                  className="field-input"
                  placeholder="e.g., Ada Lovelace"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="field-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Mandatory Pre-Use Consent & AI Output Disclaimer Gate */}
            <fieldset className="consent-gate-box">
              <legend className="consent-gate-legend">Mandatory Pre-Use Data &amp; AI Disclaimer Gate</legend>

              <label className="consent-checkbox-row" htmlFor="consent-data-processing">
                <input
                  id="consent-data-processing"
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                />
                <span>
                  I consent to Forge-Kit processing uploaded wireframes and prompts via AI and storing generated UI sections.
                </span>
              </label>

              <label className="consent-checkbox-row" htmlFor="consent-ai-disclaimer">
                <input
                  id="consent-ai-disclaimer"
                  type="checkbox"
                  checked={disclaimerChecked}
                  onChange={(e) => setDisclaimerChecked(e.target.checked)}
                />
                <span>
                  I understand that generated React/Tailwind code and heuristic WCAG scores are developer aids and require review before production use.
                </span>
              </label>

              <div className="consent-legal-links">
                <span>Review governance placeholders:</span>
                <button type="button" className="legal-link-btn" onClick={() => setLegalModal('privacy')}>
                  Privacy Policy (/privacy)
                </button>
                <span aria-hidden="true">·</span>
                <button type="button" className="legal-link-btn" onClick={() => setLegalModal('terms')}>
                  Terms of Service (/terms)
                </button>
              </div>
            </fieldset>

            {error && <div className="error-msg" role="alert">{error}</div>}

            <button
              type="submit"
              className="action-btn"
              disabled={submitting || !bothConsentsAccepted}
            >
              {submitting
                ? 'Authenticating Studio...'
                : mode === 'register'
                ? 'Create Account & Enter Studio'
                : 'Sign In to Studio'}
            </button>

            <div className="auth-divider">
              <span>OR QUICK EVALUATION</span>
            </div>

            <button
              type="button"
              className="guest-architect-btn"
              disabled={!bothConsentsAccepted}
              onClick={handleGuestAccess}
            >
              Continue as Guest Studio Architect →
            </button>

            <div className={`btn-hint ${bothConsentsAccepted ? 'ready' : ''}`}>
              {bothConsentsAccepted
                ? 'Consent verified — ready to initialize ForgeKit Studio'
                : 'Check both consent boxes above to enable Sign In or Guest Studio access'}
            </div>
          </form>
        </div>

        {legalModal && (
          <div
            className="legal-modal-backdrop"
            onClick={() => setLegalModal(null)}
            role="dialog"
            aria-modal="true"
            aria-label={legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          >
            <div className="legal-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="legal-modal-top">
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`preset-chip ${legalModal === 'privacy' ? 'active' : ''}`}
                    onClick={() => setLegalModal('privacy')}
                  >
                    Privacy Policy
                  </button>
                  <button
                    type="button"
                    className={`preset-chip ${legalModal === 'terms' ? 'active' : ''}`}
                    onClick={() => setLegalModal('terms')}
                  >
                    Terms of Service
                  </button>
                </div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => setLegalModal(null)}
                >
                  Close (Esc)
                </button>
              </div>
              <LegalDocumentContent type={legalModal} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <StudioAuthContext.Provider
      value={{
        session,
        user: session.user,
        isGuest: session.isGuest,
        actionToast,
        onExportData: handleExportData,
        onDeleteAccount: handleDeleteAccount,
        onSignOut: handleSignOut
      }}
    >
      <div className="studio-app-shell">
        {children}
        <footer className="studio-compliance-footer">
          <span>
            <strong>Developer Aid Notice:</strong> Generated React/Tailwind code and heuristic WCAG 2.1 AA scores are automated aids and require human engineering review before production use.
          </span>
          <span className="studio-footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms">Terms of Service</Link>
          </span>
        </footer>
      </div>
    </StudioAuthContext.Provider>
  );
}
