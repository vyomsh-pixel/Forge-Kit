import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { generateFromWireframe, updatePromptUI, evaluateUI } from '../services/api';
import PreviewSandbox, { buildPreviewHTML } from '../components/PreviewSandbox';
import CodeViewer from '../components/CodeViewer';
import VisualElementEditor from '../components/VisualElementEditor';
import MLAuditModal from '../components/MLAuditModal';

const PRESETS = [
  'E-commerce Hero with Cards',
  'Minimalist Agency Portfolio',
  'SaaS 3-Tier Pricing Grid',
  'Fitness Workout Landing Page'
];

const BRAND_KITS = [
  { id: 'modern', label: 'Modern Clean' },
  { id: 'fintech', label: 'Fintech SaaS' },
  { id: 'eco', label: 'Eco Organic' },
  { id: 'cyber', label: 'Midnight Cyber' },
  { id: 'brutalist', label: 'Neo-Brutalism' }
];

export default function WireframeStudio() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  // Create & clean up object URL when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

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

  const canGenerate = !loading && !!file;

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
    if (!file) { setError('Please upload or drop a wireframe image first.'); return; }
    setLoading(true);
    setError('');
    setEvalData(null);
    try {
      const formData = new FormData();
      formData.append('wireframe', file);
      formData.append('prompt', prompt);
      formData.append('brandKit', brandKit);
      const { data } = await generateFromWireframe(formData);
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
    setFile(null);
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

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="workspace-wrapper">
      <div className="workspace">
        
        {/* Left Panel: Blueprint Generator */}
        <section className="blueprint-panel">
          <div className="blueprint-card">
            <div className="blueprint-header">
              <span className="eyebrow">WIREFRAME / REACT</span>
              <h2>From sketch<br /><em>to component.</em></h2>
            </div>

            <form onSubmit={generate} className="blueprint-form">
              <div className="field-group">
                <label className="field-label">Wireframe Sketch (Required)</label>
                <div 
                  className="dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !file && document.getElementById('wireframe-input').click()}
                >
                  {file ? (
                    <div className="dropzone-preview-container">
                      <img src={previewUrl} alt="Wireframe preview" className="dropzone-preview" />
                      <button 
                        type="button" 
                        className="dropzone-clear" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        title="Remove image"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <svg className="dropzone-svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="dropzone-label">Drop sketch here or browse</span>
                      <span className="dropzone-sublabel">PNG, JPG, WEBP up to 5MB</span>
                    </div>
                  )}
                  <input 
                    id="wireframe-input" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
                    hidden 
                  />
                </div>
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
                <label className="field-label">Design Directives (Optional)</label>
                <textarea 
                  className="field-textarea"
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  rows="3" 
                  placeholder="e.g., Clean typography, muted teal accents, modern card grid..." 
                />
              </div>

              <div className="field-group">
                <label className="field-label">Quick Starters</label>
                <div className="preset-grid">
                  {PRESETS.map((p) => (
                    <button 
                      key={p} 
                      type="button" 
                      className={`preset-chip ${prompt === p ? 'active' : ''}`}
                      onClick={() => setPrompt(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="action-btn" disabled={!canGenerate}>
                {loading ? 'Generating Component...' : 'Generate React Component'}
              </button>

              <div className={`btn-hint ${canGenerate ? 'ready' : ''}`}>
                {!file ? (
                  'Upload a wireframe sketch to enable generation'
                ) : (
                  <span>Sketch loaded & ready for AI generation</span>
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
                title="Clear canvas and start a fresh sketch"
              >
                Reset Canvas
              </button>
              <div className="viewport-toggles">
                <button 
                  className={`viewport-btn ${viewport === 'desktop' ? 'active' : ''}`} 
                  onClick={() => setViewport('desktop')} 
                  title="Desktop View"
                >
                  Desktop
                </button>
                <button 
                  className={`viewport-btn ${viewport === 'tablet' ? 'active' : ''}`} 
                  onClick={() => setViewport('tablet')} 
                  title="Tablet View"
                >
                  Tablet
                </button>
                <button 
                  className={`viewport-btn ${viewport === 'mobile' ? 'active' : ''}`} 
                  onClick={() => setViewport('mobile')} 
                  title="Mobile View"
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
            {tab === 'jsx' && <CodeViewer code={jsx} label="React JSX Component" />}
            {tab === 'css' && <CodeViewer code={css} label="Styles (CSS)" />}
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
