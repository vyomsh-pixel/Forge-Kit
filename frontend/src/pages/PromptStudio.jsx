import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { generateFromPrompt, updatePromptUI, evaluateUI } from '../services/api';
import PreviewSandbox, { buildPreviewHTML } from '../components/PreviewSandbox';
import CodeViewer from '../components/CodeViewer';
import VisualElementEditor from '../components/VisualElementEditor';
import MLAuditModal from '../components/MLAuditModal';

const INSPIRATIONS = [
  'SaaS Landing Page with Pricing',
  'Minimalist Coffee Shop Menu',
  'Developer Analytics Dashboard',
  'Creative Agency Portfolio Hero'
];

const BRAND_KITS = [
  { id: 'modern', label: 'Modern Clean' },
  { id: 'fintech', label: 'Fintech SaaS' },
  { id: 'eco', label: 'Eco Organic' },
  { id: 'cyber', label: 'Midnight Cyber' },
  { id: 'brutalist', label: 'Neo-Brutalism' }
];

export default function PromptStudio() {
  const [prompt, setPrompt] = useState('');
  const [brandKit, setBrandKit] = useState('modern');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [jsx, setJsx] = useState('');
  const [css, setCss] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [evalData, setEvalData] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAuditFixing, setIsAuditFixing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('preview');
  const [viewport, setViewport] = useState('desktop');

  // Restore recent session on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('forgekit_latest_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jsx) {
          setJsx(parsed.jsx);
          setCss(parsed.css || '');
          setSectionId(parsed.sectionId || '');
          triggerEvaluation(parsed.jsx, parsed.css || '');
        }
      }
    } catch {}
  }, []);

  const isMeaningfulPrompt = prompt.trim().length >= 8 && prompt.trim().split(/\s+/).filter(Boolean).length >= 2;
  const canGenerate = !loading && isMeaningfulPrompt;

  const triggerEvaluation = async (componentJsx, componentCss) => {
    try {
      const { data } = await evaluateUI(componentJsx, componentCss);
      if (data.ok) {
        setEvalData(data.evaluation);
      }
    } catch {}
  };

  const generate = async (e) => {
    e.preventDefault();
    if (!isMeaningfulPrompt) { 
      setError('Please provide a brief description with at least a few words.'); 
      return; 
    }
    setLoading(true);
    setError('');
    setEvalData(null);
    try {
      const { data } = await generateFromPrompt(prompt, brandKit);
      if (!data.ok) throw new Error(data.error);
      setJsx(data.jsx);
      setCss(data.css || '');
      setSectionId(data.sectionId || '');
      setTab('preview');
      try {
        localStorage.setItem('forgekit_latest_session', JSON.stringify({
          sectionId: data.sectionId,
          pageName: 'Home',
          jsx: data.jsx,
          css: data.css || '',
          elements: data.elements || data.elementIds?.map(id => ({ fieldId: id, elementName: 'Field #' + id, content: '', contentType: 'Text' })) || []
        }));
      } catch {}
      triggerEvaluation(data.jsx, data.css || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const refine = async (e) => {
    e.preventDefault();
    if (!refinePrompt.trim()) return;
    setRefining(true);
    setError('');
    try {
      const { data } = await updatePromptUI(jsx, css, refinePrompt);
      if (!data.ok) throw new Error(data.error);
      setJsx(data.jsx);
      setCss(data.css || '');
      setRefinePrompt('');
      setTab('editor');
      triggerEvaluation(data.jsx, data.css || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setRefining(false);
  };

  const handleAutoFix = async () => {
    setIsAuditFixing(true);
    try {
      const fixPrompt = "Auto-fix all WCAG 2.1 AA accessibility guidelines: ensure high-contrast colors, 48px interactive touch targets, semantic hierarchy, and fluid responsive mobile-first Tailwind grid.";
      const { data } = await updatePromptUI(jsx, css, fixPrompt);
      if (data.ok) {
        setJsx(data.jsx);
        setCss(data.css || '');
        triggerEvaluation(data.jsx, data.css || '');
      }
    } catch {}
    setIsAuditFixing(false);
  };

  const handleReset = () => {
    setJsx('');
    setCss('');
    setEvalData(null);
    setSectionId('');
    setTab('preview');
    try {
      localStorage.removeItem('forgekit_latest_session');
    } catch {}
  };

  const downloadJSX = () => {
    const blob = new Blob([jsx], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeneratedComponent_${sectionId || 'forgekit'}.jsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHTML = () => {
    const htmlCode = buildPreviewHTML(jsx, css);
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ForgeKit_Standalone_${sectionId || 'page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="workspace-wrapper">
      <div className="workspace">
        
        {/* Left Panel: Prompt Composer */}
        <section className="blueprint-panel">
          <div className="blueprint-card">
            <div className="blueprint-header">
              <span className="eyebrow">PROMPT / UI</span>
              <h2>Describe it.<br /><em>We build it.</em></h2>
            </div>

            <form onSubmit={generate} className="blueprint-form">
              <div className="field-group">
                <label className="field-label">UI Blueprint Description</label>
                <textarea 
                  className="field-textarea"
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  rows="4" 
                  placeholder="Example: Create a modern landing page for a developer tool with a hero banner, feature cards, and a get started button..." 
                />
              </div>

              {/* Brand Kit Design Tokens */}
              <div className="field-group">
                <label className="field-label">Adaptive Brand Kit Tokens</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {BRAND_KITS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBrandKit(b.id)}
                      className={`preset-chip ${brandKit === b.id ? 'active' : ''}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: brandKit === b.id ? '#0f766e' : '#f5f5f4',
                        color: brandKit === b.id ? '#fff' : '#44403c',
                        border: '1px solid ' + (brandKit === b.id ? '#0f766e' : '#e7e5e4'),
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Quick Starters</label>
                <div className="preset-chips">
                  {INSPIRATIONS.map((item, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      className={`preset-chip ${prompt === item ? 'active' : ''}`}
                      onClick={() => setPrompt(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="action-btn" disabled={!canGenerate}>
                {loading ? 'Crafting UI Layout...' : 'Generate UI'}
              </button>

              <div className={`btn-hint ${canGenerate ? 'ready' : ''}`}>
                {!prompt.trim() ? (
                  'Describe your UI or pick a quick starter to enable generation'
                ) : !isMeaningfulPrompt ? (
                  'Add a few words describing what you want to build'
                ) : (
                  <span>Blueprint ready for AI generation</span>
                )}
              </div>

              {error && (
                <div className="error-msg">
                  <div>{error}</div>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Right Panel: Live Stage */}
        <section className="live-stage">
          <header className="stage-header">
            <div className="stage-tabs">
              <button 
                className={`stage-tab ${tab === 'preview' ? 'active' : ''}`} 
                onClick={() => setTab('preview')}
              >
                Live Preview
              </button>
              <button 
                className={`stage-tab ${tab === 'editor' ? 'active' : ''}`} 
                onClick={() => setTab('editor')}
              >
                Visual Hand Editor
              </button>
              <button 
                className={`stage-tab ${tab === 'jsx' ? 'active' : ''}`} 
                onClick={() => setTab('jsx')}
              >
                React JSX
              </button>
              <button 
                className={`stage-tab ${tab === 'css' ? 'active' : ''}`} 
                onClick={() => setTab('css')}
              >
                CSS
              </button>
            </div>

            <div className="stage-actions">
              {evalData && (
                <button 
                  type="button"
                  onClick={() => setIsAuditOpen(true)}
                  className="preset-chip" 
                  style={{ background: '#0f766e', color: '#fff', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  title="Click to view full ML Quality & WCAG Audit Breakdown"
                >
                  <span>Score: {evalData.overallScore}/100</span>
                </button>
              )}
              {jsx && (
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button 
                    type="button"
                    onClick={downloadJSX}
                    className="preset-chip"
                    style={{ background: '#1e293b', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    title="Download React JSX Component file"
                  >
                    .JSX
                  </button>
                  <button 
                    type="button"
                    onClick={downloadHTML}
                    className="preset-chip"
                    style={{ background: '#334155', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    title="Download Standalone HTML Bundle"
                  >
                    .HTML
                  </button>
                </div>
              )}
              {sectionId && (
                <Link 
                  to={`/cms?sectionId=${sectionId}`}
                  className="preset-chip" 
                  style={{ background: '#2a6f6f', color: '#fff', textDecoration: 'none', border: 'none' }}
                  title="Open this generated section in CMS Studio"
                >
                  CMS Studio
                </Link>
              )}
              <button 
                type="button"
                onClick={handleReset}
                className="preset-chip"
                style={{ background: '#991b1b', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                title="Clear canvas and start a fresh idea"
              >
                Reset Canvas
              </button>
              <div className="viewport-toggles">
                <button 
                  className={`viewport-btn ${viewport === 'desktop' ? 'active' : ''}`} 
                  onClick={() => setViewport('desktop')} 
                  title="Desktop"
                >
                  Desktop
                </button>
                <button 
                  className={`viewport-btn ${viewport === 'tablet' ? 'active' : ''}`} 
                  onClick={() => setViewport('tablet')} 
                  title="Tablet"
                >
                  Tablet
                </button>
                <button 
                  className={`viewport-btn ${viewport === 'mobile' ? 'active' : ''}`} 
                  onClick={() => setViewport('mobile')} 
                  title="Mobile"
                >
                  Mobile
                </button>
              </div>
            </div>
          </header>

          <div className="stage-body">
            {tab === 'preview' && <PreviewSandbox jsx={jsx} css={css} viewport={viewport} />}
            {tab === 'editor' && (
              <div className="integrated-editor-layout">
                <VisualElementEditor jsx={jsx} onJsxChange={setJsx} />
                <div className="integrated-editor-preview">
                  <PreviewSandbox jsx={jsx} css={css} viewport={viewport} />
                </div>
              </div>
            )}
            {tab === 'jsx' && <CodeViewer code={jsx} label="Generated React JSX" />}
            {tab === 'css' && <CodeViewer code={css} label="Generated CSS" />}
          </div>

          {jsx && (
            <form className="refine-bar" onSubmit={refine}>
              <input 
                className="refine-input"
                value={refinePrompt} 
                onChange={(e) => setRefinePrompt(e.target.value)} 
                placeholder="Message AI for prompt tweaks, or switch to Visual Hand Editor above to edit text boxes directly..." 
              />
              <button type="submit" className="refine-btn" disabled={refining || !refinePrompt.trim()}>
                {refining ? 'Updating...' : 'Tweak Current UI'}
              </button>
            </form>
          )}
        </section>

      </div>

      {/* ML Quality & WCAG Audit Modal */}
      <MLAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        evalData={evalData}
        onAutoFix={handleAutoFix}
        isFixing={isAuditFixing}
      />
    </div>
  );
}
