import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Baby, TrendingUp, ClipboardList,
  Stethoscope, CalendarCheck, Syringe, ShieldCheck, Bell,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Hash, Activity, Menu
} from 'lucide-react';

// ── Nav Groups ──────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Patient Management',
    items: [
      { name: 'Parent Management',  path: '/admin-parents',   icon: Users },
      { name: 'Child Profiles',     path: '/admin-children',  icon: Baby },
      { name: 'Growth Management',  path: '/admin-growth',    icon: TrendingUp },
      { name: 'Milestone Monitor',  path: '/admin-milestones', icon: Activity },
    ],
  },
  {
    label: 'Vaccinations',
    items: [
      { name: 'Vaccine Schedules',     path: '/admin-vaccine-schedules', icon: Syringe },
      { name: 'Vaccination Registry',  path: '/admin-vaccines',          icon: ShieldCheck },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { name: 'Consultant Directory', path: '/admin-consultants',  icon: Stethoscope },
      { name: 'Appointment Center',   path: '/admin-appointments', icon: CalendarCheck },
      { name: 'Queue & Token Desk',   path: '/admin-queue',        icon: Hash },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Notification Center', path: '/admin-notifications', icon: Bell, badge: true },
      { name: 'Reports & Analytics', path: '/admin-reports',       icon: BarChart3 },
      { name: 'System Settings',     path: '/admin-settings',      icon: Settings },
    ],
  },
];

const AdminLayout = ({ children, user }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    window.localStorage.clear();
    navigate('/sign-in');
  };

  const W = collapsed ? '72px' : '260px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: W, minWidth: W,
        background: '#0F172A',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0,
        zIndex: 100, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '1.25rem 0' : '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', justifyContent: collapsed ? 'center' : 'space-between', minHeight: '70px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={18} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', lineHeight: 1.2 }}>SmartCare</p>
                <p style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Console</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="white" strokeWidth={2.5} />
            </div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748B', cursor: 'pointer', borderRadius: '7px', padding: '0.35rem', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748B'; }}>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand button (collapsed mode) */}
        {collapsed && (
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setCollapsed(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748B', cursor: 'pointer', borderRadius: '7px', padding: '0.4rem', display: 'flex' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748B'; }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '1rem 0' : '1rem 0.75rem', scrollbarWidth: 'none' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: '0.5rem' }}>
              {/* Group Label */}
              {!collapsed && (
                <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.6rem 0.75rem 0.35rem', marginBottom: '0.1rem' }}>
                  {group.label}
                </p>
              )}
              {collapsed && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.4rem 0.75rem' }} />}

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 0 : '0.75rem',
                    padding: collapsed ? '0.7rem 0' : '0.625rem 0.75rem',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: collapsed ? 0 : '9px',
                    marginBottom: '2px',
                    textDecoration: 'none',
                    position: 'relative',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))'
                      : 'transparent',
                    color: isActive ? '#A5B4FC' : '#94A3B8',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease',
                    borderLeft: isActive && !collapsed ? '2px solid #6366F1' : '2px solid transparent',
                  })}
                  className="sidebar-nav-item"
                >
                  {({ isActive }) => (
                    <>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ display: 'block' }} />
                        {item.badge && (
                          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '1.5px solid #0F172A' }} />
                        )}
                      </div>
                      {!collapsed && (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: collapsed ? '1rem 0' : '1rem 0.75rem' }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.6rem 0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                {user?.fname?.charAt(0) || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#E2E8F0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.fname || 'Administrator'}</p>
                <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>Hospital Staff</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>
                {user?.fname?.charAt(0) || 'A'}
              </div>
            </div>
          )}

          <button onClick={handleLogout}
            style={{ width: '100%', padding: collapsed ? '0.65rem 0' : '0.65rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '9px', color: '#F87171', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#F87171'; }}>
            <LogOut size={15} strokeWidth={2.5} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, marginLeft: W, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: '64px', background: 'white',
          borderBottom: '1px solid #E8ECF4',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setCollapsed(c => !c)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: '0.35rem', borderRadius: '7px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <Menu size={20} />
            </button>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search patients, vaccines, staff..."
                style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', border: '1.5px solid #E8ECF4', borderRadius: '10px', fontSize: '0.875rem', color: '#0F172A', outline: 'none', width: '280px', background: '#F8FAFC', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = '#E8ECF4'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notification Bell */}
            <button style={{ position: 'relative', background: '#F8FAFC', border: '1.5px solid #E8ECF4', borderRadius: '10px', padding: '0.55rem', cursor: 'pointer', display: 'flex', color: '#64748B', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8ECF4'; e.currentTarget.style.color = '#64748B'; }}
              onClick={() => navigate('/admin-notifications')}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '9px', height: '9px', background: '#EF4444', borderRadius: '50%', border: '2px solid white' }} />
            </button>

            {/* Divider */}
            <div style={{ width: '1px', height: '28px', background: '#E8ECF4' }} />

            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.75rem 0.4rem 0.4rem', background: '#F8FAFC', border: '1.5px solid #E8ECF4', borderRadius: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem' }}>
                {user?.fname?.charAt(0) || 'A'}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0F172A', lineHeight: 1.2 }}>{user?.fname?.split(' ')[0] || 'Admin'}</p>
                <p style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>

      <style>{`
        .sidebar-nav-item:hover { background: rgba(255,255,255,0.06) !important; color: #E2E8F0 !important; }
        nav::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
