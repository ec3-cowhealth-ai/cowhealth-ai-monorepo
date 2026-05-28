/* global React, PhoneFrame, AppBar, IconBtn, Btn, Chip, Card, StatusDot, Battery, LineChart, TabBar, Icon, CowMark, HERD, TEMP_SERIES, HR_SERIES, ACT_SERIES */
const { useState: useS2 } = React;

/* ============================================================
   6. DETALHE DA VACA / MONITORAMENTO
============================================================ */
function CowDetailScreen() {
  const [tab, setTab] = useS2('temp');
  const series = tab === 'temp' ? TEMP_SERIES : tab === 'hr' ? HR_SERIES : ACT_SERIES;
  const cfg = {
    temp: { color: 'var(--danger)', yMin: 38, yMax: 41, unit: '°C', th: [{ v: 39.5, c: 'var(--warning)' }, { v: 40, c: 'var(--danger)' }] },
    hr:   { color: 'var(--accent)', yMin: 60, yMax: 100, unit: 'bpm', th: [{ v: 90, c: 'var(--warning)' }] },
    act:  { color: 'var(--info)', yMin: 0, yMax: 30, unit: 'min', th: [] },
  }[tab];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        title="Estrela"
        sub="#014 · BR-3401-014"
        left={<IconBtn n="chevronLeft"/>}
        right={<><IconBtn n="more"/></>}
      />
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hero */}
        <Card p={16} style={{ background: 'linear-gradient(160deg, rgba(232,124,92,0.14), transparent 65%), var(--bg-elev-1)', border: '1px solid var(--danger-soft)' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', position: 'relative' }}>
              <CowMark s={36} primary="var(--danger)" accent="var(--warning)"/>
              <span style={{ position: 'absolute', bottom: -4, right: -4 }}><StatusDot tone="danger" pulse/></span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Chip tone="danger" icon="alert" size="sm">Crítica</Chip>
                <Chip tone="neutral" size="sm">Jersey</Chip>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>FEGA · Estábulo A · Baia 14</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Battery pct={64}/>
                <span style={{ width: 1, height: 10, background: 'var(--border)' }}/>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 4, alignItems: 'center' }}><Icon n="wifi" s={12}/> Online</span>
                <span style={{ width: 1, height: 10, background: 'var(--border)' }}/>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>há 1 min</span>
              </div>
            </div>
          </div>
          {/* Risk score */}
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-app)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Score de risco</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--danger)' }}>84<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/100</span></span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-elev-2)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--accent) 0%, var(--warning) 50%, var(--danger) 100%)', clipPath: 'inset(0 16% 0 0)' }}/>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Padrão consistente com <b style={{ color: 'var(--text-primary)' }}>febre</b> + <b style={{ color: 'var(--text-primary)' }}>FC elevada</b> nas últimas 4h.
            </div>
          </div>
        </Card>

        {/* Vital KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { i: 'thermo', l: 'Temp', v: '40.2', u: '°C', t: 'danger', d: '+1.1' },
            { i: 'heart',  l: 'FC',   v: '96',   u: 'bpm', t: 'warn',  d: '+18' },
            { i: 'activity', l: 'Atividade', v: '4', u: 'min/h', t: 'warn', d: '−8' },
          ].map(k => (
            <div key={k.l} style={{ padding: 12, background: 'var(--bg-elev-1)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <Icon n={k.i} s={16} c={'var(--' + (k.t === 'danger' ? 'danger' : 'warning') + ')'}/>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: '-0.02em' }}>
                {k.v}<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 3 }}>{k.u}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k.l} · {k.d}</div>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <Card p={14}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{tab === 'temp' ? 'Temperatura' : tab === 'hr' ? 'Frequência cardíaca' : 'Atividade'}</span>
            <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              {['1H', '24H', '7D'].map((p, i) => (
                <span key={p} style={{ padding: '3px 8px', borderRadius: 6, background: i === 1 ? 'var(--bg-elev-2)' : 'transparent', color: i === 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>
          <LineChart data={series} yMin={cfg.yMin} yMax={cfg.yMax} thresholds={cfg.th} color={cfg.color}/>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><span style={{ width: 8, height: 1.5, background: 'var(--warning)' }}/>limite atenção</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><span style={{ width: 8, height: 1.5, background: 'var(--danger)' }}/>limite crítico</span>
          </div>
        </Card>

        {/* Metric tabs */}
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--bg-elev-1)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'temp', l: 'Temp', i: 'thermo' },
            { id: 'hr', l: 'FC', i: 'heart' },
            { id: 'act', l: 'Atividade', i: 'activity' },
            { id: 'sum', l: 'Resumo', i: 'list' },
          ].map(t => {
            const on = t.id === tab;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '10px 4px', borderRadius: 8, border: 0, cursor: 'pointer',
                background: on ? 'var(--bg-app)' : 'transparent',
                color: on ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
              }}>
                <Icon n={t.i} s={16}/>
                {t.l}
              </button>
            );
          })}
        </div>

        {/* Recent events */}
        <Card>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Eventos recentes</div>
          {[
            { t: 'há 1 min', l: 'Pico de temperatura', v: '40.2 °C', tone: 'danger' },
            { t: 'há 38 min', l: 'FC acima do basal', v: '96 bpm', tone: 'warn' },
            { t: 'há 4h', l: 'Última ordenha', v: 'Robô #2', tone: 'muted' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
              <StatusDot tone={e.tone}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.l}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{e.t}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{e.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   7. HISTÓRICO (Data Table)
============================================================ */
function HistoryScreen() {
  const rows = [
    { t: '08:40', temp: 40.2, hr: 96, act: 4,  s: 'crit' },
    { t: '08:30', temp: 40.0, hr: 94, act: 6,  s: 'crit' },
    { t: '08:20', temp: 39.7, hr: 92, act: 9,  s: 'warn' },
    { t: '08:10', temp: 39.6, hr: 88, act: 11, s: 'warn' },
    { t: '08:00', temp: 39.4, hr: 84, act: 14, s: 'warn' },
    { t: '07:50', temp: 39.3, hr: 82, act: 16, s: 'ok' },
    { t: '07:40', temp: 39.1, hr: 78, act: 18, s: 'ok' },
    { t: '07:30', temp: 39.0, hr: 76, act: 22, s: 'ok' },
    { t: '07:20', temp: 38.9, hr: 74, act: 24, s: 'ok' },
    { t: '07:10', temp: 38.9, hr: 72, act: 22, s: 'ok' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Histórico" sub="Estrela · #014" left={<IconBtn n="chevronLeft"/>} right={<><IconBtn n="download"/><IconBtn n="filter"/></>}/>
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, height: 38, borderRadius: 10, background: 'var(--bg-elev-1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
          <Icon n="calendar" s={14} c="var(--text-muted)"/>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Hoje · 07:00 → 09:00</span>
          <Icon n="chevronDown" s={14} c="var(--text-muted)" style={{ marginLeft: 'auto' }}/>
        </div>
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px' }}>
        <div style={{ background: 'var(--bg-elev-1)', borderRadius: 14, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 36px', padding: '10px 12px', background: 'var(--bg-elev-2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <span>Hora</span><span>Temp</span><span>FC</span><span>Atv</span><span/>
          </div>
          {rows.map((r, i) => {
            const tone = r.s === 'crit' ? 'var(--danger)' : r.s === 'warn' ? 'var(--warning)' : 'var(--accent)';
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 36px', padding: '12px', alignItems: 'center', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{r.t}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: r.s === 'crit' ? 'var(--danger)' : 'var(--text-primary)' }}>{r.temp.toFixed(1)}°</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>{r.hr}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{r.act}<span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>min</span></span>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: tone, marginLeft: 'auto' }}/>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-elev-1)', borderRadius: 12, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>10 leituras · intervalo de 10 min</div>
          <Btn size="sm" variant="ghost" icon="download">Exportar</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   8. ALERTAS
============================================================ */
function AlertsScreen() {
  const alerts = [
    { tone: 'danger', icon: 'thermo', title: 'Febre detectada', cow: 'Estrela #014', t: 'há 1 min', body: 'Temp 40.2 °C — acima do limite crítico (39.5 °C).' },
    { tone: 'warn',   icon: 'wifiOff', title: 'Coleira offline', cow: 'Mocinha #022', t: 'há 14 min', body: 'Sem comunicação há 22 min · piquete de pré-parto.' },
    { tone: 'warn',   icon: 'activity', title: 'Baixa atividade', cow: 'Brisa #048', t: 'há 36 min', body: 'Movimento abaixo do basal nas últimas 6h.' },
    { tone: 'info',   icon: 'battery', title: 'Bateria baixa', cow: 'Mocinha #022', t: 'há 1h', body: 'Coleira em 22% — recarga recomendada.' },
    { tone: 'success', icon: 'check', title: 'FC normalizada', cow: 'Pampa #031', t: 'há 2h', body: 'Frequência voltou ao basal após repouso.' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Alertas" sub="3 não lidos" right={<><IconBtn n="filter"/><IconBtn n="check"/></>}/>
      <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6 }}>
        {[{ l: 'Todos · 14', on: true }, { l: 'Críticos · 1' }, { l: 'Avisos · 2' }, { l: 'Resolvidos' }].map((f, i) => (
          <span key={i} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: f.on ? 'var(--text-primary)' : 'var(--bg-elev-1)', color: f.on ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: '1px solid ' + (f.on ? 'transparent' : 'var(--border)') }}>{f.l}</span>
        ))}
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map((a, i) => {
          const colors = { danger: 'var(--danger)', warn: 'var(--warning)', info: 'var(--info)', success: 'var(--accent)' };
          const c = colors[a.tone];
          return (
            <div key={i} style={{ background: 'var(--bg-elev-1)', borderRadius: 14, border: '1px solid var(--border-subtle)', padding: 14, borderLeft: '3px solid ' + c }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'grid', placeItems: 'center', color: c }}>
                  <Icon n={a.icon} s={16}/>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)' }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.cow} · <span style={{ fontFamily: 'var(--font-mono)' }}>{a.t}</span></div>
                </div>
                {i < 3 && <StatusDot tone={a.tone === 'success' ? 'success' : a.tone === 'info' ? 'muted' : a.tone}/>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{a.body}</div>
            </div>
          );
        })}
      </div>
      <TabBar active="alerts"/>
    </div>
  );
}

/* ============================================================
   9. MAPA DA FAZENDA
============================================================ */
function MapScreen() {
  const pins = [
    { x: 28, y: 38, t: 'success', l: 'Aurora' },
    { x: 44, y: 30, t: 'success', l: 'Pampa' },
    { x: 36, y: 52, t: 'warn', l: 'Mocinha' },
    { x: 60, y: 44, t: 'success', l: '+12' },
    { x: 68, y: 64, t: 'danger', l: 'Estrela' },
    { x: 50, y: 72, t: 'warn', l: 'Brisa' },
    { x: 80, y: 30, t: 'success', l: '+18' },
    { x: 22, y: 72, t: 'success', l: '+9' },
  ];
  const colors = { success: 'var(--accent)', warn: 'var(--warning)', danger: 'var(--danger)' };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Map */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: 0 }}>
        <svg viewBox="0 0 390 844" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 Q15 20 30 30 T60 30" stroke="rgba(125,226,209,0.06)" fill="none"/>
              <path d="M0 50 Q15 42 30 50 T60 50" stroke="rgba(125,226,209,0.04)" fill="none"/>
            </pattern>
            <radialGradient id="vig" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(43,44,40,0)"/>
              <stop offset="100%" stopColor="rgba(11,13,13,0.7)"/>
            </radialGradient>
          </defs>
          <rect width="390" height="844" fill="#0F1311"/>
          <rect width="390" height="844" fill="url(#topo)"/>
          {/* Pasture polygons */}
          <path d="M30 200 L180 160 L240 220 L200 340 L60 360 Z" fill="rgba(51,153,137,0.12)" stroke="rgba(51,153,137,0.35)" strokeDasharray="2 4"/>
          <path d="M200 380 L340 360 L360 540 L240 580 L180 480 Z" fill="rgba(51,153,137,0.08)" stroke="rgba(51,153,137,0.25)" strokeDasharray="2 4"/>
          <path d="M40 480 L160 460 L200 600 L80 660 Z" fill="rgba(232,198,107,0.08)" stroke="rgba(232,198,107,0.35)" strokeDasharray="2 4"/>
          {/* Pasture labels */}
          <text x="120" y="270" fontSize="11" fontFamily="var(--font-mono)" fill="rgba(255,250,251,0.5)" textAnchor="middle">ESTÁBULO A</text>
          <text x="270" y="470" fontSize="11" fontFamily="var(--font-mono)" fill="rgba(255,250,251,0.5)" textAnchor="middle">ESTÁBULO B</text>
          <text x="115" y="565" fontSize="11" fontFamily="var(--font-mono)" fill="rgba(232,198,107,0.7)" textAnchor="middle">PRÉ-PARTO</text>
          {/* Path */}
          <path d="M180 200 Q220 320 280 420 T200 600" stroke="rgba(255,250,251,0.1)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <rect width="390" height="844" fill="url(#vig)"/>
        </svg>
        {pins.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%', transform: 'translate(-50%,-50%)', zIndex: 5 }}>
            <div style={{ position: 'relative', width: 28, height: 28 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 99, background: colors[p.t], opacity: 0.25, animation: p.t !== 'success' ? 'cowPulse 1.8s ease-out infinite' : 'none', transformOrigin: 'center' }}/>
              <div style={{ position: 'absolute', inset: 4, borderRadius: 99, background: colors[p.t], display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text-inverse)' }}>
                {p.l.startsWith('+') ? p.l : '·'}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Top bar overlay */}
      <div style={{ position: 'relative', zIndex: 10, padding: '8px 16px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(19,21,21,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <Icon n="search" s={16} c="var(--text-muted)"/>
          <span style={{ flex: 1, fontSize: 14, color: 'var(--text-muted)' }}>Buscar piquete ou vaca</span>
        </div>
        <button style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(19,21,21,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'grid', placeItems: 'center' }}>
          <Icon n="filter" s={18}/>
        </button>
      </div>
      {/* Selected pin card */}
      <div style={{ position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 10, background: 'rgba(19,21,21,0.92)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', position: 'relative' }}>
            <CowMark s={26} primary="var(--danger)"/>
            <span style={{ position: 'absolute', bottom: -2, right: -2 }}><StatusDot tone="danger" pulse/></span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Estrela</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>#014</span>
              <Chip tone="danger" size="sm">Crítica</Chip>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>−25.4509°, −49.1310°</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <span style={{ color: 'var(--danger)' }}>40.2°C</span>
              <span style={{ color: 'var(--text-secondary)' }}>96 bpm</span>
              <Battery pct={64} mini/>
            </div>
          </div>
          <Icon n="chevronRight" s={18} c="var(--text-muted)"/>
        </div>
      </div>
      {/* Legend */}
      <div style={{ position: 'absolute', top: 64, right: 16, zIndex: 10, background: 'rgba(19,21,21,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
        {[{ l: 'OK · 44', t: 'success' }, { l: 'Atenção · 4', t: 'warn' }, { l: 'Críticas · 2', t: 'danger' }].map(x => (
          <span key={x.l} style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: colors[x.t] }}/> {x.l}
          </span>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}><TabBar active="mapa"/></div>
    </div>
  );
}

window.CowDetailScreen = CowDetailScreen;
window.HistoryScreen = HistoryScreen;
window.AlertsScreen = AlertsScreen;
window.MapScreen = MapScreen;
