
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root {
  --p: #2F68FF; --p-d: #1C4FCC; --p-l: #E8EFFE; --p-m: #B3C8FF;
  --s: #1C3FAA;
  --ok: #22C55E; --ok-l: #DCFCE7; --ok-d: #15803D;
  --err: #EF4444; --err-l: #FEE2E2; --err-d: #B91C1C;
  --warn: #F59E0B; --warn-l: #FEF3C7; --warn-d: #B45309;
  --inf: #2F68FF; --inf-l: #E8EFFE; --inf-d: #1C4FCC;
  --n900: #111827; --n800: #1F2937; --n700: #374151;
  --n500: #6B7280; --n400: #9CA3AF; --n300: #D1D5DB;
  --n200: #E5E7EB; --n100: #F3F4F6; --n50: #F9FAFB; --w: #fff;
  --gold: #F59E0B; --silver: #9CA3AF; --bronze: #CD7C40;
  --r4: 4px; --r8: 8px; --r12: 12px; --r16: 16px; --r24: 24px; --r999: 999px;
  --ff: 'Inter', sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--ff); background: var(--n50); color: var(--n900); }
.wrap { max-width: 380px; margin: 0 auto; padding: 0 0 2rem; }

.sec { padding: 1.25rem 1rem 0.5rem; }
.sec-t { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--n400); margin-bottom: 12px; }

.row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; align-items: center; }

.card { background: var(--w); border-radius: var(--r12); border: 0.5px solid var(--n200); padding: 14px; margin-bottom: 8px; }

/* COLORS */
.chips { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 6px; }
.chip { border-radius: var(--r8); padding: 10px 12px; }
.chip-lbl { font-size: 11px; font-weight: 600; }
.chip-hex { font-size: 10px; font-family: monospace; opacity: .7; margin-top: 1px; }

/* TYPOGRAPHY */
.ty-r { padding: 8px 0; border-bottom: 0.5px solid var(--n200); }
.ty-r:last-child { border: none; }

/* BUTTONS */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--ff); font-size: 14px; font-weight: 600; border: none; border-radius: var(--r8); padding: 10px 18px; cursor: pointer; transition: opacity .15s; }
.btn:active { opacity: .8; }
.btn-primary { background: var(--p); color: var(--w); }
.btn-secondary { background: var(--w); color: var(--p); border: 1.5px solid var(--p); }
.btn-ghost { background: var(--n100); color: var(--n700); }
.btn-danger { background: var(--err-l); color: var(--err-d); }
.btn-loading { background: var(--p); color: var(--w); opacity: .7; }
.btn-disabled { background: var(--n200); color: var(--n400); cursor: not-allowed; }
.btn-sm { font-size: 12px; padding: 6px 12px; border-radius: var(--r8); }
.btn-full { width: 100%; border-radius: var(--r12); padding: 13px; font-size: 15px; }

/* INPUTS */
.inp-wrap { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.inp-lbl { font-size: 12px; font-weight: 600; color: var(--n700); }
.inp { font-family: var(--ff); font-size: 14px; background: var(--n50); border: 1px solid var(--n300); border-radius: var(--r8); padding: 9px 12px; color: var(--n900); width: 100%; }
.inp:focus { outline: none; border-color: var(--p); background: var(--w); }
.inp-err { border-color: var(--err); background: var(--err-l); }
.inp-ok { border-color: var(--ok); }
.inp-msg { font-size: 11px; margin-top: 2px; }
.inp-msg.err { color: var(--err-d); }
.inp-msg.ok { color: var(--ok-d); }

/* BADGES */
.badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: var(--r999); }
.badge-ok { background: var(--ok-l); color: var(--ok-d); }
.badge-err { background: var(--err-l); color: var(--err-d); }
.badge-warn { background: var(--warn-l); color: var(--warn-d); }
.badge-inf { background: var(--inf-l); color: var(--inf-d); }
.badge-n { background: var(--n100); color: var(--n700); }
.badge-gold { background: #FEF3C7; color: #92400E; }
.badge-silver { background: var(--n100); color: var(--n700); }
.badge-bronze { background: #FEF3C7; color: var(--bronze); }

/* TAGS */
.tag { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: var(--r4); }
.tag-campo { background: #DCFCE7; color: #15803D; }
.tag-society { background: #DBEAFE; color: #1D4ED8; }
.tag-futsal { background: #F3E8FF; color: #6B21A8; }

/* AVATAR */
.av { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.av-lg { width: 56px; height: 56px; font-size: 20px; }
.av-md { width: 40px; height: 40px; font-size: 14px; }
.av-sm { width: 32px; height: 32px; font-size: 11px; }
.av-xs { width: 24px; height: 24px; font-size: 9px; }
.av-blue { background: var(--p-l); color: var(--p-d); }
.av-green { background: var(--ok-l); color: var(--ok-d); }
.av-amber { background: var(--warn-l); color: var(--warn-d); }

/* OVERALL BADGE */
.ovr { display: inline-flex; align-items: center; gap: 4px; background: var(--p); color: var(--w); border-radius: var(--r999); padding: 4px 10px; }
.ovr-num { font-size: 16px; font-weight: 800; line-height: 1; }
.ovr-lbl { font-size: 10px; font-weight: 600; }

/* OVERALL COLOR */
.ovr-low { background: var(--err); }
.ovr-mid { background: var(--warn); }
.ovr-high { background: var(--ok); }

/* PROGRESS */
.prog-bg { height: 6px; background: var(--n200); border-radius: var(--r999); overflow: hidden; }
.prog-fill { height: 100%; border-radius: var(--r999); }

/* MATCH CARD */
.match-card { background: var(--w); border-radius: var(--r12); border: 0.5px solid var(--n200); overflow: hidden; margin-bottom: 8px; }
.match-hdr { padding: 10px 14px; border-bottom: 0.5px solid var(--n200); display: flex; justify-content: space-between; align-items: center; }
.match-body { padding: 12px 14px; }
.vs-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.team-block { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.team-logo { width: 40px; height: 40px; border-radius: var(--r8); background: var(--n100); display: flex; align-items: center; justify-content: center; }
.team-name { font-size: 11px; font-weight: 600; color: var(--n700); text-align: center; }
.vs-badge { font-size: 13px; font-weight: 800; color: var(--n400); }
.score-big { font-size: 28px; font-weight: 800; color: var(--n900); letter-spacing: 2px; }
.conf-pill { display: inline-flex; align-items: center; gap: 4px; background: var(--ok-l); color: var(--ok-d); border-radius: var(--r999); padding: 3px 10px; font-size: 11px; font-weight: 600; }

/* STAT BAR */
.stat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.stat-lbl { font-size: 11px; color: var(--n500); width: 72px; flex-shrink: 0; }
.stat-val { font-size: 12px; font-weight: 700; color: var(--n900); width: 26px; text-align: right; }

/* MEMBER ROW */
.mem-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 0.5px solid var(--n200); }
.mem-row:last-child { border: none; }
.mem-info { flex: 1; }
.mem-name { font-size: 13px; font-weight: 600; color: var(--n900); }
.mem-sub { font-size: 11px; color: var(--n500); margin-top: 1px; }

/* NOTIF ROW */
.notif-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 0.5px solid var(--n200); }
.notif-row:last-child { border: none; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--p); margin-top: 4px; flex-shrink: 0; }
.notif-dot.read { background: var(--n300); }

/* TX ROW */
.tx-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 0.5px solid var(--n200); }
.tx-row:last-child { border: none; }
.tx-ico { width: 36px; height: 36px; border-radius: var(--r8); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
.tx-in { background: var(--ok-l); }
.tx-out { background: var(--err-l); }
.tx-pend { background: var(--warn-l); }
.tx-val-in { font-size: 14px; font-weight: 700; color: var(--ok-d); }
.tx-val-out { font-size: 14px; font-weight: 700; color: var(--err-d); }
.tx-val-pend { font-size: 14px; font-weight: 700; color: var(--warn-d); }

/* QUADRA CARD */
.q-card { background: var(--w); border-radius: var(--r12); border: 0.5px solid var(--n200); overflow: hidden; margin-bottom: 8px; display: flex; }
.q-img { width: 80px; height: 80px; background: var(--n100); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.q-info { padding: 10px 12px; flex: 1; }

/* BOTTOM NAV */
.bottom-nav { background: var(--w); border-top: 0.5px solid var(--n200); display: flex; justify-content: space-around; padding: 6px 0 10px; }
.nav-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; border: none; background: transparent; cursor: pointer; padding: 4px 8px; min-width: 50px; }
.nav-lbl { font-family: var(--ff); font-size: 10px; font-weight: 500; color: var(--n400); }
.nav-btn.on .nav-lbl { color: var(--p); font-weight: 600; }

/* SLIDER */
.slider-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.slider-lbl { font-size: 12px; color: var(--n700); width: 70px; flex-shrink: 0; }
input[type=range] { flex: 1; accent-color: var(--p); height: 4px; }
.slider-val { font-size: 13px; font-weight: 700; color: var(--p); width: 28px; text-align: right; }

/* TABS */
.tabs { display: flex; border-bottom: 1.5px solid var(--n200); margin-bottom: 14px; }
.tab { flex: 1; text-align: center; padding: 8px 4px; font-size: 13px; font-weight: 500; color: var(--n400); border-bottom: 2px solid transparent; cursor: pointer; }
.tab.on { color: var(--p); border-bottom-color: var(--p); font-weight: 600; }

/* CHIP FILTER */
.chip-f { display: inline-flex; align-items: center; font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: var(--r999); border: 1px solid var(--n300); color: var(--n700); background: var(--w); cursor: pointer; }
.chip-f.on { background: var(--p-l); border-color: var(--p); color: var(--p-d); font-weight: 600; }

/* TOGGLE */
.toggle-wrap { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 0.5px solid var(--n200); }
.toggle-wrap:last-child { border: none; }
.toggle { width: 40px; height: 22px; border-radius: var(--r999); background: var(--p); display: flex; align-items: center; padding: 2px; cursor: pointer; }
.toggle .knob { width: 18px; height: 18px; border-radius: 50%; background: var(--w); margin-left: auto; }
.toggle.off { background: var(--n300); }
.toggle.off .knob { margin-left: 0; }

/* SKELETON */
.skel { background: var(--n200); border-radius: var(--r4); }
.skel-text { height: 12px; margin-bottom: 6px; }
.skel-av { border-radius: 50%; }

/* RADAR */
.radar-wrap { display: flex; justify-content: center; padding: 8px 0; }
</style>

<div class="wrap">

<!-- HEADER -->
<div style="background:var(--w);padding:14px 16px;border-bottom:0.5px solid var(--n200);display:flex;align-items:center;justify-content:space-between;margin-bottom:1px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="width:34px;height:34px;border-radius:50%;background:var(--p);display:flex;align-items:center;justify-content:center;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
    </div>
    <div>
      <div style="font-size:10px;color:var(--n400);font-weight:500;">Soccer Manager</div>
      <div style="font-size:15px;font-weight:700;color:var(--n900);">Design System</div>
    </div>
  </div>
  <div class="badge badge-inf">v1.0</div>
</div>

<!-- ═══ CORES ═══ -->
<div class="sec">
  <div class="sec-t">Paleta de cores</div>
  <div class="chips">
    <div class="chip" style="background:var(--p);">
      <div class="chip-lbl" style="color:white;">Primária</div>
      <div class="chip-hex" style="color:rgba(255,255,255,.7);">#2F68FF</div>
    </div>
    <div class="chip" style="background:var(--s);">
      <div class="chip-lbl" style="color:white;">Secundária</div>
      <div class="chip-hex" style="color:rgba(255,255,255,.7);">#1C3FAA</div>
    </div>
    <div class="chip" style="background:var(--ok);">
      <div class="chip-lbl" style="color:white;">Sucesso</div>
      <div class="chip-hex" style="color:rgba(255,255,255,.7);">#22C55E</div>
    </div>
    <div class="chip" style="background:var(--err);">
      <div class="chip-lbl" style="color:white;">Erro</div>
      <div class="chip-hex" style="color:rgba(255,255,255,.7);">#EF4444</div>
    </div>
    <div class="chip" style="background:var(--warn);">
      <div class="chip-lbl" style="color:white;">Alerta</div>
      <div class="chip-hex" style="color:rgba(255,255,255,.7);">#F59E0B</div>
    </div>
    <div class="chip" style="background:var(--n900);">
      <div class="chip-lbl" style="color:white;">Neutro 900</div>
      <div class="chip-hex" style="color:rgba(255,255,255,.7);">#111827</div>
    </div>
    <div class="chip" style="background:var(--n100);border:0.5px solid var(--n200);">
      <div class="chip-lbl" style="color:var(--n700);">Neutro 100</div>
      <div class="chip-hex" style="color:var(--n400);">#F3F4F6</div>
    </div>
    <div class="chip" style="background:var(--w);border:0.5px solid var(--n200);">
      <div class="chip-lbl" style="color:var(--n700);">Branco</div>
      <div class="chip-hex" style="color:var(--n400);">#FFFFFF</div>
    </div>
  </div>
  <!-- SEMANTIC -->
  <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
    <div style="background:var(--p-l);border-radius:var(--r8);padding:6px 10px;flex:1;">
      <div style="font-size:10px;font-weight:600;color:var(--p-d);">Primário Light</div>
      <div style="font-size:9px;font-family:monospace;color:var(--p);">#E8EFFE</div>
    </div>
    <div style="background:var(--ok-l);border-radius:var(--r8);padding:6px 10px;flex:1;">
      <div style="font-size:10px;font-weight:600;color:var(--ok-d);">Sucesso Light</div>
      <div style="font-size:9px;font-family:monospace;color:var(--ok-d);">#DCFCE7</div>
    </div>
    <div style="background:var(--err-l);border-radius:var(--r8);padding:6px 10px;flex:1;">
      <div style="font-size:10px;font-weight:600;color:var(--err-d);">Erro Light</div>
      <div style="font-size:9px;font-family:monospace;color:var(--err-d);">#FEE2E2</div>
    </div>
    <div style="background:var(--warn-l);border-radius:var(--r8);padding:6px 10px;flex:1;">
      <div style="font-size:10px;font-weight:600;color:var(--warn-d);">Alerta Light</div>
      <div style="font-size:9px;font-family:monospace;color:var(--warn-d);">#FEF3C7</div>
    </div>
  </div>
</div>

<!-- ═══ TIPOGRAFIA ═══ -->
<div class="sec">
  <div class="sec-t">Tipografia — Inter</div>
  <div class="card" style="padding:0 14px;">
    <div class="ty-r"><div style="font-size:24px;font-weight:800;color:var(--n900);">H1 — 24px Bold 800</div><div style="font-size:10px;color:var(--n400);margin-top:2px;">Títulos principais de tela</div></div>
    <div class="ty-r"><div style="font-size:20px;font-weight:700;color:var(--n900);">H2 — 20px Semibold 700</div><div style="font-size:10px;color:var(--n400);margin-top:2px;">Subtítulos de seção</div></div>
    <div class="ty-r"><div style="font-size:16px;font-weight:600;color:var(--n900);">H3 — 16px Semibold 600</div><div style="font-size:10px;color:var(--n400);margin-top:2px;">Títulos de card</div></div>
    <div class="ty-r"><div style="font-size:14px;font-weight:400;color:var(--n700);">Body — 14px Regular 400 · texto principal e descrições do app</div></div>
    <div class="ty-r" style="border:none;"><div style="font-size:12px;font-weight:400;color:var(--n500);">Caption — 12px Regular · metadados, labels, timestamps</div></div>
  </div>
</div>

<!-- ═══ ESPAÇAMENTO ═══ -->
<div class="sec">
  <div class="sec-t">Espaçamento & Border Radius</div>
  <div class="card">
    <div style="display:flex;align-items:flex-end;gap:10px;margin-bottom:10px;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:4px;height:4px;background:var(--p);border-radius:1px;"></div><span style="font-size:9px;color:var(--n400);">4</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:8px;height:8px;background:var(--p);border-radius:2px;"></div><span style="font-size:9px;color:var(--n400);">8</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:12px;height:12px;background:var(--p);border-radius:2px;"></div><span style="font-size:9px;color:var(--n400);">12</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:16px;height:16px;background:var(--p);border-radius:3px;"></div><span style="font-size:9px;color:var(--n400);">16</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:20px;height:20px;background:var(--p);border-radius:4px;"></div><span style="font-size:9px;color:var(--n400);">20</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:24px;height:24px;background:var(--p);border-radius:4px;"></div><span style="font-size:9px;color:var(--n400);">24</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:32px;height:32px;background:var(--p);border-radius:6px;"></div><span style="font-size:9px;color:var(--n400);">32</span></div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <div style="width:36px;height:36px;border:1.5px solid var(--p);border-radius:4px;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:var(--p);">r4</span></div>
      <div style="width:36px;height:36px;border:1.5px solid var(--p);border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:var(--p);">r8</span></div>
      <div style="width:36px;height:36px;border:1.5px solid var(--p);border-radius:12px;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:var(--p);">r12</span></div>
      <div style="width:36px;height:36px;border:1.5px solid var(--p);border-radius:16px;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:var(--p);">r16</span></div>
      <div style="width:48px;height:24px;border:1.5px solid var(--p);border-radius:999px;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:var(--p);">pill</span></div>
    </div>
  </div>
</div>

<!-- ═══ BOTÕES ═══ -->
<div class="sec">
  <div class="sec-t">Botões</div>
  <div class="row">
    <button class="btn btn-primary">Primário</button>
    <button class="btn btn-secondary">Secundário</button>
    <button class="btn btn-ghost">Ghost</button>
  </div>
  <div class="row">
    <button class="btn btn-danger">Destrutivo</button>
    <button class="btn btn-loading" disabled>Carregando...</button>
    <button class="btn btn-disabled" disabled>Inativo</button>
  </div>
  <button class="btn btn-primary btn-full" style="margin-bottom:8px;">Botão Full Width</button>
  <div class="row">
    <button class="btn btn-primary btn-sm">Pequeno</button>
    <button class="btn btn-secondary btn-sm">Pequeno</button>
    <button class="btn btn-ghost btn-sm">Ghost Sm</button>
  </div>
</div>

<!-- ═══ INPUTS ═══ -->
<div class="sec">
  <div class="sec-t">Inputs & Form</div>
  <div class="card">
    <div class="inp-wrap">
      <label class="inp-lbl">Nome completo</label>
      <input class="inp" placeholder="Pedro Henrique" />
    </div>
    <div class="inp-wrap">
      <label class="inp-lbl">Email</label>
      <input class="inp inp-err" placeholder="pedro@email.com" value="pedro@email" />
      <span class="inp-msg err">Email inválido</span>
    </div>
    <div class="inp-wrap" style="margin-bottom:0;">
      <label class="inp-lbl">Senha</label>
      <input class="inp inp-ok" type="password" value="12345678" />
      <span class="inp-msg ok">Senha válida</span>
    </div>
  </div>
  <!-- SLIDER -->
  <div class="card" style="margin-bottom:8px;">
    <div style="font-size:12px;font-weight:600;color:var(--n700);margin-bottom:10px;">Atributos técnicos</div>
    <div class="slider-wrap"><span class="slider-lbl">Velocidade</span><input type="range" min="0" max="100" value="78" style="flex:1;accent-color:var(--p);" /><span class="slider-val">78</span></div>
    <div class="slider-wrap"><span class="slider-lbl">Finalização</span><input type="range" min="0" max="100" value="65" style="flex:1;accent-color:var(--p);" /><span class="slider-val">65</span></div>
    <div class="slider-wrap"><span class="slider-lbl">Passe</span><input type="range" min="0" max="100" value="72" style="flex:1;accent-color:var(--p);" /><span class="slider-val">72</span></div>
  </div>
  <!-- TOGGLE -->
  <div class="card" style="padding:0 14px;">
    <div class="toggle-wrap"><span style="font-size:13px;font-weight:500;color:var(--n800);">Notificações push</span><div class="toggle"><div class="knob"></div></div></div>
    <div class="toggle-wrap"><span style="font-size:13px;font-weight:500;color:var(--n800);">Perfil público</span><div class="toggle off"><div class="knob"></div></div></div>
    <div class="toggle-wrap"><span style="font-size:13px;font-weight:500;color:var(--n800);">Disponível como goleiro</span><div class="toggle"><div class="knob"></div></div></div>
  </div>
</div>

<!-- ═══ BADGES & TAGS ═══ -->
<div class="sec">
  <div class="sec-t">Badges, Tags & Status</div>
  <div class="row">
    <span class="badge badge-ok">Confirmado</span>
    <span class="badge badge-warn">Pendente</span>
    <span class="badge badge-err">Inadimplente</span>
    <span class="badge badge-inf">Agendada</span>
    <span class="badge badge-n">Mensalista</span>
  </div>
  <div class="row">
    <span class="badge badge-gold">Profissional</span>
    <span class="badge badge-silver">Amador</span>
    <span class="badge badge-bronze">Casual</span>
  </div>
  <div class="row">
    <span class="tag tag-campo">Campo</span>
    <span class="tag tag-society">Society</span>
    <span class="tag tag-futsal">Futsal</span>
  </div>
  <!-- OVERALL -->
  <div class="row" style="margin-top:4px;">
    <div class="ovr"><span class="ovr-num">78</span><span class="ovr-lbl">OVR</span></div>
    <div class="ovr ovr-mid"><span class="ovr-num">55</span><span class="ovr-lbl">OVR</span></div>
    <div class="ovr ovr-low"><span class="ovr-num">38</span><span class="ovr-lbl">OVR</span></div>
    <div class="ovr ovr-high"><span class="ovr-num">90</span><span class="ovr-lbl">OVR</span></div>
  </div>
</div>

<!-- ═══ AVATARES ═══ -->
<div class="sec">
  <div class="sec-t">Avatar</div>
  <div class="row" style="align-items:center;">
    <div class="av av-lg av-blue">PH</div>
    <div class="av av-md av-blue">LS</div>
    <div class="av av-sm av-green">RF</div>
    <div class="av av-xs av-amber">GL</div>
    <div style="margin-left:8px;">
      <div style="font-size:12px;color:var(--n500);">Tamanhos: 56 · 40 · 32 · 24px</div>
      <div style="font-size:11px;color:var(--n400);margin-top:2px;">Fallback com iniciais coloridas</div>
    </div>
  </div>
</div>

<!-- ═══ CARD DE PARTIDA ═══ -->
<div class="sec">
  <div class="sec-t">Card de Partida</div>
  <div class="match-card">
    <div class="match-hdr">
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--n700);">Sáb, 25 Mai · 16:00</div>
        <div style="font-size:11px;color:var(--n400);">Campo Arena Show · São Paulo, SP</div>
      </div>
      <span class="conf-pill">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        Confirmado
      </span>
    </div>
    <div class="match-body">
      <div class="vs-row">
        <div class="team-block">
          <div class="team-logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div>
          <div class="team-name">Resenha FC</div>
        </div>
        <span class="vs-badge">VS</span>
        <div class="team-block">
          <div class="team-logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ok-d)" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div>
          <div class="team-name">Amigos FC</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span class="tag tag-campo">Campo</span>
        <span class="badge badge-inf" style="font-size:10px;">16 vagas</span>
        <span class="badge badge-n" style="font-size:10px;">Overall 72+</span>
        <span class="badge badge-n" style="font-size:10px;">2.3 km</span>
      </div>
      <div style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span style="font-size:11px;color:var(--n400);">Vagas preenchidas</span><span style="font-size:11px;font-weight:600;color:var(--p);">10/16</span></div>
        <div class="prog-bg"><div class="prog-fill" style="width:62.5%;background:var(--p);"></div></div>
      </div>
    </div>
  </div>
  <!-- finalizada -->
  <div class="match-card">
    <div class="match-hdr">
      <div><div style="font-size:12px;font-weight:600;color:var(--n700);">Qui, 29 Mai · 19:00</div><div style="font-size:11px;color:var(--n400);">Arena Society</div></div>
      <span class="badge badge-n">Finalizada</span>
    </div>
    <div class="match-body">
      <div class="vs-row">
        <div class="team-block"><div class="team-logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div><div class="team-name">Time Azul</div></div>
        <span class="score-big">3 × 1</span>
        <div class="team-block"><div class="team-logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--err)" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div><div class="team-name">Time Verm.</div></div>
      </div>
      <span class="tag tag-society">Society</span>
    </div>
  </div>
</div>

<!-- ═══ CARD DE ATLETA ═══ -->
<div class="sec">
  <div class="sec-t">Card de Atleta</div>
  <div class="card">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div class="av av-lg av-blue">PH</div>
      <div style="flex:1;">
        <div style="font-size:15px;font-weight:700;color:var(--n900);">Pedro Henrique</div>
        <div style="font-size:12px;color:var(--n500);margin-top:1px;">Meia · 26 anos · São Paulo, SP</div>
        <div style="display:flex;gap:6px;margin-top:6px;align-items:center;">
          <div class="ovr"><span class="ovr-num">78</span><span class="ovr-lbl">OVR</span></div>
          <span class="badge badge-silver">Amador</span>
          <span class="badge badge-ok">Ativo</span>
        </div>
      </div>
    </div>
    <div class="stat-row"><span class="stat-lbl">Técnica</span><div class="prog-bg" style="flex:1;"><div class="prog-fill" style="width:78%;background:var(--p);"></div></div><span class="stat-val">78</span></div>
    <div class="stat-row"><span class="stat-lbl">Velocidade</span><div class="prog-bg" style="flex:1;"><div class="prog-fill" style="width:72%;background:var(--p);"></div></div><span class="stat-val">72</span></div>
    <div class="stat-row"><span class="stat-lbl">Finalização</span><div class="prog-bg" style="flex:1;"><div class="prog-fill" style="width:76%;background:var(--ok);"></div></div><span class="stat-val">76</span></div>
    <div class="stat-row"><span class="stat-lbl">Marcação</span><div class="prog-bg" style="flex:1;"><div class="prog-fill" style="width:70%;background:var(--warn);"></div></div><span class="stat-val">70</span></div>
  </div>

  <!-- membro row -->
  <div class="card" style="padding:0 14px;">
    <div class="mem-row">
      <div class="av av-md av-blue">PH</div>
      <div class="mem-info"><div class="mem-name">Pedro Henrique</div><div class="mem-sub">Meia · OVR 78</div></div>
      <span class="badge badge-ok">Pago</span>
    </div>
    <div class="mem-row">
      <div class="av av-md av-green">LS</div>
      <div class="mem-info"><div class="mem-name">Lucas Silva</div><div class="mem-sub">Atacante · OVR 80</div></div>
      <span class="badge badge-ok">Pago</span>
    </div>
    <div class="mem-row">
      <div class="av av-md av-amber">BL</div>
      <div class="mem-info"><div class="mem-name">Bruno Lima</div><div class="mem-sub">Lateral · OVR 68</div></div>
      <span class="badge badge-warn">Pendente</span>
    </div>
    <div class="mem-row">
      <div class="av av-md" style="background:var(--err-l);color:var(--err-d);">CE</div>
      <div class="mem-info"><div class="mem-name">Carlos Eduardo</div><div class="mem-sub">Membro · OVR 65</div></div>
      <span class="badge badge-err">Inadimplente</span>
    </div>
  </div>
</div>

<!-- ═══ FINANCEIRO ═══ -->
<div class="sec">
  <div class="sec-t">Financeiro — Transações</div>
  <div class="card" style="padding:0 14px;">
    <div class="tx-row">
      <div class="tx-ico tx-in">💸</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:500;color:var(--n800);">Mensalidade — Mai/2024</div><div style="font-size:11px;color:var(--n400);margin-top:1px;">Resenha FC · Vence 10/05</div></div>
      <div class="tx-val-in">+ R$ 80</div>
    </div>
    <div class="tx-row">
      <div class="tx-ico tx-pend">📋</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:500;color:var(--n800);">Partida — 25 Mai</div><div style="font-size:11px;color:var(--n400);margin-top:1px;">Vence 25/05</div></div>
      <div class="tx-val-pend">R$ 20</div>
    </div>
    <div class="tx-row">
      <div class="tx-ico tx-out">🏟️</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:500;color:var(--n800);">Aluguel de Quadra</div><div style="font-size:11px;color:var(--n400);margin-top:1px;">Arena Show · 25 Mai · Vence 20/05</div></div>
      <div class="tx-val-out">− R$ 300</div>
    </div>
  </div>
</div>

<!-- ═══ QUADRA CARD ═══ -->
<div class="sec">
  <div class="sec-t">Card de Quadra</div>
  <div class="q-card">
    <div class="q-img">🏟️</div>
    <div class="q-info">
      <div style="font-size:13px;font-weight:700;color:var(--n900);">Arena Show</div>
      <div style="font-size:11px;color:var(--n400);margin-top:1px;">Society · Coberto</div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
        <span style="font-size:11px;color:var(--warn-d);font-weight:600;">★ 4.8</span>
        <span style="font-size:10px;color:var(--n400);">1.2 km</span>
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--p);margin-top:3px;">A partir de R$ 300,00</div>
    </div>
  </div>
</div>

<!-- ═══ EMPTY / ERROR / SKELETON ═══ -->
<div class="sec">
  <div class="sec-t">Estados</div>
  <!-- EMPTY -->
  <div class="card" style="display:flex;flex-direction:column;align-items:center;padding:24px 16px;margin-bottom:8px;">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--p-l);display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div style="font-size:15px;font-weight:600;color:var(--n900);margin-bottom:4px;">Nenhuma partida</div>
    <div style="font-size:13px;color:var(--n400);text-align:center;margin-bottom:14px;">Você ainda não tem partidas agendadas. Crie uma ou aguarde um convite.</div>
    <button class="btn btn-primary btn-sm">Criar partida</button>
  </div>
  <!-- ERROR -->
  <div class="card" style="display:flex;flex-direction:column;align-items:center;padding:20px 16px;margin-bottom:8px;border-color:var(--err);">
    <div style="width:44px;height:44px;border-radius:50%;background:var(--err-l);display:flex;align-items:center;justify-content:center;margin-bottom:10px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--err)" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div style="font-size:14px;font-weight:600;color:var(--err-d);">Erro ao carregar</div>
    <div style="font-size:12px;color:var(--n400);margin-top:3px;">Verifique sua conexão e tente novamente.</div>
    <button class="btn btn-secondary btn-sm" style="margin-top:12px;">Tentar novamente</button>
  </div>
  <!-- SKELETON -->
  <div class="card">
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
      <div class="skel skel-av" style="width:40px;height:40px;"></div>
      <div style="flex:1;"><div class="skel skel-text" style="width:60%;"></div><div class="skel skel-text" style="width:40%;height:10px;"></div></div>
    </div>
    <div class="skel skel-text" style="width:100%;"></div>
    <div class="skel skel-text" style="width:80%;"></div>
    <div class="skel skel-text" style="width:90%;"></div>
  </div>
</div>

<!-- ═══ NOTIFICAÇÕES ═══ -->
<div class="sec">
  <div class="sec-t">Notificações</div>
  <div class="card" style="padding:0 14px;">
    <div class="notif-row">
      <div class="notif-dot"></div>
      <div class="av av-sm av-blue" style="flex-shrink:0;">RF</div>
      <div style="flex:1;"><div style="font-size:13px;color:var(--n900);line-height:1.4;"><strong>Resenha FC</strong> te convidou para a partida de sábado.</div><div style="font-size:10px;color:var(--n400);margin-top:2px;">Agora</div></div>
    </div>
    <div class="notif-row">
      <div class="notif-dot"></div>
      <div class="av av-sm av-green" style="flex-shrink:0;">GS</div>
      <div style="flex:1;"><div style="font-size:13px;color:var(--n900);line-height:1.4;"><strong>Galera do Society</strong> te convidou para o grupo.</div><div style="font-size:10px;color:var(--n400);margin-top:2px;">3h</div></div>
    </div>
    <div class="notif-row">
      <div class="notif-dot read"></div>
      <div class="av av-sm av-blue" style="flex-shrink:0;">SM</div>
      <div style="flex:1;"><div style="font-size:13px;color:var(--n500);line-height:1.4;">Pagamento recebido · Mensalidade — Resenha FC</div><div style="font-size:10px;color:var(--n400);margin-top:2px;">5h</div></div>
    </div>
  </div>
</div>

<!-- ═══ CHIPS / FILTROS ═══ -->
<div class="sec">
  <div class="sec-t">Chips de Filtro · Tabs</div>
  <div class="row" style="margin-bottom:12px;">
    <span class="chip-f on">Todos</span>
    <span class="chip-f">Campo</span>
    <span class="chip-f">Society</span>
    <span class="chip-f">Futsal</span>
  </div>
  <div class="tabs">
    <div class="tab on">Próximas</div>
    <div class="tab">Histórico</div>
  </div>
</div>

<!-- ═══ BOTTOM NAV PREVIEW ═══ -->
<div class="sec">
  <div class="sec-t">Bottom Navigation</div>
  <div class="card" style="padding:0;">
    <div class="bottom-nav" style="border-radius:var(--r12);">
      <button class="nav-btn on">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        <span class="nav-lbl" style="color:var(--p);">Início</span>
      </button>
      <button class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--n400)" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
        <span class="nav-lbl">Partidas</span>
      </button>
      <button class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--n400)" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        <span class="nav-lbl">Grupos</span>
      </button>
      <button class="nav-btn" style="position:relative;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--n400)" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div style="position:absolute;top:2px;right:8px;width:14px;height:14px;border-radius:50%;background:var(--err);border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:white;">3</div>
        <span class="nav-lbl">Notif.</span>
      </button>
      <button class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--n400)" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span class="nav-lbl">Perfil</span>
      </button>
    </div>
  </div>
</div>

<!-- ═══ STATUS TABLE ═══ -->
<div class="sec">
  <div class="sec-t">Tabela de Status</div>
  <div class="card" style="padding:0 14px;">
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--n200);"><span style="font-size:12px;color:var(--n500);">SCHEDULED</span><span class="badge badge-inf">Agendada</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--n200);"><span style="font-size:12px;color:var(--n500);">IN_PROGRESS</span><span class="badge badge-ok">Em andamento</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--n200);"><span style="font-size:12px;color:var(--n500);">FINISHED</span><span class="badge badge-n">Finalizada</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--n200);"><span style="font-size:12px;color:var(--n500);">CANCELLED</span><span class="badge badge-err">Cancelada</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--n200);"><span style="font-size:12px;color:var(--n500);">PAID</span><span class="badge badge-ok">Pago</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--n200);"><span style="font-size:12px;color:var(--n500);">PENDING</span><span class="badge badge-warn">Pendente</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:12px;color:var(--n500);">DECLINED</span><span class="badge badge-err">Recusado</span></div>
  </div>
</div>

</div>
