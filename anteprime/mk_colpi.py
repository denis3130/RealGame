# Pagina dei colpi unici (Denis, 20 ottobre: «voglio che gli attacchi tipo che sparano qualcosa siano unici per tutti e adatti al proprio
# stile e design»; le sue risposte: tutti i nemici e i boss della Classica, aspetto, suono e modo di sparare, i 13 boss rifatti, prima una
# pagina da vedere sul telefono). Una copia del gioco con src/js/93-colpi-unici.js e i 13 boss rifatti (modelli e cervelli, come
# mk_boss2.py --tutti), più un pannello: scegli un nemico o un boss e lo vedi sparare contro l'eroe, che non muore e non tira (si può
# cambiare); «Colpi nuovi» / «Colpi di oggi» per confrontare. Il gioco vero non cambia finché 93 non entra in src/ordine.txt.
# Uso: python3 anteprime/mk_colpi.py [--test] [--build]
#   --test   la pagina per le prove (tests/colpi_test.html, con window.__E come tests/test.html; il pannello c'è lo stesso)
#   --build  prima ricostruisce index.html (python3 build.py)
# Uscita: anteprime/colpi.html (con --test tests/colpi_test.html).
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
B={'golem':'89-golem-nuovo.js','salamander':'89-salamandra-nuova.js','toad':'89-rospo-nuovo.js','yeti':'89-yeti-nuovo.js','witch':'89-strega-nuova.js',
   'smith':'89-fabbro-nuovo.js','hydra':'89-idra-nuova.js','icequeen':'89-regina-nuova.js','mimic':'89-mimic-nuovo.js','puppeteer':'89-burattinaio-nuovo.js',
   'phoenix':'89-fenice-nuova.js','octopus':'89-piovra-nuova.js','stag':'89-cervo-nuovo.js'}
A=sys.argv[1:];test='--test' in A
if '--build' in A:subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
parts=[]
kit=os.path.join(root,'sprite','nemici3d','boss2kit.js')
if os.path.exists(kit)and'window.C3K='not in s:parts.append(open(kit,encoding='utf-8').read())
brains=[]
for t,f in B.items():
    bf=os.path.join(root,'src','js',f);mp=os.path.join(root,'sprite','nemici3d',t+'2.js')
    if not os.path.exists(bf)or not os.path.exists(mp):print('manca',t);continue
    src=open(bf,encoding='utf-8').read()
    if src[:400] in s:continue   # already in the game
    parts.append(open(mp,encoding='utf-8').read());brains.append(src)
cu=open(os.path.join(root,'src','js','93-colpi-unici.js'),encoding='utf-8').read()
if cu[:400] in s:cu=''
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:2000,gems:50,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
s=s.replace('<title>Mossbound</title>','<title>Colpi dei nemici</title>'+seed,1)
panel=r"""
// ===================================================================== COLPI UNICI: il pannello della pagina (solo in questa pagina)
(()=>{const CP={open:false,was:null,elite:false,walk:true,noShoot:true,cur:null,first:true};
  const EN=[
    {t:'goblin',n:'Goblin',ch:1,d:"Freccia da bracconiere (punta di selce, una penna rossa e una verde). Mentre mira, una riga di puntini dice dove tirerà. Élite: tre frecce in fila."},
    {t:'skeleton',n:'Scheletro',ch:1,d:"Dardo d'osso della balestra: resta piantato nei muri e nei massi e vibra. Élite: tre dardi paralleli."},
    {t:'bat',n:'Pipistrello',ch:1,el:1,d:"Tira solo l'élite: due strilli di fila, archi rosa e viola che si allargano mentre volano."},
    {t:'plant',n:'Pianta',ch:1,d:"Corona di semi di girasole che girano: rallenta mentre si allarga e resta sospesa come un fiore."},
    {t:'wisp',n:'Fuoco fatuo',ch:1,d:"Fiammelle fatue con gli occhietti che danzano a destra e a sinistra, intrecciandosi."},
    {t:'necro',n:'Negromante',ch:1,d:"Teschietto fantasma con la fiamma verde: batte i denti e ti segue piano per poco, poi va dritto."},
    {t:'eyeflower',n:'Fiore occhio',ch:1,d:"Petali taglienti che girano: quelli di lato curvano e si chiudono dove eri tu."},
    {t:'shadoweye',n:"Occhio d'ombra",ch:1,d:"Lo sguardo: nell'avviso corrono occhietti, poi il raggio viola col cuore bianco e le pupille."},
    {t:'puppet',n:"Burattino d'ombra",ch:1,d:"Il servitore del Burattinaio: spillo d'oro col filo che vola a zig zag come un punto da cucito."},
    {t:'imp',n:'Diavoletto',ch:2,d:"Palla di fuoco con le lingue di fiamma che si spacca in tre braci (cinque l'élite)."},
    {t:'pyro',n:'Piromante',ch:2,d:"Meteora di basalto con le crepe di lava e la coda di fuoco; a terra l'anello di rune e l'ombra che cresce."},
    {t:'bomber',n:'Nano bombarolo',ch:2,d:"Bomba di ferro col tappo d'ottone e la miccia che sfavilla e sfrigola."},
    {t:'frog',n:'Rana',ch:3,d:"Sputo che saltella verso di te a quattro balzi: fa male solo quando tocca terra (guarda l'ombra)."},
    {t:'snowspirit',n:'Spirito della neve',ch:4,d:"Fiocchi di neve a sei punte in una corona che gira a spirale."},
    {t:'icesentinel',n:'Sentinella di ghiaccio',ch:4,d:"Lancia le sue schegge una dopo l'altra: mentre ricrescono è scoperta."}];
  window.CPEN=EN;
  const css=document.createElement('style');css.textContent=`#cpBtn{position:fixed;left:6px;top:46%;z-index:60;width:50px;height:50px;border-radius:50%;border:2px solid #2a1d14;background:#ffd36e;color:#2a1d14;
    font:800 11px/1.05 system-ui,sans-serif;box-shadow:0 3px 0 #2a1d14,0 6px 14px rgba(0,0,0,.4);cursor:pointer}
  #cpPan{position:fixed;inset:0;z-index:61;background:rgba(10,8,14,.8);display:flex;align-items:center;justify-content:center;padding:12px}
  #cpPan .w{width:min(400px,100%);max-height:94vh;overflow:auto;background:#2b2620;border:3px solid #15110d;border-radius:18px;padding:14px;color:#f4ecdc;font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #cpPan h2{margin:0 0 4px;font:800 20px/1.2 system-ui,sans-serif;color:#ffd36e}#cpPan h3{margin:12px 0 6px;font:800 13px/1.2 system-ui,sans-serif;color:#e9c98a;letter-spacing:.06em;text-transform:uppercase}
  #cpPan p{margin:0 0 10px;color:#ddd2bf;font-size:13px}
  #cpPan .seg{display:flex;gap:6px;margin:6px 0 8px}#cpPan .seg button{flex:1;padding:10px 6px;border-radius:12px;border:2px solid #15110d;background:#4a3f33;color:#fff6e4;font:800 14px system-ui,sans-serif;cursor:pointer}
  #cpPan .seg button.on{background:#ffd36e;color:#2a1d14}
  #cpPan .b{display:block;width:100%;margin:0 0 7px;padding:10px 12px;border-radius:12px;border:2px solid #15110d;background:#4a3f33;color:#fff6e4;font:700 15px/1.2 system-ui,sans-serif;cursor:pointer;text-align:left}
  #cpPan .b small{display:block;font:500 12px/1.3 system-ui,sans-serif;color:#d9ccb6;margin-top:3px}
  #cpPan label{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px}
  #cpPan .x{margin-top:8px;width:100%;padding:9px;border-radius:12px;border:2px solid #15110d;background:#5a5046;color:#fff6e4;font:700 14px system-ui,sans-serif;cursor:pointer}
  #cpLab{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 58px);z-index:59;max-width:min(360px,92vw);padding:6px 12px;border-radius:12px;background:rgba(20,16,12,.72);
    color:#fff3d6;font:800 14px/1.2 system-ui,sans-serif;text-align:center;pointer-events:none;border:1px solid rgba(255,211,110,.35)}
  #cpLab small{display:block;font:500 11.5px/1.3 system-ui,sans-serif;color:#e6d8bd;margin-top:2px}#cpLab b{color:#ffd36e}
  #cpLab.old b{color:#9fd0ff}
  #cpP2{position:fixed;right:8px;top:46%;z-index:60;padding:10px 12px;border-radius:14px;border:2px solid #2a1d14;background:#e5484d;color:#fff;font:800 12px system-ui,sans-serif;box-shadow:0 3px 0 #2a1d14;cursor:pointer}`;
  document.head.appendChild(css);
  const BN={golem:'Golem di Muschio',salamander:'Salamandra di Lava',toad:'Re Rospo',yeti:'Yeti delle Vette',witch:'Strega delle Radici',smith:'Il Fabbro Infernale',hydra:"L'Idra della Palude",
    icequeen:'Regina dei Ghiacci',mimic:'Il Mimic',puppeteer:"Il Burattinaio d'Ombra",phoenix:'La Fenice della Forgia',octopus:'La Piovra della Palude',stag:"Il Cervo d'Aurora"};
  const BD=window.CPBD||{};
  const BL=Object.keys(BN).filter(t=>window.BCL&&BCL[t]);
  const btn=document.createElement('button');btn.id='cpBtn';btn.textContent='Colpi';document.body.appendChild(btn);
  const lab=document.createElement('div');lab.id='cpLab';lab.hidden=true;document.body.appendChild(lab);
  const p2=document.createElement('button');p2.id='cpP2';p2.textContent='Fase 2';p2.hidden=true;document.body.appendChild(p2);
  const pan=document.createElement('div');pan.id='cpPan';pan.hidden=true;document.body.appendChild(pan);
  pan.innerHTML=`<div class="w"><h2>I colpi dei nemici</h2><p>Scegli chi vuoi vedere sparare: entri in una stanza con lui. L'eroe non muore. Il gioco vero non cambia.</p>
    <div class="seg"><button id="cpNew" class="on">Colpi nuovi</button><button id="cpOld">Colpi di oggi</button></div>
    <label><input type="checkbox" id="cpEl"> Élite (più colpi)</label>
    <label><input type="checkbox" id="cpWalk" checked> L'eroe cammina avanti e indietro</label>
    <label><input type="checkbox" id="cpNo" checked> L'eroe non tira</label>
    <h3>Nemici</h3>${EN.map((it,i)=>`<button class="b" data-e="${i}">${it.n}<small>${it.d}</small></button>`).join('')}
    ${BL.length?`<h3>I boss rifatti</h3>${BL.map(t=>`<button class="b" data-b="${t}">${BN[t]}<small>${BD[t]||''}</small></button>`).join('')}`:''}
    <button class="x" id="cpClose">Chiudi</button></div>`;
  const show=()=>{if(CP.open)return;CP.open=true;pan.hidden=false;CP.was={paused,modal};if(started)paused=true;modal=true};
  const hide=()=>{if(!CP.open)return;CP.open=false;pan.hidden=true;if(CP.was){paused=CP.was.paused;modal=CP.was.modal}};
  const label=()=>{const c=CP.cur;if(!c){lab.hidden=true;p2.hidden=true;return}lab.hidden=false;lab.className=CU.on?'':'old';
    const nm=c.k==='e'?c.it.n+(CP.elite||c.it.el?' élite':''):BN[c.t],d=c.k==='e'?c.it.d:(BD[c.t]||'');
    lab.innerHTML=`${nm} · <b>${CU.on?'colpi nuovi':'colpi di oggi'}</b>${CU.on&&d?`<small>${d}</small>`:''}`;p2.hidden=c.k!=='b'};
  window.CPlabel=label;
  const clean=()=>{G.eproj=[];G.lobs=[];G.meteors=[];G.lines=[];CU.fx.length=0;CU.stuck.length=0};
  const begin=go=>{const run=!(started&&G&&!G.ended&&$('menu').hidden);if(run){try{document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(q=>q.hidden=true);startRun()}catch(err){}
    setTimeout(go,400)}else go()};
  const goEnemy=it=>{CP.cur={k:'e',it};begin(()=>{try{const ai=[0,0,1,2,3][it.ch]||0;G.arena=ai;G.chapter=ARENAS[ai].ch;G.diff=ARENAS[ai].diff;G.bossLvl=null;G.room=3;G.event=null;G.daily=null;buildRoom();
      G.enemies=[];clean();G.zones=[];G.state='play';G.door=false;const cx=Math.round((L+R)/2),hy=Math.min(BOT-60,TOP+420);G.rocks=G.rocks.filter(k=>Math.hypot(k.x-cx,k.y-(TOP+170))>k.r+60&&!(Math.abs(k.y-hy)<k.r+30&&Math.abs(k.x-cx)<k.r+140)&&!(k.y>TOP+150&&k.y<hy&&Math.abs(k.x-cx)<k.r+40));const e=makeE(it.t,cx,TOP+170,0,CP.elite||!!it.el);e.hp=e.max=1e7;e.cuDemo=1;G.enemies.push(e);
      P.x=cx;P.y=hy;P.hp=P.maxhp;CP.home=P.x;G.bannerT=0;try{bannerEl.classList.remove('show')}catch(err){}label()}catch(err){console.error(err)}})};
  const goBoss=t=>{CP.cur={k:'b',t};begin(()=>{try{BCL[t].enter();P.hp=P.maxhp;label()}catch(err){console.error(err)}})};
  window.CPgo=(k,v)=>k==='e'?goEnemy(EN.find(q=>q.t===v)):goBoss(v);
  btn.onclick=e=>{e.stopPropagation();show()};$('cpClose').onclick=e=>{e.stopPropagation();hide()};
  const setOn=on=>{CU.on=on;$('cpNew').classList.toggle('on',on);$('cpOld').classList.toggle('on',!on);try{if(G)clean()}catch(err){}label()};
  window.CPset=setOn;
  $('cpNew').onclick=e=>{e.stopPropagation();setOn(true)};$('cpOld').onclick=e=>{e.stopPropagation();setOn(false)};
  $('cpEl').onchange=e=>{CP.elite=e.target.checked};$('cpWalk').onchange=e=>{CP.walk=e.target.checked;keys.KeyA=keys.KeyD=false};$('cpNo').onchange=e=>{CP.noShoot=e.target.checked};
  pan.querySelectorAll('.b').forEach(b=>b.onclick=e=>{e.stopPropagation();hide();modal=false;paused=false;if(b.dataset.e!=null)goEnemy(EN[+b.dataset.e]);else goBoss(b.dataset.b)});
  p2.onclick=e=>{e.stopPropagation();try{const c=CP.cur;if(!c||c.k!=='b')return;const q=(BCL[c.t].find&&BCL[c.t].find())||G.enemies.find(o=>o.type===c.t);if(q&&!q.p2)q.hp=Math.min(q.hp,q.max*.48)}catch(err){}};
  {const _v=volley;volley=function(){if(CP.noShoot&&CP.cur)return;return _v.apply(this,arguments)}}
  setInterval(()=>{try{if(!started||!G||!P)return;const inMenu=!$('menu').hidden&&$('endScr').hidden;
      if(inMenu){if(CP.first||CP.cur){CP.first=false;CP.cur=null;label();keys.KeyA=keys.KeyD=false;show()}return}
      if(CP.cur){P.hp=P.maxhp;P.inv=Math.max(P.inv,0)}
      if(CP.cur&&CP.cur.k==='e'){const e=G.enemies.find(q=>q.cuDemo);if(!e&&G.state!=='trans')goEnemy(CP.cur.it);else if(e){e.hp=e.max}}
      if(CP.walk&&CP.cur&&!paused&&!CP.open){const ph=(performance.now()/1000)%4.4,h=CP.home||(L+R)/2;keys.KeyA=ph<1.3&&P.x>h-110;keys.KeyD=ph>=2.2&&ph<3.5&&P.x<h+110}
      else if(!CP.walk){}}catch(err){}},50);
  {const _r=buildRoom;buildRoom=function(){const r=_r.apply(this,arguments);try{if(CP.cur)CP.home=null}catch(err){}return r}}
})();
"""
i=s.rfind('})();')
s=s[:i]+'\n'+'\n'.join(parts)+'\n'+'\n'.join(brains)+'\n'+cu+'\n'+panel+('window.__E=s=>eval(s);' if test else '')+s[i:]
out=os.path.join(root,'tests','colpi_test.html') if test else os.path.join(here,'colpi.html')
open(out,'w',encoding='utf-8').write(s)
print(os.path.relpath(out,root),len(s)//1024,'KB ·',len(brains),'boss')
