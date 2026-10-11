import React, { useEffect } from 'react';

export default function MLAuditModal({ isOpen, onClose, evalData, onAutoFix, isFixing }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !evalData) return null;

  const { overallScore = 90, metrics = {}, badges = [], recommendations = [] } = evalData;
  const { wcagAccessibility = 90, responsiveDesign = 85, designSystem = 95 } = metrics;

  const getScoreColor = (score) => {
    if (score >= 90) return '#0f766e'; // teal-700
    if (score >= 75) return '#d97706'; // amber-600
    return '#dc2626'; // red-600
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ml-audit-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafaf9'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 id="ml-audit-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                ML Quality & WCAG Accessibility Audit
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#78716c' }}>
              Real-time neural analysis against WCAG 2.1 AA benchmarks and responsive design tokens.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: '#a8a29e',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Score Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f0fdfa',
            borderRadius: '12px',
            border: '1px solid #ccfbf1'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: '#0f766e', textTransform: 'uppercase' }}>
                Overall Compliance Score
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#115e59', lineHeight: 1.1, marginTop: '4px' }}>
                {overallScore}<span style={{ fontSize: '1.25rem', color: '#14b8a6', fontWeight: 700 }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: overallScore >= 90 ? '#115e59' : '#d97706',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {overallScore >= 90 ? 'National Showcase Ready' : 'Optimization Recommended'}
              </span>
            </div>
          </div>

          {/* 3 Metric Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid #e7e5e4', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(wcagAccessibility) }}>
                {wcagAccessibility}%
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#44403c', marginTop: '4px' }}>
                WCAG 2.1 AA
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a8a29e' }}>Contrast & Alt text</div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid #e7e5e4', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(responsiveDesign) }}>
                {responsiveDesign}%
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#44403c', marginTop: '4px' }}>
                Responsiveness
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a8a29e' }}>Mobile-first Grids</div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid #e7e5e4', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(designSystem) }}>
                {designSystem}%
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#44403c', marginTop: '4px' }}>
                Design System
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a8a29e' }}>Tailwind Tokens</div>
            </div>
          </div>

          {/* Badges Earned */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#57534e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Verified Compliance Badges
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {badges.map((b, i) => (
                <span key={i} style={{
                  padding: '5px 12px',
                  backgroundColor: '#f5f5f4',
                  border: '1px solid #e7e5e4',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#292524',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: '#0f766e', fontWeight: 800 }}>PASS:</span> {b}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#57534e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Audit Recommendations & Diagnostics
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#44403c', lineHeight: 1.6 }}>
              {recommendations.map((r, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafaf9'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#fff',
              border: '1px solid #d6d3d1',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#44403c',
              cursor: 'pointer'
            }}
          >
            Close Audit
          </button>

          {onAutoFix && (
            <button
              onClick={onAutoFix}
              disabled={isFixing}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: '#0f766e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isFixing ? 'not-allowed' : 'pointer',
                opacity: isFixing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isFixing ? 'Auto-Optimizing with ML Critic...' : '1-Click Auto-Fix with ML Critic'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
