/* global React, AppBar, IconBtn, Btn, Chip, Card, StatusDot, Battery, TabBar, Icon, CowMark */
const { useState: useS3 } = React;

/* ============================================================
   10. PERFIL DO USUÁRIO
============================================================ */
function ProfileScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Perfil" right={<IconBtn n="settings"/>}/>
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hero */}
        <Card p={20} style={{ background: 'linear-gradient(160deg, rgba(51,153,137,0.18), transparent 60%), var(--bg-elev-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: 'linear-gradient(135deg, #4f6e6a, #2a3a36)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: 22, border: '2px solid var(--primary-soft)' }}>AL</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>Ana Lima</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Veterinária responsável</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Chip tone="primary" size="sm">Veterinária</Chip>
                <Chip tone="neutral" size="sm">CRMV-PR 12345</Chip>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { v: '50', l: 'Vacas\nmonitoradas' },
            { v: '128', l: 'Eventos\nresolvidos' },
            { v: '14', l: 'Dias em\natividade' },
          ].map(s => (
            <Card key={s.l} p={12} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Info rows */}
        <Card p={0}>
          {[
            { i: 'globe', l: 'Fazenda', v: 'FEGA · PUCPR' },
            { i: 'map', l: 'Localização', v: 'São José dos Pinhais, PR' },
            { i: 'bell', l: 'Notificações', v: 'Push · E-mail · SMS' },
            { i: 'shield', l: 'Permissões', v: 'Acesso completo' },
          ].map((r, i) => (
            <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}><Icon n={r.i} s={16}/></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.l}</div>
                <div style={{ fontSize: 14, marginTop: 1 }}>{r.v}</div>
              </div>
              <Icon n="chevronRight" s={16} c="var(--text-muted)"/>
            </div>
          ))}
        </Card>

        <Btn full variant="ghost" icon="logOut">Sair</Btn>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CowHealth AI · v1.7.0 · build 240615</div>
      </div>
      <TabBar active="perfil"/>
    </div>
  );
}

/* ============================================================
   11. CONFIGURAÇÕES
============================================================ */
function SettingsScreen() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Configurações" left={<IconBtn n="chevronLeft"/>}/>
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Modo de coleta */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '0 4px 8px' }}>Coleta de dados</div>
          <Card p={16}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Frequência de medição</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Intervalo entre leituras das coleiras. Menor intervalo = mais bateria.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 14 }}>
              {[
                { l: 'Higher', s: '2 min', d: 'Animais críticos' },
                { l: 'Default', s: '10 min', d: 'Recomendado', on: true },
                { l: 'Lower', s: '60 min', d: 'Modo noturno' },
              ].map(m => (
                <div key={m.l} style={{
                  padding: '12px 8px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  background: m.on ? 'var(--primary-soft)' : 'var(--bg-app)',
                  border: '1px solid ' + (m.on ? 'var(--primary)' : 'var(--border-subtle)'),
                }}>
                  <div style={{ fontSize: 11, color: m.on ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.l}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginTop: 4, color: m.on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{m.s}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.d}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Toggles */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '0 4px 8px' }}>Notificações</div>
          <Card p={0}>
            {[
              { l: 'Alertas críticos', d: 'Febre, FC anômala, parada de movimento', on: true },
              { l: 'Avisos', d: 'Bateria, conectividade, baixa atividade', on: true },
              { l: 'Resumo diário', d: 'Todo dia às 07:00', on: false },
              { l: 'E-mail / SMS', d: 'ana.lima@fega.pucpr.br', on: true },
            ].map((r, i) => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.l}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.d}</div>
                </div>
                <span style={{ width: 38, height: 22, borderRadius: 99, background: r.on ? 'var(--primary)' : 'var(--bg-elev-3)', position: 'relative', transition: 'background .2s' }}>
                  <span style={{ position: 'absolute', top: 2, left: r.on ? 18 : 2, width: 18, height: 18, borderRadius: 99, background: 'var(--snow)', transition: 'left .2s' }}/>
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* Other */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '0 4px 8px' }}>Conta</div>
          <Card p={0}>
            {[
              { i: 'user', l: 'Editar perfil' },
              { i: 'lock', l: 'Senha e segurança' },
              { i: 'globe', l: 'Idioma', v: 'Português (BR)' },
              { i: 'shield', l: 'Privacidade · LGPD' },
              { i: 'info', l: 'Ajuda e suporte' },
            ].map((r, i) => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
                <Icon n={r.i} s={18} c="var(--text-secondary)"/>
                <span style={{ flex: 1, fontSize: 14 }}>{r.l}</span>
                {r.v && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.v}</span>}
                <Icon n="chevronRight" s={16} c="var(--text-muted)"/>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   12. ESTADOS — vazio / loading / erro
============================================================ */
function StateEmpty() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Rebanho" left={<IconBtn n="chevronLeft"/>}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 96, height: 96, borderRadius: 24, background: 'var(--bg-elev-1)', border: '1px dashed var(--border)', display: 'grid', placeItems: 'center' }}>
          <CowMark s={48} primary="var(--text-muted)" accent="var(--text-muted)"/>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Nenhuma coleira pareada</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4, maxWidth: 240 }}>Adicione uma coleira para começar a monitorar sinais vitais em tempo real.</div>
        </div>
        <Btn icon="plus">Parear coleira</Btn>
        <a style={{ fontSize: 12, color: 'var(--text-muted)' }}>Importar do Delpro</a>
      </div>
    </div>
  );
}

function StateLoading() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Sincronizando" sub="2 / 50 vacas"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 22 }}>
        <div style={{ position: 'relative', width: 96, height: 96, display: 'grid', placeItems: 'center' }}>
          <svg viewBox="0 0 96 96" style={{ position: 'absolute', inset: 0, animation: 'cowSpin 2s linear infinite' }}>
            <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,250,251,0.08)" strokeWidth="3"/>
            <circle cx="48" cy="48" r="38" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 240"/>
          </svg>
          <CowMark s={36}/>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Lendo coleiras…</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>broker.emqx.io · MQTT</div>
        </div>
        <div style={{ width: '80%', height: 6, background: 'var(--bg-elev-2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: '34%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 99 }}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          {[
            { l: 'Conexão Wi-Fi', s: 'ok' },
            { l: 'Sincronização NTP', s: 'ok' },
            { l: 'Leitura de sensores', s: 'load' },
            { l: 'Análise de IA', s: 'wait' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: s.s === 'wait' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
              {s.s === 'ok' && <Icon n="check" s={14} c="var(--accent)"/>}
              {s.s === 'load' && <span style={{ width: 12, height: 12, borderRadius: 99, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'cowSpin 1s linear infinite' }}/>}
              {s.s === 'wait' && <span style={{ width: 12, height: 12, borderRadius: 99, border: '1.5px dashed var(--border)' }}/>}
              <span>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StateError() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Sem conexão" left={<IconBtn n="chevronLeft"/>}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 18 }}>
        <div style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--danger-soft)', border: '1px solid rgba(232,124,92,0.3)', display: 'grid', placeItems: 'center', position: 'relative' }}>
          <Icon n="wifiOff" s={40} c="var(--danger)" sw={1.5}/>
          <span style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 99, background: 'var(--danger)', display: 'grid', placeItems: 'center', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, border: '3px solid var(--bg-app)' }}>!</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Coleira fora do ar</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.45, maxWidth: 260 }}>Mocinha #022 está no piquete de pré-parto, sem cobertura Wi-Fi. Os dados serão sincronizados ao retornar.</div>
        </div>
        <Card p={12} style={{ width: '100%', maxWidth: 300, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Última sincronia</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>há 22 min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginTop: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Buffer local</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>132 leituras</span>
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" icon="refresh">Tentar novamente</Btn>
          <Btn variant="ghost">Ver detalhes</Btn>
        </div>
      </div>
    </div>
  );
}

window.ProfileScreen = ProfileScreen;
window.SettingsScreen = SettingsScreen;
window.StateEmpty = StateEmpty;
window.StateLoading = StateLoading;
window.StateError = StateError;
