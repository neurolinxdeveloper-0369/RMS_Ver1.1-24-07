import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, Shield, Eye, EyeOff, Mail } from 'lucide-react';
import { apiFetch } from '../utils/api';

const roleColors = { Admin: '#3B82F6', Manager: '#10B981', Viewer: '#94A3B8' };
const roleBg = { Admin: 'rgba(59,130,246,0.1)', Manager: 'rgba(16,185,129,0.1)', Viewer: 'rgba(148,163,184,0.12)' };

const ROWS = 6;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ username: '', password: '', role: 'Viewer' });
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    apiFetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      apiFetch(`/api/users/${id}`, { method: 'DELETE' })
        .then(() => {
          fetchUsers();
        })
        .catch(err => console.error(err));
    }
  };

  const handleInvite = () => {
    setLoading(true);
    apiFetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowInviteModal(false);
        setInviteForm({ username: '', password: '', role: 'Viewer' });
        fetchUsers();
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const filtered = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const paginated = filtered.slice((page - 1) * ROWS, page * ROWS);

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const managerCount = users.filter(u => u.role === 'Manager').length;
  const viewerCount = users.filter(u => u.role === 'Viewer').length;

  return (
    <div className="page-content">
      <div className="top-content-divider" style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1.5rem' }}></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Control access and permissions for all system users</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} style={{
          background: 'linear-gradient(135deg, #00A1E6, #0077B6)', color: '#fff',
          border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem',
          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: '0 4px 12px rgba(0,161,230,0.3)'
        }}>
          <UserPlus size={16} /> Create User
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: '#00A1E6', bg: 'rgba(0,161,230,0.08)' },
          { label: 'Admins', value: adminCount, icon: '🛡️', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Managers', value: managerCount, icon: '🔧', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Viewers', value: viewerCount, icon: '👁️', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
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

      {/* Filters */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', padding: '1rem 1.25rem',
        border: '1px solid var(--border-color)', marginBottom: '1rem',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by username..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['All', 'Admin', 'Manager', 'Viewer'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }} style={{
              padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              background: roleFilter === r ? '#00A1E6' : 'transparent',
              color: roleFilter === r ? '#fff' : 'var(--text-secondary)'
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset', overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#F5F7F9', borderBottom: '1px solid var(--border-color)' }}>
                {['Username', 'Role', 'Created At', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, idx) => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid var(--border-color)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)', transition: 'background 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,161,230,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,161,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👦</div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: roleBg[user.role] || roleBg['Viewer'], color: roleColors[user.role] || roleColors['Viewer'] }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => handleDelete(user.id)} title="Delete" style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', background: '#F5F7F9' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing {(page - 1) * ROWS + 1}–{Math.min(page * ROWS, filtered.length)} of {filtered.length} users</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: page === p ? '#00A1E6' : 'transparent', color: page === p ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: page === p ? 700 : 400, fontSize: '0.82rem' }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Next →</button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowInviteModal(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>✉ Create New User</h2>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Username / Email</label>
              <input type="text" placeholder="e.g. user@company.com" value={inviteForm.username}
                onChange={e => setInviteForm(f => ({ ...f, username: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Initial Password</label>
              <input type="text" placeholder="e.g. Password@123" value={inviteForm.password}
                onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Role</label>
              <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-surface-light)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <option value="Viewer">Viewer (Customer)</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleInvite} disabled={loading} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00A1E6, #0077B6)', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
