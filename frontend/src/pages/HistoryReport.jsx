import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { apiFetch } from '../utils/api';

// Removed mock data generator

const HistoryReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [energyType, setEnergyType] = useState('combined');
  const [chartType, setChartType] = useState('line');
  const [applied, setApplied] = useState({ from: weekAgo, to: today, type: 'combined' });

  const [data, setData] = useState([]);

  React.useEffect(() => {
    const days = Math.max(1, Math.round((new Date(applied.to) - new Date(applied.from)) / 86400000));
    const typeParam = applied.type === 'combined' ? 'all' : applied.type;
    
    apiFetch(`/api/dashboard/historical?days=${days}&type=${typeParam}`)
      .then(res => res.json())
      .then(resData => {
        setData(Array.isArray(resData) ? resData : []);
      })
      .catch(err => console.error(err));
  }, [applied]);

  const totalSolar = data.reduce((s, d) => s + (d.solar || 0), 0);
  const totalWind = data.reduce((s, d) => s + (d.wind || 0), 0);
  const totalGen = data.reduce((s, d) => s + (d.total || 0), 0);
  const avgEff = data.length > 0 ? (data.reduce((s, d) => s + (d.efficiency || 0), 0) / data.length).toFixed(1) : "0.0";

  const handleApply = () => setApplied({ from: fromDate, to: toDate, type: energyType });

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ['Date', 'Solar Generation (kW)', 'Wind Generation (kW)', 'Total Generation (kW)', 'Average Efficiency (%)'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.date}"`,
        row.solar || 0,
        row.wind || 0,
        row.total || 0,
        row.efficiency || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `history_report_${applied.from}_to_${applied.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>History Report</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Historical energy generation data across all devices</p>
        </div>
        <button onClick={handleExportCSV} style={{
          background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', borderRadius: '8px',
          padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
        }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem 1.25rem',
        border: '1px solid var(--border-color)', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From:</label>
          <input type="date" value={fromDate} max={today} onChange={e => setFromDate(e.target.value)} style={{ padding: '0.45rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To:</label>
          <input type="date" value={toDate} max={today} onChange={e => setToDate(e.target.value)} style={{ padding: '0.45rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {[['combined', '⚡ Combined'], ['solar', '☀ Solar'], ['wind', '💨 Wind']].map(([val, lbl]) => (
            <button key={val} onClick={() => setEnergyType(val)} style={{
              padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              background: energyType === val ? '#00A1E6' : 'transparent',
              color: energyType === val ? '#fff' : 'var(--text-secondary)'
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', marginLeft: 'auto' }}>
          {[['line', '〰 Line'], ['bar', '▌Bar']].map(([val, lbl]) => (
            <button key={val} onClick={() => setChartType(val)} style={{
              padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              background: chartType === val ? '#F5F7F9' : 'transparent',
              color: 'var(--text-secondary)'
            }}>{lbl}</button>
          ))}
        </div>
        <button onClick={handleApply} style={{
          padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #00A1E6, #0077B6)', color: '#fff',
          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,161,230,0.25)'
        }}>Apply</button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Solar Generated', value: `${(totalSolar / 1000).toFixed(1)} MWh`, icon: '☀️', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
          { label: 'Wind Generated', value: `${(totalWind / 1000).toFixed(1)} MWh`, icon: '💨', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
          { label: 'Total Generation', value: `${(totalGen / 1000).toFixed(1)} MWh`, icon: '⚡', color: '#00A1E6', bg: 'rgba(0,161,230,0.1)' },
          { label: 'Avg Efficiency', value: `${avgEff}%`, icon: '📈', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem 1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{kpi.icon}</div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', padding: '0',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
        overflow: 'hidden', marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#F5F7F9', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Energy Generation Trend — {applied.from} to {applied.to}</span>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            {applied.type !== 'wind' && <span style={{ color: '#FBBF24', fontWeight: 600 }}>☀ Solar (kWh)</span>}
            {applied.type !== 'solar' && <span style={{ color: '#34D399', fontWeight: 600 }}>💨 Wind (kWh)</span>}
          </div>
        </div>
        <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
          <ResponsiveContainer width="100%" height={240}>
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={Math.floor(data.length / 7)} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                {applied.type !== 'wind' && <Line type="monotone" dataKey="solar" stroke="#FBBF24" strokeWidth={2} dot={false} name="Solar kWh" />}
                {applied.type !== 'solar' && <Line type="monotone" dataKey="wind" stroke="#34D399" strokeWidth={2} dot={false} name="Wind kWh" />}
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={Math.floor(data.length / 7)} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                {applied.type !== 'wind' && <Bar dataKey="solar" fill="#FBBF24" radius={[3, 3, 0, 0]} name="Solar kWh" />}
                {applied.type !== 'solar' && <Bar dataKey="wind" fill="#34D399" radius={[3, 3, 0, 0]} name="Wind kWh" />}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset', overflow: 'hidden'
      }}>
        <div style={{ background: '#F5F7F9', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Daily Generation Log</span>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr style={{ background: '#F5F7F9', borderBottom: '1px solid var(--border-color)' }}>
                {['Date', 'Solar Gen (kWh)', 'Wind Gen (kWh)', 'Total (kWh)', 'Efficiency', 'Export'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,161,230,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.65rem 1rem', fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.date}</td>
                  <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#FBBF24', fontWeight: 600 }}>{row.solar.toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#34D399', fontWeight: 600 }}>{row.wind.toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#00A1E6', fontWeight: 700 }}>{row.total.toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', fontSize: '0.83rem', color: row.efficiency > 93 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>{row.efficiency}%</td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <button style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10B981', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                      ↓ CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryReport;
