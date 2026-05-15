/* global React, PhoneFrame, AppBar, IconBtn, Btn, Chip, Card, StatusDot, Battery, LineChart, TabBar, Icon, CowMark */
const { useState } = React;

/* Mock dataset */
const HERD = [
  { id: '007', name: 'Mimosa',   tag: 'BR-3401-007', breed: 'Holandesa',   temp: 39.1, hr: 78, act: 'Repouso',  status: 'ok',     risk: 12, batt: 78, conn: 'on',  farm: 'FEGA · Estábulo A', updated: 'há 3 min',  prepart: false },
  { id: '014', name: 'Estrela',  tag: 'BR-3401-014', breed: 'Jersey',      temp: 40.2, hr: 96, act: 'Inquieta', status: 'crit',   risk: 84, batt: 64, conn: 'on',  farm: 'FEGA · Estábulo A', updated: 'há 1 min',  prepart: false },
  { id: '022', name: 'Mocinha',  tag: 'BR-3401-022', breed: 'Holandesa',   temp: 39.4, hr: 88, act: 'Pastando', status: 'warn',   risk: 41, batt: 22, conn: 'off', farm: 'FEGA · Pré-parto',  updated: 'há 14 min', prepart: true  },
  { id: '031', name: 'Pampa',    tag: 'BR-3401-031', breed: 'Girolando',   temp: 38.9, hr: 72, act: 'Ruminando',status: 'ok',     risk: 8,  batt: 91, conn: 'on',  farm: 'FEGA · Estábulo B', updated: 'há 5 min',  prepart: false },
  { id: '045', name: 'Aurora',   tag: 'BR-3401-045', breed: 'Holandesa',   temp: 39.0, hr: 74, act: 'Pastando', status: 'ok',     risk: 6,  batt: 88, conn: 'on',  farm: 'FEGA · Estábulo B', updated: 'há 2 min',  prepart: false },
  { id: '048', name: 'Brisa',    tag: 'BR-3401-048', breed: 'Jersey',      temp: 39.6, hr: 84, act: 'Repouso',  status: 'warn',   risk: 38, batt: 45, conn: 'on',  farm: 'FEGA · Pré-parto',  updated: 'há 8 min',  prepart: true  },
];

const TEMP_SERIES = [38.9, 39.0, 39.1, 39.3, 39.6, 39.9, 40.2, 40.0, 39.7, 39.4];
const HR_SERIES   = [72, 74, 78, 82, 88, 92, 96, 94, 89, 85];
const ACT_SERIES  = [12, 18, 24, 16, 9,  6,  4,  6,  10, 14];

/* ============================================================
   1. SPLASH
============================================================ */
function SplashScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0 24px 60px', background: 'radial-gradient(120% 70% at 50% 30%, rgba(51,153,137,0.18), transparent 60%), var(--bg-app)' }}>
      <div/>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', width: 96, height: 96, display: 'grid', placeItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--primary-soft)', animation: 'cowPulse 2s ease-out infinite' }}/>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--bg-elev-2)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', position: 'relative' }}>
            <CowMark s={48}/>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>CowHealth <span style={{ color: 'var(--accent)' }}>AI</span></div>
          <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>Pecuária de precisão · Saúde em tempo real</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
          <StatusDot tone="success" pulse/> <span>Sincronizando coleiras…</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>Fazenda Experimental Gralha Azul · PUCPR · v1.7</div>
      </div>
    </div>
  );
}

/* ============================================================
   2. ONBOARDING
============================================================ */
function OnboardingScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CowMark s={22}/> <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>CowHealth AI</span></div>
        <button style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Pular</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        {/* Hero illustration */}
        <div style={{ height: 280, position: 'relative', borderRadius: 24, background: 'linear-gradient(160deg, var(--bg-elev-1), var(--bg-elev-2))', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          {/* Grid bg */}
          <svg viewBox="0 0 320 280" width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
            <defs>
              <pattern id="ogrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="rgba(125,226,209,0.08)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="320" height="280" fill="url(#ogrid)"/>
            {/* heart line trace */}
            <path d="M0 180 L60 180 L75 140 L90 200 L110 100 L125 220 L140 180 L320 180" stroke="var(--pearl-aqua)" strokeWidth="2" fill="none" opacity="0.85"/>
            {/* connection rings around cow */}
            {[40, 60, 80].map((r, i) => <circle key={i} cx="160" cy="150" r={r} fill="none" stroke="var(--verdigris)" strokeWidth="1" opacity={0.18 + i * 0.05} strokeDasharray="2 4"/>)}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-app)', border: '2px solid var(--primary)', display: 'grid', placeItems: 'center', boxShadow: '0 0 40px rgba(51,153,137,0.45)' }}>
              <CowMark s={36}/>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <Chip tone="success" icon="check" size="sm">Coleira ativa</Chip>
          </div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <Chip tone="primary" size="sm">39.1 °C</Chip>
            <Chip tone="primary" size="sm">78 bpm</Chip>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>O rebanho<br/>monitorado em <span style={{ color: 'var(--accent)' }}>tempo real</span>.</div>
          <p style={{ marginTop: 14, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.5 }}>Coleiras inteligentes lêem temperatura, frequência cardíaca e movimento de cada vaca — direto no seu bolso.</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 24, height: 4, borderRadius: 99, background: 'var(--accent)' }}/>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--bg-elev-3)' }}/>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--bg-elev-3)' }}/>
        </div>
        <Btn icon="chevronRight" size="md">Próximo</Btn>
      </div>
    </div>
  );
}

/* ============================================================
   3. LOGIN
============================================================ */
function LoginScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '32px 24px 32px', background: 'radial-gradient(110% 60% at 50% 0%, rgba(51,153,137,0.14), transparent 65%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <CowMark s={28}/>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>CowHealth <span style={{ color: 'var(--accent)' }}>AI</span></span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Bem-vindo de volta</div>
        <div style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14 }}>Entre para acompanhar o rebanho da FEGA.</div>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Usuário ou e-mail" icon="user" value="ana.lima@fega.pucpr.br"/>
        <Field label="Senha" icon="lock" type="password" value="••••••••••"/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon n="check" s={12} c="var(--text-inverse)" sw={3}/></span>
            Manter conectado
          </label>
          <a style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Esqueci a senha</a>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Btn full size="lg">Entrar</Btn>
      </div>
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon n="shield" s={12}/> Conexão criptografada · TLS 1.3
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Chip tone="neutral" size="sm">Produtor</Chip>
        <Chip tone="neutral" size="sm">Veterinário</Chip>
        <Chip tone="neutral" size="sm">Admin</Chip>
      </div>
    </div>
  );
}
function Field({ label, icon, type = 'text', value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ height: 48, borderRadius: 12, background: 'var(--bg-elev-1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
        <Icon n={icon} s={18} c="var(--text-muted)"/>
        <span style={{ flex: 1, fontSize: 15, fontFamily: 'var(--font-body)' }}>{type === 'password' ? value : value}</span>
        {type === 'password' && <Icon n="eye" s={18} c="var(--text-muted)"/>}
      </div>
    </div>
  );
}

/* ============================================================
   4. HOME / DASHBOARD
============================================================ */
function HomeScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        title="Olá, Ana"
        sub="Fazenda Gralha Azul · 50 vacas"
        left={<div style={{ width: 40, height: 40, borderRadius: 99, background: 'linear-gradient(135deg, #4f6e6a, #2a3a36)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>AL</div>}
        right={<><IconBtn n="search"/><IconBtn n="bell" badge/></>}
      />
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Herd status hero */}
        <Card p={18} style={{ background: 'linear-gradient(160deg, rgba(51,153,137,0.20), rgba(125,226,209,0.04) 60%), var(--bg-elev-1)', border: '1px solid var(--primary-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Saúde do rebanho</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>92<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span></div>
            </div>
            <Chip tone="success" icon="arrowUp" size="sm">+4 vs ontem</Chip>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
            {[{ n: 44, l: 'Saudáveis', t: 'success' }, { n: 4, l: 'Atenção', t: 'warn' }, { n: 2, l: 'Críticas', t: 'danger' }].map(k => (
              <div key={k.l} style={{ background: 'var(--bg-app)', borderRadius: 12, padding: 12, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <StatusDot tone={k.t}/>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.l}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{k.n}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Critical alert */}
        <Card style={{ borderLeft: '3px solid var(--danger)', background: 'linear-gradient(90deg, rgba(232,124,92,0.08), transparent 60%), var(--bg-elev-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon n="alert" s={16} c="var(--danger)"/>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Alerta crítico</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>há 1 min</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Estrela está com febre</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>Temperatura 40.2 °C, FC 96 bpm. Recomenda-se avaliação veterinária imediata.</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="primary">Ver vaca</Btn>
            <Btn size="sm" variant="ghost">Adiar</Btn>
          </div>
        </Card>

        {/* Quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Acesso rápido</span>
          <a style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Ver tudo</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { i: 'list', l: 'Rebanho', s: '50 vacas' },
            { i: 'map', l: 'Mapa', s: '6 piquetes' },
            { i: 'calendar', l: 'Histórico', s: '24 meses' },
            { i: 'download', l: 'Relatórios', s: 'CSV / JSON' },
          ].map(a => (
            <Card key={a.l} p={14} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <Icon n={a.i} s={18}/>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.l}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.s}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pré-parto watch */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Pré-parto (2)</span>
            <Chip tone="warn" icon="wifiOff" size="sm">Offline</Chip>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Piquete sem cobertura Wi-Fi · sincronização ao retornar.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {HERD.filter(c => c.prepart).map(c => (
              <div key={c.id} style={{ flex: 1, background: 'var(--bg-app)', borderRadius: 10, padding: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>#{c.id}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginTop: 6 }}>{c.temp}°C</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <TabBar active="home"/>
    </div>
  );
}

/* ============================================================
   5. REBANHO (Listagem)
============================================================ */
function HerdScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Rebanho" sub="50 vacas · FEGA" right={<><IconBtn n="filter"/><IconBtn n="plus"/></>}/>
      {/* Search + filters */}
      <div style={{ padding: '4px 16px 12px' }}>
        <div style={{ height: 44, borderRadius: 12, background: 'var(--bg-elev-1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <Icon n="search" s={16} c="var(--text-muted)"/>
          <span style={{ flex: 1, fontSize: 14, color: 'var(--text-muted)' }}>Buscar por nome ou brinco…</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>⌘K</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { l: 'Todas · 50', on: true },
            { l: 'Atenção · 4', tone: 'warn' },
            { l: 'Críticas · 2', tone: 'danger' },
            { l: 'Pré-parto · 2', tone: 'info' },
            { l: 'Estábulo A' },
          ].map((f, i) => (
            <span key={i} style={{
              padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              background: f.on ? 'var(--text-primary)' : 'var(--bg-elev-1)',
              color: f.on ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: '1px solid ' + (f.on ? 'transparent' : 'var(--border)'),
              whiteSpace: 'nowrap',
            }}>{f.l}</span>
          ))}
        </div>
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HERD.map(c => <CowRow key={c.id} c={c}/>)}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>+ 44 vacas a carregar</div>
      </div>
      <TabBar active="rebanho"/>
    </div>
  );
}
function CowRow({ c }) {
  const tone = c.status === 'crit' ? 'danger' : c.status === 'warn' ? 'warn' : 'success';
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg-elev-1)', borderRadius: 14, border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 12, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <CowMark s={26} primary={tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warning)' : 'var(--accent)'}/>
        <span style={{ position: 'absolute', bottom: 2, right: 2 }}><StatusDot tone={tone} pulse={c.status !== 'ok'}/></span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{c.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>#{c.id}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.breed} · {c.act}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: tone === 'danger' ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600 }}>{c.temp}°C</span>
          <span style={{ width: 1, height: 10, background: 'var(--border)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{c.hr} bpm</span>
          <span style={{ width: 1, height: 10, background: 'var(--border)' }}/>
          <Battery pct={c.batt} mini/>
          {c.conn === 'off' && <Icon n="wifiOff" s={12} c="var(--warning)"/>}
        </div>
      </div>
      <Icon n="chevronRight" s={18} c="var(--text-muted)"/>
    </div>
  );
}

window.SplashScreen = SplashScreen;
window.OnboardingScreen = OnboardingScreen;
window.LoginScreen = LoginScreen;
window.HomeScreen = HomeScreen;
window.HerdScreen = HerdScreen;
window.HERD = HERD;
window.TEMP_SERIES = TEMP_SERIES;
window.HR_SERIES = HR_SERIES;
window.ACT_SERIES = ACT_SERIES;
