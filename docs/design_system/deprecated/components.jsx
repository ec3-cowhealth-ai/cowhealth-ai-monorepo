/* global React */
const { useState, useMemo } = React;

/* ============================================================
   ICONS — minimal Lucide-style outline set
============================================================ */
const ICONS = {
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35',
  menu: 'M3 6h18M3 12h18M3 18h18',
  x: 'M18 6 6 18M6 6l12 12',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 6 6 6-6 6',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm18 15-6-6-6 6',
  plus: 'M12 5v14M5 12h14',
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  alert: 'M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  map: 'M9 4 3 7v13l6-3 6 3 6-3V4l-6 3-6-3ZM9 4v13M15 7v13',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  settings: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  thermo: 'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z',
  heart: 'M3.5 12h3l2-5 4 10 2-5h6',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  drop: 'M12 2.69 5.64 9.05a8 8 0 0 0 11.31 11.31A8 8 0 0 0 18.36 9.05Z',
  wifi: 'M5 12.55a11 11 0 0 1 14 0M2 8.82a15 15 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0M12 20h.01',
  wifiOff: 'M2 2 22 22M8.5 16.43a6 6 0 0 1 7 0M19 12.55a11 11 0 0 0-3.47-2.17M2 8.82a15 15 0 0 1 4.17-2.65M5 12.55a11 11 0 0 1 5.17-2.39M22 8.82a15 15 0 0 0-11.18-3.78M12 20h.01',
  battery: 'M3 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3ZM22 11v2',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  lock: 'M5 11h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM7 11V7a5 5 0 0 1 10 0v4',
  calendar: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 10h18M8 2v4M16 2v4',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3Z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  check: 'm5 12 5 5L20 7',
  info: 'M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  pulse: 'M22 12h-4l-3 9L9 3l-3 9H2',
  logOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  cloud: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z',
  signal: 'M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16',
};
function Icon({ n, s = 18, c = 'currentColor', sw = 1.6, fill = 'none', style }) {
  const d = ICONS[n] || '';
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}

/* Cow logo mark */
function CowMark({ s = 28, primary = 'var(--verdigris)', accent = 'var(--pearl-aqua)' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
      <path d="M8 14c0-4 3-7 7-7h10c4 0 7 3 7 7v3c0 5-3 9-7 11-1 .5-2 1-3 1h-4c-1 0-2-.5-3-1-4-2-7-6-7-11v-3Z" stroke={primary} strokeWidth="2"/>
      <path d="M8 14c-2 0-3-1-3-3s1-3 2-3M32 14c2 0 3-1 3-3s-1-3-2-3" stroke={primary} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="18" r="1.4" fill={primary}/>
      <circle cx="24" cy="18" r="1.4" fill={primary}/>
      <path d="M18 24c.5.7 1.2 1 2 1s1.5-.3 2-1" stroke={primary} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M28 5c1 1.2 2 1.2 3 .5M30 7c.5 1 1.5 1.5 2.5 1" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

/* ============================================================
   PHONE FRAME — 390×844 iPhone-style bezel
============================================================ */
function PhoneFrame({ children, label, time = '08:42', light = false }) {
  return (
    <div style={{ width: 414, padding: 12, background: 'transparent' }}>
      <div style={{
        width: 390, height: 844, position: 'relative', margin: '0 auto',
        background: light ? 'var(--snow)' : 'var(--bg-app)',
        borderRadius: 48,
        boxShadow: '0 0 0 10px #1a1c1c, 0 0 0 11px #2a2c2c, 0 30px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        color: light ? 'var(--onyx)' : 'var(--text-primary)',
      }}>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 34, background: '#000', borderRadius: 999, zIndex: 50,
        }}/>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 54,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px 0', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
          color: light ? 'var(--onyx)' : 'var(--text-primary)', zIndex: 40,
        }}>
          <span>{time}</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: .9 }}>
            <Icon n="signal" s={15} sw={2}/>
            <Icon n="wifi" s={14} sw={2}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
              <span style={{ width: 22, height: 11, border: '1.4px solid currentColor', borderRadius: 3, padding: 1, position: 'relative', display: 'inline-block' }}>
                <span style={{ display: 'block', width: '78%', height: '100%', background: 'currentColor', borderRadius: 1 }}/>
              </span>
            </span>
          </span>
        </div>
        {/* Screen content */}
        <div style={{ position: 'absolute', inset: 0, paddingTop: 54, paddingBottom: 0, overflow: 'hidden' }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, background: light ? 'rgba(19,21,21,0.8)' : 'rgba(255,250,251,0.65)', borderRadius: 99,
        }}/>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED UI
============================================================ */
function AppBar({ title, left, right, sub }) {
  return (
    <div style={{ padding: '8px 16px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function IconBtn({ n, onClick, badge, ghost = true, size = 36 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999, border: 0, cursor: 'pointer', position: 'relative',
      background: ghost ? 'transparent' : 'var(--bg-elev-1)',
      color: 'var(--text-primary)',
    }}>
      <Icon n={n} s={20}/>
      {badge && <span style={{
        position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 99,
        background: 'var(--danger)', boxShadow: '0 0 0 2px var(--bg-app)',
      }}/>}
    </button>
  );
}

function Btn({ children, variant = 'primary', full, icon, size = 'md', onClick }) {
  const heights = { sm: 36, md: 48, lg: 56 };
  const styles = {
    primary: { background: 'var(--primary)', color: 'var(--primary-on)' },
    accent: { background: 'var(--accent)', color: 'var(--accent-on)' },
    ghost: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    soft: { background: 'var(--primary-soft)', color: 'var(--accent)' },
  };
  return (
    <button onClick={onClick} style={{
      height: heights[size], padding: '0 20px', borderRadius: 12, border: 0, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em',
      width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...styles[variant],
    }}>
      {icon && <Icon n={icon} s={18}/>}
      {children}
    </button>
  );
}

function Chip({ children, tone = 'neutral', icon, size = 'md' }) {
  const tones = {
    neutral: { bg: 'var(--bg-elev-2)', fg: 'var(--text-secondary)' },
    primary: { bg: 'var(--primary-soft)', fg: 'var(--accent)' },
    success: { bg: 'rgba(125,226,209,0.14)', fg: 'var(--accent)' },
    warn:    { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
    danger:  { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
    info:    { bg: 'var(--info-soft)', fg: 'var(--info)' },
  };
  const t = tones[tone];
  const small = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '3px 8px' : '5px 10px',
      borderRadius: 999, background: t.bg, color: t.fg,
      fontSize: small ? 11 : 12, fontWeight: 600, letterSpacing: '0.01em',
      lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      {icon && <Icon n={icon} s={small ? 11 : 13}/>}
      {children}
    </span>
  );
}

function Card({ children, p = 16, style }) {
  return (
    <div style={{
      background: 'var(--bg-elev-1)', borderRadius: 16, padding: p,
      border: '1px solid var(--border-subtle)', ...style,
    }}>{children}</div>
  );
}

function StatusDot({ tone = 'success', pulse }) {
  const tones = { success: 'var(--success)', warn: 'var(--warning)', danger: 'var(--danger)', muted: 'var(--text-muted)' };
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: 99, background: tones[tone] }}/>
      {pulse && <span style={{ position: 'absolute', inset: -3, borderRadius: 99, background: tones[tone], opacity: 0.3, animation: 'cowPulse 1.6s ease-out infinite' }}/>}
    </span>
  );
}

function Battery({ pct = 78, mini }) {
  const tone = pct < 20 ? 'var(--danger)' : pct < 40 ? 'var(--warning)' : 'var(--accent)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: mini ? 10 : 11, color: 'var(--text-secondary)' }}>
      <span style={{ position: 'relative', width: 18, height: 9, border: '1px solid var(--border-strong)', borderRadius: 2, padding: 1 }}>
        <span style={{ display: 'block', width: pct + '%', height: '100%', background: tone, borderRadius: 1 }}/>
        <span style={{ position: 'absolute', right: -3, top: 2, width: 2, height: 3, background: 'var(--border-strong)', borderRadius: 1 }}/>
      </span>
      {pct}%
    </span>
  );
}

/* ============================================================
   SVG LINE CHART
============================================================ */
function LineChart({ data, w = 322, h = 140, yMin = 36, yMax = 41, thresholds = [], unit = '°C', color = 'var(--accent)' }) {
  const pad = { l: 28, r: 8, t: 8, b: 22 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const xs = (i) => pad.l + (i / (data.length - 1)) * iw;
  const ys = (v) => pad.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const path = data.map((v, i) => `${i ? 'L' : 'M'} ${xs(i)} ${ys(v)}`).join(' ');
  const area = `${path} L ${xs(data.length - 1)} ${pad.t + ih} L ${xs(0)} ${pad.t + ih} Z`;
  const yTicks = 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lcg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* grid */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = pad.t + (ih * i) / yTicks;
        const v = yMax - ((yMax - yMin) * i) / yTicks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="rgba(255,250,251,0.06)" strokeDasharray="2 4"/>
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="rgba(255,250,251,0.42)" fontFamily="var(--font-mono)">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {/* threshold band */}
      {thresholds.map((t, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={ys(t.v)} y2={ys(t.v)} stroke={t.c || 'var(--danger)'} strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
      ))}
      <path d={area} fill="url(#lcg)"/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((v, i) => (i % 2 === 0) && <circle key={i} cx={xs(i)} cy={ys(v)} r="2.4" fill={color}/>)}
      {/* x labels */}
      {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
        <text key={i} x={xs(i)} y={h - 6} textAnchor="middle" fontSize="9" fill="rgba(255,250,251,0.42)" fontFamily="var(--font-mono)">{i}h</text>
      ))}
    </svg>
  );
}

/* ============================================================
   BOTTOM TAB BAR
============================================================ */
function TabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'rebanho', label: 'Rebanho', icon: 'list' },
    { id: 'alerts', label: 'Alertas', icon: 'bell' },
    { id: 'mapa', label: 'Mapa', icon: 'map' },
    { id: 'perfil', label: 'Perfil', icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 78,
      background: 'rgba(19,21,21,0.92)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex', padding: '8px 8px 22px',
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} style={{
            flex: 1, background: 'transparent', border: 0, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.02em',
          }}>
            <span style={{ position: 'relative' }}>
              {on && <span style={{ position: 'absolute', inset: -6, borderRadius: 12, background: 'var(--primary-soft)' }}/>}
              <Icon n={t.icon} s={20} sw={on ? 2 : 1.6} style={{ position: 'relative' }}/>
            </span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* CSS helpers */
const sharedStyle = document.createElement('style');
sharedStyle.textContent = `
  @keyframes cowPulse { 0% { transform: scale(1); opacity: .4 } 100% { transform: scale(2.6); opacity: 0 } }
  @keyframes cowSpin { to { transform: rotate(360deg) } }
  .scroll::-webkit-scrollbar { display: none }
`;
document.head.appendChild(sharedStyle);

Object.assign(window, { Icon, CowMark, PhoneFrame, AppBar, IconBtn, Btn, Chip, Card, StatusDot, Battery, LineChart, TabBar });
