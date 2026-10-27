# Pagina delle mosse leggendarie (Denis, 26 ottobre, sull'albero delle abilità: «Mosse più spettacolari», ogni mossa leggendaria con
# luci e suoni tutti suoi, più grandi da vedere). Una copia del gioco con la Classica nuova (94, 95 e 96, come mk_classica.py) e un
# pannello: scegli un'abilità e una delle sue due mosse leggendarie e la vedi in una stanza vera, coi nemici che tornano sempre, senza
# dover comprare l'albero. L'eroe non muore; per le mosse che lo chiedono la stanza lo fa colpire, scattare, correre, bere la pozione o
# stare con poca salute. «Rifai» la fa ripartire subito. Il gioco vero e la pagina della Classica nuova non cambiano.
# Uso: python3 anteprime/mk_mosse.py [--test] [--build]
#   --test   la pagina per le prove (tests/mosse_test.html, con window.__E come tests/test.html)
#   --build  prima ricostruisce index.html (python3 build.py)
# Uscita: anteprime/mosse.html (con --test tests/mosse_test.html).
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
A=sys.argv[1:];test='--test' in A
if '--build' in A:subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
js=[open(os.path.join(root,'src','js',f),encoding='utf-8').read() for f in ('94-classica-nuova.js','95-ostacoli-3d.js','96-albero-abilita.js')]
if js[0][:300] in s:sys.exit('94-classica-nuova.js è già nel gioco')
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1500,gems:60,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
assert '<title>Mossbound</title>' in s
s=s.replace('<title>Mossbound</title>','<title>Mosse leggendarie</title>'+seed,1)
panel=r"""
// ===================================================================== MOSSE LEGGENDARIE: il pannello della pagina (solo in questa pagina)
(()=>{const MV={open:false,was:null,cur:null,first:true,t0:0,next:{}};window.MV=MV;
  // cosa serve a ogni abilità per far vedere le sue mosse: le abilità da prendere (la prima è la sua), i nemici in fila, e per ogni lato
  // della mossa leggendaria: poca salute (low), colpi presi (hit), scatti (dash), la corsa (run), la pozione (pot), più critici (crit), nemici che
  // tirano (shots: per lo Scudo di lame; altrimenti stanno fermi e non attaccano, così si vede solo la mossa), l'eroe intoccabile (safe)
  const NEED={front:{},multi:{},diag:{},side:{},rear:{b:[{},{hit:1}]},giant:{},ric:{},pierce:{line:1},wallb:{sk:['pierce']},fire:{},ice:{},poison:{group:1},light:{},
    orbit:{b:[{},{shots:1,safe:1}]},dash:{all:{dash:1}},boots:{all:{run:1}},atk:{},aspd:{b:[{low:1},{}]},crit:{b:[{},{crit:1}]},hp:{b:[{low:1},{hit:1}]},heal:{all:{pot:1}},
    shield:{all:{hit:1}},vamp:{hpk:1,b:[{safe:1},{low:1}]}};
  const css=document.createElement('style');css.textContent=`#mvBtn{position:fixed;left:6px;top:46%;z-index:60;width:54px;height:54px;border-radius:50%;border:2px solid #1b1612;background:#ffd24a;color:#1b1612;
    font:800 11px/1.05 system-ui,sans-serif;box-shadow:0 3px 0 #1b1612,0 6px 14px rgba(0,0,0,.4);cursor:pointer}
  #mvRe{position:fixed;right:8px;top:46%;z-index:60;padding:10px 12px;border-radius:14px;border:2px solid #1b1612;background:#b9a4ff;color:#1b1612;font:800 13px system-ui,sans-serif;box-shadow:0 3px 0 #1b1612;cursor:pointer}
  #mvPan{position:fixed;inset:0;z-index:61;background:rgba(9,7,20,.82);display:flex;align-items:center;justify-content:center;padding:12px}
  #mvPan .w{width:min(420px,100%);max-height:94vh;overflow:auto;background:linear-gradient(#2b2056,#171233);border:3px solid #120f22;border-radius:18px;padding:14px;color:#efe9ff;font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #mvPan h2{margin:0 0 4px;font:800 20px/1.2 system-ui,sans-serif;color:#ffe9a8}#mvPan h3{margin:14px 0 6px;font:800 12px/1.2 system-ui,sans-serif;color:#cfc4ef;letter-spacing:.08em;text-transform:uppercase}
  #mvPan p{margin:0 0 8px;color:#d9d0f2;font-size:13px}
  #mvPan .ab{margin:0 0 8px;padding:8px;border-radius:14px;background:rgba(10,8,24,.45);border:1px solid rgba(var(--c),.45)}
  #mvPan .ab b{display:flex;align-items:center;gap:8px;font:800 15px/1.2 system-ui,sans-serif;color:#fff}#mvPan .ab b svg{width:26px;height:26px;flex:none}
  #mvPan .two{display:flex;gap:6px;margin-top:6px}#mvPan .two button{flex:1;min-width:0;padding:8px 8px 9px;border-radius:11px;border:2px solid #120f22;background:rgba(var(--c),.22);color:#fff;
    font:700 13px/1.2 system-ui,sans-serif;text-align:left;cursor:pointer}#mvPan .two button small{display:block;margin-top:3px;font:500 11.5px/1.3 system-ui,sans-serif;color:#ddd4f6}
  #mvPan .two button.on{background:rgb(var(--c));color:#1b1612}#mvPan .two button.on small{color:#2a2240}
  #mvPan .x{margin-top:8px;width:100%;padding:10px;border-radius:12px;border:2px solid #120f22;background:#4a3f74;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer}
  #mvLab{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 58px);z-index:59;width:max-content;max-width:min(360px,92vw);padding:6px 12px;border-radius:12px;background:rgba(14,11,30,.78);
    color:#fff6d8;font:800 14px/1.2 system-ui,sans-serif;text-align:center;pointer-events:none;border:1px solid rgba(var(--c),.6)}
  #mvLab small{display:block;font:500 11.5px/1.3 system-ui,sans-serif;color:#ddd4f6;margin-top:2px}#mvLab i{font-style:normal;color:rgb(var(--c))}`;
  document.head.appendChild(css);
  const btn=document.createElement('button');btn.id='mvBtn';btn.textContent='Mosse';document.body.appendChild(btn);
  const re=document.createElement('button');re.id='mvRe';re.textContent='↺ Rifai';re.hidden=true;document.body.appendChild(re);
  const lab=document.createElement('div');lab.id='mvLab';lab.hidden=true;document.body.appendChild(lab);
  const pan=document.createElement('div');pan.id='mvPan';pan.hidden=true;document.body.appendChild(pan);
  const nm=id=>{const q=SK.find(x=>x.id===id);return q?q.n:id};
  pan.innerHTML=`<div class="w"><h2>Le mosse leggendarie</h2><p>Scegli un'abilità e una delle sue due mosse leggendarie (il passo V dell'albero): la vedi in una stanza vera, coi nemici che tornano sempre. L'eroe non muore. Il gioco non cambia.</p>
    ${TR_GRP.map(([g,ids])=>`<h3>${g}</h3>`+ids.map(id=>{const D=TRD[id],V=D.s[4];return`<div class="ab" style="--c:${trRgb(D.c)}"><b><svg viewBox="0 0 40 40">${ICON[id]||''}</svg>${nm(id)}</b>
      <div class="two">${[0,1].map(b=>`<button data-id="${id}" data-b="${b}">★ ${V[b].n}<small>${V[b].d}</small></button>`).join('')}</div></div>`}).join('')).join('')}
    <button class="x" id="mvClose">Chiudi</button></div>`;
  const show=()=>{if(MV.open)return;MV.open=true;pan.hidden=false;MV.was={paused,modal};if(started)paused=true;modal=true;
    pan.querySelectorAll('.two button').forEach(q=>q.classList.toggle('on',!!MV.cur&&MV.cur.id===q.dataset.id&&MV.cur.b===+q.dataset.b))};
  const hide=()=>{if(!MV.open)return;MV.open=false;pan.hidden=true;if(MV.was){paused=MV.was.paused;modal=MV.was.modal}};
  const label=()=>{const c=MV.cur;re.hidden=!c;if(!c){lab.hidden=true;return}const D=TRD[c.id],q=D.s[4][c.b];lab.hidden=false;lab.style.setProperty('--c',trRgb(D.c));
    lab.innerHTML=`<i>★</i> ${q.n} <i>·</i> ${nm(c.id)}<small>${q.d}</small>`};
  const need=()=>{const c=MV.cur;if(!c)return{};const N=NEED[c.id]||{};return Object.assign({},N.all||{},N.b?N.b[c.b]:{})};
  // i nemici della stanza: tornano sempre, cinque vivi, un po' più resistenti perché si vedano i fuochi, i veleni e i geli; fermi (senza
  // scudi né colpi) tranne per lo Scudo di lame, che vuole i loro colpi
  const TYPES=['goblin','slime','bat','goblin','slime'];let ti=0;
  // i posti: a ventaglio davanti all'eroe (le frecce dritte e le diagonali, che il Ventaglio largo apre a mezzo radiante, trovano tutte qualcuno),
  // in fila per Trapassa tutto, stretti per il Contagio (il veleno passa a chi sta vicino)
  const slots=()=>{const cx=Math.round((L+R)/2),hy=BOT-110,N=NEED[MV.cur.id]||{};if(N.line)return[0,1,2,3,4].map(k=>[cx+(k%2?5:-5),hy-150-k*46]);
    if(N.group)return[[0,0],[-40,-16],[40,-16],[-22,30],[22,30]].map(([dx,dy])=>[cx+dx,hy-230+dy]);
    return[[0,200],[-.5,236],[.5,236],[-.95,222],[.95,222]].map(([a,r])=>[Math.round(cx+Math.sin(a)*r),Math.round(hy-Math.cos(a)*r)])};
  const spot=()=>{const S=slots(),free=S.filter(q=>!G.enemies.some(e=>!e.dead&&e.hp>0&&Math.hypot(e.x-q[0],e.y-q[1])<30));return free.length?free[0]:S[Math.floor(Math.random()*S.length)]};
  const add=k=>{const [x,y]=spot(),e=makeE(TYPES[ti++%TYPES.length],x,y,0,false);e.max=e.hp=Math.round(e.max*((NEED[MV.cur.id]||{}).hpk||5));if(!need().shots)e.trStun=1e6;G.enemies.push(e);return e};
  const refill=()=>{if(!MV.cur||!started||!G||G.state==='dead')return;const alive=G.enemies.filter(e=>!e.dead&&e.hp>0).length;for(let k=alive;k<5;k++)add(k);if(G.state!=='play'){G.state='play';G.door=false}};
  window.MVrefill=refill;
  const begin=go=>{const run=!(started&&G&&!G.ended&&$('menu').hidden);if(run){try{document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(q=>q.hidden=true);SAVE.cn=SAVE.cn||{};SAVE.cn.pick=0;startRun()}catch(err){}
    setTimeout(go,450)}else go()};
  const go=(id,b)=>{MV.cur={id,b};keys.KeyA=keys.KeyD=keys.KeyW=keys.KeyS=false;begin(()=>{try{
      document.querySelectorAll('#skScr,#cnRel,#revScr').forEach(q=>q.hidden=true);modal=false;paused=false;
      const S=trS();for(const k of Object.keys(S))delete S[k];S[id]={lv:5,f3:0,f5:b};
      G.room=3;G.event=null;G.daily=null;buildRoom();G.enemies=[];G.eproj=[];G.arrows=[];G.zones=[];G.state='play';G.door=false;
      const cx=Math.round((L+R)/2),hy=BOT-110,SL=slots();G.rocks=G.rocks.filter(k=>(Math.abs(k.x-cx)>k.r+60||k.y<TOP+60)&&!SL.some(q=>Math.hypot(k.x-q[0],k.y-q[1])<k.r+40));fields={};
      P=makeP();P.x=cx;P.y=hy;P.hp=P.maxhp;P.inv=0;trReset();   // un eroe nuovo a ogni mossa: niente frecce rimaste dalle mosse di prima
      for(const sid of[id,...((NEED[id]||{}).sk||[])]){const s=SK.find(q=>q.id===sid);if(!s)continue;s.f();P.skills[sid]=(P.skills[sid]||0)+1}
      if(need().crit)P.crit=Math.max(P.crit,.6);if(need().pot)P.skills.heal=P.skills.heal||1;trSync();
      TR.t={salvo:.6,bliz:.8,storm:.8,walls:.6,crown:.8,perf:.2,gold:.8,bark:0,cloud:.8};MV.t0=G.t;MV.next={};
      for(let k=0;k<5;k++)add(k);G.bannerT=0;try{bannerEl.classList.remove('show')}catch(err){}label()}catch(err){console.error(err)}})};
  window.MVgo=go;
  const again=()=>{if(!MV.cur||!started)return;Object.assign(TR.t,{salvo:.05,bliz:.05,storm:.05,walls:.05,crown:.05,perf:.05,gold:.05,bark:0,cloud:.05});TR.legSeen={};TR.hpRoom=-1;TR.feast=Math.max(TR.feast,8);MV.next={};
    if(TR.orbOut){P.orbit+=TR.orbOut;TR.orbOut=0}};
  btn.onclick=e=>{e.stopPropagation();show()};re.onclick=e=>{e.stopPropagation();again()};$('mvClose').onclick=e=>{e.stopPropagation();hide()};
  pan.querySelectorAll('.two button').forEach(q=>q.onclick=e=>{e.stopPropagation();hide();modal=false;paused=false;go(q.dataset.id,+q.dataset.b)});
  // niente livelli nuovi, niente porte: la stanza resta questa; i nemici tornano appena uno cade
  {const _g=gainXp;gainXp=function(){if(MV.cur)return;return _g.apply(this,arguments)}}
  {const _k=killE;killE=function(){const r=_k.apply(this,arguments);try{refill()}catch(err){}return r}}
  {const _h=hurtP;hurtP=function(d){if(MV.cur&&P){const n=need();if(n.low||n.safe)return;if(P.hp-(d||0)<=1)P.hp=P.maxhp}return _h.apply(this,arguments)}}
  // quello che la mossa chiede: poca salute, i colpi presi, gli scatti, la corsa, la pozione
  setInterval(()=>{try{const inMenu=!$('menu').hidden&&$('endScr').hidden;
      if(inMenu){if(MV.first||MV.cur){MV.first=false;MV.cur=null;label();keys.KeyA=keys.KeyD=keys.KeyW=keys.KeyS=false;document.querySelectorAll('#sheetScr').forEach(q=>q.hidden=true);show()}return}
      if(!started||!G||!P||!MV.cur)return;
      if(!$('skScr').hidden&&!MV.open){$('skScr').hidden=true;modal=false;paused=false}
      if(paused||MV.open)return;const n=need(),t=G.t,due=(k,per)=>{if(MV.next[k]==null)MV.next[k]=t+.6;if(t>=MV.next[k]){MV.next[k]=t+per;return true}return false};
      if(n.low){P.hp=Math.min(P.hp,P.maxhp*.25);if(due('heart',4))TR.hpRoom=-1}else if(!n.hit)P.hp=P.maxhp;
      if(n.hit&&due('hit',2.2)){P.inv=0;P.dashT=0;hurtP(4);if(P.hp<P.maxhp*.5)P.hp=P.maxhp}
      if(n.dash&&due('dash',1.6)){P.dashCd=0;dash();if(MV.cur.id==='dash'&&MV.cur.b===0)setTimeout(()=>{try{if(started&&!paused)dash()}catch(err){}},260)}
      if(n.pot&&due('pot',3.4))trPotion();
      // la corsa: un ottagono intorno al punto di partenza, sempre in movimento
      if(n.run){const an=Math.floor((t-MV.t0)/.45)%8*Math.PI/4,c=Math.cos(an),sn=Math.sin(an);keys.KeyD=c>.3;keys.KeyA=c<-.3;keys.KeyS=sn>.3;keys.KeyW=sn<-.3}
      refill()}catch(err){}},50);
})();
"""
i=s.rfind('})();')
s=s[:i]+'\n'+'\n'.join(js)+'\n'+panel+('window.__E=s=>eval(s);' if test else '')+s[i:]
out=os.path.join(root,'tests','mosse_test.html') if test else os.path.join(here,'mosse.html')
open(out,'w',encoding='utf-8').write(s)
print(os.path.relpath(out,root),len(s)//1024,'KB')
