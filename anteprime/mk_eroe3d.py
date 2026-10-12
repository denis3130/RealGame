# Costruisce anteprime/eroe3d.html: l'eroe della modalità Classica (l'Arciere) rifatto in 3D (sprite/eroe3d/disegno_eroe.js), con tutte
# le armi in 3D (sprite/eroe3d/armi3d.js: i quattro archi, la balestra, il bastone del Druida e le otto armi della modalità zombie),
# disegnato dal vivo sopra una copia del gioco. Quattro viste: «Gira» (un eroe grande, si gira col dito), «4 direzioni» (davanti, destra,
# dietro, sinistra, con sotto l'eroe di oggi), «Prima e dopo» (oggi e 3D affiancati, girano insieme) e «Tutte le armi» (le 14 armi in mano
# all'eroe, girano insieme). Bottoni per la mossa, l'arma e l'equipaggiamento, il bastoncino di muschio, gli effetti bassi e l'inclinazione
# della telecamera come nella mappa zombie (35°-62°). La pagina costruita non si salva su git.
# Uso: python3 anteprime/mk_eroe3d.py
import os
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
game=open(os.path.join(root,'index.html'),encoding='utf-8').read()
cr=open(os.path.join(root,'sprite','mostri','disegno_mostri.js'),encoding='utf-8').read()
ar=open(os.path.join(root,'sprite','armi','disegno_armi.js'),encoding='utf-8').read()
a3=open(os.path.join(root,'sprite','eroe3d','armi3d.js'),encoding='utf-8').read()
er=open(os.path.join(root,'sprite','eroe3d','disegno_eroe.js'),encoding='utf-8').read()
ctrl=r'''
// ---------- anteprima: l'Arciere in 3D dal vivo ----------
(()=>{const ANIMS=[['idle','Fermo',2.4],['walk','Cammina',.56],['shoot','Tira',1.15],['dash','Scatto',.75],['hit','Colpito',1.1]];
// the weapons: the Classic ones (the cards and the Druid's staff) and the eight of the zombie mode; how long one 'shoot' lasts with each
const WEAPS=[['Classica',['arco_frassino','arco_ricurvo','balestra','arco_spine','arco_fenice','bastone']],['Zombie',['pistola','revolver','mitraglietta','mitra','mitragliatrice','pompa','tattica','lanciarazzi']]];
const ALLW=WEAPS[0][1].concat(WEAPS[1][1]),ISGUN=w=>WEAPS[1][1].includes(w);
const SHOOTD={revolver:1.25,pompa:1.35,tattica:1.4,lanciarazzi:2.3,balestra:1.8,bastone:1.5};
const SLOTS=[['armatura','Armatura',['giubba','cotta','mantello_ombra','corazza_muschio']],
  ['anello','Anello',['','anello_rame','anello_falco','anello_vento','anello_gelo']],['amuleto','Amuleto',['','amuleto_osso','amuleto_luna','amuleto_lame','cuore_drago']]];
const gear={arma:'arco_frassino',armatura:'giubba',anello:'',amuleto:''};
const SHORT={bastone:'Bastone del Druida',pistola:'Pistola',revolver:'Revolver',mitraglietta:'Mitraglietta',mitra:'Mitra',mitragliatrice:'Mitragliatrice',pompa:'Pompa da caccia',tattica:'Pompa tattica',lanciarazzi:'Lanciarazzi',
  arco_frassino:'Arco di frassino',arco_ricurvo:'Arco ricurvo',balestra:'Balestra leggera',arco_spine:'Arco delle spine',arco_fenice:'Arco della fenice',giubba:'Giubba',cotta:'Cotta di maglia',mantello_ombra:"Mantello d'ombra",corazza_muschio:'Corazza di muschio',anello_rame:'Anello di rame',anello_falco:'Anello del falco',anello_vento:'Anello del vento',anello_gelo:'Anello del gelo',amuleto_osso:"Amuleto d'osso",amuleto_luna:'Amuleto lunare',amuleto_lame:'Amuleto delle lame',cuore_drago:'Cuore di drago'};
let view='tutte',anim='idle',face=Math.PI/2,spin=true,low=false,moss=false,eyeLight=true,zoom=1,el=45,p=0,ms=0,last=performance.now(),tAnim=0;
// the style of the Arciere with this gear and weapon, as heroStyle() makes it in the game (for the hero of today and for the 3D one):
// a zombie gun goes in style.gun (no quiver, as in the zombie map), the staff is the Druid's (no quiver, the orb the colour of his eyes)
function styleFor(wp){wp=wp||gear.arma;const a=gear.armatura&&ITEM[gear.armatura],h=HERO_BY&&HERO_BY.arciere;
  const base={...HERO,...(h&&h.style||{}),armor:gear.armatura||null,ring:gear.anello||null,amu:gear.amuleto||null},S={...base,body:a?a.tint.a:HERO.body,hood:a?a.tint.b:HERO.hood};
  if(ISGUN(wp))return{...S,held:null,quiver:false,gun:wp};if(wp==='bastone')return{...S,held:'staff',eyeCol:'#9fff7a',quiver:false};
  const w=ITEM[wp],W=WEAP[wp];return{...S,held:W&&W.held||'bow',bowKind:W&&W.bow,bowCol:w?w.tint.a:HERO.bowCol}}
// the hero of today holds the zombie guns as in the zombie map (ARMI.inMano)
{const _h=held;held=function(St,o,B){if(St.gun&&window.ARMI)return ARMI.inMano(St.gun,B,o.gp||{},o.aim);return _h(St,o,B)}}
const GRIDN={arco_frassino:'Frassino',arco_ricurvo:'Ricurvo',balestra:'Balestra',arco_spine:'Spine',arco_fenice:'Fenice',bastone:'Bastone',pompa:'Pompa',tattica:'Tattica'};
const shootName=()=>ISGUN(gear.arma)?'Spara':gear.arma==='bastone'?'Incanta':'Tira';
// the camera of the zombie map: tilt θ from 35° to 62° (45° = the game today)
function tilt(){const th=el*Math.PI/180,SP=Math.SQRT2*Math.sin(th),CP=Math.SQRT2*Math.cos(th),flat=Math.abs(el-45)<.01,kr=flat?1:Math.sqrt(SP),zk=flat?1:Math.pow(CP,.25);
  Object.assign(CR.cam,{k:flat?.55:.55*kr,zk});RIGCAM.kr=kr;RIGCAM.zk=zk;return{SP,CP}}
// the hero of today: drawRig with its own walk phase and pull (its point is 8 px above the feet)
function oldHero(x,y,f,sc,S){const ph=p*Math.PI*2,mv=anim==='walk',pull=anim==='shoot'?(p<.5?p/.5*5:0):0;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(anim==='hit'&&p<.5){ctx.globalAlpha=Math.floor(p*40)%2?.45:1}
  const lw=mossOn;mossOn=moss&&anim==='idle'?1:0;try{drawRig(0,-8,f,mv?ph:0,mv,S,{pull})}catch(e){}mossOn=lw;ctx.restore()}
function newHero(x,y,f,sc,S,pp){EROE.arciere(x,y,f,anim,pp==null?p:pp,sc,{style:S,moss,eyeLight})}
function boot(){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  const ov=document.createElement('div');ov.id='e3';ov.innerHTML=`<style>
  #e3{position:fixed;inset:0;z-index:99999;background:#1d1a16;font-family:"Baloo 2",system-ui,sans-serif;color:#f6ead2;touch-action:none;user-select:none;-webkit-user-select:none}
  #e3 canvas{position:absolute;inset:0;width:100%;height:100%}
  #e3 .e3top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 22px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(rgba(16,13,10,.92),rgba(16,13,10,0));pointer-events:none}
  #e3 h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:21px;letter-spacing:.02em;color:#ffd86b;text-shadow:0 2px 0 #1b1612}
  #e3 h1 small{display:block;font-family:"Baloo 2",system-ui;font-size:12px;color:#d9c9a6;letter-spacing:0;text-shadow:none;margin-top:-2px}
  #e3 .e3ms{font-size:12px;color:#d9c9a6;white-space:nowrap;text-align:right}
  #e3 .e3bar{position:absolute;left:0;right:0;bottom:0;padding:22px 8px calc(10px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;background:linear-gradient(rgba(16,13,10,0),rgba(16,13,10,.94) 26px)}
  #e3 .e3row{display:flex;gap:5px;justify-content:center;flex-wrap:wrap}
  #e3 button,#e3 select{font:700 13.5px "Baloo 2",system-ui;color:#f6ead2;background:#3a3027;border:2px solid #1b1612;border-radius:11px;padding:6px 10px;box-shadow:0 3px 0 #1b1612;min-height:34px}
  #e3 select{width:calc(50% - 4px);max-width:190px;padding:6px 6px}
  #e3 button.on{background:#7a5a24;color:#fff2c0}#e3 button:active{transform:translateY(2px);box-shadow:0 1px 0 #1b1612}
  #e3 .e3seg button{border-radius:0;margin-right:-2px}#e3 .e3seg button:first-child{border-radius:11px 0 0 11px}#e3 .e3seg button:last-child{border-radius:0 11px 11px 0;margin-right:0}
  #e3 .e3seg{display:flex}
  #e3 label{display:flex;align-items:center;gap:6px;font-size:13px;color:#d9c9a6}
  #e3 input[type=range]{width:120px;accent-color:#ffd86b}
  #e3 .e3hint{position:absolute;left:0;right:0;text-align:center;font-size:12.5px;color:#d9c9a6;opacity:.8;pointer-events:none}
  </style><canvas></canvas><div class="e3top"><h1>L'Arciere in 3D<small id="e3Sub"></small></h1><span class="e3ms" id="e3Ms"></span></div><div class="e3hint" id="e3Hint"></div>
  <div class="e3bar"><div class="e3row"><div class="e3seg" id="e3View"></div></div><div class="e3row" id="e3Anim"></div><div class="e3row" id="e3Gear"></div><div class="e3row" id="e3Opt"></div></div>`;
  document.body.appendChild(ov);
  const cvp=ov.querySelector('canvas'),$=id=>ov.querySelector('#'+id);
  const VIEWS=[['gira','Gira'],['quattro','4 direzioni'],['prima','Prima e dopo'],['tutte','Tutte le armi']];
  const btn=(txt,on,f)=>{const b=document.createElement('button');b.textContent=txt;b.className=on?'on':'';b.onclick=()=>{f();build()};return b};
  function build(){
    $('e3View').innerHTML='';for(const[k,n] of VIEWS)$('e3View').appendChild(btn(n,view===k,()=>{view=k;if(k!=='gira')spin=k==='prima'||k==='tutte'}));
    $('e3Anim').innerHTML='';for(const[k,n] of ANIMS)$('e3Anim').appendChild(btn(k==='shoot'?(view==='tutte'?'Tira e spara':shootName()):n,anim===k,()=>{anim=k;tAnim=0}));
    $('e3Gear').innerHTML='';
    // the weapon: the Classic ones and the zombie ones in two groups
    {const s=document.createElement('select');for(const[g,ids] of WEAPS){const og=document.createElement('optgroup');og.label=g;for(const id of ids){const o=document.createElement('option');o.value=id;o.textContent=SHORT[id];if(gear.arma===id)o.selected=true;og.appendChild(o)}s.appendChild(og)}
      s.onchange=()=>{gear.arma=s.value;tAnim=0;build()};if(view!=='tutte')$('e3Gear').appendChild(s)}
    for(const[slot,n,ids] of SLOTS){const s=document.createElement('select');for(const id of ids){const o=document.createElement('option');o.value=id;o.textContent=id?(SHORT[id]||ITEM[id].n):(slot==='anello'?'Senza anello':'Senza amuleto');if(gear[slot]===id)o.selected=true;s.appendChild(o)}
      s.onchange=()=>{gear[slot]=s.value;build()};$('e3Gear').appendChild(s)}
    $('e3Opt').innerHTML='';$('e3Opt').appendChild(btn('Gira da solo',spin,()=>spin=!spin));$('e3Opt').appendChild(btn('Bastoncino',moss,()=>moss=!moss));
    $('e3Opt').appendChild(btn('Luce negli occhi',eyeLight,()=>eyeLight=!eyeLight));$('e3Opt').appendChild(btn('Effetti bassi',low,()=>low=!low));
    const lb=document.createElement('label');lb.innerHTML=`Telecamera <input type="range" min="35" max="62" step="1" value="${el}"> <b id="e3El">${el}°</b>`;
    const r=lb.querySelector('input');r.oninput=()=>{el=+r.value;lb.querySelector('#e3El').textContent=el+'°'};$('e3Opt').appendChild(lb);
    $('e3Sub').textContent=view==='gira'?SHORT[gear.arma]+' · trascina per girarlo':view==='quattro'?SHORT[gear.arma]+' · sopra in 3D, sotto quello di oggi':view==='prima'?SHORT[gear.arma]+' · a sinistra oggi, a destra in 3D':'Le 14 armi · trascina per girarli, tocca un\'arma per vederla da vicino'}
  build();
  // drag to turn; in «Tutte le armi» a tap on a hero opens that weapon in «Gira»
  let drag=null,cells=null;cvp.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,f:face,moved:false,wasSpin:spin}});
  window.addEventListener('pointermove',e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)>6)drag.moved=true;if(drag.moved){if(spin){spin=false;build()}face=drag.f-(e.clientX-drag.x)*.012}});
  window.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&view==='tutte'&&cells){const r=cvp.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      for(const q of cells)if(x>=q.x0&&x<q.x1&&y>=q.y0&&y<q.y1){gear.arma=q.w;view='gira';spin=false;tAnim=0;build();break}}drag=null});
  window.addEventListener('pointercancel',()=>drag=null);
  cvp.addEventListener('wheel',e=>{zoom=Math.max(.6,Math.min(2.4,zoom*(e.deltaY<0?1.1:1/1.1)))},{passive:true});
  const dpr=Math.min(2,window.devicePixelRatio||1);
  // a floor of the Classic arena: warm stone slabs with moss in the joints, lit in the middle
  function floor(c,W,H){c.fillStyle='#2b2620';c.fillRect(0,0,W,H);const S=34,ox=(W/2)%S,oy=(H*.5)%S;
    for(let y=-S+oy;y<H+S;y+=S)for(let x=-S+ox;x<W+S;x+=S){const i=Math.round((x-ox)/S),j=Math.round((y-oy)/S),k=((i*7+j*13)%5+5)%5;
      c.fillStyle=['#4a4236','#463e33','#4e463a','#433b31','#4b4338'][k];c.fillRect(x+1.5,y+1.5,S-3,S-3);c.fillStyle='rgba(255,236,200,.05)';c.fillRect(x+1.5,y+1.5,S-3,2);c.fillStyle='rgba(0,0,0,.14)';c.fillRect(x+1.5,y+S-3.5,S-3,2);
      if(k===2){c.fillStyle='rgba(111,160,62,.35)';c.fillRect(x-1.5,y+S*.3,3,S*.4)}}
    const g=c.createRadialGradient(W/2,H*.5,H*.08,W/2,H*.52,H*.78);g.addColorStop(0,'rgba(255,214,150,.13)');g.addColorStop(.5,'rgba(0,0,0,.05)');g.addColorStop(1,'rgba(0,0,0,.72)');c.fillStyle=g;c.fillRect(0,0,W,H)}
  const label=(c,t,x,y)=>{c.font='700 12px "Baloo 2",system-ui';c.textAlign='center';c.fillStyle='rgba(0,0,0,.5)';c.fillText(t,x+1,y+1);c.fillStyle='#e9dcc0';c.fillText(t,x,y)};
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const W=ov.clientWidth,H=ov.clientHeight;if(cvp.width!==Math.round(W*dpr)||cvp.height!==Math.round(H*dpr)){cvp.width=Math.round(W*dpr);cvp.height=Math.round(H*dpr)}
    const A=ANIMS.find(a=>a[0]===anim),dur=w=>anim==='shoot'?(SHOOTD[w]||A[2]):A[2];tAnim+=dt;p=(tAnim/dur(gear.arma))%1;if(spin)face-=dt*.55;
    const c=cvp.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);floor(c,W,H);
    const saved=ctx,lf=LOWFX;ctx=c;LOWFX=low;G.t=now/1000;tilt();const S=styleFor();let t1=0,cost=0;
    const top=70,bot=(ov.querySelector('.e3bar').offsetHeight||170),mid=top+(H-top-bot)*.5,room=H-top-bot;
    try{
      if(view==='gira'){const sc=Math.min(W/64,room/58)*zoom,fy=mid+19*sc;t1=performance.now();newHero(W/2,fy,face,sc,S);cost=performance.now()-t1}
      else if(view==='prima'){const sc=Math.min(W/120,room/58)*zoom,fy=mid+19*sc;oldHero(W*.27,fy,face,sc,S);t1=performance.now();newHero(W*.73,fy,face,sc,S);cost=performance.now()-t1;
        label(c,'Oggi',W*.27,fy+9*sc+14);label(c,'In 3D',W*.73,fy+9*sc+14)}
      else if(view==='tutte'){// the 14 weapons, each with its own time (the shooting lasts longer with some), turning together
        const n=ALLW.length,room2=room-6;let best=null;for(let cols=2;cols<=7;cols++){const rows=Math.ceil(n/cols),cw=W/cols,ch=room2/rows,s2=Math.min(cw/50,ch/62);if(!best||s2>best.s)best={cols,rows,cw,ch,s:s2}}
        const{cols,cw,ch}=best,sc=best.s*zoom;cells=[];
        for(let i=0;i<n;i++){const w=ALLW[i],cx=cw*(i%cols+.5),cy=top+6+ch*Math.floor(i/cols),fy=cy+ch*.74;cells.push({w,x0:cx-cw/2,x1:cx+cw/2,y0:cy,y1:cy+ch});t1=performance.now();newHero(cx,fy,face,sc,styleFor(w),(tAnim/dur(w))%1);cost+=(performance.now()-t1)/n;
          label(c,GRIDN[w]||SHORT[w],cx,cy+ch*.97)}}
      else{const F=[[Math.PI/2,'Davanti'],[0,'Destra'],[-Math.PI/2,'Dietro'],[Math.PI,'Sinistra']],sc=Math.min(W/4/34,(room-30)/2/50)*zoom,cw=W/4,f1=top+30+(room-30)*.5-8*sc,f2=top+30+(room-30)-8*sc;
        for(let i=0;i<4;i++){const x=cw*(i+.5);t1=performance.now();newHero(x,f1,F[i][0],sc,S);cost+=(performance.now()-t1)/4;oldHero(x,f2,F[i][0],sc,S);label(c,F[i][1],x,f1-44*sc)}
        label(c,'In 3D',W/2,f1+11*sc);label(c,'Oggi',W/2,f2+11*sc)}
    }catch(e){console.error(e)}
    ctx=saved;LOWFX=lf;ms=ms*.93+cost*.07;$('e3Ms').innerHTML=ms.toFixed(2)+' ms<br>'+(anim==='shoot'?(view==='tutte'?'Tira e spara':shootName()):A[1]);
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame)}
if(document.readyState==='complete')setTimeout(boot,300);else window.addEventListener('load',()=>setTimeout(boot,300))})();
'''
i=game.rfind('})();')
page=game[:i]+'\n'+cr+'\n'+ar+'\n'+a3+'\n'+er+'\n'+ctrl+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Arciere 3D</title>',1)
open(os.path.join(here,'eroe3d.html'),'w',encoding='utf-8').write(page)
print('anteprime/eroe3d.html pronto')
