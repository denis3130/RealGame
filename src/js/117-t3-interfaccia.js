// =====================================================================
// 117. MOSSBOUND TRIPLA A · L'INTERFACCIA, I FOGLI E LE FINESTRE (anteprima a parte, con 110–116).
// Denis (2 novembre), fra le parti del menu da rifare: «Interfaccia», «Fogli e finestre», «Menu Zombie». Le stesse forme, gli stessi posti
// e le stesse misure di oggi (niente si sposta, i tocchi restano dove sono): cambiano i materiali, come nei giochi tripla A sul telefono.
// Rilievi più profondi (la luce in cima, l'ombra in fondo, l'ombra morbida sotto), un filo di metallo del colore della modalità intorno a
// ogni bottone (oro nella Classica, verde malato nella Zombie), le monete e i cristalli in tasche incassate, i cinque posti delle casse come
// incastri di pietra con le borchie, una luce che scorre sui bottoni laterali (più spesso su quelli pronti), Gioca d'oro più ricco, la barra
// in basso con la scheda scelta che si accende; i fogli più scuri e caldi col titolo su un nastro, le schede con la loro cornice, le barre
// incassate. Nelle Impostazioni due interruttori dell'anteprima: la luce del 3D («Chiara» o «Da film») e l'interfaccia («Nuova» o «Di prima»,
// per confrontarle). Tutto in CSS: niente costa ai fotogrammi tranne le luci che scorrono (spente con gli effetti ridotti).
// =====================================================================
const T3UI={on:true};
const T3UI_CSS=`
html.t3ui{--t3ink:#15110d}
html.t3ui #menu{--t3a:#f2c14e;--t3a2:#fff1b8;--t3a3:#a8741c;--t3g:255,200,80}
html.t3ui #menu.zmode{--t3a:#9fd36a;--t3a2:#e8ffd0;--t3a3:#3e5e22;--t3g:150,230,110}
html.t3ui #topbar{background:linear-gradient(rgba(12,10,8,.97),rgba(18,15,12,.92) 64%,rgba(12,10,8,0))}
html.t3ui #topbar .av{background:linear-gradient(var(--t3a2),var(--t3a) 45%,var(--t3a3));border-color:var(--t3ink);box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -2px 0 rgba(0,0,0,.35),0 3px 0 var(--t3ink),0 6px 12px rgba(0,0,0,.55),0 0 10px rgba(var(--t3g),.25)}
html.t3ui #topbar .xpb{background:linear-gradient(#0b0908,#1e1915);box-shadow:inset 0 2px 3px rgba(0,0,0,.85),0 1px 0 rgba(255,240,200,.14)}
html.t3ui #tbName{text-shadow:0 2px 0 var(--t3ink),0 0 8px rgba(var(--t3g),.22)}
html.t3ui #topbar .res{background:linear-gradient(#0b0908,#1d1814 55%,#2a241e);box-shadow:inset 0 3px 5px rgba(0,0,0,.8),inset 0 -1px 0 rgba(255,240,200,.14),0 1px 0 rgba(255,240,200,.08)}
html.t3ui #topbar .res span{text-shadow:0 2px 0 var(--t3ink),0 0 6px rgba(var(--t3g),.25)}
html.t3ui #topbar .plus{background:radial-gradient(70% 45% at 50% 22%,rgba(255,255,255,.8),rgba(255,255,255,0) 70%),linear-gradient(#b6ff7e,#55c52e 52%,#2b8a18);box-shadow:inset 0 -3px 0 rgba(0,50,0,.35),0 2px 0 var(--t3ink),0 4px 6px rgba(0,0,0,.4)}
html.t3ui #tbMenu{box-shadow:inset 0 0 0 1.5px rgba(var(--t3g),.55),inset 0 2px 0 rgba(255,255,255,.4),inset 0 -3px 0 rgba(0,0,0,.3),0 3px 0 var(--t3ink),0 6px 10px rgba(0,0,0,.45)}
html.t3ui .sideBtns .qbtn{box-shadow:inset 0 0 0 1.5px rgba(var(--t3g),.42),inset 0 3px 0 rgba(255,255,255,.45),inset 0 -4px 0 rgba(0,0,0,.3),0 3px 0 var(--t3ink),0 8px 14px rgba(0,0,0,.5)}
html.t3ui .sideBtns .qbtn::after{content:'';position:absolute;left:2px;right:2px;top:2px;bottom:2px;border-radius:11px;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,0) 36%,rgba(255,255,255,.42) 47%,rgba(255,255,255,0) 58%) no-repeat;background-size:320% 100%;background-position:150% 0;animation:t3shine 5.2s ease-in-out infinite}
html.t3ui .sideBtns .qbtn.hot::after{animation-duration:2.7s}
html.t3ui .sideBtns .qbtn small{text-shadow:0 2px 0 var(--t3ink),0 0 6px rgba(0,0,0,.6)}
@keyframes t3shine{0%,60%{background-position:150% 0}100%{background-position:-70% 0}}
html.t3ui #heroPill{background:linear-gradient(#5e5446,#2f2922);box-shadow:inset 0 0 0 1.5px rgba(var(--t3g),.45),inset 0 2px 0 rgba(255,255,255,.2),0 3px 0 var(--t3ink),0 7px 12px rgba(0,0,0,.5)}
html.t3ui #heroPill i{box-shadow:inset 0 2px 0 rgba(255,255,255,.6),inset 0 -2px 0 rgba(0,50,0,.3)}
html.t3ui .posti .psl{box-shadow:inset 0 3px 7px rgba(0,0,0,.75),inset 0 -1px 0 rgba(255,240,200,.12),0 2px 0 rgba(0,0,0,.55),0 6px 10px rgba(0,0,0,.35)}
html.t3ui .posti .psl.empty{position:relative;background:radial-gradient(70% 60% at 50% 42%,rgba(70,60,48,.6),rgba(12,10,8,.82)),linear-gradient(#2a241e,#120f0d);border-color:rgba(var(--t3g),.5)}
html.t3ui .posti .psl.empty::before{content:'';position:absolute;inset:3px;border-radius:9px;pointer-events:none;opacity:.85;
  background:radial-gradient(circle at 5px 5px,var(--t3a) 0 1.5px,transparent 2.1px),radial-gradient(circle at calc(100% - 5px) 5px,var(--t3a) 0 1.5px,transparent 2.1px),radial-gradient(circle at 5px calc(100% - 5px),var(--t3a) 0 1.5px,transparent 2.1px),radial-gradient(circle at calc(100% - 5px) calc(100% - 5px),var(--t3a) 0 1.5px,transparent 2.1px)}
html.t3ui .posti .psl.p5{box-shadow:inset 0 0 0 2px rgba(var(--t3g),.4),inset 0 3px 7px rgba(0,0,0,.75),0 0 14px rgba(var(--t3g),.28),0 6px 10px rgba(0,0,0,.35)}
html.t3ui .cnMode{box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.12),inset 0 2px 0 rgba(255,255,255,.24),inset 0 -4px 0 rgba(0,0,0,.32),0 4px 0 var(--t3ink),0 9px 14px rgba(0,0,0,.45)}
html.t3ui .cnMode svg,html.t3ui .modeBtn svg,html.t3ui #tabs button svg{filter:drop-shadow(0 2px 0 rgba(0,0,0,.5))}
html.t3ui .cnMode b,html.t3ui .modeBtn b{text-shadow:0 2px 0 var(--t3ink)}
html.t3ui #menu:not(.zmode) #playBtn:not(.cnInc){background:radial-gradient(80% 60% at 50% 16%,rgba(255,255,255,.55),rgba(255,255,255,0) 60%),linear-gradient(#ffef9a 0%,#ffd33c 44%,#f3a514 52%,#c97a06 100%)}
html.t3ui #playBtn{box-shadow:inset 0 3px 0 rgba(255,255,255,.75),inset 0 -6px 0 rgba(110,50,0,.38),0 5px 0 var(--t3ink),0 11px 20px rgba(0,0,0,.5),0 0 24px rgba(var(--t3g),.32)}
html.t3ui #playBtn span{text-shadow:0 3px 0 var(--t3ink),0 0 14px rgba(255,255,255,.3)}
html.t3ui .modeBtn{box-shadow:inset 0 0 0 1.5px rgba(255,240,200,.25),inset 0 3px 0 rgba(255,255,255,.32),inset 0 -5px 0 rgba(0,0,0,.3),0 4px 0 var(--t3ink),0 10px 16px rgba(0,0,0,.45)}
html.t3ui #tabs{box-shadow:inset 0 2px 0 rgba(var(--t3g),.5),inset 0 4px 0 rgba(0,0,0,.35),0 -6px 14px rgba(0,0,0,.45)}
html.t3ui #tabs button:not(.on){box-shadow:inset 1px 0 0 rgba(255,255,255,.06),inset -1px 0 0 rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.08)}
html.t3ui #tabs button.on{box-shadow:inset 0 3px 0 rgba(255,255,255,.55),inset 0 0 0 2px rgba(var(--t3g),.55),0 -4px 16px rgba(var(--t3g),.35),0 0 0 1px var(--t3ink)}
html.t3ui #tabs button span{text-shadow:0 2px 0 var(--t3ink)}
html.t3ui #sheet{--t3a:#f2c14e;--t3a2:#fff1b8;--t3g:255,200,80;--t3r1:#8a2e22;--t3r2:#4e1912;
  background:radial-gradient(120% 70% at 50% 0%,rgba(255,236,190,.1),rgba(0,0,0,0) 60%),repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0 2px,rgba(0,0,0,0) 2px 7px),linear-gradient(#4a4236,#2b251f 40%,#1f1b16);
  box-shadow:inset 0 0 0 2px rgba(var(--t3g),.35),inset 0 3px 0 rgba(255,255,255,.22),inset 0 -40px 60px rgba(0,0,0,.35),0 -8px 30px rgba(0,0,0,.6)}
html.t3ui:has(#menu.zmode) #sheet{--t3a:#9fd36a;--t3a2:#e8ffd0;--t3g:150,230,110;--t3r1:#3f4a34;--t3r2:#1c2218}
html.t3ui #sheet>h2{text-align:center;margin-left:auto;margin-right:auto;width:fit-content;max-width:86%;padding:4px 26px 6px;border-radius:10px;background:linear-gradient(var(--t3r1),var(--t3r2));color:#fff3d6;border:2px solid var(--t3ink);
  box-shadow:inset 0 0 0 1.5px rgba(var(--t3g),.6),inset 0 2px 0 rgba(255,255,255,.25),0 3px 0 var(--t3ink),0 6px 12px rgba(0,0,0,.45);text-shadow:0 2px 0 var(--t3ink)}
html.t3ui #sheet .mis,html.t3ui #sheet .wk{background:linear-gradient(#4b4337,#332d25);box-shadow:inset 0 0 0 1.5px rgba(var(--t3g),.22),inset 0 2px 0 rgba(255,255,255,.14),0 3px 0 var(--t3ink),0 6px 12px rgba(0,0,0,.35)}
html.t3ui #sheet .bar,html.t3ui #sheet .wkBar,html.t3ui #sheet .xpb{box-shadow:inset 0 2px 3px rgba(0,0,0,.8),0 1px 0 rgba(255,240,200,.1)}
html.t3ui #sheet .seg{box-shadow:inset 0 2px 4px rgba(0,0,0,.6)}
html.t3ui #sheet .seg button.on{background:linear-gradient(var(--t3a2),var(--t3a) 55%,#b9801a);color:#2a1c08;text-shadow:0 1px 0 rgba(255,255,255,.4)}
html.t3ui .btn{box-shadow:inset 0 3px 0 rgba(255,255,255,.45),inset 0 -5px 0 rgba(0,0,0,.25),0 4px 0 var(--t3ink),0 8px 14px rgba(0,0,0,.4)}
html.t3ui .t3set{display:flex;flex-direction:column;gap:8px;margin:2px 0 14px;padding:10px 12px;border:2px solid var(--t3ink);border-radius:12px;background:linear-gradient(#3a2e22,#251d16);box-shadow:inset 0 0 0 1.5px rgba(var(--t3g),.35)}
html.t3ui .t3set b{color:var(--t3a);font-family:var(--display);font-size:15px;text-shadow:0 2px 0 var(--t3ink)}
.t3set{display:flex;flex-direction:column;gap:8px;margin:2px 0 14px}
@media (prefers-reduced-motion:reduce){html.t3ui .sideBtns .qbtn::after{animation:none}}
html.t3ui.t3low .sideBtns .qbtn::after{animation:none;background:none}
`;
(function(){const st=document.createElement('style');st.id='t3uiCss';st.textContent=T3UI_CSS;document.head.appendChild(st);try{T3UI.on=localStorage.getItem('mb_t3_ui')!=='0'}catch(e){}
  document.documentElement.classList.toggle('t3ui',T3UI.on)})();
function t3UiSet(on){T3UI.on=!!on;document.documentElement.classList.toggle('t3ui',T3UI.on);try{localStorage.setItem('mb_t3_ui',T3UI.on?'1':'0')}catch(e){}}
// (the effects down: the lights that run over the buttons stop)
{let lw=null;setInterval(()=>{if(LOWFX!==lw){lw=LOWFX;document.documentElement.classList.toggle('t3low',!!LOWFX)}},1000)}
// the two switches of the preview, on top of the Settings
{const _f=fillSettings;fillSettings=function(){const r=_f.apply(this,arguments);try{const sh=$('sheet'),h=sh.querySelector('h2');const d=document.createElement('div');d.className='t3set';
    d.innerHTML=`<b>Anteprima tripla A</b><div class="seg"><button data-l="chiara">Luce chiara</button><button data-l="film">Luce da film</button></div><div class="seg"><button data-u="1">Interfaccia nuova</button><button data-u="0">Di prima</button></div>`;
    const mark=()=>{d.querySelectorAll('[data-l]').forEach(b=>b.classList.toggle('on',b.dataset.l===T3.luce));d.querySelectorAll('[data-u]').forEach(b=>b.classList.toggle('on',(b.dataset.u==='1')===T3UI.on))};
    d.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{sfx('ui');T3.luce=b.dataset.l;try{localStorage.setItem('mb_t3_luce',T3.luce)}catch(e){}mark()});
    d.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{sfx('ui');t3UiSet(b.dataset.u==='1');mark()});mark();if(h)h.after(d);else sh.prepend(d)}catch(e){t3Err(e)}return r}}
