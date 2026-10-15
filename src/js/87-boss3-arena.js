// =====================================================================
// L'ARENA REAGISCE AI 4 BOSS NUOVI (Denis, 15 ottobre: «ci sta ma secondo me gli manca qualcosa», poi ha scelto «l'arena che reagisce» e
// «voce e personalità», 88-boss3-voci.js). Come per i 9 boss di prima (52-boss2-arena-reagisce.js) ogni colpo vero lascia il segno, nel
// suo fotogramma: le mosse in 82–85 chiamano b3fx.
// - Burattinaio d'Ombra: le manate fanno tremare e crepare gli ostacoli, cade polvere dal soffitto, le torce si fanno viola; il filo d'oro
//   fa vibrare gli ostacoli che attraversa e taglia l'erba; dove escono i burattini e dove sprofonda restano macchie d'ombra; mentre è
//   sparito le torce si abbassano.
// - Fenice della Forgia: le torce divampano quando lancia le piume; la picchiata brucia l'erba e incendia il legno lungo la sua strada e
//   lascia cenere; i vortici bruciano l'erba intorno; quando diventa uovo le torce quasi si spengono, quando rinasce si accendono azzurre.
// - Piovra della Palude: le tentacolate fanno schizzi e pozzanghere nuove; l'inchiostro lascia macchie che restano anche quando non
//   rallenta più; il gorgo fa tremare l'acqua delle pozzanghere; tuffarsi e riemergere fa onde e schizzi.
// - Cervo d'Aurora: la carica lascia brina sotto gli zoccoli e contro un muro o un ostacolo fa cadere ghiaccioli, crepa tutto e pianta
//   schegge di cristallo; la zoccolata gela il pavimento; l'aurora colora le torce e dove cadono le tende resta una riga di brina.
// - La fase 2 di tutti: le torce prendono il colore della rabbia e la stanza trema.
// Con LOWFX volano meno pezzi; i segni a terra sono cotti nel pavimento (non costano niente).
// =====================================================================
const B3N=k=>LOWFX?Math.ceil(k*.5):k;
// the torches in the colour of the moment (for sec seconds, then back to their own: 52-boss2-arena-reagisce.js)
const B3TORCH={violet:[['#7a2fd0','#c07aff','#f4e6ff'],'190,120,255'],gold:[['#ffb000','#ffe27a','#fff6d0'],'255,220,140'],dim:[['#2a1048','#5a2a90','#b08ae0'],'110,70,190'],
  magenta:[['#c0207a','#ff6ac8','#ffe0f4'],'255,120,210'],fire:[['#ff5a00','#ffb347','#fff0c0'],'255,170,90'],ember:[['#3a1208','#7a2a10','#c0602a'],'140,60,30'],
  blue:[['#1a62ff','#7fc8ff','#f0fbff'],'140,200,255'],teal:[['#0f8a80','#5fe0d0','#e0fff8'],'120,230,210'],aurora:[['#30e0a0','#c890ff','#f4ecff'],'170,150,255'],
  green:[['#2affb0','#a0ffd8','#f0fff8'],'150,255,210']};
function b3torch(c,sec){const T=B3TORCH[c];if(T&&G&&G.env)ENV2.torches(T[0],T[1],sec)}
// the new marks on the floor (baked into it like the others: they stay for the whole fight)
function b3mark(kind,x,y,r){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);
  if(kind==='shadow'){// a stain of shadow: dark in the middle, a violet glow at the edge, torn threads round it, golden sparks fallen in it
    let g=c.createRadialGradient(x,y,1,x,y,r*1.15);g.addColorStop(0,'rgba(16,6,30,.7)');g.addColorStop(.62,'rgba(40,16,72,.5)');g.addColorStop(.8,'rgba(150,95,235,.32)');g.addColorStop(1,'rgba(150,95,235,0)');
    c.fillStyle=g;c.beginPath();c.ellipse(x,y,r*1.15,r*.63,0,0,TAU);c.fill();c.strokeStyle='rgba(30,12,52,.75)';c.lineWidth=1;c.lineCap='round';
    for(let i=0;i<5;i++){const a=rand(0,TAU),r0=r*.7,r1=r*rand(1.15,1.5);c.beginPath();c.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0*.55);c.quadraticCurveTo(x+Math.cos(a+.2)*(r0+r1)/2,y+Math.sin(a+.2)*(r0+r1)/4,x+Math.cos(a+.1)*r1,y+Math.sin(a+.1)*r1*.55);c.stroke()}
    for(let i=0;i<5;i++){const a=rand(0,TAU),d=rand(.2,.85)*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.55;g=c.createRadialGradient(px,py,0,px,py,3.2);g.addColorStop(0,'rgba(255,220,110,.7)');g.addColorStop(1,'rgba(255,220,110,0)');
      c.fillStyle=g;c.beginPath();c.arc(px,py,3.2,0,TAU);c.fill();c.fillStyle='rgba(255,236,150,.95)';c.beginPath();c.arc(px,py,.9,0,TAU);c.fill()}}
  else if(kind==='ash'){// burnt floor under a pile of pale ash, some embers still glowing in it
    let g=c.createRadialGradient(x,y,1,x,y,r*1.2);g.addColorStop(0,'rgba(18,10,6,.5)');g.addColorStop(.75,'rgba(30,18,10,.28)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r*1.2,r*.66,0,0,TAU);c.fill();
    for(let i=0;i<3;i++){const px=x+rand(-r,r)*.35,py=y+rand(-r,r)*.18,rr=r*rand(.45,.7);g=c.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,'rgba(178,172,166,.55)');g.addColorStop(1,'rgba(150,145,140,0)');c.fillStyle=g;c.beginPath();c.ellipse(px,py,rr,rr*.55,0,0,TAU);c.fill()}
    for(let i=0;i<18;i++){const a=rand(0,TAU),d=rand(0,1)*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.55;if(Math.random()<.3){g=c.createRadialGradient(px,py,0,px,py,3);g.addColorStop(0,'rgba(255,150,60,.75)');g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.beginPath();c.arc(px,py,3,0,TAU);c.fill();
        c.fillStyle='rgba(255,210,120,.95)';c.beginPath();c.arc(px,py,.8,0,TAU);c.fill()}else{c.fillStyle='rgba(200,195,188,.7)';c.beginPath();c.arc(px,py,rand(.6,1.6),0,TAU);c.fill()}}}
  else if(kind==='ink'){// a splash of ink with its drops: dark, with an oily violet rim and a sheen of light
    c.fillStyle='rgba(24,16,44,.72)';c.beginPath();const n=11,pts=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=r*(.75+Math.random()*.35);pts.push([x+Math.cos(a)*q,y+Math.sin(a)*q*.55])}
    pts.forEach(([px,py],i)=>{const[qx,qy]=pts[(i+1)%n],mx=(px+qx)/2,my=(py+qy)/2;i?c.quadraticCurveTo(px,py,mx,my):c.moveTo(mx,my)});c.closePath();c.fill();c.strokeStyle='rgba(150,120,235,.5)';c.lineWidth=1.3;c.stroke();
    for(let i=0;i<6;i++){const a=rand(0,TAU),d=r*rand(1.05,1.5);c.beginPath();c.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d*.55,rand(1.2,2.6),rand(.8,1.6),0,0,TAU);c.fill();c.stroke()}
    c.fillStyle='rgba(205,190,255,.42)';c.beginPath();c.ellipse(x-r*.3,y-r*.15,r*.34,r*.09,-.15,0,TAU);c.fill();c.fillStyle='rgba(120,235,215,.3)';c.beginPath();c.ellipse(x+r*.22,y+r*.1,r*.2,r*.055,-.1,0,TAU);c.fill()}
  else if(kind==='shards'){// little shards of aurora crystal stuck in the floor
    for(let i=0;i<7;i++){const a=rand(0,TAU),d=rand(.2,1)*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.55,s=rand(1.6,3.2);c.save();c.translate(px,py);c.rotate(rand(-.6,.6));
      c.fillStyle=pk(['#bff7e4','#d8c8ff','#ffffff']);c.strokeStyle='rgba(30,40,60,.6)';c.lineWidth=.6;c.beginPath();c.moveTo(0,-s*1.6);c.lineTo(s*.6,0);c.lineTo(0,s*.4);c.lineTo(-s*.6,0);c.closePath();c.fill();c.stroke();c.restore()}}
  c.restore()}
// the reactions, one for each blow: e the boss (or null), what, where, and the size of the blow
function b3fx(e,what,x,y,r){if(!BOSS2||!G||!G.rocks)return;try{const S=stonePal(),stone=[S.hi,S.mid,S.lo],p2=e&&e.p2,B=G.b3||{};switch(what){
  // ---- the Puppeteer
  case 'pslam':ENV2.rocks(x,y,150,2);ENV2.fall(B3N(6));ENV2.chunks(x,y,B3N(12),stone,140);ENV2.mark('cracks',x,y,46);ENV2.wiltGrass(x,y,60);b3torch(p2?'magenta':'violet',.9);for(const t of G.torches||[])t.ph+=1.5;break;
  case 'pstrings':b3torch('gold',.8);break;
  case 'ppuppet':b3mark('shadow',x,y,14);ENV2.chunks(x,y,B3N(5),stone,80);break;
  case 'psink':b3mark('shadow',x,y,30);ENV2.wiltGrass(x,y,40);b3torch('dim',1.5);break;
  case 'prise':b3mark('shadow',x,y,26);ENV2.rocks(x,y,140,1.5);ENV2.chunks(x,y,B3N(8),stone,110);break;
  // ---- the Phoenix
  case 'ffeathers':b3torch(p2?'blue':'fire',.6);break;
  case 'fdive':{const D=r;if(!D)break;const len=Math.hypot(D.ex-D.sx,D.ey-D.sy);for(let s=0;s<=len;s+=38){const px=D.sx+Math.cos(D.ang)*s,py=D.sy+Math.sin(D.ang)*s;ENV2.burnGrass(px,py,26);ENV2.ignite(px,py,26)}
    ENV2.rocks(D.ex,D.ey,140,2);ENV2.chunks(D.ex,D.ey,B3N(12),['#3a2a24',p2?'#7fc8ff':'#ff7a2e','#5a4038'],130);b3mark('ash',D.ex,D.ey,30);b3torch(p2?'blue':'fire',.7);break}
  case 'fvortex':ENV2.burnGrass(x,y,90);ENV2.ignite(x,y,60);ENV2.rocks(x,y,180,1);b3torch(p2?'blue':'fire',.8);break;
  case 'fegg':b3torch('ember',2.2);break;
  case 'freborn':b3torch('blue',4);ENV2.rocks(x,y,400,1);ENV2.fall(B3N(10));ENV2.mark('scorch',x,y,50);b3mark('ash',x,y,40);ENV2.burnGrass(x,y,120);ENV2.ignite(x,y,140);break;
  // ---- the Octopus: at most eight new puddles in a fight (the floor must stay a floor)
  case 'oslam':ENV2.splash(x,y,B3N(16),'#bfe9d0');if((B.pud=(B.pud||0)+1)<=8)ENV2.mark('puddle',x,y+4,22);ENV2.rocks(x,y,130,1.5);ENV2.chunks(x,y,B3N(8),['#46432a','#68643c'],110);ENV2.wiltGrass(x,y,40);break;
  case 'oink':b3mark('ink',x,y,(r||14)*.9);ENV2.wiltGrass(x,y,24);break;
  case 'owhirl':for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9});b3torch(p2?'magenta':'teal',1.4);break;
  case 'osink':ENV2.splash(x,y,B3N(14),'#cfe9d8');for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9});break;
  case 'orise':ENV2.splash(x,y,B3N(22),'#cfe9d8');if((B.pud=(B.pud||0)+1)<=8)ENV2.mark('puddle',x,y+6,28);ENV2.rocks(x,y,160,2);ENV2.fall(B3N(5));ENV2.chunks(x,y,B3N(8),['#46432a','#68643c'],120);break;
  // ---- the Stag
  case 'sstride':if((B.st=(B.st||0)+1)%2===0)ENV2.mark('frost',x,y,10);ENV2.wiltGrass(x,y,16);break;
  case 'swall':ENV2.rocks(x,y,170,4);ENV2.fall(B3N(10),true);ENV2.chunks(x,y,B3N(14),ICE_T,150);ENV2.mark('cracks',x,y,40);b3mark('shards',x,y,24);break;
  case 'scrystals':b3torch(p2?'aurora':'green',.7);break;
  case 'saurora':b3torch('aurora',2.4);break;
  case 'scurtain':{const c=r;if(!c)break;for(let s=0,n=c.h?R-L:BOT-TOP;s<=n;s+=70){const px=c.h?L+s:c.pos,py=c.h?c.pos:TOP+s;ENV2.mark('frost',px,py,16)}break}
  case 'sstomp':ENV2.mark('frost',x,y,80);ENV2.fall(B3N(12),true);ENV2.rocks(x,y,190,3);ENV2.chunks(x,y,B3N(14),ICE_T,140);ENV2.wiltGrass(x,y,80);b3mark('shards',x,y,30);break;
  // ---- the second phase of any of them
  case 'phase2':{const c={puppeteer:'magenta',octopus:'magenta',stag:'aurora'}[e.type];if(c)b3torch(c,3);ENV2.rocks(e.x,e.y,400,0);ENV2.fall(B3N(10),e.type==='stag');break}}}catch(err){}}
// the golden thread: the obstacles it runs through shake and spark, the grass it crosses is cut (half of it)
function b3threadFx(){const B=G.b3;if(!B||!B.thr.length)return;
  for(const h of B.thr){const ca=Math.cos(h.a),sa=Math.sin(h.a),s0=h._ps==null?h.s:h._ps,s1=h.s;h._ps=s1;if(s0===s1)continue;const lo=Math.min(s0,s1),hi=Math.max(s0,s1);
    for(const k of G.rocks){const kd=(k.x-h.x)*ca+(k.y-h.y)*sa;if(kd>lo-k.r*.3&&kd<=hi+k.r*.3&&!(k._thrT>G.t-.3)){k._thrT=G.t;k.hit=Math.max(k.hit||0,.18);if(!LOWFX)for(let i=0;i<3;i++)fxPush({k:'spark',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.3,.9),t:.3})}}
    if(G.tufts)for(let i=G.tufts.length-1;i>=0;i--){const t=G.tufts[i],kd=(t.x-h.x)*ca+(t.y-h.y)*sa;if(kd>lo&&kd<=hi&&Math.random()<.5){G.tufts.splice(i,1);
      for(let q=0;q<3;q++)G.debris.push({x:t.x,y:t.y,z:6,vx:rand(-24,24),vy:rand(-6,6),vz:rand(20,50),col:pk(['#5f9e3c','#86b84a','#3f6a2a']),s:1.8,rot:rand(0,TAU),vr:rand(-8,8),life:1.4,leaf:true})}}}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(BOSS2&&G&&G.b3&&G.state==='play'&&started&&!paused)b3threadFx()}catch(err){}}}
// the second phase: the room feels the rage
{const _bp=b3phase;b3phase=function(e){const r=_bp.apply(this,arguments);if(r)b3fx(e,'phase2');return r}}
