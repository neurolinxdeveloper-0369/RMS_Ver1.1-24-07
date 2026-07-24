import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Compass,
  Server,
  Users,
  FileText,
  Activity,
  History,
  BarChart2,
  BookOpen,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Globe,
  Sun,
  Moon,
  Search,
  Calendar,
  Download,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import windStreamLogo from '../assets/WindStream.png';
import neuroLogo from '../assets/neuro.png';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState('');
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });



  const [isReportsOpen, setIsReportsOpen] = useState(() => {
    return localStorage.getItem('reports-submenu-open') === 'true';
  });

  const userRole = localStorage.getItem('userRole') || 'Viewer';
  const userName = localStorage.getItem('userName') || 'User';

  const toggleReports = () => {
    const newState = !isReportsOpen;
    setIsReportsOpen(newState);
    localStorage.setItem('reports-submenu-open', String(newState));
  };

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };



  useEffect(() => {
    // Force light mode completely, no matter what localStorage or OS says
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    setIsDark(false);

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          {isCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', width: '100%' }}>
              <img 
                src={windStreamLogo} 
                alt="WindStream Logo" 
                className="logo-img-collapsed" 
                style={{ width: '28px', height: 'auto', cursor: 'pointer' }} 
                onClick={toggleSidebar} 
                title="Expand Sidebar"
              />
            </div>
          ) : (
            <>
              <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={toggleSidebar} title="Collapse Sidebar">
                <img src={windStreamLogo} alt="WindStream Logo" className="logo-img" style={{ height: '24px', width: 'auto' }} />
                <span className="sidebar-brand-text">WindStream</span>
              </div>
              <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Collapse Sidebar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="4" x2="5" y2="20" />
                  <polyline points="19 5 12 12 19 19" />
                  <line x1="12" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-section-header">General</div>
          
          <NavLink to="/dashboard" end className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div className="sidebar-icon"><Compass size={18} /></div>
            <span className="sidebar-label">Overview</span>
            <span className="sidebar-tooltip">Overview</span>
          </NavLink>

          <NavLink to="/dashboard/devices" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div className="sidebar-icon"><Server size={18} /></div>
            <span className="sidebar-label">Device Management</span>
            <span className="sidebar-tooltip">Device Management</span>
          </NavLink>

          {userRole === 'Admin' && (
            <NavLink to="/dashboard/users" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="sidebar-icon"><Users size={18} /></div>
              <span className="sidebar-label">User Management</span>
              <span className="sidebar-tooltip">User Management</span>
            </NavLink>
          )}

          {/* Reports Collapsible sub-menu */}
          <div className="sidebar-submenu-wrapper">
            <div 
              className={`sidebar-link ${isReportsOpen ? 'submenu-parent-open' : ''}`}
              onClick={() => {
                if (isCollapsed) {
                  toggleSidebar();
                  setIsReportsOpen(true);
                } else {
                  toggleReports();
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="sidebar-icon"><FileText size={18} /></div>
              <span className="sidebar-label">Reports</span>
              {!isCollapsed && (
                <ChevronDown 
                  size={14} 
                  style={{ 
                    marginLeft: 'auto', 
                    transform: isReportsOpen ? 'rotate(180deg)' : 'none', 
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-muted)' 
                  }} 
                />
              )}
              <span className="sidebar-tooltip">Reports</span>
            </div>
            
            {isReportsOpen && !isCollapsed && (
              <div className="sidebar-submenu" style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                <NavLink to="/dashboard/reports/instantaneous" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <div className="sidebar-icon"><Activity size={16} /></div>
                  <span className="sidebar-label">Instantaneous</span>
                </NavLink>
                <NavLink to="/dashboard/reports/history" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <div className="sidebar-icon"><History size={16} /></div>
                  <span className="sidebar-label">History</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/dashboard/analytics" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div className="sidebar-icon"><BarChart2 size={18} /></div>
            <span className="sidebar-label">Analytics</span>
            <span className="sidebar-tooltip">Analytics</span>
          </NavLink>

          {/* Separator Gap and Line Divider */}
          <div className="sidebar-nav-gap" style={{ height: '80px' }}></div>
          <div className="sidebar-divider-line" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', margin: '0 0.75rem 0.75rem 0.75rem' }}></div>

          <NavLink to="/dashboard/settings" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div className="sidebar-icon"><Settings size={18} /></div>
            <span className="sidebar-label">Settings</span>
            <span className="sidebar-tooltip">Settings</span>
          </NavLink>

          <NavLink to="/dashboard/help" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div className="sidebar-icon"><HelpCircle size={18} /></div>
            <span className="sidebar-label">Help</span>
            <span className="sidebar-tooltip">Help</span>
          </NavLink>

          <NavLink to="/dashboard/docs" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div className="sidebar-icon"><BookOpen size={18} /></div>
            <span className="sidebar-label">Docs</span>
            <span className="sidebar-tooltip">Docs</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer - Logo */}
        {!isCollapsed && (
          <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Powered by</span>
            <img src={neuroLogo} alt="Neurolinx Logo" style={{ width: '130px', height: 'auto', opacity: 0.8 }} />
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          {/* Search bar on the left */}
          <div className="topbar-search-container">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search" className="topbar-search-input" />
            <span className="search-shortcut">⌘+F</span>
          </div>
          
          <div className="topbar-right-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Date and Time */}
            <div className="topbar-datetime" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Clock size={16} style={{ color: '#00A1E6' }} />
              <span>{time} IST</span>
            </div>

            {/* Vertical Divider */}
            <div className="topbar-vertical-divider" style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>

            {/* Profile Info Header & Logout */}
            <div className="topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="profile-avatar" style={{ fontSize: '1.2rem', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 161, 230, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👦</div>
              <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span className="profile-name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{userName.split('@')[0]}</span>
                <span className="profile-email" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{userRole}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-logout-topbar" 
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s',
                  marginLeft: '0.25rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <Outlet />


      </main>
    </div>
  );
};

export default DashboardLayout;
