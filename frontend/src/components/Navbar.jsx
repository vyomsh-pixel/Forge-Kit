import { NavLink } from 'react-router';
import { useStudioAuth } from './StudioAuthGate';

export default function Navbar() {
  const tabClass = ({ isActive }) => 'navbar-tab' + (isActive ? ' active' : '');
  const auth = useStudioAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span>ForgeKit</span>
        <span className="navbar-brand-badge">AI</span>
      </div>
      <nav className="navbar-tabs" aria-label="Studio Navigation">
        <NavLink to="/wireframe" className={tabClass}>Wireframe to React</NavLink>
        <NavLink to="/prompt-ui" className={tabClass}>Prompt UI</NavLink>
        <NavLink to="/code-modifier" className={tabClass}>Component Modifier</NavLink>
        <NavLink to="/cms" className={tabClass}>CMS Studio</NavLink>
      </nav>
      {auth && (
        <div className="navbar-account-controls">
          {auth.actionToast && (
            <span className="navbar-toast" role="status">{auth.actionToast}</span>
          )}
          <span className="navbar-user-pill" title="Active Studio Profile">
            {auth.user?.display_name || auth.user?.username || 'Architect'}
          </span>
          <button
            type="button"
            className="navbar-ctrl-btn"
            onClick={auth.onExportData}
            title="Download all account metadata, sections, and CMS fields as JSON"
          >
            Export My Data
          </button>
          <button
            type="button"
            className="navbar-ctrl-btn danger"
            onClick={auth.onDeleteAccount}
            title="Delete account and purge stored sections & CMS data"
          >
            Delete Account &amp; Data
          </button>
          <button
            type="button"
            className="navbar-ctrl-btn"
            onClick={auth.onSignOut}
            title="Lock and sign out of ForgeKit Studio"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}

