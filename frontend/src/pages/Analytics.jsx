import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiFetch } from '../utils/api';

const faultColor = { critical: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
const faultBg = { critical: 'rgba(239,68,68,0.1)', warning: 'rgba(245,158,11,0.1)', info: 'rgba(59,130,246,0.1)' };

const Analytics = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [data, setData] = useState({
    monthlyData: [],
    typeDistribution: [],
    topFaults: [],
    kpis: {
      totalGeneration: 0, peakOutput: 0, avgDailyGen: 0, uptime: 100, co2Avoided: 0, revenue: 0
    }
  });

  useEffect(() => {
    apiFetch(`/api/dashboard/analytics?year=${selectedYear}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.kpis) {
          setData(resData);
        }
      })
      .catch(err => console.error(err));
  }, [selectedYear]);

  const kpis = [
    { label: 'Total Generation', value: (data.kpis.totalGeneration / 1000).toFixed(1), unit: 'MWh', icon: '⚡', color: '#00A1E6', bg: 'rgba(0,161,230,0.1)', sub: `YTD ${selectedYear}` },
    { label: 'Peak Output', value: data.kpis.peakOutput.toFixed(1), unit: 'kW', icon: '🔝', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', sub: `In ${selectedYear}` },
    { label: 'Avg Daily Gen', value: data.kpis.avgDailyGen.toFixed(1), unit: 'kWh', icon: '📊', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', sub: 'Per device avg' },
    { label: 'System Uptime', value: data.kpis.uptime.toFixed(1), unit: '%', icon: '🟢', color: '#10B981', bg: 'rgba(16,185,129,0.1)', sub: 'Currently' },
    { label: 'CO₂ Avoided', value: data.kpis.co2Avoided.toFixed(1), unit: 'tons', icon: '🌱', color: '#34D399', bg: 'rgba(52,211,153,0.1)', sub: 'Environmental impact' },
    { label: 'Revenue Est.', value: `₹${data.kpis.revenue.toFixed(2)}`, unit: 'Cr', icon: '💰', color: '#F97316', bg: 'rgba(249,115,22,0.1)', sub: 'At ₹6.05/kWh' },
  ];

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Performance insights for your hybrid solar & wind energy system</p>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
          <option>2024</option>
          <option>2023</option>
          <option>2022</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset',
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '0.6rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>{kpi.unit}</span></div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

        {/* Monthly Bar Chart */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
          overflow: 'hidden'
        }}>
          <div style={{ background: '#F5F7F9', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Monthly Generation — Solar vs Wind (kWh)</span>
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#FBBF24', fontWeight: 600 }}>☀ Solar</span>
              <span style={{ color: '#34D399', fontWeight: 600 }}>💨 Wind</span>
            </div>
          </div>
          <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`${v.toLocaleString()} kWh`]} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Bar dataKey="solar" fill="#FBBF24" radius={[3, 3, 0, 0]} name="Solar" />
                <Bar dataKey="wind" fill="#34D399" radius={[3, 3, 0, 0]} name="Wind" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Type Distribution Donut */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
          overflow: 'hidden'
        }}>
          <div style={{ background: '#F5F7F9', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Device Type Distribution</span>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={data.typeDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {data.typeDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              {data.typeDistribution.map(t => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color, display: 'inline-block' }}></span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t.name} ({t.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Analytics;
