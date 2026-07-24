import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, ExternalLink, MessageCircle, FileText, Video, HelpCircle } from 'lucide-react';

const faqs = [
  { q: 'How do I add a new solar or wind device to the system?', a: 'Navigate to Device Management from the sidebar, then click "Add Device". Fill in the device type (Solar/Wind/Hybrid), capacity, location, and connection details. The device will appear on the dashboard after a successful ping.' },
  { q: 'Why is my device showing "Offline" status?', a: 'An Offline status means the device has failed to communicate for over 5 minutes. Check the device\'s network connection, verify the IP address and port in Device Management, and ensure the device firmware is up to date.' },
  { q: 'How is energy generation efficiency calculated?', a: 'Efficiency is computed as (Actual Energy Output / Theoretical Maximum Output) × 100. The theoretical maximum is based on panel/turbine capacity ratings and measured irradiance/wind-speed conditions.' },
  { q: 'Can I export historical reports to Excel or CSV?', a: 'Yes. In the History Report page, apply your desired date range and energy type filter, then click the "Export CSV" button in the top-right. Each row in the table also has a per-day CSV download button.' },
  { q: 'How do I configure alert thresholds for voltage or temperature?', a: 'Go to Settings → Thresholds tab. Use the sliders to set minimum and maximum values for voltage, power, temperature, wind speed, irradiance, and frequency. Click "Save Changes" to apply.' },
  { q: 'What does the Instantaneous Report show in real time?', a: 'The Instantaneous Report page shows live power output in kW for Solar, Wind, and Total generation, refreshed every 3 seconds. It also shows voltage, irradiance, and wind speed metrics, plus a rolling 60-second power sparkline chart.' },
  { q: 'How do I invite a new user and assign them a role?', a: 'Go to User Management and click "Invite User". Enter their name, email, and select a role: Admin (full access), Operator (can view & manage devices), or Viewer (read-only access). An invitation email is sent automatically.' },
  { q: 'What is the difference between Solar and Wind mode in Analytics?', a: 'In Analytics, the Solar/Wind filters adjust all charts and KPI summaries to show data for only that energy type. "Combined" mode shows the aggregate of both generation types.' },
];

const quickLinks = [
  { label: 'Full Documentation', icon: <FileText size={18} />, color: '#00A1E6', href: '#' },
  { label: 'Video Tutorials', icon: <Video size={18} />, color: '#A78BFA', href: '#' },
  { label: 'Submit Support Ticket', icon: <MessageCircle size={18} />, color: '#F97316', href: '#' },
  { label: 'Contact Support', icon: <HelpCircle size={18} />, color: '#10B981', href: '#' },
];

const Help = () => {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❓</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Help Center</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Find answers to common questions about WindStream RMS</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 2rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search for help topics..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* FAQ Accordion */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem' }}>No results found for "{search}"</div>
            )}
            {filtered.map((faq, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)', borderRadius: '10px',
                border: openIdx === i ? '1px solid rgba(0,161,230,0.35)' : '1px solid var(--border-color)',
                overflow: 'hidden', transition: 'border-color 0.2s',
                boxShadow: openIdx === i ? '0 4px 12px rgba(0,161,230,0.1)' : '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{faq.q}</span>
                  {openIdx === i ? <ChevronDown size={16} style={{ color: '#00A1E6', flexShrink: 0 }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                </button>
                {openIdx === i && (
                  <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links + System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '12px', padding: '1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickLinks.map(link => (
                <a key={link.label} href={link.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                  textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500,
                  background: 'var(--bg-surface-light)', transition: 'all 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = link.color}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <span style={{ color: link.color }}>{link.icon}</span>
                  {link.label}
                  <ExternalLink size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </a>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '12px', padding: '1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🖥 System Information</h3>
            {[
              ['Application', 'WindStream RMS'],
              ['Version', 'v1.1.0'],
              ['Build Date', '22 Jul 2026'],
              ['Environment', 'Production'],
              ['API Endpoint', 'api.neurolinx.io'],
              ['Support Email', 'support@neurolinx.io'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
