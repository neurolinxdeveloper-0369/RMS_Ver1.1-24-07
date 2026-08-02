import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Sliders, Globe, Eye, EyeOff, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

const ALL_TABS = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'thresholds', label: 'Thresholds', icon: '🎛️' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'integrations', label: 'Integrations', icon: '🔗' },
  { id: 'firmware', label: 'Firmware Update', icon: '⚡' },
  { id: 'support', label: 'Support & Tickets', icon: '🎧' },
];

const Settings = () => {
  const userRole = localStorage.getItem('userRole') || 'Viewer';
  
  const tabs = ALL_TABS.filter(tab => {
    if (userRole === 'Viewer') {
      return ['general', 'security', 'support'].includes(tab.id);
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [general, setGeneral] = useState({ systemName: 'WindStream RMS', timezone: 'Asia/Kolkata', currency: 'INR', units: 'metric', language: 'English', dateFormat: 'DD/MM/YYYY' });
  const [notif, setNotif] = useState({ emailAlerts: true, smsAlerts: false, criticalAlerts: true, warningAlerts: true, infoAlerts: false, dailyReport: true, weeklyReport: false, emailRecipient: 'admin@neurolinx.io' });
  const [thresholds, setThresholds] = useState({ voltageMin: 210, voltageMax: 250, powerMin: 0, powerMax: 6000, tempMax: 85, windSpeedMax: 25, irradianceMin: 100, freqMin: 47, freqMax: 52 });
  const [security, setSecurity] = useState({ twoFA: false, sessionTimeout: 30, oldPwd: '', newPwd: '', confirmPwd: '' });

  const [devices, setDevices] = useState([]);
  const [otaState, setOtaState] = useState({ targetDevice: '', file: null, progress: 0, status: 'idle' });
  const [ticketData, setTicketData] = useState({ deviceId: '', severity: 'info', description: '' });
  const [ticketStatus, setTicketStatus] = useState('');
  const [ticketsList, setTicketsList] = useState([]);

  useEffect(() => {
    if (activeTab === 'support') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = () => {
    apiFetch('/api/tickets', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setTicketsList(data))
      .catch(err => console.error('Failed to fetch tickets', err));
  };

  useEffect(() => {
    apiFetch('/api/devices', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(err => console.error('Failed to fetch devices', err));
  }, []);

  const handleOtaUpdate = (e) => {
    e.preventDefault();
    if (!otaState.targetDevice || !otaState.file) return;

    setOtaState(s => ({ ...s, status: 'uploading', progress: 0 }));

    const formData = new FormData();
    formData.append('deviceId', otaState.targetDevice);
    formData.append('firmware', otaState.file);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setOtaState(s => {
        if (s.progress >= 90) {
          clearInterval(progressInterval);
          return s;
        }
        return { ...s, progress: s.progress + 10 };
      });
    }, 300);

    apiFetch('/api/ota/update', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      clearInterval(progressInterval);
      setOtaState(s => ({ ...s, progress: 100, status: 'success' }));
      setTimeout(() => {
        setOtaState(s => ({ ...s, progress: 0, status: 'idle', file: null }));
      }, 3000);
    })
    .catch(err => {
      clearInterval(progressInterval);
      setOtaState(s => ({ ...s, status: 'error' }));
      console.error('OTA Update failed', err);
    });
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    setTicketStatus('Submitting...');
    apiFetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    })
    .then(res => res.json())
    .then(data => {
      setTicketStatus('Ticket raised successfully!');
      setTicketData({ deviceId: '', severity: 'info', description: '' });
      fetchTickets();
      setTimeout(() => setTicketStatus(''), 3000);
    })
    .catch(err => {
      console.error(err);
      setTicketStatus('Failed to raise ticket.');
      setTimeout(() => setTicketStatus(''), 3000);
    });
  };

  const inputStyle = { width: '100%', padding: '0.55rem 0.85rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' };
  const fieldWrap = { marginBottom: '1.1rem' };

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Configure system preferences and security options</p>
        </div>
        <button onClick={handleSave} style={{
          background: saved ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #00A1E6, #0077B6)',
          color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem',
          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: saved ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(0,161,230,0.3)',
          transition: 'all 0.3s'
        }}>
          {saved ? '✓ Saved!' : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        {/* Tab Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.65rem 0.9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'rgba(0,161,230,0.1)' : 'transparent',
              color: activeTab === tab.id ? '#00A1E6' : 'var(--text-secondary)',
              transition: 'all 0.18s'
            }}>
              <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '12px', padding: '1.75rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>⚙️ General Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>System Name</label>
                  <input style={inputStyle} value={general.systemName} onChange={e => setGeneral(g => ({ ...g, systemName: e.target.value }))} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Timezone</label>
                  <select style={inputStyle} value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Currency</label>
                  <select style={inputStyle} value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Measurement Units</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['metric', 'imperial'].map(u => (
                      <button key={u} onClick={() => setGeneral(g => ({ ...g, units: u }))} style={{
                        flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                        background: general.units === u ? '#00A1E6' : 'transparent',
                        color: general.units === u ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', textTransform: 'capitalize'
                      }}>{u}</button>
                    ))}
                  </div>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Language</label>
                  <select style={inputStyle} value={general.language} onChange={e => setGeneral(g => ({ ...g, language: e.target.value }))}>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Date Format</label>
                  <select style={inputStyle} value={general.dateFormat} onChange={e => setGeneral(g => ({ ...g, dateFormat: e.target.value }))}>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>🔔 Notification Preferences</h3>
              <div style={fieldWrap}>
                <label style={labelStyle}>Alert Email Recipients</label>
                <input style={inputStyle} value={notif.emailRecipient} onChange={e => setNotif(n => ({ ...n, emailRecipient: e.target.value }))} placeholder="email@domain.com" />
              </div>
              {[
                ['emailAlerts', '📧 Email Alerts', 'Send critical alerts via email'],
                ['smsAlerts', '📱 SMS Alerts', 'Send alerts via SMS/WhatsApp'],
                ['criticalAlerts', '🔴 Critical Alerts', 'Device offline, voltage overload, faults'],
                ['warningAlerts', '🟡 Warning Alerts', 'Temperature warnings, frequency issues'],
                ['infoAlerts', '🔵 Info Alerts', 'Firmware updates, routine health checks'],
                ['dailyReport', '📊 Daily Report Email', 'Receive a daily generation summary'],
                ['weeklyReport', '📋 Weekly Report Email', 'Receive a weekly analytics digest'],
              ].map(([key, title, desc]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{desc}</div>
                  </div>
                  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotif(n => ({ ...n, [key]: !n[key] }))}>
                    <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: notif[key] ? '#00A1E6' : 'var(--border-color)', transition: 'background 0.2s', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '3px', left: notif[key] ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Thresholds Tab */}
          {activeTab === 'thresholds' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>🎛️ Alert Thresholds</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                {[
                  ['voltageMin', 'Voltage Min (V)', 180, 250],
                  ['voltageMax', 'Voltage Max (V)', 200, 280],
                  ['powerMax', 'Max Power Limit (kW)', 1000, 10000],
                  ['tempMax', 'Max Temperature (°C)', 50, 120],
                  ['windSpeedMax', 'Max Wind Speed (m/s)', 5, 50],
                  ['irradianceMin', 'Min Irradiance (W/m²)', 0, 500],
                  ['freqMin', 'Frequency Min (Hz)', 45, 50],
                  ['freqMax', 'Frequency Max (Hz)', 50, 55],
                ].map(([key, label, min, max]) => (
                  <div key={key} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ ...labelStyle, margin: 0 }}>{label}</label>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00A1E6' }}>{thresholds[key]}</span>
                    </div>
                    <input type="range" min={min} max={max} value={thresholds[key]}
                      onChange={e => setThresholds(t => ({ ...t, [key]: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#00A1E6', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span>{min}</span><span>{max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>🔒 Security Settings</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>🔐 Two-Factor Authentication</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Require OTP on every login</div>
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => setSecurity(s => ({ ...s, twoFA: !s.twoFA }))}>
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: security.twoFA ? '#00A1E6' : 'var(--border-color)', transition: 'background 0.2s', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '3px', left: security.twoFA ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </div>
                </div>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Session Timeout (minutes)</label>
                <select style={inputStyle} value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: parseInt(e.target.value) }))}>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: '1.5rem' }}>Change Password</h4>
              {[['oldPwd', 'Current Password'], ['newPwd', 'New Password'], ['confirmPwd', 'Confirm New Password']].map(([key, label]) => (
                <div key={key} style={{ ...fieldWrap, position: 'relative' }}>
                  <label style={labelStyle}>{label}</label>
                  <input type={showPwd ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '2.5rem' }} value={security[key]} onChange={e => setSecurity(s => ({ ...s, [key]: e.target.value }))} placeholder="••••••••" />
                  <button onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: '0.7rem', top: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              ))}
              <button style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00A1E6, #0077B6)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Update Password</button>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>🔗 Integrations</h3>
              {[
                { name: 'MQTT Broker', desc: 'Connect to IoT message broker for device telemetry', connected: true, icon: '📡' },
                { name: 'REST API Webhook', desc: 'Forward alerts to external systems via POST webhook', connected: false, icon: '🔌' },
                { name: 'Google Sheets Export', desc: 'Auto-export daily reports to Google Sheets', connected: false, icon: '📊' },
                { name: 'Slack Notifications', desc: 'Send critical alerts to a Slack channel', connected: true, icon: '💬' },
              ].map(intg => (
                <div key={intg.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '0.75rem', background: 'var(--bg-surface-light)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: intg.connected ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{intg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{intg.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{intg.desc}</div>
                  </div>
                  <span style={{ padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: intg.connected ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)', color: intg.connected ? '#10B981' : '#9CA3AF' }}>{intg.connected ? '✓ Connected' : 'Not Connected'}</span>
                  <button style={{ padding: '0.4rem 0.9rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>{intg.connected ? 'Configure' : 'Connect'}</button>
                </div>
              ))}
            </div>
          )}

          {/* Firmware Update Tab */}
          {activeTab === 'firmware' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>⚡ Over-The-Air (OTA) Firmware Update</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Push new firmware binaries to your remote devices seamlessly over the air.</p>
              
              <form onSubmit={handleOtaUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '500px' }}>
                <div>
                  <label style={labelStyle}>Target Device ID *</label>
                  <input 
                    type="text"
                    required
                    list="device-list"
                    style={inputStyle}
                    placeholder="Enter or select a device ID..."
                    value={otaState.targetDevice}
                    onChange={e => setOtaState(s => ({ ...s, targetDevice: e.target.value }))}
                  />
                  <datalist id="device-list">
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.name || d.id} - {d.type || 'Unknown Type'}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={labelStyle}>Firmware Binary (.bin) *</label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'var(--bg-surface-light)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="file" 
                      accept=".bin" 
                      required
                      onChange={e => setOtaState(s => ({ ...s, file: e.target.files[0] }))}
                      style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                    />
                    <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {otaState.file ? otaState.file.name : 'Click or drag .bin file here'}
                    </div>
                    {!otaState.file && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Only .bin files are supported</div>}
                  </div>
                </div>

                {otaState.status !== 'idle' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      <span>
                        {otaState.status === 'uploading' && 'Uploading & Updating...'}
                        {otaState.status === 'success' && 'Update Successful!'}
                        {otaState.status === 'error' && 'Update Failed!'}
                      </span>
                      <span>{otaState.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${otaState.progress}%`, 
                        height: '100%', 
                        background: otaState.status === 'error' ? '#EF4444' : otaState.status === 'success' ? '#10B981' : '#00A1E6',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={otaState.status === 'uploading'}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: otaState.status === 'uploading' ? 'var(--text-muted)' : 'linear-gradient(135deg, #00A1E6, #0077B6)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: otaState.status === 'uploading' ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  {otaState.status === 'uploading' ? 'Updating...' : 'Start OTA Update'}
                </button>
              </form>
            </div>
          )}
        </div>

          {/* Support & Tickets Tab */}
          {activeTab === 'support' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>🎧 Raise Support Ticket</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Report an anomaly or issue. This will instantly reflect on the main Dashboard Alarm Log.</p>
              
                <form onSubmit={handleRaiseTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={labelStyle}>Device ID *</label>
                  <input 
                    type="text" required list="ticket-device-list" style={inputStyle}
                    placeholder="Enter or select device ID..."
                    value={ticketData.deviceId}
                    onChange={e => setTicketData(s => ({ ...s, deviceId: e.target.value }))}
                  />
                  <datalist id="ticket-device-list">
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name || d.id}</option>)}
                  </datalist>
                </div>
                
                <div>
                  <label style={labelStyle}>Severity *</label>
                  <select style={inputStyle} value={ticketData.severity} onChange={e => setTicketData(s => ({ ...s, severity: e.target.value }))}>
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="critical">Critical (Red)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Issue Description *</label>
                  <textarea 
                    required style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    placeholder="Describe the anomaly or issue..."
                    value={ticketData.description}
                    onChange={e => setTicketData(s => ({ ...s, description: e.target.value }))}
                  />
                </div>

                {ticketStatus && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: ticketStatus.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(0,161,230,0.1)', color: ticketStatus.includes('success') ? '#10B981' : '#00A1E6', fontSize: '0.85rem', fontWeight: 600 }}>
                    {ticketStatus}
                  </div>
                )}

                <button type="submit" style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00A1E6, #0077B6)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                  Submit Ticket
                </button>
              </form>
              </div>

              <div style={{ overflow: 'hidden' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>📋 Recent Tickets</h3>
                {ticketsList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tickets found.</p>
                ) : (
                  <div style={{ overflowX: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#F5F7F9', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ID</th>
                          <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Device</th>
                          <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</th>
                          <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketsList.map(t => (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#00A1E6', fontFamily: 'monospace' }}>#{t.id}</td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{t.deviceId}</td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.description}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ 
                                padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                background: t.status === 'Cleared' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                color: t.status === 'Cleared' ? '#10B981' : '#F59E0B'
                              }}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select 
                                value={t.status}
                                onChange={(e) => {
                                  apiFetch(`/api/tickets/${t.id}/status`, {
                                    method: 'PUT',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    },
                                    body: JSON.stringify({ status: e.target.value })
                                  })
                                  .then(() => fetchTickets())
                                  .catch(err => console.error(err));
                                }}
                                style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', background: 'transparent' }}
                              >
                                <option value="Unresolved">Unresolved</option>
                                <option value="Pending">Pending</option>
                                <option value="Cleared">Cleared</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Settings;
