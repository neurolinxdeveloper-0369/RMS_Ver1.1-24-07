import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search, Copy, ExternalLink } from 'lucide-react';

const docsTree = [
  {
    section: '🚀 Getting Started',
    items: [
      { id: 'intro', title: 'Introduction to WindStream' },
      { id: 'login', title: 'Logging In & Dashboard Overview' },
      { id: 'quickstart', title: 'Quick Start Guide' },
    ]
  },
  {
    section: '📡 Device Configuration',
    items: [
      { id: 'add-device', title: 'Adding Solar Devices' },
      { id: 'add-wind', title: 'Adding Wind Turbine Units' },
      { id: 'device-types', title: 'Device Types & Capacities' },
      { id: 'firmware', title: 'Firmware Update Guide' },
    ]
  },
  {
    section: '📊 Reports & Analytics',
    items: [
      { id: 'instantaneous', title: 'Instantaneous Reports' },
      { id: 'history', title: 'Historical Data & Export' },
      { id: 'analytics-guide', title: 'Understanding Analytics' },
    ]
  },
  {
    section: '🔔 Alerts & Alarms',
    items: [
      { id: 'alert-types', title: 'Alert Types & Severity Levels' },
      { id: 'thresholds', title: 'Configuring Thresholds' },
      { id: 'acknowledge', title: 'Acknowledging & Muting Alerts' },
    ]
  },
  {
    section: '🔌 API Reference',
    items: [
      { id: 'api-auth', title: 'Authentication & API Keys' },
      { id: 'api-devices', title: 'Devices API Endpoints' },
      { id: 'api-telemetry', title: 'Telemetry Data API' },
      { id: 'api-reports', title: 'Reports API' },
    ]
  },
];

const docContent = {
  intro: {
    title: 'Introduction to WindStream RMS',
    breadcrumb: ['Getting Started', 'Introduction'],
    content: [
      { type: 'heading', text: 'What is WindStream?' },
      { type: 'para', text: 'WindStream RMS (Remote Monitoring System) is a comprehensive hybrid solar and wind energy monitoring platform designed for real-time telemetry, performance analytics, anomaly detection, and device lifecycle management.' },
      { type: 'heading', text: 'Key Features' },
      { type: 'list', items: ['Real-time power output monitoring (Solar + Wind)', 'Device management for up to 10,000 endpoints', 'Configurable alert thresholds and notifications', 'Historical report generation with CSV export', 'Role-based access control (Admin, Operator, Viewer)', 'Energy analytics with CO₂ offset tracking'] },
      { type: 'heading', text: 'System Architecture' },
      { type: 'para', text: 'WindStream uses an IoT edge-to-cloud architecture. Devices communicate via MQTT over TLS to the Neurolinx cloud broker, which processes telemetry and pushes it to the dashboard frontend via WebSocket.' },
    ]
  },
  'api-auth': {
    title: 'Authentication & API Keys',
    breadcrumb: ['API Reference', 'Authentication'],
    content: [
      { type: 'heading', text: 'Obtaining an API Key' },
      { type: 'para', text: 'All API requests must include a valid Bearer token in the Authorization header. Generate your API key from Settings → Integrations → REST API Webhook.' },
      { type: 'code', lang: 'http', text: 'POST https://api.neurolinx.io/v1/auth/token\nContent-Type: application/json\n\n{\n  "clientId": "your-client-id",\n  "clientSecret": "your-client-secret"\n}' },
      { type: 'heading', text: 'Using the Token' },
      { type: 'code', lang: 'http', text: 'GET https://api.neurolinx.io/v1/devices\nAuthorization: Bearer eyJhbGciOiJIUzI1...\nContent-Type: application/json' },
    ]
  },
  'api-devices': {
    title: 'Devices API Endpoints',
    breadcrumb: ['API Reference', 'Devices API'],
    content: [
      { type: 'heading', text: 'List All Devices' },
      { type: 'code', lang: 'http', text: 'GET /v1/devices?type=solar&status=active&page=1&limit=50' },
      { type: 'heading', text: 'Get Device by ID' },
      { type: 'code', lang: 'http', text: 'GET /v1/devices/{device_id}' },
      { type: 'heading', text: 'Response Example' },
      { type: 'code', lang: 'json', text: '{\n  "id": "DEV-0012",\n  "name": "Solar Unit 012",\n  "type": "Solar",\n  "status": "Active",\n  "capacity_kw": 120.5,\n  "location": "Maharashtra",\n  "last_seen": "2026-07-22T12:00:00Z"\n}' },
    ]
  },
  'api-telemetry': {
    title: 'Telemetry Data API',
    breadcrumb: ['API Reference', 'Telemetry'],
    content: [
      { type: 'heading', text: 'Get Instantaneous Reading' },
      { type: 'code', lang: 'http', text: 'GET /v1/telemetry/{device_id}/instant' },
      { type: 'heading', text: 'Get Historical Data' },
      { type: 'code', lang: 'http', text: 'GET /v1/telemetry/{device_id}/history\n  ?from=2026-07-01&to=2026-07-22&interval=day' },
      { type: 'heading', text: 'Response' },
      { type: 'code', lang: 'json', text: '{\n  "device_id": "DEV-0012",\n  "readings": [\n    {\n      "timestamp": "2026-07-22T12:00:00Z",\n      "solar_kw": 3.24,\n      "wind_kw": 0,\n      "total_kw": 3.24,\n      "voltage_v": 231.2\n    }\n  ]\n}' },
    ]
  },
  quickstart: {
    title: 'Quick Start Guide',
    breadcrumb: ['Getting Started', 'Quick Start'],
    content: [
      { type: 'heading', text: 'Step 1 — Log In' },
      { type: 'para', text: 'Navigate to your WindStream instance URL and log in with your admin credentials. First-time login requires a password reset.' },
      { type: 'heading', text: 'Step 2 — Add Your First Device' },
      { type: 'para', text: 'Go to Device Management → Add Device. Select device type, enter capacity, location, and the device IP address on your local network.' },
      { type: 'heading', text: 'Step 3 — View Live Data' },
      { type: 'para', text: 'Once a device connects, it will appear on the Dashboard Overview. Switch to Instantaneous Report for real-time power readings.' },
      { type: 'heading', text: 'Step 4 — Configure Alerts' },
      { type: 'para', text: 'In Settings → Thresholds, set your voltage and power limits. In Notifications, enable email or SMS alerts so you are notified of any anomalies.' },
    ]
  },
};

const Docs = () => {
  const [activeDoc, setActiveDoc] = useState('intro');
  const [openSections, setOpenSections] = useState({ '🚀 Getting Started': true });
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState('');

  const doc = docContent[activeDoc] || docContent['intro'];

  const toggleSection = (section) => setOpenSections(s => ({ ...s, [section]: !s[section] }));

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const allItems = docsTree.flatMap(s => s.items);
  const filteredTree = search
    ? [{ section: 'Search Results', items: allItems.filter(i => i.title.toLowerCase().includes(search.toLowerCase())) }]
    : docsTree;

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Nav Tree */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '1rem'
        }}>
          <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search docs..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.45rem 0.6rem 0.45rem 2rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {filteredTree.map(section => (
            <div key={section.section}>
              <button onClick={() => toggleSection(section.section)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.4rem', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                {section.section}
                {openSections[section.section] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              {(openSections[section.section] || search) && (
                <div style={{ marginBottom: '0.5rem' }}>
                  {section.items.map(item => (
                    <button key={item.id} onClick={() => { setActiveDoc(item.id); setSearch(''); }} style={{
                      width: '100%', display: 'block', textAlign: 'left',
                      padding: '0.45rem 0.75rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                      fontSize: '0.82rem', fontWeight: activeDoc === item.id ? 700 : 400,
                      background: activeDoc === item.id ? 'rgba(0,161,230,0.1)' : 'transparent',
                      color: activeDoc === item.id ? '#00A1E6' : 'var(--text-secondary)',
                      transition: 'all 0.15s', marginBottom: '0.15rem'
                    }}>
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '12px', padding: '2rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Docs</span>
            {doc.breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={12} />
                <span style={{ color: i === doc.breadcrumb.length - 1 ? '#00A1E6' : 'var(--text-muted)', fontWeight: i === doc.breadcrumb.length - 1 ? 600 : 400 }}>{b}</span>
              </React.Fragment>
            ))}
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>{doc.title}</h1>

          {doc.content.map((block, i) => {
            if (block.type === 'heading') return (
              <h2 key={i} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.6rem' }}>{block.text}</h2>
            );
            if (block.type === 'para') return (
              <p key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>{block.text}</p>
            );
            if (block.type === 'list') return (
              <ul key={i} style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.3rem' }}>{item}</li>
                ))}
              </ul>
            );
            if (block.type === 'code') return (
              <div key={i} style={{ position: 'relative', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E293B', padding: '0.5rem 1rem', borderRadius: '8px 8px 0 0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{block.lang}</span>
                  <button onClick={() => handleCopy(block.text, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === i ? '#10B981' : '#94A3B8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Copy size={12} /> {copied === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre style={{ background: '#0F172A', margin: 0, padding: '1rem', borderRadius: '0 0 8px 8px', overflowX: 'auto', fontSize: '0.82rem', color: '#38BDF8', lineHeight: 1.65, fontFamily: 'monospace' }}>{block.text}</pre>
              </div>
            );
            return null;
          })}

          {/* Prev / Next nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={() => {
              const flat = docsTree.flatMap(s => s.items);
              const idx = flat.findIndex(i => i.id === activeDoc);
              if (idx > 0) setActiveDoc(flat[idx - 1].id);
            }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>← Previous</button>
            <button onClick={() => {
              const flat = docsTree.flatMap(s => s.items);
              const idx = flat.findIndex(i => i.id === activeDoc);
              if (idx < flat.length - 1) setActiveDoc(flat[idx + 1].id);
            }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
