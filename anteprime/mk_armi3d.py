# Costruisce anteprime/armi3d.html: le dodici armi della modalità zombie in mano all'Arciere 3D, con lo stato vero di ogni arma
# (ARMI.nuova(id), come sulla mappa): spara tenendo premuto, ricarica (caricatore che esce e cade, mano alla cintura, caricatore nuovo,
# carrello; il tamburo del revolver; le cartucce una a una; il razzo), «Prendi» (l'arma che sale e si arma), i suoni del gioco, i bossoli e
# i caricatori che cadono a terra. Viste «Gira» (una grande, si gira col dito) e «4 direzioni»; «Lento» rallenta tutto a un quarto,
# «Da solo» spara e ricarica in ciclo. La pagina costruita non si salva su git.
# Uso: python3 tests/mk.py && python3 anteprime/mk_armi3d.py [arma]
import os,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
game=open(os.path.join(root,'index.html'),encoding='utf-8').read()
start=sys.argv[1] if len(sys.argv)>1 else 'pistola'
ctrl=r'''
// ---------- anteprima: le armi zombie in 3D, con la ricarica, dal vivo ----------
(()=>{const IDS=ARMI3D.ZOMBIE.slice(),NAME=id=>ARMI.DATI[id].n;
let view='gira',cur='__START__',face=Math.PI/2-.55,spin=false,low=false,slow=false,auto=false,zoom=1,ms=0,last=performance.now(),g=null,fire=false,autoT=0,au=false;
if(!IDS.includes(cur))cur=IDS[0];
const HS=()=>Object.assign({},HERO,{hid:'arciere',held:null,quiver:false,gun:cur});
function take(id){cur=id;g=ARMI.nuova(id);g.res=9999;if(g.estrai)g.estrai();ARMI.FX.length=0;build()}
function boot(){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false}catch(e){}
  const ov=document.createElement('div');ov.id='a3';ov.innerHTML=`<style>
  #a3{position:fixed;inset:0;z-index:99999;background:#14171a;font-family:"Baloo 2",system-ui,sans-serif;color:#f6ead2;touch-action:none;user-select:none;-webkit-user-select:none}
  #a3 canvas{position:absolute;inset:0;width:100%;height:100%}
  #a3 .top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 22px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;background:linear-gradient(rgba(10,12,14,.92),rgba(10,12,14,0));pointer-events:none}
  #a3 h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:21px;color:#c8f08a;text-shadow:0 2px 0 #0b0d0f}
  #a3 h1 small{display:block;font-family:"Baloo 2",system-ui;font-size:12.5px;color:#c9d2c2;text-shadow:none;margin-top:-2px}
  #a3 .ms{font-size:12px;color:#b9c2b4;white-space:nowrap;text-align:right}
  #a3 .bar{position:absolute;left:0;right:0;bottom:0;padding:22px 8px calc(10px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;background:linear-gradient(rgba(10,12,14,0),rgba(10,12,14,.95) 26px)}
  #a3 .row{display:flex;gap:5px;justify-content:center;flex-wrap:wrap}
  #a3 button,#a3 select{font:700 13.5px "Baloo 2",system-ui;color:#eef3e6;background:#2c332c;border:2px solid #0b0d0f;border-radius:11px;padding:6px 10px;box-shadow:0 3px 0 #0b0d0f;min-height:36px}
  #a3 select{max-width:230px}
  #a3 button.on{background:#4f6b2a;color:#f2ffd8}#a3 button:active,#a3 button.press{transform:translateY(2px);box-shadow:0 1px 0 #0b0d0f}
  #a3 button.big{font-size:16px;padding:8px 18px;background:#6b2a22;color:#ffe9de}
  #a3 .seg{display:flex}#a3 .seg button{border-radius:0;margin-right:-2px}#a3 .seg button:first-child{border-radius:11px 0 0 11px}#a3 .seg button:last-child{border-radius:0 11px 11px 0;margin-right:0}
  </style><canvas></canvas><div class="top"><h1>Armi zombie in 3D<small id="aSub"></small></h1><span class="ms" id="aMs"></span></div>
  <div class="bar"><div class="row"><div class="seg" id="aView"></div><select id="aGun"></select></div><div class="row" id="aAct"></div><div class="row" id="aOpt"></div></div>`;
  document.body.appendChild(ov);const cvp=ov.querySelector('canvas'),$=id=>ov.querySelector('#'+id);
  const btn=(txt,on,f,cls)=>{const b=document.createElement('button');b.textContent=txt;b.className=(on?'on ':'')+(cls||'');b.onclick=()=>{sound();f();build()};return b};
  function sound(){if(au)return;au=true;try{initAudio();AU.on.sfx=true;AU.on.music=false}catch(e){}}
  window.build=function(){
    $('aView').innerHTML='';for(const[k,n] of[['gira','Gira'],['quattro','4 direzioni']])$('aView').appendChild(btn(n,view===k,()=>{view=k}));
    const s=$('aGun');if(!s.options.length){for(const id of IDS){const o=document.createElement('option');o.value=id;o.textContent=NAME(id);s.appendChild(o)}s.onchange=()=>{sound();take(s.value)}}s.value=cur;
    $('aAct').innerHTML='';const sp=document.createElement('button');sp.textContent='Spara';sp.className='big';
    sp.onpointerdown=e=>{e.preventDefault();sound();fire=true;sp.classList.add('press')};const up=()=>{fire=false;sp.classList.remove('press')};sp.onpointerup=up;sp.onpointerleave=up;sp.onpointercancel=up;$('aAct').appendChild(sp);
    $('aAct').appendChild(btn('Ricarica',false,()=>{if(g.st==='ricarica')return;if(g.id!=='lanciarazzi'){g.mag=0;g.empty=true}else{g.mag=0;g.loaded=0}g.ricarica()}));
    $('aAct').appendChild(btn('Prendi',false,()=>{if(g.estrai)g.estrai()}));
    $('aOpt').innerHTML='';$('aOpt').appendChild(btn('Da solo',auto,()=>{auto=!auto;autoT=0}));$('aOpt').appendChild(btn('Lento',slow,()=>slow=!slow));
    $('aOpt').appendChild(btn('Gira da solo',spin,()=>spin=!spin));$('aOpt').appendChild(btn('Effetti bassi',low,()=>low=!low));
    $('aSub').textContent=NAME(cur)+(view==='gira'?' · trascina per girarlo':'')};
  take(cur);
  let drag=null;cvp.addEventListener('pointerdown',e=>{drag={x:e.clientX,f:face,moved:false}});
  window.addEventListener('pointermove',e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)>6)drag.moved=true;if(drag.moved){if(spin){spin=false;build()}face=drag.f-(e.clientX-drag.x)*.012}});
  window.addEventListener('pointerup',()=>drag=null);window.addEventListener('pointercancel',()=>drag=null);
  cvp.addEventListener('wheel',e=>{zoom=Math.max(.6,Math.min(2.4,zoom*(e.deltaY<0?1.1:1/1.1)))},{passive:true});
  const dpr=Math.min(2,window.devicePixelRatio||1);
  // the ground of the graveyard: dark earth, a few stones and tufts, the light of a lantern in the middle
  function floor(c,W,H){c.fillStyle='#1d211c';c.fillRect(0,0,W,H);for(let i=0;i<70;i++){const x=(i*97.3)%W,y=(i*61.7)%H,r=2+(i*13%7);c.fillStyle=i%3?'rgba(60,70,52,.35)':'rgba(30,26,22,.4)';c.beginPath();c.ellipse(x,y,r*1.6,r*.8,0,0,Math.PI*2);c.fill()}
    const gr=c.createRadialGradient(W/2,H*.5,H*.05,W/2,H*.52,H*.75);gr.addColorStop(0,'rgba(255,214,150,.16)');gr.addColorStop(.55,'rgba(0,0,0,.08)');gr.addColorStop(1,'rgba(0,0,0,.75)');c.fillStyle=gr;c.fillRect(0,0,W,H)}
  const label=(c,t,x,y)=>{c.font='700 12px "Baloo 2",system-ui';c.textAlign='center';c.fillStyle='rgba(0,0,0,.5)';c.fillText(t,x+1,y+1);c.fillStyle='#e9e4d0';c.fillText(t,x,y)};
  let wasRel=false;
  function frame(now){const dt0=Math.min(.05,(now-last)/1000);last=now;const dt=dt0*(slow?.25:1),W=ov.clientWidth,H=ov.clientHeight;
    if(cvp.width!==Math.round(W*dpr)||cvp.height!==Math.round(H*dpr)){cvp.width=Math.round(W*dpr);cvp.height=Math.round(H*dpr)}
    // «Da solo»: two seconds of shooting, then a reload, then again
    let trig=fire;if(auto){autoT+=dt;if(g.st==='pronta'&&g.eq>=1){trig=autoT%3.2<1.6;if(autoT%3.2>=1.6&&g.mag<g.D.mag&&!g.D.auto&&g.id!=='lanciarazzi'){}}if(autoT%3.2>=1.6&&g.st==='pronta'&&g.mag<g.D.mag&&g.id!=='lanciarazzi'){g.mag=Math.min(g.mag,g.D.mag-1);g.ricarica()}}
    const ev=g.update(dt,trig);const out=g._out||{};
    for(const e of ev){if(e.k==='suono'){try{ARMI.suono(cur,e.w,W/2)}catch(er){}}
      else if(e.k==='bossolo'&&out.eject){try{ARMI.espelli(cur,out.eject[0],out.eject[1],0,1,Math.max(6,out.ejectZ||10)*out.sc,e.n||1)}catch(er){}}
      else if(e.k==='caricatore'&&out.mag){try{ARMI.espelliCar(cur,out.mag[0],out.mag[1]-0,0,1,Math.max(4,(out.magFloor[1]-out.mag[1])))}catch(er){}}}
    if(g.id==='mitragliatrice')try{ARMI.motore(g,W/2)}catch(er){}
    ARMI.fxUpdate(dt);if(spin)face-=dt0*.55;
    const c=cvp.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);floor(c,W,H);
    const saved=ctx,lf=LOWFX;ctx=c;LOWFX=low;G.t=now/1000;let cost=0;const top=74,bot=(ov.querySelector('.bar').offsetHeight||150),room=H-top-bot,gp=g.pose();
    try{
      const hero=(x,y,f,sc,o2)=>{const o={style:HS(),noFx:true,gp,out:{}};const t1=performance.now();EROE.arciere(x,y,f,'idle',(now/2400)%1,sc,o);cost+=performance.now()-t1;return o.out};
      if(view==='gira'){const sc=Math.min(W/70,room/60)*zoom,fy=top+room*.5+20*sc,o=hero(W/2,fy,face,sc);
        g._out={sc,eject:o.eject&&[W/2+o.eject[0]*sc,fy+o.eject[1]*sc],ejectZ:o.ejectZ,mag:o.mag&&[W/2+o.mag[0]*sc,fy+o.mag[1]*sc],magFloor:o.magFloor&&[W/2+o.magFloor[0]*sc,fy+o.magFloor[1]*sc]}}
      else{const F=[[Math.PI/2,'Davanti'],[0,'Destra'],[-Math.PI/2,'Dietro'],[Math.PI,'Sinistra']],cols=W>H?4:2,rows=4/cols,cw=W/cols,ch=room/rows,sc=Math.min(cw/56,ch/58)*zoom;let o0=null,base=null;
        for(let i=0;i<4;i++){const x=cw*(i%cols+.5),fy=top+ch*(Math.floor(i/cols)+.5)+18*sc,o=hero(x,fy,F[i][0],sc);if(i===1){o0=o;base=[x,fy]}label(c,F[i][1],x,fy+14+6*sc)}
        g._out={sc,eject:o0.eject&&[base[0]+o0.eject[0]*sc,base[1]+o0.eject[1]*sc],ejectZ:o0.ejectZ,mag:o0.mag&&[base[0]+o0.mag[0]*sc,base[1]+o0.mag[1]*sc],magFloor:o0.magFloor&&[base[0]+o0.magFloor[0]*sc,base[1]+o0.magFloor[1]*sc]}}
      ARMI.fxDraw('suolo');ARMI.fxDraw('aria')}catch(e){console.error(e)}
    ctx=saved;LOWFX=lf;ms=ms*.93+cost*.07;
    $('aMs').innerHTML=ms.toFixed(2)+' ms<br>'+(g.st==='ricarica'?'ricarica…':g.eq<1?'la prende…':(g.id==='lanciarazzi'?(g.loaded>0?'carico':'vuoto'):g.mag+' / '+g.D.mag));
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame)}
if(document.readyState==='complete')setTimeout(boot,300);else window.addEventListener('load',()=>setTimeout(boot,300))})();
'''.replace('__START__',start)
i=game.rfind('})();')
page=game[:i]+'\n'+ctrl+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Armi zombie 3D</title>',1)
open(os.path.join(here,'armi3d.html'),'w',encoding='utf-8').write(page)
print('anteprime/armi3d.html pronto')
