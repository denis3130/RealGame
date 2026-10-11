# Costruisce anteprime/mostro.html: i nemici della modalità zombie disegnati dal vivo (sprite/mostri/disegno_mostri.js) sopra una copia
# del gioco, con bottoni per la mossa, trascinamento per girarli, rotazione automatica, effetti bassi e il tempo di disegno.
# Uso: python3 anteprime/mk_mostro.py [nome]   (nome iniziale: spaventapasseri). La pagina costruita non si salva su git.
import os,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
game=open(os.path.join(root,'index.html'),encoding='utf-8').read()
cr=open(os.path.join(root,'sprite','mostri','disegno_mostri.js'),encoding='utf-8').read()
ne=open(os.path.join(root,'sprite','nemici','disegno_nemici.js'),encoding='utf-8').read()
start=sys.argv[1] if len(sys.argv)>1 else 'spaventapasseri'
ctrl=r'''
// ---------- anteprima: i mostri zombie dal vivo ----------
(()=>{const MOSTRI={spaventapasseri:{n:'Zombie spaventapasseri',sc:1.15,an:['idle','walk','attack']},lanterna:{n:'Zombie della lanterna',sc:1.55,an:['idle','walk','attack']},
  zombie:{n:'Zombie della cripta',sc:1.1,an:['idle','walk','attack']},strisciante:{n:'Zombie strisciante',sc:1.1,an:['idle','walk','attack']},minatore:{n:'Zombie minatore',sc:1.1,an:['idle','walk','attack']},
  hound:{n:'Segugio infernale',sc:1.05,an:['idle','walk','attack']},becchino:{n:'Il Becchino',sc:1.9,an:['idle','walk','slam','summon']},
  goblin:{n:'Goblin (classico, rifatto)',sc:1,an:['idle','walk','attack'],ne:1},skeleton:{n:'Scheletro (classico, rifatto)',sc:1.1,an:['idle','walk','attack'],ne:1},slime:{n:'Slime (classico, rifatto)',sc:1,an:['idle','walk','attack'],ne:1},bat:{n:'Pipistrello (classico, rifatto)',sc:1,an:['idle','walk','attack'],ne:1}};
const NOMI={idle:'Fermo',walk:'Cammina',attack:'Attacco',slam:'Palata',summon:'Evoca'},DUR={idle:1.8,walk:1.1,attack:1.6,slam:1.5,summon:1.8};
let kind='__START__',anim='idle',face=Math.PI/2,spin=true,low=false,zoom=1.5,p=0,ms=0,last=performance.now();
function boot(){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  const ov=document.createElement('div');ov.id='spv';ov.innerHTML=`<style>
  #spv{position:fixed;inset:0;z-index:99999;background:#14110e;font-family:"Baloo 2",system-ui,sans-serif;color:#f1e4c6;touch-action:none;user-select:none}
  #spv canvas{position:absolute;inset:0;width:100%;height:100%}
  #spv .top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 8px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(rgba(10,8,6,.9),rgba(10,8,6,0))}
  #spv h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:20px;letter-spacing:.02em;text-shadow:0 2px 0 #1b1612}
  #spv .ms{font-size:13px;opacity:.8;white-space:nowrap}
  #spv .bar{position:absolute;left:0;right:0;bottom:0;padding:10px 10px calc(12px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:linear-gradient(rgba(10,8,6,0),rgba(10,8,6,.92))}
  #spv button,#spv select{font:700 14px "Baloo 2",system-ui;color:#f1e4c6;background:#3a3027;border:2px solid #1b1612;border-radius:12px;padding:8px 12px;box-shadow:0 3px 0 #1b1612}
  #spv button.on{background:#7a5a24;color:#fff2c0}#spv button:active{transform:translateY(2px);box-shadow:0 1px 0 #1b1612}
  #spv .hint{position:absolute;left:0;right:0;bottom:92px;text-align:center;font-size:13px;opacity:.65;pointer-events:none}
  </style><canvas></canvas><div class="top"><h1 id="spvName"></h1><span class="ms" id="spvMs"></span></div>
  <div class="hint">Trascina per girarlo</div><div class="bar" id="spvBar"></div>`;document.body.appendChild(ov);
  const cvp=ov.querySelector('canvas'),bar=ov.querySelector('#spvBar');
  const build=()=>{const M=MOSTRI[kind];ov.querySelector('#spvName').textContent=M.n;bar.innerHTML='';
    const sel=document.createElement('select');for(const k in MOSTRI){const o=document.createElement('option');o.value=k;o.textContent=MOSTRI[k].n;if(k===kind)o.selected=true;sel.appendChild(o)}
    sel.onchange=()=>{kind=sel.value;anim='idle';p=0;build()};bar.appendChild(sel);
    for(const a of M.an){const b=document.createElement('button');b.textContent=NOMI[a]||a;b.className=a===anim?'on':'';b.onclick=()=>{anim=a;p=0;build()};bar.appendChild(b)}
    const mk=(txt,on,f)=>{const b=document.createElement('button');b.textContent=txt;b.className=on?'on':'';b.onclick=()=>{f();build()};bar.appendChild(b)};
    mk('Gira da solo',spin,()=>spin=!spin);mk('Effetti bassi',low,()=>low=!low);mk('−',false,()=>zoom=Math.max(.5,zoom/1.25));mk('+',false,()=>zoom=Math.min(4,zoom*1.25))};
  build();
  // drag to turn
  let drag=null;ov.addEventListener('pointerdown',e=>{if(e.target.closest('.bar,.top'))return;drag={x:e.clientX,f:face};spin=false;build()});
  ov.addEventListener('pointermove',e=>{if(drag){face=drag.f+(e.clientX-drag.x)*.012}});ov.addEventListener('pointerup',()=>drag=null);ov.addEventListener('pointercancel',()=>drag=null);
  const dpr=Math.min(2,window.devicePixelRatio||1);
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const W=ov.clientWidth,H=ov.clientHeight;if(cvp.width!==W*dpr||cvp.height!==H*dpr){cvp.width=W*dpr;cvp.height=H*dpr}
    const M=MOSTRI[kind];p=(p+dt/(DUR[anim]||1.5))%1;if(spin)face+=dt*.6;
    const c=cvp.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#1d1a16';c.fillRect(0,0,W,H);
    // a dark floor of slabs, darker at the edges
    const S=36;c.fillStyle='#15120f';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=S)for(let x=((y/S)%2?-S/2:0);x<W;x+=S){c.fillStyle=((x/S+y/S)|0)%3?'#2a251f':'#26211c';c.fillRect(x+1.5,y+1.5,S-3,S-3)}
    const g=c.createRadialGradient(W/2,H*.55,H*.15,W/2,H*.55,H*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.75)');c.fillStyle=g;c.fillRect(0,0,W,H);
    const saved=ctx,lf=LOWFX;ctx=c;LOWFX=low;G.t=now/1000;const t1=performance.now();const sc=Math.min(W,H)/210*zoom;
    ctx.save();ctx.translate(W/2,H*.6);ctx.scale(sc,sc);try{(M.ne?NE:CR)[kind](0,0,face,anim,p,M.sc)}catch(e){}ctx.restore();
    ms=ms*.92+(performance.now()-t1)*.08;ctx=saved;LOWFX=lf;
    ov.querySelector('#spvMs').textContent=ms.toFixed(1)+' ms · '+NOMI[anim];requestAnimationFrame(frame)}
  requestAnimationFrame(frame)}
if(document.readyState==='complete')setTimeout(boot,300);else window.addEventListener('load',()=>setTimeout(boot,300))})();
'''.replace('__START__',start)
i=game.rfind('})();')
page=game[:i]+'\n'+cr+'\n'+ne+'\n'+ctrl+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Mostri zombie dal vivo</title>',1)
open(os.path.join(here,'mostro.html'),'w',encoding='utf-8').write(page)
print('anteprime/mostro.html pronto (parte da %s)'%start)
