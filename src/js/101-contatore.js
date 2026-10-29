// ===================================================================== THE METER (FASE 9, Denis, 20 October: «non è cambiato un cazzo»,
// then «vai»): the measurements so far came from a computer without a graphics card that imitates a phone; this shows what really happens on
// Denis's iPhone. Every requestAnimationFrame callback is timed (the frames are grouped by the timestamp the browser gives them), and inside
// the main loop the big pieces too (update, render, the camp, the menu background…). A small chip shows the frames per second; a tap opens
// the panel: now (fps, frame time, our code, the rest = the phone drawing and showing the page, hitches), one row per screen since the page
// opened (zombie map, Zombie menu, chests, packs, battle…), the device (iOS, screen, canvases, inside another page or not) and «Copia», which
// copies everything as text to send in the chat. «Parti della mappa» times the parts of the zombie map for 5 s (with a flush after every
// part: it shows what the graphics card does, and slows the map a little while it runs).
// On in the preview (window.MB_CONTATORE, set by the preview's page) and from Impostazioni → Contatore (SAVE.set.perf); off in the game.
// It costs two performance.now() per callback when on, nothing when off (the requestAnimationFrame wrapper is installed only when on), and
// the chip's text changes twice a second. It draws nothing on the canvases, so the game looks the same.
const CNT={on:false,inst:false,ts:-1,js:0,tj:0,parts:null,scene:'',ring:[],sc:{},order:[],open:false,tm:null,tmT:0,tmN:0,tmRes:null,last:0,pos:0,el:null,pn:null};
const CNT_NAMES={loop:'gioco',frame:'mappa zombie',fxFrame:'casse (effetti)',pkFrame:'bustine',proLoop:'prologo',sceLoop:'creazione',wardLoop:'guardaroba',
  step:'animazioni del menu',whLoop:'ruota',update:'· aggiornamento',render:'· disegno della stanza',hud:'· scritte',drawCamp:'· cripta e falò',drawMenuBg:'· sfondo dei menu',
  drawHeroPreview:'· eroe nel menu'};
const CNT_TM={beings:'aggiornamento zombie ed eroe',ambient:'nebbia, foglie, fumo',area:'aggiornamento della mappa',backdrop:'fondo',world:'mondo (terreno, case, oggetti, zombie)',dark:'buio e luci',hud:'scritte'};
function cntWanted(){const s=SAVE&&SAVE.set||{};return s.perf===true||(s.perf!==false&&!!window.MB_CONTATORE)}
function cntScene(){try{
  if(typeof LOAD!=='undefined'&&LOAD.on)return'Caricamento';if(PRO.on)return'Prologo';if(SCE.on)return'Creazione dell\'eroe';if(INTRO.on)return'Filmato';if(ZG.on)return'Mappa zombie';
  if(PK.on)return'Bustine';if(!$('chestScr').hidden)return'Casse';
  if(!$('menu').hidden){const z=SAVE.modo==='zombie';return(z?'Menu Zombie':'Menu Classica')+($('tabPlay').hidden?' (pagine)':'')}
  return'Battaglia'}catch(e){return'Altro'}}
// one frame is over: its length (from the previous frame's timestamp) and what our code took in it
function cntEnd(dt){if(document.hidden||dt>1000||dt<=0)return;const s=CNT.scene,R=CNT.ring,tj=CNT.tj;CNT.tj=0;R.push({i:dt,j:CNT.js,t:tj,s,p:CNT.parts});if(R.length>720)R.shift();
  let S=CNT.sc[s];if(!S){S=CNT.sc[s]={n:0,i:0,j:0,t:0,b34:0,b50:0,worst:0,win:0,wn:0,minF:1e9,p:{}};CNT.order.push(s)}
  S.n++;S.i+=dt;S.j+=CNT.js;S.t+=tj;if(dt>34)S.b34++;if(dt>50)S.b50++;if(dt>S.worst)S.worst=dt;S.win+=dt;S.wn++;
  if(S.win>=1000){const f=S.wn*1000/S.win;if(f<S.minF)S.minF=f;S.win=0;S.wn=0}
  for(const k in CNT.parts)S.p[k]=(S.p[k]||0)+CNT.parts[k];
  if(CNT.tm){if(CNT.tmK!=='isole')CNT.tmN+=CNT.parts['mappa zombie']?1:0;if(performance.now()-CNT.tmT>5000)cntTmEnd()}}
function cntFrame(ts){if(ts===CNT.ts)return;if(CNT.ts>=0)cntEnd(ts-CNT.ts);CNT.ts=ts;CNT.js=0;CNT.parts={};CNT.scene=cntScene()}
const CNT_RAF=window.requestAnimationFrame.bind(window),CNT_SI=window.setInterval.bind(window);
function cntInstall(){if(CNT.inst)return;CNT.inst=true;
  window.requestAnimationFrame=function(cb){return CNT_RAF(function(ts){if(!CNT.on)return cb(ts);cntFrame(ts);const t0=performance.now();
    try{return cb(ts)}finally{const d=performance.now()-t0,k=CNT_NAMES[cb.name]||cb.name||'altro';CNT.js+=d;CNT.parts[k]=(CNT.parts[k]||0)+d}})};
  // the code that runs between frames in timers (the music scheduler, the menus): «altro codice»
  const tw=f=>function(fn){if(typeof fn!=='function')return f.apply(window,arguments);const a=Array.prototype.slice.call(arguments);
    a[0]=function(){if(!CNT.on)return fn.apply(this,arguments);const t0=performance.now();try{return fn.apply(this,arguments)}finally{CNT.tj+=performance.now()-t0}};return f.apply(window,a)};
  window.setTimeout=tw(window.setTimeout);window.setInterval=tw(window.setInterval);
  // the big pieces of the main loop (inside «gioco»: they are not added to the frame's code time a second time)
  const wrap=(f,name)=>function(){if(!CNT.on||!CNT.parts)return f.apply(this,arguments);const t0=performance.now();try{return f.apply(this,arguments)}finally{const k=CNT_NAMES[name];CNT.parts[k]=(CNT.parts[k]||0)+performance.now()-t0}};
  update=wrap(update,'update');render=wrap(render,'render');hud=wrap(hud,'hud');drawCamp=wrap(drawCamp,'drawCamp');drawMenuBg=wrap(drawMenuBg,'drawMenuBg');drawHeroPreview=wrap(drawHeroPreview,'drawHeroPreview')}
// «Parti della mappa»: the zombie map's own timers (motore.js, W.dbg.tm) for 5 s; on the Classic's islands «Parti delle isole» the same with
// the islands' timers (cnIsles in src/js/94-classica-nuova.js, ISL.tm: the part names are already the words to show)
const cntIsl=()=>typeof ISL!=='undefined'&&typeof CN!=='undefined'&&CN.on&&!ZG.on&&!$('menu').hidden&&!$('tabPlay').hidden&&$('sheetScr').hidden&&SAVE.modo!=='zombie';   // (under a sheet they stop)
function cntTmStart(){const W=ZM&&ZM.W;
  if(cntIsl()){ISL.tm={};ISL.tmN=0;CNT.tm=ISL.tm;CNT.tmK='isole'}
  else{if(!W||!ZG.on){toast('Apri la mappa zombie o le isole della Classica e poi tocca qui');return}W.dbg.tm={};CNT.tm=W.dbg.tm;CNT.tmK='mappa'}
  CNT.tmT=performance.now();CNT.tmN=0;CNT.tmRes=null;cntDraw(true)}
function cntTmEnd(){const W=ZM&&ZM.W,tm=CNT.tm,isl=CNT.tmK==='isole';CNT.tm=null;if(W)W.dbg.tm=null;if(isl){CNT.tmN=ISL.tmN||0;ISL.tm=null}
  if(!tm||!CNT.tmN){if(tm)toast(isl?'Le isole non si sono disegnate: chiudi quello che c\'è sopra e riprova':'La mappa non si è disegnata: riprova');cntDraw(true);return}const out=[];
  if(isl){for(const k in tm)out.push([k,tm[k]/CNT.tmN])}else for(const k in CNT_TM)if(tm[k]!=null)out.push([CNT_TM[k],tm[k]/CNT.tmN]);
  out.sort((a,b)=>b[1]-a[1]);CNT.tmRes={n:CNT.tmN,rows:out,k:isl?'isole':'mappa'};cntDraw(true)}
const cntF=(v,d)=>(v==null||!isFinite(v)?'–':v.toFixed(d==null?1:d)).replace('.',',');
function cntMed(a){if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y);return b[b.length>>1]}
function cntNow(){const R=CNT.ring;let i=R.length-1,sum=0,n=0,js=0,tj=0,worst=0,b50=0,parts={};const r1=[],j1=[];
  for(let k=R.length-1,acc=0;k>=0&&acc<10000;k--){const f=R[k];acc+=f.i;if(f.i>50)b50++}
  let c30=0;for(;i>=0&&sum<2000;i--){const f=R[i];if(f.i>31&&f.i<36)c30++;sum+=f.i;n++;js+=f.j;tj+=f.t||0;if(f.i>worst)worst=f.i;r1.push(f.i);j1.push(f.j);for(const k in f.p)parts[k]=(parts[k]||0)+f.p[k]}
  return{c30:n?c30/n:0,fps:n?n*1000/sum:0,ms:n?sum/n:0,js:n?js/n:0,tj:n?tj/n:0,worst,b50,parts,n,medI:cntMed(r1),medJ:cntMed(j1),scene:R.length?R[R.length-1].s:CNT.scene}}
function cntDevice(){const u=navigator.userAgent||'',io=u.match(/OS (\d+)_(\d+)/),cv=$('cv'),mz=document.getElementById('mzCv'),cc=$('campCv');
  const sz=c=>c&&c.width?c.width+'×'+c.height:'–';
  return{tel:/iPhone/.test(u)?'iPhone'+(io?' iOS '+io[1]+'.'+io[2]:''):/iPad/.test(u)?'iPad':/Android/.test(u)?'Android':'computer',
    scr:innerWidth+'×'+innerHeight+' ×'+(window.devicePixelRatio||1),dentro:window.self!==window.top,app:!!navigator.standalone||matchMedia('(display-mode: standalone)').matches,
    tele:'stanza '+sz(cv)+(mz?' · mappa '+sz(mz):'')+' · menu '+sz(cc),
    graf:(SAVE.set.q||'auto')+(typeof RESCUT!=='undefined'&&RESCUT?', risoluzione ridotta':'')+(LOWFX?', effetti ridotti':'')}}
function cntText(){const N=cntNow(),D=cntDevice(),L=[];
  L.push('Contatore Mossbound · '+new Date().toLocaleString('it-IT'));
  L.push('Telefono: '+D.tel+' · schermo '+D.scr+(D.app?' · app dalla schermata Home':'')+(D.dentro?' · dentro un\'altra pagina':''));
  L.push('Tele: '+D.tele+' · grafica '+D.graf);
  L.push('Adesso ('+N.scene+'): '+cntF(N.fps,0)+' fps · fotogramma '+cntF(N.ms)+' ms (peggiore '+cntF(N.worst,0)+') · codice '+cntF(N.js)+' ms · altro codice '+cntF(N.tj)+' ms · resto '+cntF(Math.max(0,N.ms-N.js-N.tj))+' ms · scatti 10 s: '+N.b50);
  for(const s of CNT.order){const S=CNT.sc[s];if(!S.n)continue;const top=Object.entries(S.p).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>k+' '+cntF(v/S.n)).join(', ');
    L.push(s+': '+cntF(S.n*1000/S.i,0)+' fps · peggior secondo '+(S.minF<1e9?cntF(S.minF,0):'–')+' · fotogramma '+cntF(S.i/S.n)+' ms (peggiore '+cntF(S.worst,0)+') · persi '+cntF(100*S.b34/S.n,0)+'% · scatti '+S.b50+' in '+cntF(S.i/1000,0)+' s · codice '+cntF(S.j/S.n)+' ms · altro codice '+cntF(S.t/S.n)+' ms ['+top+']')}
  if(CNT.tmRes)L.push('Parti '+(CNT.tmRes.k==='isole'?'delle isole':'della mappa')+' ('+CNT.tmRes.n+' fotogrammi): '+CNT.tmRes.rows.map(([k,v])=>k+' '+cntF(v)).join(', '));
  return L.join('\n')}
function cntHint(N){if(N.n<60)return'';if(N.c30>.8&&N.medJ<15)return'Il telefono tiene la pagina a 30 fotogrammi anche se il codice ci starebbe in 60: Risparmio energetico acceso, oppure la pagina aperta dentro un\'altra (l\'app di Claude)? Prova ad aprirla in Safari.';
  if(N.ms>20&&N.js+N.tj<N.ms*.45)return'Il codice è veloce: il tempo va al telefono che disegna e mostra la pagina (scheda grafica).';
  if(N.ms>20)return'Il tempo va soprattutto al codice del gioco.';return''}
const CNT_POS=['top:calc(env(safe-area-inset-top,0px) + 2px);left:50%;transform:translateX(-50%)','top:46%;left:calc(env(safe-area-inset-left,0px) + 2px)','bottom:calc(env(safe-area-inset-bottom,0px) + 70px);left:50%;transform:translateX(-50%)'];
function cntBuild(){if(CNT.el)return;const st=document.createElement('style');st.textContent=`
#cntChip{position:fixed;z-index:2147483000;padding:3px 8px;border-radius:9px;background:rgba(10,12,16,.78);border:1px solid rgba(255,255,255,.18);color:#eef3e6;
  font:700 11px/1.25 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.02em;white-space:nowrap;pointer-events:auto;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
#cntChip i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:1px}
#cntPanel{position:fixed;z-index:2147483001;left:calc(env(safe-area-inset-left,0px) + 6px);right:calc(env(safe-area-inset-right,0px) + 6px);top:calc(env(safe-area-inset-top,0px) + 30px);max-height:72vh;overflow:auto;
  padding:10px 11px 11px;border-radius:12px;background:rgba(10,12,16,.93);border:1px solid rgba(255,255,255,.2);color:#e8eee0;font:500 11px/1.4 ui-monospace,Menlo,Consolas,monospace;-webkit-user-select:text;user-select:text}
#cntPanel b{color:#fff}#cntPanel h4{margin:8px 0 3px;font:700 11px/1.3 ui-monospace,Menlo,monospace;color:#ffd84a;letter-spacing:.04em;text-transform:uppercase}
#cntPanel .r{display:flex;justify-content:space-between;gap:8px}#cntPanel .r span:last-child{text-align:right;white-space:nowrap}
#cntPanel .sc{margin:4px 0;padding:5px 7px;border-radius:7px;background:rgba(255,255,255,.06)}#cntPanel .hint{margin-top:6px;color:#ffd84a}
#cntPanel .bt{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}#cntPanel button{font:700 12px/1 ui-monospace,Menlo,monospace;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:#2a3140;color:#fff}
#cntPanel button.go{background:#3d6b2a}#cntPanel textarea{width:100%;height:120px;margin-top:6px;font:500 10px/1.3 ui-monospace,Menlo,monospace;background:#11141a;color:#e8eee0;border:1px solid #444;border-radius:6px}`;
  document.head.appendChild(st);
  const c=document.createElement('div');c.id='cntChip';c.setAttribute('role','button');c.setAttribute('aria-label','Contatore dei fotogrammi');c.innerHTML='<i></i><span>– fps</span>';document.body.appendChild(c);
  const p=document.createElement('div');p.id='cntPanel';p.hidden=true;p.innerHTML='<div class="cb"></div><div class="bt"><button class="go" data-a="copia">Copia</button><button data-a="parti" hidden>Parti della mappa · 5 s</button><button data-a="azzera">Azzera</button><button data-a="sposta">Sposta</button><button data-a="chiudi">Chiudi</button></div><textarea hidden readonly></textarea>';document.body.appendChild(p);CNT.el=c;CNT.pn=p;CNT.cb=p.firstChild;
  const stop=e=>e.stopPropagation();for(const ev of['touchstart','touchmove','touchend','pointerdown','pointermove','pointerup','mousedown','click','wheel'])p.addEventListener(ev,stop);
  for(const ev of['touchstart','pointerdown','mousedown'])c.addEventListener(ev,stop);
  c.addEventListener('click',e=>{e.stopPropagation();CNT.open=!CNT.open;p.hidden=!CNT.open;cntDraw(true)});
  p.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='copia'){const tx=cntText(),box=p.querySelector('textarea');box.hidden=false;box.value=tx;
      const sel=()=>{box.focus();box.select();toast('Selezionato: copialo a mano')};try{navigator.clipboard.writeText(tx).then(()=>toast('Copiato: incollalo nella chat'),sel)}catch(err){sel()}return}
    if(a==='azzera'){CNT.ring=[];CNT.sc={};CNT.order=[];CNT.tmRes=null;toast('Azzerato');cntDraw(true);return}
    if(a==='parti'){cntTmStart();return}
    if(a==='sposta'){CNT.pos=(CNT.pos+1)%CNT_POS.length;try{SAVE.set.perfPos=CNT.pos;save()}catch(err){}cntPlace();return}
    if(a==='chiudi'){CNT.open=false;p.hidden=true;return}});
  CNT.pos=(SAVE.set.perfPos|0)%CNT_POS.length;cntPlace()}
function cntPlace(){if(CNT.el)CNT.el.style.cssText=CNT_POS[CNT.pos]}
function cntDraw(full){if(!CNT.el)return;const N=cntNow(),col=N.fps>=50?'#7bd65a':N.fps>=30?'#ffd84a':'#ff6b5a';
  CNT.el.firstChild.style.background=col;CNT.el.lastChild.textContent=(N.n?cntF(N.fps,0):'–')+' fps · '+(N.n?cntF(N.ms,0):'–')+' ms';
  if(!CNT.open||!full)return;const D=cntDevice(),pr=Object.entries(N.parts).sort((a,b)=>b[1]-a[1]).slice(0,7),h=cntHint(N);
  let H=`<div class="r"><b>Adesso · ${N.scene}</b><span>${cntF(N.fps,0)} fps</span></div>
  <div class="r"><span>fotogramma (media · peggiore)</span><span>${cntF(N.ms)} · ${cntF(N.worst,0)} ms</span></div>
  <div class="r"><span>codice del gioco</span><span>${cntF(N.js)} ms</span></div>
  <div class="r"><span>altro codice (musica, menu)</span><span>${cntF(N.tj)} ms</span></div>
  <div class="r"><span>resto (il telefono disegna e mostra)</span><span>${cntF(Math.max(0,N.ms-N.js-N.tj))} ms</span></div>
  <div class="r"><span>scatti oltre 50 ms (ultimi 10 s)</span><span>${N.b50}</span></div>`;
  for(const[k,v] of pr)H+=`<div class="r"><span>&nbsp;&nbsp;${k}</span><span>${cntF(v/Math.max(1,N.n))} ms</span></div>`;
  if(h)H+=`<div class="hint">${h}</div>`;
  if(CNT.tm)H+=`<div class="hint">Misuro le parti ${CNT.tmK==='isole'?'delle isole':'della mappa'}… (${Math.max(0,5-Math.floor((performance.now()-CNT.tmT)/1000))} s)</div>`;
  if(CNT.tmRes){H+=`<h4>Parti ${CNT.tmRes.k==='isole'?'delle isole':'della mappa'}</h4>`;for(const[k,v] of CNT.tmRes.rows)H+=`<div class="r"><span>${k}</span><span>${cntF(v)} ms</span></div>`}
  H+=`<h4>Per schermata</h4>`;
  for(const s of CNT.order){const S=CNT.sc[s];if(!S.n)continue;H+=`<div class="sc"><div class="r"><b>${s}</b><span>${cntF(S.n*1000/S.i,0)} fps</span></div>
    <div class="r"><span>peggior secondo · scatti</span><span>${S.minF<1e9?cntF(S.minF,0):'–'} fps · ${S.b50} in ${cntF(S.i/1000,0)} s</span></div>
    <div class="r"><span>codice · resto</span><span>${cntF((S.j+S.t)/S.n)} · ${cntF(Math.max(0,(S.i-S.j-S.t)/S.n))} ms</span></div></div>`}
  H+=`<h4>Telefono</h4><div>${D.tel} · ${D.scr}${D.app?' · app dalla Home':''}${D.dentro?' · dentro un\'altra pagina':''}</div><div>${D.tele}</div><div>grafica ${D.graf}</div>
`;
  CNT.cb.innerHTML=H;const pb=CNT.pn.querySelector('[data-a="parti"]'),isl=cntIsl();pb.hidden=!ZG.on&&!isl;pb.textContent=isl?'Parti delle isole · 5 s':'Parti della mappa · 5 s'}
function cntSet(on){CNT.on=on;if(on){cntInstall();cntBuild();CNT.el.hidden=false;CNT.ts=-1}else if(CNT.el){CNT.el.hidden=true;CNT.pn.hidden=true;CNT.open=false;if(CNT.tm)cntTmEnd()}}
CNT_SI(()=>{if(CNT.on&&!document.hidden){const ae=document.activeElement,busy=CNT.open&&ae&&ae.tagName==='TEXTAREA'&&CNT.pn.contains(ae);cntDraw(!busy)}},500);
cntSet(cntWanted());
// Impostazioni → Contatore
{const _fs=fillSettings;fillSettings=function(){_fs.apply(this,arguments);const p=$('sheet').querySelector('p.lead');if(!p)return;const on=CNT.on;
  p.insertAdjacentHTML('beforebegin',`<div class="srow"><span>Contatore</span><div class="seg"><button class="${on?'on':''}" data-perf="1">Acceso</button><button class="${on?'':'on'}" data-perf="0">Spento</button></div></div>`)}}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('[data-perf]');if(!b)return;e.stopPropagation();SAVE.set.perf=b.dataset.perf==='1';save();cntSet(SAVE.set.perf);sfx('ui');fillSettings()},true);
