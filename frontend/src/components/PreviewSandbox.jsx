import { useMemo } from 'react';

const VIEWPORTS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px'
};

export function buildPreviewHTML(jsx, css) {
  if (!jsx) return '';

  let code = jsx;

  // Strip markdown fences
  code = code.replace(/^```(?:jsx|javascript|react)?\s*/i, '').replace(/\s*```$/i, '').trim();
  if (!code.includes('\n') && code.includes('\\n')) {
    code = code.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '  ').replace(/\\"/g, '"');
  }

  // Strip imports
  code = code.replace(/^\s*import\b.*$/gm, '');

  // Detect component name (default: GeneratedPage)
  let name = 'GeneratedPage';
  const funcMatch = code.match(/(?:export\s+default\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
  const constMatch = code.match(/(?:export\s+default\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/);
  if (funcMatch) name = funcMatch[1];
  else if (constMatch) name = constMatch[1];

  // Strip exports
  code = code.replace(/export\s+default\s+/g, '');
  code = code.replace(/export\s+(?=(function|const|let|var|class))/g, '');

  // Escape closing script tags inside user code
  code = code.replace(/<\/script>/gi, '<\\/script>');

  const safeCode = JSON.stringify(code);

  return '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<script src="https://cdn.tailwindcss.com"></script>'
    + '<style>'
    + 'body{margin:0;font-family:Arial,sans-serif;overflow-x:hidden;background:#ffffff;color:#111827}*{box-sizing:border-box}'
    + (css || '')
    + '</style></head><body><div id="root"></div>'
    + '<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>'
    + '<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>'
    + '<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>'
    + '<script>'
    + 'window.addEventListener("error",function(e){if(e.target&&e.target.tagName==="IMG"){e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";}},true);'
    + 'window.onload=function(){try{'
    + 'var ICONS=["Check","Zap","Star","Sparkles","Shield","ShieldCheck","ArrowRight","ArrowLeft","ChevronRight","ChevronLeft","ChevronDown","ChevronUp","Menu","X","Search","User","Users","Mail","Lock","Phone","Play","Pause","Heart","Globe","ExternalLink","Copy","Trash","Edit","Plus","Minus","Clock","Calendar","Award","HelpCircle","Info","AlertCircle","Compass","Activity","BarChart","TrendingUp","Cpu","Layers","Grid","Box","DollarSign","CreditCard","Download","Upload","Settings","Share2","Maximize","Minimize"];'
    + 'var iconDefs="";'
    + 'ICONS.forEach(function(ic){iconDefs+="var "+ic+"=function(p){return React.createElement(\\"span\\",{className:(p&&p.className)||\\"inline-flex items-center\\"},\\"•\\");};\\n";});'
    + 'var c=' + safeCode + ';'
    + 'var t=Babel.transform(iconDefs+c,{presets:[["react",{runtime:"classic"}]]}).code;'
    + 'var run=new Function("React","ReactDOM","useState","useEffect","useContext","useReducer","useRef","useMemo","useCallback","useLayoutEffect",'
    + 't+"\\nif (typeof ' + name + ' !== \\"undefined\\") return ' + name + '; if (typeof GeneratedPage !== \\"undefined\\") return GeneratedPage; if (typeof App !== \\"undefined\\") return App;");'
    + 'var C=run(React,ReactDOM,React.useState,React.useEffect,React.useContext,React.useReducer,React.useRef,React.useMemo,React.useCallback,React.useLayoutEffect);'
    + 'if (!C) throw new Error("Component \\"' + name + '\\" not found in generated code.");'
    + 'ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(C));'
    + '}catch(e){'
    + 'document.getElementById("root").innerHTML="<div style=\\"padding:24px;font-family:monospace;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:16px\\"><h3 style=\\"margin-top:0\\">Preview Error</h3><pre style=\\"white-space:pre-wrap;font-size:12px\\">"+(e.stack||e.message)+"</pre></div>";'
    + 'console.error(e)}}<\/script></body></html>';
}

export default function PreviewSandbox({ jsx, css, viewport = 'desktop' }) {
  const html = useMemo(() => buildPreviewHTML(jsx, css), [jsx, css]);

  if (!jsx) {
    return (
      <div className="preview-sandbox">
        <div className={`preview-frame-wrapper viewport-${viewport}`}>
          <div className={`preview-empty-card ${viewport}`}>
            <div className="empty-card-header">
              <span className="empty-tag">Live Canvas ({viewport.toUpperCase()})</span>
              <span className="empty-status-text">Awaiting Generation</span>
            </div>

            <div className="ghost-wireframe">
              <div className="ghost-nav">
                <div className="ghost-bar" style={{ width: '80px' }} />
                <div className="ghost-bar" style={{ width: '160px' }} />
              </div>

              <div className="ghost-hero">
                <div className="ghost-title" />
                <div className="ghost-desc" />
                <div className="ghost-desc-short" />
                <div className="ghost-btn" />
              </div>

              <div className="ghost-grid">
                <div className="ghost-card" />
                <div className="ghost-card" />
                <div className="ghost-card" />
              </div>
            </div>

            <div className="empty-card-footer">
              Set your directives on the left and generate to render the interactive React component.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-sandbox">
      <div className={`preview-frame-wrapper viewport-${viewport}`}>
        <div className={`device-container ${viewport}`}>
          {viewport === 'mobile' && (
            <div className="phone-notch">
              <div className="phone-camera"></div>
              <div className="phone-speaker"></div>
            </div>
          )}
          <iframe
            title="Live Preview"
            srcDoc={html}
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
