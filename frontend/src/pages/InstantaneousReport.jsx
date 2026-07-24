import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { apiFetch } from '../utils/api';
import { toast } from 'react-hot-toast';
import { Power } from 'lucide-react';

const statusColor = { 'ON load': '#10B981', 'OFF load': '#F59E0B', Offline: '#EF4444' };
const statusBg = { 'ON load': 'rgba(16,185,129,0.1)', 'OFF load': 'rgba(245,158,11,0.1)', Offline: 'rgba(239,68,68,0.1)' };

const InstantaneousReport = () => {
  const [liveData, setLiveData] = useState([]);
  const [liveTableData, setLiveTableData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({ solar: 0, wind: 0, total: 0, avgVoltage: 0 });
  const [confirmSwitch, setConfirmSwitch] = useState(null);

  const handleToggleSwitch = (row, newState) => {
    if (!row.meterId) {
      toast.error("Device has no active meter to toggle");
      return;
    }
    setConfirmSwitch({ 
      meterId: row.meterId, 
      customMeterId: row.customMeterId, 
      deviceId: row.device, 
      newState 
    });
  };

  const executeToggleSwitch = () => {
    if (!confirmSwitch) return;
    const { meterId, deviceId, newState } = confirmSwitch;
    
    // Optimistic update
    setLiveTableData(prev => prev.map(m => m.device === deviceId ? { ...m, status: newState ? 'ON load' : 'OFF load' } : m));
    
    apiFetch(`/api/devices/${deviceId}/meters/${meterId}/switch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState })
    })
    .then(res => {
      if(res.ok) toast.success("Switch toggled successfully!");
      else toast.error("Failed to toggle switch");
    })
    .catch(err => {
      console.error('Failed to toggle switch', err);
      toast.error("Failed to toggle switch");
    });
    
    setConfirmSwitch(null);
  };

  useEffect(() => {
    // Initial fetch to populate something immediately
    const fetchLive = () => {
      apiFetch('/api/dashboard/live')
        .then(res => res.json())
        .then(data => {
          if (data.t) {
            const date = new Date(data.t);
            if (!isNaN(date.getTime())) {
              data.t = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
          }
          setCurrentMetrics(data);
          setLiveData(prev => {
            const next = [...prev, data];
            if (next.length > 60) return next.slice(next.length - 60);
            return next;
          });
        })
        .catch(err => console.error(err));
        
      apiFetch('/api/dashboard/live-table')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map(row => {
              if (row.ts) {
                const date = new Date(row.ts);
                if (!isNaN(date.getTime())) {
                  row.ts = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                }
              }
              return row;
            });
            setLiveTableData(formatted);
          } else {
            setLiveTableData([]);
          }
        })
        .catch(err => console.error(err));
    };
    
    fetchLive();
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Solar Power', value: currentMetrics.solar, unit: 'kW', icon: '☀️', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', trend: '' },
    { label: 'Wind Power', value: currentMetrics.wind, unit: 'kW', icon: '💨', color: '#34D399', bg: 'rgba(52,211,153,0.1)', trend: '' },
    { label: 'Total Output', value: currentMetrics.total, unit: 'kW', icon: '⚡', color: '#00A1E6', bg: 'rgba(0,161,230,0.1)', trend: '' },
    { label: 'Voltage (Avg)', value: currentMetrics.avgVoltage, unit: 'V', icon: '🔌', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', trend: '' },
    { label: 'Irradiance (NA)', value: '--', unit: 'W/m²', icon: '🌤', color: '#F97316', bg: 'rgba(249,115,22,0.1)', trend: '' },
    { label: 'Wind Speed (NA)', value: '--', unit: 'm/s', icon: '🌬️', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', trend: '' },
  ];

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Instantaneous Report</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Real-time power output telemetry from all connected devices</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '0.4rem 0.9rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10B981' }}>Live — updating every 3s</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{m.icon}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: m.trend.startsWith('+') ? '#10B981' : m.trend === '0.0%' ? 'var(--text-muted)' : '#EF4444' }}>{m.trend}</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{m.label} <span style={{ color: m.color, opacity: 0.8 }}>{m.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Live Chart */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', padding: '0',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
        overflow: 'hidden', marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#F5F7F9', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Live Power Output (Last 60 readings)</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#FBBF24', fontWeight: 600 }}>☀ Solar</span>
            <span style={{ color: '#34D399', fontWeight: 600 }}>💨 Wind</span>
            <span style={{ color: '#00A1E6', fontWeight: 600 }}>⚡ Total</span>
          </div>
        </div>
        <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={liveData}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A1E6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00A1E6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="solar" stroke="#FBBF24" strokeWidth={1.5} fill="url(#solarGrad)" dot={false} />
              <Area type="monotone" dataKey="wind" stroke="#34D399" strokeWidth={1.5} fill="url(#windGrad)" dot={false} />
              <Area type="monotone" dataKey="total" stroke="#00A1E6" strokeWidth={2} fill="url(#totalGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Data Table */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset', overflow: 'hidden'
      }}>
        <div style={{ background: '#F5F7F9', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Recent Instantaneous Readings</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
            <thead>
              <tr style={{ background: '#F5F7F9', borderBottom: '1px solid var(--border-color)' }}>
                {['Timestamp', 'Device ID', 
                  'Solar P (kW)', 'Solar V', 'Solar I', 
                  'Wind P (kW)', 'Wind V', 'Wind I', 
                  'Inv. P (kW)', 'Inv. V', 'Inv. I', 
                  'Status'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.5rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveTableData.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,161,230,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.ts || '--'}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#00A1E6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.isOnline ? '#10B981' : '#EF4444', display: 'inline-block' }} title={row.isOnline ? 'Online' : 'Offline'}></span>
                    {row.device}
                  </td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: '#FBBF24', fontWeight: 600 }}>{row.solarPower}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.solarVoltage}V</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.solarCurrent}A</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>{row.windPower}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.windVoltage}V</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.windCurrent}A</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: '#00A1E6', fontWeight: 700 }}>{row.inverterPower}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.inverterVoltage}V</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.inverterCurrent}A</td>
                  <td style={{ padding: '0.7rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: statusBg[row.status] || 'rgba(107,114,128,0.1)', color: statusColor[row.status] || '#6B7280' }}>{row.status}</span>
                    <button 
                      onClick={() => handleToggleSwitch(row, row.status !== 'ON load')}
                      style={{
                        background: row.status === 'ON load' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: row.status === 'ON load' ? '#EF4444' : '#10B981',
                        border: 'none', borderRadius: '6px', padding: '0.25rem 0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title={row.status === 'ON load' ? 'Turn OFF' : 'Turn ON'}
                    >
                      <Power size={14} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
              {liveTableData.length === 0 && (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No live readings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmSwitch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setConfirmSwitch(null)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: confirmSwitch.newState ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: confirmSwitch.newState ? '#10B981' : '#EF4444' }}>
              {confirmSwitch.newState ? '⚡' : '🔌'}
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Confirm Action</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Are you sure you want to turn <strong>{confirmSwitch.newState ? 'ON' : 'OFF'}</strong> the load for device ({confirmSwitch.customMeterId || confirmSwitch.meterId})?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConfirmSwitch(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={executeToggleSwitch} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: confirmSwitch.newState ? '#10B981' : '#EF4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Yes, Turn {confirmSwitch.newState ? 'ON' : 'OFF'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstantaneousReport;
