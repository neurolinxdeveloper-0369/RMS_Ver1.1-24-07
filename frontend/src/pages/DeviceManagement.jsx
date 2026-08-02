import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Wind, Sun, Zap, Wifi, WifiOff, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

const deviceTypes = ['Solar', 'Wind', 'Hybrid'];
const statusOptions = ['Active', 'Idle', 'Offline'];
const regions = ['All Regions', 'North', 'South', 'East', 'West'];



const statusColors = { Active: '#10B981', Idle: '#F59E0B', Offline: '#EF4444' };
const statusBg = { Active: 'rgba(16,185,129,0.1)', Idle: 'rgba(245,158,11,0.1)', Offline: 'rgba(239,68,68,0.1)' };
const typeColors = { Solar: '#FBBF24', Wind: '#34D399', Hybrid: '#60A5FA' };
const typeBg = { Solar: 'rgba(251,191,36,0.12)', Wind: 'rgba(52,211,153,0.12)', Hybrid: 'rgba(96,165,250,0.12)' };
const typeIcon = { Solar: '☀️', Wind: '💨', Hybrid: '⚡' };

const ROWS = 8;

const DeviceManagement = () => {
  const userRole = localStorage.getItem('userRole') || 'Viewer';
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewDevice, setViewDevice] = useState(null);
  const [showMapped, setShowMapped] = useState(true);
  const [showUnmapped, setShowUnmapped] = useState(true);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDevice, setEditDevice] = useState(null);
  const [editFormData, setEditFormData] = useState({
    location: '', capacity: '', state: '', city: '', region: '', division: '', latitude: '', longitude: '', meters: []
  });
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [telemetryDevice, setTelemetryDevice] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [confirmSwitch, setConfirmSwitch] = useState(null);

  const fetchDevices = () => {
    apiFetch('/api/devices', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setDevices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch devices', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    let interval;
    if (telemetryDevice) {
      const fetchTelemetry = () => {
        apiFetch(`/api/devices/${telemetryDevice.id}/telemetry`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
          .then(res => res.json())
          .then(data => setTelemetryData(data))
          .catch(err => console.error('Failed to fetch telemetry', err));
      };
      fetchTelemetry(); // initial fetch
      interval = setInterval(fetchTelemetry, 1000);
    }
    return () => clearInterval(interval);
  }, [telemetryDevice]);

  useEffect(() => {
    if (editDevice) {
      setEditFormData({
        location: editDevice.location || '',
        state: editDevice.state || '',
        city: editDevice.city || '',
        region: editDevice.region || '',
        division: editDevice.division || '',
        latitude: editDevice.latitude || '',
        longitude: editDevice.longitude || '',
        capacity: editDevice.capacity || '',
        meters: editDevice.meters.map(m => ({ meterId: m.originalId, type: m.type || '' }))
      });
    }
  }, [editDevice]);

  const handleFetchLatLong = async () => {
    const { city, state } = editFormData;
    if (!city || !state) {
      toast.error("Please enter at least City and State to fetch coordinates.");
      return;
    }
    setFetchingLocation(true);
    try {
      const query = `${city}, ${state}`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setEditFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat).toFixed(6),
          longitude: parseFloat(data[0].lon).toFixed(6)
        }));
        toast.success("Coordinates fetched successfully!");
      } else {
        toast.error("Could not find coordinates for this location.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coordinates. Please try again later.");
    }
    setFetchingLocation(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    apiFetch(`/api/devices/${editDevice.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editFormData)
    }).then(res => {
      if (res.ok) {
        setEditDevice(null);
        toast.success("Device updated successfully!");
        fetchDevices();
      } else {
        toast.error("Failed to update device");
      }
    }).catch(err => {
      console.error(err);
      toast.error("An error occurred");
    });
  };
  const handleToggleSwitch = (meter, newState) => {
    setConfirmSwitch({ meter, newState });
  };

  const executeToggleSwitch = () => {
    if (!confirmSwitch) return;
    const { meter, newState } = confirmSwitch;

    // Optimistic update
    setTelemetryData(prev => prev.map(m => m.meterId === meter.meterId ? { ...m, switchState: newState } : m));

    apiFetch(`/api/devices/${telemetryDevice.id}/meters/${meter.meterId}/switch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ state: newState })
    })
      .then(res => {
        if (res.ok) toast.success("Switch toggled successfully!");
        else toast.error("Failed to toggle switch");
      })
      .catch(err => {
        console.error('Failed to toggle switch', err);
        toast.error("Failed to toggle switch");
      });

    setConfirmSwitch(null);
  };

  const filtered = devices.filter(d => {
    const matchSearch = (d.name && d.name.toLowerCase().includes(search.toLowerCase())) ||
      (d.id && d.id.toLowerCase().includes(search.toLowerCase())) ||
      (d.location && d.location.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'All' || d.type === typeFilter;
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchRegion = regionFilter === 'All Regions' || d.region === regionFilter;

    // Mapped logic: if neither checked, show none. If both checked, show all.
    const matchMapped = (showMapped && d.mapped) || (showUnmapped && !d.mapped);

    return matchSearch && matchType && matchStatus && matchRegion && matchMapped;
  });

  const totalPages = Math.ceil(filtered.length / ROWS);
  const paginated = filtered.slice((page - 1) * ROWS, page * ROWS);
  const activeCount = devices.filter(d => d.status === 'Active').length;
  const idleCount = devices.filter(d => d.status === 'Idle').length;
  const offlineCount = devices.filter(d => d.status === 'Offline').length;

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Device Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Manage all solar & wind energy monitoring devices
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showMapped}
              onChange={(e) => {
                setShowMapped(e.target.checked);
                if (e.target.checked) setShowUnmapped(false);
              }}
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#00A1E6' }}
            />
            Mapped
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showUnmapped}
              onChange={(e) => {
                setShowUnmapped(e.target.checked);
                if (e.target.checked) setShowMapped(false);
              }}
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#00A1E6' }}
            />
            Unmapped
          </label>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Devices', value: devices.length, icon: '📡', color: '#00A1E6', bg: 'rgba(0,161,230,0.08)' },
          { label: 'Active', value: activeCount, icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Idle', value: idleCount, icon: '⏸', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Offline', value: offlineCount, icon: '❌', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem 1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{kpi.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem 1.25rem',
        border: '1px solid var(--border-color)', marginBottom: '1rem',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="Search devices..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              background: 'var(--bg-surface-light)', color: 'var(--text-primary)',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Type filter toggles */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['All', 'Solar', 'Wind', 'Hybrid'].map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} style={{
              padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              background: typeFilter === t ? '#00A1E6' : 'transparent',
              color: typeFilter === t ? '#fff' : 'var(--text-secondary)'
            }}>{t === 'Solar' ? '☀ ' : t === 'Wind' ? '💨 ' : t === 'Hybrid' ? '⚡ ' : ''}{t}</button>
          ))}
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{
          padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)',
          background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer'
        }}>
          <option value="All">All Status</option>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>

        <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1); }} style={{
          padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)',
          background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer'
        }}>
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>

        {selectedIds.length > 0 && (
          <button style={{
            padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}>🗑 Delete {selectedIds.length} selected</button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#F5F7F9', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: '40px' }}>
                  <input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? paginated.map(d => d.id) : [])} />
                </th>
                {['Device ID', 'Meter ID', 'Type', 'Location', 'Capacity', 'Meters', 'Status', 'Last Seen', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((device, idx) => (
                <tr key={device.id} style={{
                  borderBottom: '1px solid var(--border-color)',
                  background: selectedIds.includes(device.id) ? 'rgba(0,161,230,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                  transition: 'background 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,161,230,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = selectedIds.includes(device.id) ? 'rgba(0,161,230,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <input type="checkbox" checked={selectedIds.includes(device.id)} onChange={() => toggleSelect(device.id)} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#00A1E6', fontWeight: 600 }}>{device.id}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {device.meters.map(m => m.customId || m.originalId).join(', ')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {device.type ? (
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                        background: typeBg[device.type], color: typeColors[device.type]
                      }}>{typeIcon[device.type]} {device.type}</span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{device.location || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{device.capacity ? `${device.capacity} kW` : '-'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '140px' }}>
                      {device.meters && device.meters.map(m => (
                        <span key={m.originalId} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(0,161,230,0.1)', color: '#00A1E6', fontSize: '0.7rem', fontWeight: 600 }}>
                          {m.type ? `${m.type} (${m.originalId})` : m.originalId}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: statusBg[device.status], color: statusColors[device.status],
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[device.status], display: 'inline-block' }}></span>
                      {device.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{device.lastSeen}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => setViewDevice(device)} title="View" style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: '#00A1E6' }}><Eye size={14} /></button>
                      <button onClick={() => setEditDevice(device)} title="Edit" style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={14} /></button>
                      <button title="Delete" style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', background: '#F5F7F9' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {(page - 1) * ROWS + 1}–{Math.min(page * ROWS, filtered.length)} of {filtered.length} devices
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: page === p ? '#00A1E6' : 'transparent', color: page === p ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: page === p ? 700 : 400, fontSize: '0.82rem' }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Next →</button>
          </div>
        </div>
      </div>

      {/* Device Detail Modal */}
      {viewDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewDevice(null)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{viewDevice.name}</h2>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00A1E6' }}>{viewDevice.id}</span>
              </div>
              <button onClick={() => setViewDevice(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              {[
                ['Type', `${typeIcon[viewDevice.type]} ${viewDevice.type}`],
                ['Status', viewDevice.status],
                ['Capacity', `${viewDevice.capacity} kW`],
                ['Location', viewDevice.location],
                ['Region', viewDevice.region],
                ['IP Address', viewDevice.ipAddress],
                ['Firmware', viewDevice.firmware],
                ['Installed', viewDevice.installed],
                ['Last Seen', viewDevice.lastSeen],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg-surface-light)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => { setEditDevice(viewDevice); setViewDevice(null); }} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>✏ Edit Device</button>
              <button onClick={() => { setTelemetryDevice(viewDevice); setViewDevice(null); }} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00A1E6, #0077B6)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>📊 View Telemetry</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>Edit {editDevice.id}</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {editFormData.meters.map((meter, index) => (
                <div key={meter.meterId} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Meter {meter.meterId} Type *</label>
                  <select
                    required
                    value={meter.type}
                    onChange={(e) => {
                      const newMeters = [...editFormData.meters];
                      newMeters[index].type = e.target.value;
                      setEditFormData({ ...editFormData, meters: newMeters });
                    }}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select Type...</option>
                    <option value="Solar">Solar</option>
                    <option value="Wind">Wind</option>
                    <option value="Inverter">Inverter</option>
                  </select>
                </div>
              ))}

              <div style={{ background: 'var(--bg-surface-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Location Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>State</label>
                    <input
                      type="text"
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>City</label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Region</label>
                    <input
                      type="text"
                      value={editFormData.region}
                      onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                      placeholder="e.g. West"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Division</label>
                    <input
                      type="text"
                      value={editFormData.division}
                      onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                      placeholder="e.g. Mumbai Metro"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Latitude</label>
                    <input
                      type="number" step="any"
                      value={editFormData.latitude}
                      onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Longitude</label>
                    <input
                      type="number" step="any"
                      value={editFormData.longitude}
                      onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFetchLatLong}
                  disabled={fetchingLocation}
                  style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', background: 'rgba(0,161,230,0.1)', color: '#00A1E6', border: '1px solid rgba(0,161,230,0.3)', borderRadius: '8px', cursor: fetchingLocation ? 'wait' : 'pointer', fontWeight: 600, marginTop: '0.3rem' }}
                >
                  {fetchingLocation ? 'Fetching Coordinates...' : '🌍 Auto-Fetch Lat/Long (Uses City/State)'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Capacity (Optional)</label>
                <input
                  type="number"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                  placeholder="e.g. 150"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditDevice(null)} style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#00A1E6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telemetry Modal */}
      {telemetryDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setTelemetryDevice(null)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '700px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Live Telemetry: {telemetryDevice.id}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updating every 1 second</span>
              </div>
              <button onClick={() => setTelemetryDevice(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {telemetryData.map(meter => {
                // Calculate age using 10-second timeout rule
                let isOffline = true;
                if (meter.updatedAt) {
                  const updatedDate = new Date(meter.updatedAt);
                  const now = new Date();
                  const diffSeconds = (now - updatedDate) / 1000;
                  isOffline = diffSeconds > 10;
                }

                return (
                  <div key={meter.meterId} style={{ border: `1px solid ${isOffline ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-surface-light)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Meter: {meter.customMeterId || meter.meterId} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>({meter.meterType || 'Unknown Type'})</span></h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {meter.meterType === 'Inverter' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>INVERTER SWITCH</span>
                            <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', opacity: userRole === 'Viewer' ? 0.5 : 1 }}>
                              <input
                                type="checkbox"
                                checked={meter.switchState || false}
                                onChange={(e) => {
                                  if (userRole !== 'Viewer') {
                                    handleToggleSwitch(meter, e.target.checked);
                                  } else {
                                    alert('Viewers do not have permission to physically toggle switches.');
                                  }
                                }}
                                disabled={userRole === 'Viewer'}
                                style={{ opacity: 0, width: 0, height: 0 }}
                              />
                              <span style={{
                                position: 'absolute', cursor: userRole === 'Viewer' ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: meter.switchState ? '#10B981' : '#CBD5E1', borderRadius: '20px',
                                transition: '0.3s'
                              }}>
                                <span style={{
                                  position: 'absolute', height: '16px', width: '16px', left: meter.switchState ? '18px' : '2px', bottom: '2px',
                                  backgroundColor: 'white', borderRadius: '50%', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                }}></span>
                              </span>
                            </label>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOffline ? '#EF4444' : '#10B981', display: 'inline-block', boxShadow: `0 0 8px ${isOffline ? '#EF4444' : '#10B981'}` }}></span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isOffline ? '#EF4444' : '#10B981', textTransform: 'uppercase' }}>{isOffline ? 'Offline' : 'Live'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>POWER</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00A1E6' }}>{meter.power !== null ? meter.power : '--'} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kW</span></div>
                      </div>
                      <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>ENERGY</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>{typeof meter.energy === 'number' ? meter.energy.toFixed(3) : (meter.energy !== null ? meter.energy : '--')} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kWh</span></div>
                      </div>
                      <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>VOLTAGE</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F59E0B' }}>{meter.voltage !== null ? meter.voltage : '--'} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>V</span></div>
                      </div>
                      <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>CURRENT</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#8B5CF6' }}>{meter.current !== null ? meter.current : '--'} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>A</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {telemetryData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No telemetry data found for this device.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmSwitch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setConfirmSwitch(null)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: confirmSwitch.newState ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: confirmSwitch.newState ? '#10B981' : '#EF4444' }}>
              {confirmSwitch.newState ? '⚡' : '🔌'}
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Confirm Action</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Are you sure you want to turn <strong>{confirmSwitch.newState ? 'ON' : 'OFF'}</strong> the inverter ({confirmSwitch.meter.customMeterId || confirmSwitch.meter.meterId})?
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

export default DeviceManagement;
