import { useState } from 'react';
import { modifyReactCode, updatePromptUI } from '../services/api';
import PreviewSandbox from '../components/PreviewSandbox';
import CodeViewer from '../components/CodeViewer';
import VisualElementEditor from '../components/VisualElementEditor';

const EXAMPLE_COMPONENT = `function MyHero() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#161c1b" }}>Welcome to My App</h1>
      <p style={{ color: "#5c5952" }}>A minimal component ready for feature expansion.</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ padding: "10px 20px", background: "#2a6f6f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
      >
        Clicks: {count}
      </button>
    </div>
  );
}`;

export default function CodeModifier() {
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [code, setCode] = useState(EXAMPLE_COMPONENT);
  const [fileName, setFileName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [resultJsx, setResultJsx] = useState('');
  const [resultCss, setResultCss] = useState('');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('preview'); // 'preview' | 'editor' | 'jsx' | 'css'
  const [viewport, setViewport] = useState('desktop');

  const hasCode = code.trim().length > 0;
  const isMeaningfulPrompt = prompt.trim().length >= 8 && prompt.trim().split(/\s+/).filter(Boolean).length >= 2;
  const canApply = !loading && hasCode && isMeaningfulPrompt;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCode(ev.target.result || '');
      setResultJsx('');
      setResultCss('');
    };
    reader.readAsText(f);
  };

  const apply = async (e) => {
    e.preventDefault();
    if (!hasCode) { setError('Please paste or upload React code first.'); return; }
    if (!isMeaningfulPrompt) { 
      setError('Please describe your modification in a few words (e.g. "add dark mode toggle").'); 
      return; 
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await modifyReactCode(code, prompt);
      if (!data.ok) throw new Error(data.error);
      setResultJsx(data.jsx);
      setResultCss(data.css || '');
      setTab('editor');
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
      const currentJsx = resultJsx || code;
      const { data } = await updatePromptUI(currentJsx, resultCss, refinePrompt);
      if (!data.ok) throw new Error(data.error);
      setResultJsx(data.jsx);
      setResultCss(data.css || '');
      setRefinePrompt('');
      setTab('editor');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setRefining(false);
  };

  const displayCode = resultJsx || code;
  const displayLabel = resultJsx ? 'Evolved React JSX' : 'Source React JSX';

  return (
    <div className="workspace-wrapper">
      <div className="workspace">
        
        {/* Left Panel: Component Evolution Blueprint */}
        <section className="blueprint-panel">
          <div className="blueprint-card">
            <div className="blueprint-header">
              <span className="eyebrow">COMPONENT MODIFIER</span>
              <h2>Evolve your<br /><em>components.</em></h2>
            </div>

            <form onSubmit={apply} className="blueprint-form">
              <div className="field-group">
                <div className="input-mode-toggle">
                  <button 
                    type="button" 
                    className={`input-mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
                    onClick={() => setInputMode('paste')}
                  >
                    Paste Code
                  </button>
                  <button 
                    type="button" 
                    className={`input-mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setInputMode('upload')}
                  >
                    Upload File
                  </button>
                </div>

                {inputMode === 'paste' ? (
                  <div className="code-editor-container">
                    <div className="code-editor-statusbar">
                      <span>JSX Source Editor</span>
                      <span>UTF-8</span>
                    </div>
                    <textarea 
                      className="code-textarea"
                      value={code} 
                      onChange={(e) => setCode(e.target.value)} 
                      rows="7" 
                      placeholder="Paste your React component JSX here..." 
                      spellCheck="false"
                    />
                  </div>
                ) : (
                  <div 
                    className="dropzone"
                    onClick={() => document.getElementById('code-file-input').click()}
                    style={{ minHeight: '120px' }}
                  >
                    <div className="dropzone-content">
                      <svg className="dropzone-svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <span className="dropzone-label">{fileName || 'Select .jsx or .js component file'}</span>
                      <span className="dropzone-sublabel">React 18+ components supported</span>
                    </div>
                    <input 
                      id="code-file-input" 
                      type="file" 
                      accept=".jsx,.js,.tsx" 
                      onChange={handleFile} 
                      hidden 
                    />
                  </div>
                )}
              </div>

              <div className="field-group">
                <label className="field-label">Feature or Modification</label>
                <textarea 
                  className="field-textarea"
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  rows="3" 
                  placeholder="e.g., Add a dark mode toggle button, stats grid, and interactive filter buttons..." 
                />
              </div>

              <button type="submit" className="action-btn" disabled={!canApply}>
                {loading ? 'Evolving Component...' : 'Apply Changes'}
              </button>

              <div className={`btn-hint ${canApply ? 'ready' : ''}`}>
                {!hasCode ? (
                  'Paste or upload component code to continue'
                ) : !prompt.trim() ? (
                  'Describe your modification to enable changes'
                ) : !isMeaningfulPrompt ? (
                  'Describe the feature in a few words (e.g. "add dark mode toggle")'
                ) : (
                  <span>Component & directives ready to evolve</span>
                )}
              </div>

              {error && <div className="error-msg">{error}</div>}
            </form>
          </div>
        </section>

        {/* Right Panel: Live Evolved Preview with Integrated Hand Editor */}
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
                {resultJsx ? 'Evolved JSX' : 'Source JSX'}
              </button>
              <button 
                className={`stage-tab ${tab === 'css' ? 'active' : ''}`} 
                onClick={() => setTab('css')}
              >
                CSS
              </button>
            </div>

            <div className="stage-actions">
              <button 
                type="button" 
                onClick={() => { setCode(''); setResultJsx(''); setResultCss(''); setPrompt(''); setRefinePrompt(''); }}
                className="preset-chip"
                style={{ background: '#991b1b', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                title="Reset canvas and clear editor"
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
            {tab === 'preview' && <PreviewSandbox jsx={resultJsx || code} css={resultCss} viewport={viewport} />}
            {tab === 'editor' && (
              <div className="integrated-editor-layout">
                <VisualElementEditor jsx={displayCode} onJsxChange={resultJsx ? setResultJsx : setCode} />
                <div className="integrated-editor-preview">
                  <PreviewSandbox jsx={resultJsx || code} css={resultCss} viewport={viewport} />
                </div>
              </div>
            )}
            {tab === 'jsx' && <CodeViewer code={displayCode} label={displayLabel} />}
            {tab === 'css' && <CodeViewer code={resultCss} label="Styles (CSS)" />}
          </div>

          {resultJsx && (
            <form className="refine-bar" onSubmit={refine}>
              <input 
                className="refine-input"
                value={refinePrompt} 
                onChange={(e) => setRefinePrompt(e.target.value)} 
                placeholder="Message AI to tweak current UI, or edit text boxes directly in Visual Hand Editor above..." 
              />
              <button type="submit" className="refine-btn" disabled={refining || !refinePrompt.trim()}>
                {refining ? 'Updating...' : 'Tweak Current UI'}
              </button>
            </form>
          )}
        </section>

      </div>
    </div>
  );
}
