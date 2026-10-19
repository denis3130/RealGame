# Costruisce anteprime/nemici3d.html: i nemici e i boss della modalità Classica rifatti in 3D come l'Arciere (sprite/nemici3d/), disegnati
# dal vivo sopra una copia del gioco. Quattro viste: «Gira» (un mostro grande, si gira col dito), «4 direzioni» (davanti, lato, dietro,
# altro lato, con sotto il mostro di oggi), «Prima e dopo» (oggi e 3D affiancati, girano insieme) e «Tutti» (tutto il gruppo del mostro,
# un tocco ne apre uno). Bottoni per la mossa, ◀ ▶ per passare da un mostro all'altro, effetti bassi, zoom e il tempo di disegno.
# La pagina costruita non si salva su git.
# Uso: python3 anteprime/mk_nemici3d.py [nome]   (nome del mostro da cui parte; senza nome il primo)
#      python3 anteprime/mk_nemici3d.py --nuovi   solo i 4 boss nuovi del terzo giro (sprite/nemici3d/boss3.js) → anteprime/boss3.html
#      python3 anteprime/mk_nemici3d.py --classici  i boss della Classica rifatti (Denis, 15 ottobre: «possenti, belli, fighi, che diano
#        timore»): ogni modello «<boss>2» (es. golem2 in sprite/nemici3d/golem2.js) con sotto quello di oggi → anteprime/boss_classici.html
# I file di lavoro dei costruttori (…2a.js, …2b.js) non entrano mai nelle pagine.
import os,sys,glob
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
game=open(os.path.join(root,'index.html'),encoding='utf-8').read()
ne=open(os.path.join(root,'sprite','nemici','disegno_nemici.js'),encoding='utf-8').read()
d3=os.path.join(root,'sprite','nemici3d')
# the toolkit first, then the monsters in the order of the chapters
order=['base3d.js','boss2kit.js','cap1.js','cap1b.js','cap2.js','cap3.js','cap4.js','umanoidi.js','boss1.js','boss2.js','boss3.js']
import re
files=[f for f in order if os.path.exists(os.path.join(d3,f))]+sorted(os.path.basename(f) for f in glob.glob(os.path.join(d3,'*.js')) if os.path.basename(f) not in order and not re.search(r'2[ab]\.js$',os.path.basename(f)))
src='\n'.join(open(os.path.join(d3,f),encoding='utf-8').read() for f in files)
nuovi='--nuovi' in sys.argv
classici='--classici' in sys.argv
args=[a for a in sys.argv[1:] if not a.startswith('--')]
start=args[0] if args else ('puppeteer' if nuovi else 'golem2' if classici else '')
ctrl=r'''
// ---------- anteprima: nemici e boss della Classica in 3D, dal vivo ----------
(()=>{const GROUPS=[['eroi','Eroi e compagni'],[1,'Capitolo 1 · Muschio'],[2,'Capitolo 2 · Cenere'],[3,'Capitolo 3 · Palude'],[4,'Capitolo 4 · Ghiaccio'],['boss','Boss'],['boss3','Boss nuovi · terzo giro'],['classici','Boss classici rifatti']];
const SOLO=__SOLO__;
// the Classic bosses redone: <boss>2 next to the <boss> of today («Prima e dopo», and under it in «4 direzioni»)
if(SOLO==='classici')for(const id of N3.order){const o=id.replace(/2$/,'');if(id===o||!N3[o]||!/^boss/.test(N3.meta[o].g))continue;const M=N3.meta[id];M.g='classici';
  M.old=(x,y,f,a,pp)=>{const M0=N3.meta[o];N3[o](x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}}
const MOVE={idle:'Fermo',walk:'Cammina',attack:'Attacco',hit:'Colpito'};
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s,moveName=(id,a)=>{const M=N3.meta[id];return cap(M.lab&&M.lab[a]||MOVE[a]||a)};
// the game's type for the drawing of today (when it is not the same name)
const OLD={};
// the order of the game (the chapters, then the bosses arena by arena)
const ORDER=['arciere','cacciatrice','balestriere','druida','muschietto','lucciola','draghetto','mercante','slime','bigslime','bat','goblin','plant','skeleton','mushroom','wisp','beetle','eyeflower','shadoweye','necro','bonelet','imp','magmaslime','obsidian','pyro','bomber',
  'frog','mosquito','croc','snail','tadpole','wolf','snowspirit','icesentinel','golem','salamander','toad','yeti','witch','smith','hydra','icequeen','qmirror','mimic','puppeteer','phoenix','octopus','stag'];
const rank=id=>{const i=ORDER.indexOf(id);return i<0?999:i};
const ids=()=>{const out=[];for(const[g] of GROUPS)for(const id of N3.order.slice().sort((a,b)=>rank(a)-rank(b)))if(N3.meta[id].g===g)out.push(id);for(const id of N3.order)if(!out.includes(id))out.push(id);return SOLO?out.filter(id=>N3.meta[id].g===SOLO):out};
const isBoss=id=>/^boss|classici/.test(N3.meta[id].g);
let view='__VIEW__',cur='__START__',anim='idle',face=Math.PI/2-.5,spin=true,low=false,p2=false,zoom=1,p=0,ms=0,last=performance.now(),tAnim=0;
if(!N3[cur])cur=ids()[0];
// how big each monster is (screen box round its ground point at scale 1, over four directions and all its moves), measured once
const BOX={};
function box(id,a0){const key=id+'|'+(a0||'');if(BOX[key])return BOX[key];const M=N3.meta[id],cv=document.createElement('canvas');cv.width=cv.height=420;const c=cv.getContext('2d'),saved=ctx;ctx=c;let b=[1e9,1e9,-1e9,-1e9];
  try{for(const a of(a0&&M.an.includes(a0)?['idle',a0]:M.an))for(const f of[Math.PI/2,0,-Math.PI/2,Math.PI])for(const pp of[.15,.5,.85]){c.clearRect(0,0,420,420);c.save();N3[id](210,300,f,a,pp,M.sc||1,{noFx:true});c.restore();
    const d=c.getImageData(0,0,420,420).data;for(let y=0;y<420;y+=2)for(let x=0;x<420;x+=2)if(d[(y*420+x)*4+3]>20){b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)}}}catch(e){console.error(e)}
  ctx=saved;if(b[0]>b[2])b=[180,200,240,310];return BOX[key]={l:210-b[0],r:b[2]-210,t:300-b[1],bt:b[3]-300}}
// the monster of today: the game's own drawing with a pretend enemy (kept, so its particles live on)
const OE={};
function oldDraw(id,x,y,f,sc){const M=N3.meta[id];if(M.old){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);try{M.old(0,0,f,anim,p)}catch(e){console.error(e)}ctx.restore();ctx.globalAlpha=1;return}
  const t=OLD[id]!=null?OLD[id]:id;if(!t||!ET[t])return;let e=OE[id];
  if(!e){e=OE[id]=makeE0(t,0,-8,0);e.spawn=0;e.intro=0;e.em=1;e.fa=1;e.z=0;e.hp=e.max;e.ph='show';e.hidden=false;e.alpha=1;e.st='walk';if(t==='hydra'){const g=G.enemies;G.enemies=[e];try{updEnemy(e,.001)}catch(er){}G.enemies=g}}
  e.x=0;e.y=-8;e.face=f;e.t=G.t;e.moving=anim==='walk';e.walk=G.t*9;e.flash=anim==='hit'&&p<.15?.1:0;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);try{shadowFor(e);drawEnemy(e)}catch(er){try{drawEnemy0(e)}catch(e2){}}ctx.restore();ctx.globalAlpha=1}
function newDraw(id,x,y,f,sc,pp){const M=N3.meta[id],fl=anim==='hit'&&(pp==null?p:pp)<.14&&HASF;if(fl){ctx.save();ctx.filter='brightness(1.85) saturate(.6)'}
  try{N3[id](x,y,f,anim,pp==null?p:pp,sc*(M.sc||1),{p2:p2&&isBoss(id)})}finally{if(fl)ctx.restore()}}
function boot(){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  const ov=document.createElement('div');ov.id='n3';ov.innerHTML=`<style>
  #n3{position:fixed;inset:0;z-index:99999;background:#1d1a16;font-family:"Baloo 2",system-ui,sans-serif;color:#f6ead2;touch-action:none;user-select:none;-webkit-user-select:none}
  #n3 canvas{position:absolute;inset:0;width:100%;height:100%}
  #n3 .n3top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 22px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;background:linear-gradient(rgba(16,13,10,.92),rgba(16,13,10,0));pointer-events:none}
  #n3 h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:21px;letter-spacing:.02em;color:#ffd86b;text-shadow:0 2px 0 #1b1612}
  #n3 h1 small{display:block;font-family:"Baloo 2",system-ui;font-size:12px;color:#d9c9a6;letter-spacing:0;text-shadow:none;margin-top:-2px}
  #n3 .n3ms{font-size:12px;color:#d9c9a6;white-space:nowrap;text-align:right}
  #n3 .n3bar{position:absolute;left:0;right:0;bottom:0;padding:22px 8px calc(10px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;background:linear-gradient(rgba(16,13,10,0),rgba(16,13,10,.94) 26px)}
  #n3 .n3row{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;align-items:center}
  #n3 button,#n3 select{font:700 13.5px "Baloo 2",system-ui;color:#f6ead2;background:#3a3027;border:2px solid #1b1612;border-radius:11px;padding:6px 10px;box-shadow:0 3px 0 #1b1612;min-height:34px}
  #n3 select{flex:1;max-width:260px;padding:6px 6px}
  #n3 button.on{background:#7a5a24;color:#fff2c0}#n3 button:active{transform:translateY(2px);box-shadow:0 1px 0 #1b1612}
  #n3 .n3seg button{border-radius:0;margin-right:-2px}#n3 .n3seg button:first-child{border-radius:11px 0 0 11px}#n3 .n3seg button:last-child{border-radius:0 11px 11px 0;margin-right:0}
  #n3 .n3seg{display:flex}
  </style><canvas></canvas><div class="n3top"><h1 id="n3Name"></h1><span class="n3ms" id="n3Ms"></span></div>
  <div class="n3bar"><div class="n3row"><div class="n3seg" id="n3View"></div></div><div class="n3row" id="n3Pick"></div><div class="n3row" id="n3Anim"></div><div class="n3row" id="n3Opt"></div></div>`;
  document.body.appendChild(ov);
  const cvp=ov.querySelector('canvas'),$=id=>ov.querySelector('#'+id);
  const VIEWS=[['gira','Gira'],['quattro','4 direzioni'],['prima','Prima e dopo'],['tutti','Tutti']];
  const btn=(txt,on,f)=>{const b=document.createElement('button');b.textContent=txt;b.className=on?'on':'';b.onclick=()=>{f();build()};return b};
  const pick=id=>{cur=id;const M=N3.meta[id];if(!M.an.includes(anim))anim='idle';tAnim=0};
  function build(){const M=N3.meta[cur],L=ids(),i=L.indexOf(cur),grp=GROUPS.find(g=>g[0]===M.g);
    $('n3View').innerHTML='';for(const[k,n] of VIEWS)$('n3View').appendChild(btn(n,view===k,()=>{view=k;spin=k!=='quattro'}));
    $('n3Pick').innerHTML='';$('n3Pick').appendChild(btn('◀',false,()=>pick(L[(i-1+L.length)%L.length])));
    const s=document.createElement('select');for(const[g,gn] of GROUPS){const og=document.createElement('optgroup');og.label=gn;for(const id of L)if(N3.meta[id].g===g){const o=document.createElement('option');o.value=id;o.textContent=N3.meta[id].n;if(id===cur)o.selected=true;og.appendChild(o)}if(og.children.length)s.appendChild(og)}
    s.onchange=()=>{pick(s.value);build()};$('n3Pick').appendChild(s);$('n3Pick').appendChild(btn('▶',false,()=>pick(L[(i+1)%L.length])));
    $('n3Anim').innerHTML='';for(const a of M.an)$('n3Anim').appendChild(btn(moveName(cur,a),anim===a,()=>{anim=a;tAnim=0}));
    $('n3Opt').innerHTML='';$('n3Opt').appendChild(btn('Gira da solo',spin,()=>spin=!spin));if(isBoss(cur))$('n3Opt').appendChild(btn('Fase 2',p2,()=>p2=!p2));$('n3Opt').appendChild(btn('Effetti bassi',low,()=>low=!low));
    $('n3Opt').appendChild(btn('−',false,()=>zoom=Math.max(.5,zoom/1.2)));$('n3Opt').appendChild(btn('+',false,()=>zoom=Math.min(3,zoom*1.2)));
    $('n3Name').innerHTML=(view==='tutti'?(grp?grp[1]:'Tutti'):M.n)+'<small>'+(view==='gira'?(grp?grp[1]+' · ':'')+'trascina per girarlo':view==='quattro'?(M.g==='boss3'?'sopra la prima fase, sotto la seconda':M.g==='classici'?'sopra il nuovo, sotto quello di oggi':'sopra in 3D, sotto come è oggi'):view==='prima'?(M.g==='classici'?'a sinistra oggi, a destra il nuovo':'a sinistra oggi, a destra in 3D'):'tocca un mostro per vederlo da vicino')+'</small>'}
  pick(cur);build();
  // drag to turn; in «Tutti» a tap on a monster opens it in «Gira»
  let drag=null,cells=null;cvp.addEventListener('pointerdown',e=>{drag={x:e.clientX,f:face,moved:false}});
  window.addEventListener('pointermove',e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)>6)drag.moved=true;if(drag.moved){if(spin){spin=false;build()}face=drag.f-(e.clientX-drag.x)*.012}});
  window.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&view==='tutti'&&cells){const r=cvp.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      for(const q of cells)if(x>=q.x0&&x<q.x1&&y>=q.y0&&y<q.y1){pick(q.id);view='gira';spin=false;build();break}}drag=null});
  window.addEventListener('pointercancel',()=>drag=null);
  cvp.addEventListener('wheel',e=>{zoom=Math.max(.5,Math.min(3,zoom*(e.deltaY<0?1.1:1/1.1)))},{passive:true});
  const dpr=Math.min(2,window.devicePixelRatio||1);
  // a floor of the Classic arena: warm stone slabs with moss in the joints, lit in the middle
  function floor(c,W,H){c.fillStyle='#2b2620';c.fillRect(0,0,W,H);const S=34,ox=(W/2)%S,oy=(H*.5)%S;
    for(let y=-S+oy;y<H+S;y+=S)for(let x=-S+ox;x<W+S;x+=S){const i=Math.round((x-ox)/S),j=Math.round((y-oy)/S),k=((i*7+j*13)%5+5)%5;
      c.fillStyle=['#4a4236','#463e33','#4e463a','#433b31','#4b4338'][k];c.fillRect(x+1.5,y+1.5,S-3,S-3);c.fillStyle='rgba(255,236,200,.05)';c.fillRect(x+1.5,y+1.5,S-3,2);c.fillStyle='rgba(0,0,0,.14)';c.fillRect(x+1.5,y+S-3.5,S-3,2);
      if(k===2){c.fillStyle='rgba(111,160,62,.35)';c.fillRect(x-1.5,y+S*.3,3,S*.4)}}
    const g=c.createRadialGradient(W/2,H*.5,H*.08,W/2,H*.52,H*.78);g.addColorStop(0,'rgba(255,214,150,.13)');g.addColorStop(.5,'rgba(0,0,0,.05)');g.addColorStop(1,'rgba(0,0,0,.72)');c.fillStyle=g;c.fillRect(0,0,W,H)}
  const label=(c,t,x,y,sz)=>{c.font='700 '+(sz||12)+'px "Baloo 2",system-ui';c.textAlign='center';c.fillStyle='rgba(0,0,0,.5)';c.fillText(t,x+1,y+1);c.fillStyle='#e9dcc0';c.fillText(t,x,y)};
  // the scale that fits a monster in a w × h box, and where its ground point goes
  const fit=(id,w,h,a)=>{const b=box(id,a),s=Math.min(w/(2*Math.max(b.l,b.r)+8),h/(b.t+b.bt+8));return{s,gy:(b.t+4)*s,b}};
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const W=ov.clientWidth,H=ov.clientHeight;if(cvp.width!==Math.round(W*dpr)||cvp.height!==Math.round(H*dpr)){cvp.width=Math.round(W*dpr);cvp.height=Math.round(H*dpr)}
    const M=N3.meta[cur],dur=(id,a)=>(N3.meta[id].dur&&N3.meta[id].dur[a])||1.4;tAnim+=dt;p=(tAnim/dur(cur,anim))%1;if(spin)face-=dt*.55;
    const c=cvp.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);floor(c,W,H);
    const saved=ctx,lf=LOWFX;ctx=c;LOWFX=low;G.t=now/1000;let t1=0,cost=0;
    const top=74,bot=(ov.querySelector('.n3bar').offsetHeight||170),room=H-top-bot;
    try{
      if(view==='gira'){const F=fit(cur,W*.92,room*.9,anim),b0=F.b,s0=Math.min(F.s,6),sc=s0*zoom,gy=top+(room-(b0.t+b0.bt+8)*s0)/2+(b0.t+4)*s0;
        t1=performance.now();newDraw(cur,W/2,gy,face,sc);cost=performance.now()-t1}
      else if(view==='prima'){const F=fit(cur,W*.46,room*.8,anim),sc=Math.min(F.s,5)*zoom,gy=top+room*.1+F.gy;oldDraw(cur,W*.27,gy,face,sc);t1=performance.now();newDraw(cur,W*.73,gy,face,sc);cost=performance.now()-t1;
        label(c,'Oggi',W*.27,top+room*.98);label(c,'In 3D',W*.73,top+room*.98)}
      else if(view==='tutti'){const L=ids().filter(id=>N3.meta[id].g===M.g),n=L.length;let best=null;
        for(let cols=1;cols<=5;cols++){const rows=Math.ceil(n/cols),cw=W/cols,ch=room/rows,sz=Math.min(cw,ch);if(!best||sz>best.sz)best={cols,rows,cw,ch,sz}}
        const{cols,cw,ch}=best;cells=[];
        for(let i=0;i<n;i++){const id=L[i],cx=cw*(i%cols+.5),cy=top+ch*Math.floor(i/cols),F=fit(id,cw*.9,ch*.78,N3.meta[id].an.includes(anim)?anim:'idle'),sc=F.s*zoom;cells.push({id,x0:cx-cw/2,x1:cx+cw/2,y0:cy,y1:cy+ch});
          const a0=anim,M2=N3.meta[id];if(!M2.an.includes(anim))anim='idle';t1=performance.now();try{newDraw(id,cx,cy+ch*.06+F.gy,face,sc,(tAnim/dur(id,anim))%1)}finally{anim=a0}cost+=(performance.now()-t1)/n;
          label(c,M2.n,cx,cy+ch*.97,11)}}
      else{const D4=[[Math.PI/2,'Davanti'],[0,'Lato'],[-Math.PI/2,'Dietro'],[Math.PI,'Altro lato']],cw=W/4,F=fit(cur,cw*.95,(room-34)/2*.9,anim),sc=F.s*zoom,y1=top+22,h2=(room-34)/2;
        const nb=M.g==='boss3';for(let i=0;i<4;i++){const x=cw*(i+.5);t1=performance.now();const sp2=p2;if(nb)p2=false;newDraw(cur,x,y1+F.gy,D4[i][0],sc);cost+=(performance.now()-t1)/4;if(nb){p2=true;newDraw(cur,x,y1+h2+12+F.gy,D4[i][0],sc);p2=sp2}else oldDraw(cur,x,y1+h2+12+F.gy,D4[i][0],sc);label(c,D4[i][1],x,y1-4)}
        label(c,nb?'Fase 1':'In 3D',W/2,y1+h2+2);label(c,nb?'Fase 2':'Oggi',W/2,y1+2*h2+20)}
    }catch(e){console.error(e)}
    ctx=saved;LOWFX=lf;ms=ms*.93+cost*.07;$('n3Ms').innerHTML=ms.toFixed(2)+' ms<br>'+moveName(cur,anim);
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame)}
if(document.readyState==='complete')setTimeout(boot,300);else window.addEventListener('load',()=>setTimeout(boot,300))})();
'''.replace('__START__',start).replace('__VIEW__','gira' if start and not nuovi else 'tutti').replace('__SOLO__',"'boss3'" if nuovi else "'classici'" if classici else 'null')
i=game.rfind('})();')
page=game[:i]+'\n'+ne+'\n'+src+'\n'+ctrl+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>'+('Boss nuovi 3D' if nuovi else 'Boss Classici nuovi' if classici else 'Nemici e boss 3D')+'</title>',1)
out='boss3.html' if nuovi else 'boss_classici.html' if classici else 'nemici3d.html'
open(os.path.join(here,out),'w',encoding='utf-8').write(page)
print('anteprime/%s pronto (%d file di mostri)'%(out,len(files)))
