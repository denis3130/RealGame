// IL BURATTINAIO D'OMBRA rifatto: «la Marionetta del Teatro delle Ombre» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy
// e fatti meglio sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»;
// 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). Nome e titolo restano: «Il Burattinaio d'Ombra», «Il teatro delle ombre». Era
// l'artista del teatro della Cripta; l'Ombra gli ha rubato la croce di comando e adesso la marionetta più grande del teatro è lui: un
// giullare di legno, avorio e velluto viola, alto tre volte e mezzo l'eroe (130 in cima alle punte del cappuccio), appeso a cinque fili
// d'oro che salgono a una croce di legno che dondola da sola nel buio. Viso tondo d'avorio con le guance rosa, una mascherina scura da
// Arlecchino che fa da sopracciglio a V, due occhi d'oro che brillano con la lucina, un sorriso dipinto con la mascella da marionetta e
// due zannette; farsetto a botte coi rombi viola e cremisi e le righe d'oro, gorgiera bianca, maniche a sbuffo, calzoni a sbuffo, gambe
// e braccia di legno miele con le giunture a palla, grandi mani bianche, scarpe a punta coi campanellini, sul dorso la maschera della
// commedia ricamata d'oro, il cappuccio da giullare a due punte coi campanelli. Il suo avviso: prima di ogni colpo si accendono e si
// tendono i fili dell'arto che colpirà (una perla di luce corre giù dalla croce), la croce si piega da quella parte, tintinnano i
// campanelli e le palpebre si chiudono a metà; quando i fili sono molli è indifeso. Fase 2 (o.p2): sopra la croce si aprono due grandi
// occhi magenta e una mano d'ombra la stringe; velluto più cupo, occhi e fili magenta, crepe della vernice accese, sospeso a 3 px.
// Resta della Classica: forme robuste, contorno scuro spesso, colori pieni, occhi con la lucina, solo due zannette, niente sangue, ferite o
// cuciture (le crepe sono solo della vernice); l'Ombra è nebbia, due occhi e una mano.
// Metodo dello spaventapasseri (scheletro 3D proiettato con V(face), braccia e gambe a due ossa con ik, ordine di disegno dalla posa di
// riposo, la testa che gira da sola sul suo piolo, la croce con il suo telaio); dipinta come la lanterna (tre toni, bordo caldo, bagliori
// morbidi). Unità del modello a sc 1: x avanti, y a sinistra (la destra è y negativa), z in su; l'origine è a terra tra i piedi.
// Mosse: idle, walk, hit, slam (Manate), slam3 (Manate a catena), strings (Fili d'oro), puppets (Burattini), lasso (il filo del
// burattino), yank (Tira!), snap (Filo spezzato), vanish (Sipario), drop (Dal riflettore), hand (Mano dell'Ombra), rage (Il vero
// Burattinaio), taunt (Presa in giro), call (Ti chiama), enter (Entrata), die (Sconfitta). Opzioni: o.p2, o.noFx, o.z (altezza della
// caduta data dal gioco), o.jig (colpito, 0..1), o.look (dove guarda la testa, rad), o.talk (parla, 0..1), o.veil (croce, fili alti e
// Ombra velati, 0..1), o.mini (anteprime delle arene), o.game (il gioco disegna il lazo, i fili verso le botole e la luce della
// caduta), o.traps ([{x,y}] le botole, nel mondo), o.out (il modello ci scrive i punti sullo schermo, nel mondo: tipR, tipL, wristR,
// wristL, cross, head). Con LOWFX niente bagliori, perle, fumo, polvere né scintille; nebbia piatta, sipario a 4 pieghe, gorgiera a 10.
// Disegni per il gioco con lo stesso aspetto: il burattino nuovo (modello 'puppet2'), N3.puppeteer2Hand (la mano gigante dell'Ombra che
// cade), N3.puppeteer2Trap (la botola) e N3.puppeteer2Info (i momenti dei colpi). Modello 'puppeteer2': nel gioco prende il nome
// 'puppeteer' (src/js/89-burattinaio-nuovo.js).
(()=>{const C=C3,K3=C3K,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,run,cmix,poly,bbox,
  rotX,rotY,rotZ,keys,sstep,hitK,frame,ellAt,ellN,AXES,chain,parts,reg,shine,ik,glowTop,cam,hull,rim,chull,bump}=C;
const{trem,fxOn,cheat,pls,rise,ga,ellCap,fadeDraw,grad3,ellSil,smoothP,rimP,frm,ringS,limbGrad,T3,mixT,mixRgb,rotAx}=K3;

// ------------------------------------------------------------------ helpers
const lin=(K,p)=>{if(p<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p<=b[0])return lerp(a[1],b[1],(p-a[0])/Math.max(1e-6,b[0]-a[0]))}return K[K.length-1][1]};
const kv=(K,p)=>p<=K[0][0]?(Array.isArray(K[0][1])?K[0][1].slice():K[0][1]):keys(K,p);
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const rgba=(rgb,a)=>`rgba(${rgb},${cl(a,0,1).toFixed(3)})`;
// a thick line with the outline under it (bars, threads)
function stroke2(pts,w,col,lw){ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  if(lw){ctx.strokeStyle=INK;ctx.lineWidth=w+lw;ctx.stroke()}ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
// a ball painted in three tones with the thick outline, the warm rim and the light on top
function ball3(q,r,T,lw,al){ctx.lineJoin='round';ball(q,r);ctx.fillStyle=grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],T);ctx.fill();if(lw!==0){ctx.strokeStyle=INK;ctx.lineWidth=lw||2.2;ctx.stroke()}
  if(r>2.5)rim(q,r,q,r,al||.28)}
// a capsule painted across (from the lit side to the dark one)
function caps3(a,ra,b,rb,T,lw){ctx.lineJoin='round';hull(a,ra,b,rb);ctx.fillStyle=limbGrad(a,b,Math.max(ra,rb),T);ctx.fill();if(lw!==0){ctx.strokeStyle=INK;ctx.lineWidth=lw||2.3;ctx.stroke()}}
// a 4-point star of light
function star4(q,r,a,col){if(a<=.01||r<.3)return;ctx.save();ctx.globalAlpha*=Math.min(1,a);ctx.fillStyle=col||'#ffffff';ctx.beginPath();ctx.moveTo(q[0],q[1]-r);ctx.quadraticCurveTo(q[0],q[1],q[0]+r*.8,q[1]);
  ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]+r);ctx.quadraticCurveTo(q[0],q[1],q[0]-r*.8,q[1]);ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]-r);ctx.fill();ctx.restore()}
// a soft glow that adds light
function glowL(rgb,q,r,a){if(LOWFX||a<=.01)return;ctx.save();ctx.globalCompositeOperation='lighter';shine(rgb,q[0],q[1],r,a);ctx.restore()}
// a five-pointed star (the buttons), squashed across by k
function star5(q,r,k,rot){ctx.beginPath();for(let i=0;i<10;i++){const a=rot+i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(q[0]+Math.cos(a)*rr*k,q[1]+Math.sin(a)*rr)}ctx.closePath()}

// ------------------------------------------------------------------ colours: three tones per piece (light, base, shadow)
const K1={vel:T3('#a47ae8','#6e42b8','#351a6e'),cri:T3('#c8384f','#8f1d35','#4a0b1d'),plum:T3('#74468f','#4a2463','#230f35'),
  wood:T3('#f3c98a','#c4864a','#6f4224'),grain:'rgba(141,90,51,.35)',peg:'#3a2416',ivory:T3('#fffaf0','#f1e4c8','#b9a383'),
  mask:T3('#3a1838','#24102a','#120610'),gold:T3('#fff1a8','#ffcd45','#b17b12'),ruff:T3('#ffffff','#f3eeff','#c5b8e4'),
  shoe:T3('#6c4c8c','#3f2659','#1d102b'),wear:'#8a6aa8',crossW:T3('#9c6c46','#5f3b22','#2d190c'),
  cheek:'224,96,127',smile:'#6a1d44',nose:T3('#ffd2b4','#e8a07a','#c87a58'),mouthIn:'#1c0a18',mouthL:'170,110,255',fang:'#fff6e0',
  eye:'#ffd84a',eyeC:'#fff6c8',eyeG:'255,216,74',str:'255,233,160',strHot:'#fffbe8',top:null,crk:'255,122,214',smoke:'120,60,180'};
const K2={vel:T3('#8a5ccc','#55309a','#261050'),cri:T3('#a82a48','#6a1028','#300614'),plum:T3('#5e3478','#3a1a52','#1a0828'),
  eye:'#ff5fc8',eyeC:'#ffe6f6',eyeG:'255,95,200',str:'255,154,224',strHot:'#ffe0f4',top:'255,95,200'};
// the Shadow (phase 2) and the curtain
const SHD={mist:'20,10,34',rim:'120,70,200',hand:T3('#4a2a6e','#2a1444','#120820'),hr:'255,95,200',eye:'#ff5fc8',eyeG:'255,95,200'};
const PALC={};
function pal(k2){k2=Math.round(cl(k2,0,1)*12)/12;if(PALC[k2])return PALC[k2];const K=Object.assign({},K1);if(k2>0){
  for(const n of['vel','cri','plum'])K[n]=mixT(K1[n],K2[n],k2);for(const n of['eye','eyeC','strHot'])K[n]=cmix(K1[n],K2[n],k2);
  for(const n of['eyeG','str'])K[n]=mixRgb(K1[n],K2[n],k2);K.top=k2>.05?K2.top:null;K.topA=k2}return PALC[k2]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to its left, z up; 0,0,0 the floor point)
const HIP=[-1,11,44],LTH=18.5,LSH=20.4;                  // the hips (±y), thigh and shin
const SHJ=[0,30,80],LUA=21,LFA=20,PUFF=[0,29,84],PUFFR=12; // the shoulder joint, upper arm and forearm, the puffed sleeve
const BC=[0,0,66],BRD=[17,25,24];                         // the barrel doublet
const HC0=[3,0,108],HOOD=18.6;                            // the head (its own turn on the peg), the hood over it
const CR0=[0,0,158];                                      // the control cross
const RUFC=[1,0,92],RUFR=15.5,RUFB=4.8;                   // the ruff
const WR0=[12,39,42],AN0=[-1,10,6];                       // the wrists and the ankles at rest
const GS=1.4;                                             // the big gloves
// the face: the cap of ivory on the front of the head (62° wide, a little taller), the eyes, the jaw
const FACEN=[1,0,.06],FACEA=1.08,FACEAV=1.2,EYEF=.37,EYEP=.03;
const dirAt=(f,s)=>[Math.cos(s)*Math.cos(f),Math.cos(s)*Math.sin(f),Math.sin(s)];
// the two points of the hood (head space, from the root to the tip), their radii, the bell under the tip
const TIP=[[-5,8,13],[-7,15,18],[-9,26,17],[-9,33,10],[-8,35,3]],TIPR=[6,5,3.8,2.8,2],TIPLAG=[0,0,.35,.7,1],TIPDROOP=[0,0,4,10,16];
// the coat tails: where they hang from (behind the belt) and where they end
const TAILA=[-15,7,48],TAILB=[-18,9,22];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','slam','slam3','strings','puppets','lasso','yank','snap','vanish','drop','hand','rage','taunt','call','enter','die'];
const DUR={idle:3,walk:1.2,hit:.6,slam:1.8,slam3:2.8,strings:1.8,puppets:1.9,lasso:1.6,yank:1.5,snap:1,vanish:1.4,drop:1.9,hand:2.4,rage:3.2,taunt:1.2,call:1,enter:3.4,die:3.8};
const LAB={idle:'Fermo',walk:'Cammina',hit:'Colpito',slam:'Manate',slam3:'Manate a catena',strings:"Fili d'oro",puppets:'Burattini',lasso:'Il filo del burattino',
  yank:'Tira!',snap:'Filo spezzato',vanish:'Sipario',drop:'Dal riflettore',hand:"Mano dell'Ombra",rage:'Il vero Burattinaio',taunt:'Presa in giro',call:'Ti chiama',
  enter:'Entrata',die:'Sconfitta'};
// the moments of the blows (the brain reads them from N3.puppeteer2Info)
const INFO={slam:.52,slam3:[.4,.64,.9],strings:.4,puppets:.62,lasso:.68,yank:[.12,.39,.66],yankHit:.94,vanish:.45,drop:.28,hand:.78,
  slamWarn:.04,lassoLock:.28,handLock:.36,cry:.76,dieClou:.46};
const STR=['h','wL','wR','kL','kR','up'];
const S0=()=>({t:1,l:0,u:-1,b:-1,v:0});
// a hand: fd the fingers' direction, bk the back of the hand (root space; null: along the forearm, the back outward), c the curl of the
// three fingers (index, middle, ring: 0 open .. 1 fist), th the thumb, pt the index straight
const HP=(fd,bk,c,th,pt)=>({fd,bk,c:c||[.25,.3,.35],th:th==null?.3:th,pt:pt||0});
const FIST=()=>HP(null,null,[1,1,1],1,0);
function rest(p2){const A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,lift:p2?3:0,breath:0,
  fL:AN0.slice(),fR:[AN0[0],-AN0[1],AN0[2]],tL:0,tR:0,fyL:0,fyR:0,kpole:null,
  hL:WR0.slice(),hR:[WR0[0],-WR0[1],WR0[2]],gL:HP(null,null),gR:HP(null,null),
  hy:0,hp:.12,hr:0,hx:0,hz:0,jaw:p2?1.5:0,lid:0,eg:1,wide:0,stars:0,look:1,
  cx:[0,0,0],cr:0,cp:0,cyw:0,kb:0,cvis:1,cup:1,
  S:{h:S0(),wL:S0(),wR:S0(),kL:S0(),kR:S0(),up:S0()},vib:0,
  jb:0,jph:0,droop:0,tsw:0,tail:0,k2:p2?1:0,crk:p2?1:0,smoke:0,
  cur:null,sh:p2?{k:1,eye:1,eg:1,sq:0,blink:1,gz:0,go:0,free:null,breath:0}:null,hint:0,fx:[],thr:null,lasso:null,fthr:null,ring:null};
  if(p2){A.tL=A.tR=.38;for(const k of STR){A.S[k].t=1}}
  return A}
// light a string at p = a (the pearl runs down in .1), out by b
function lightS(A,ks,p,a,b){for(const k of ks){const s=A.S[k],l=rise(p,a,a+.02,b-.03,b);s.l=Math.max(s.l,l);if(p>=a&&p<a+.1)s.u=(p-a)/.1}}
const slack=(A,t,ks)=>{for(const k of ks||STR)A.S[k].t=Math.min(A.S[k].t,t)};
const tense=(A,k,p,a)=>{A.S[k].t=Math.min(A.S[k].t,sstep(a-.005,a+.02,p))};
const snapS=(A,k,p,a)=>{if(p>=a){A.S[k].b=cl((p-a)/.08,0,1);if(p<a+.12)A.fx.push({k:'spark',s:k,t:(p-a)/.12})}};
// the heap: a puppet nobody moves (sitting on the floor, the legs bent outward, the arms wide on the floor, the head lolling)
function heap(A,k,sd){if(k<=0)return;const s=sd||1;
  A.B=lerp3(A.B,[2,0,-33],k);A.lean=lerp(A.lean,.3,k);A.roll=lerp(A.roll,.14*s,k);A.yaw=lerp(A.yaw,0,k);
  A.fL=lerp3(A.fL,[20,27,4],k);A.fR=lerp3(A.fR,[20,-27,4],k);A.tL=lerp(A.tL,-.45,k);A.tR=lerp(A.tR,-.45,k);A.fyL=lerp(A.fyL,.55,k);A.fyR=lerp(A.fyR,.55,k);
  A.kpole=[.15,1,.75];A.kpk=k;
  A.hL=lerp3(A.hL,[8,50,4],k);A.hR=lerp3(A.hR,[8,-50,4],k);if(k>.5){A.gL=HP([.5,1,0],[0,0,1],[.2,.25,.3],.2);A.gR=HP([.5,-1,0],[0,0,1],[.2,.25,.3],.2)}
  A.hp=lerp(A.hp,.6,k);A.hr=lerp(A.hr,.7*s,k);A.hy=lerp(A.hy,.25*s,k);A.droop=Math.max(A.droop,k);A.look=lerp(A.look,0,k);A.tail=lerp(A.tail,.5,k)}
function pPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter'&&anim!=='rage',A=rest(P2);
  // the idle sway that every standing pose keeps a little of: the cross draws a slow eight, the body follows
  const sway=(w)=>{A.cx=add(A.cx,mul([2.5*Math.sin(2*ph),4*Math.sin(ph),1.2*Math.sin(ph)],w));A.cr+=.05*w*Math.sin(ph);A.cp+=.04*w*Math.sin(2*ph+1);
    A.B[1]+=1.5*w*Math.sin(ph-.38);A.breath=.02*w*(.5-.5*Math.cos(ph))};
  const hang2=(w)=>{if(!P2)return;// carried: the legs swing like a pendulum under it
    const sw=Math.sin(ph-.6)*w;A.fL[0]+=3*sw;A.fR[0]+=3*sw}
  if(anim==='idle'){sway(1);hang2(1);
    A.B[2]-=1.5*(.5-.5*Math.cos(ph-.38));A.tsw=.12*Math.sin(ph-.63);A.tail=.06*Math.sin(ph-.63);A.jb=.25+.25*Math.sin(ph*2);A.jph=p*2;
    // the fingers play invisible strings: a wave at .15 and one at .60 (the other hand .20 later)
    for(const[sd,o2] of[[1,0],[-1,.2]]){const g=sd>0?A.gL:A.gR,c=[];for(let i=0;i<3;i++){const w=pls(p,(.15+o2+(2-i)*.035)%1,.09)+pls(p,(.6+o2+(2-i)*.035)%1,.09);c.push(.25+.55*w*(P2?1.4:1))}g.c=c}
    A.jaw=Math.max(A.jaw,1.5*(pls(p,.3,.04)+pls(p,.36,.04)));
    A.hy=lin([[0,0],[.1,0],[.16,.5],[.3,.5],[.36,0],[.45,0],[.5,-.5],[.6,-.5],[.66,0],[.68,0],[.84,1.9],[.85,1.9],[.866,-.1],[.88,.05],[.9,0],[1,0]],p);
    if(p>.68&&p<.85)A.hy=1.9*ez((p-.68)/.17);
    A.lid=pls(p,.885,.03);A.tR=Math.max(A.tR,-.35*pls(p,.55,.06)*(P2?0:1));
    if(!P2)A.hint=pls(p,.96,.06);
    if(P2){A.sh.breath=.04*(.5-.5*Math.cos(ph));A.sh.blink=1-pls(p,.3,.05)-pls(p,.8,.05);A.crk=.75+.25*Math.sin(ph*2)}}
  else if(anim==='walk'){A.look=1;
    if(!P2){// a puppet's step: the string of the knee pulls the knee up, the shin dangles, the foot comes down on its toe
      for(const[sd,o2] of[[-1,0],[1,.5]]){const q=((p-o2)%1+1)%1,sw=q<.5,u=sw?q/.5:0,su=sw?0:(q-.5)/.5,f=sd>0?A.fL:A.fR;
        f[0]+=sw?lerp(-7,7,ez(u)):lerp(7,-7,su);f[2]+=sw?14*Math.sin(Math.PI*u):0;
        const t=sw?(u<.8?.6*Math.sin(Math.PI*Math.min(1,u*1.25)):lerp(.25,0,(u-.8)/.2)):0;if(sd>0)A.tL=t;else A.tR=t;
        if(sw)tense(A,sd>0?'kL':'kR',1,0)}
      A.B[2]+=2.5*(.5-.5*Math.cos(2*ph));A.roll=.04*Math.sin(ph);A.cx[0]+=4;A.kb=.25*Math.sin(ph)}
    else{// carried by the Shadow: the feet over the floor, toes down, the legs left behind like a pendulum
      const sw=Math.sin(ph);A.fL[0]+=-4+3*sw;A.fR[0]+=-4-3*sw;A.lean=-.08;A.roll=.05*Math.sin(ph);A.cx[0]+=5;A.B[2]+=1.2*Math.sin(2*ph)}
    // the arms swing loose, against the legs, a little late
    const as=Math.sin(ph-.5);A.hL[0]+=6*as;A.hR[0]-=6*as;A.hL[2]+=1.5*Math.abs(as);A.hR[2]+=1.5*Math.abs(as);
    A.tsw=.2*Math.sin(2*ph-.6);A.tail=.12*Math.sin(2*ph-.7);A.jb=.6;A.jph=p*4;A.hp=.14;A.cx[1]+=2*Math.sin(ph-.4);
    if(P2)A.crk=.85}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.3*kb;A.B[0]-=4*kb;A.hy=1.2*Math.sin(Math.PI*cl(p/.6,0,1));A.lid=p<.5?1:sstep(.6,.5,p);A.stars=p<.75?1-p/.75:0;A.vib=1.5*(1-p);A.look=0;
    A.hL=add(A.hL,[-6*kb,4*kb,8*kb]);A.hR=add(A.hR,[-6*kb,-4*kb,8*kb]);A.cp=-.2*kb;A.jb=1;A.jph=p*6;A.tsw=-.3*kb}
  else if(anim==='slam'){A.look=0;
    lightS(A,['wL','wR'],p,0,.47);A.jb=p<.1?1:p<.47?.4:0;A.jph=p*8;A.lid=.55*rise(p,.0,.06,.74,.8);
    const up=sstep(.06,.4,p),dn=sstep(.47,.52,p),st=sstep(.74,.78,p)*.5+sstep(.8,.84,p)*.5;
    A.cp=-.25*rise(p,0,.06,.45,.5);A.cx[2]=lin([[0,0],[.06,6],[.4,22],[.47,22],[.52,-8],[.74,-8],[.78,8],[.84,0],[1,0]],p);
    A.lean=lin([[0,0],[.06,-.05],[.4,-.15],[.47,-.15],[.52,.8],[.74,.8],[.78,.45],[.84,.05],[.9,-.03],[1,0]],p);
    A.B[2]=lin([[0,0],[.47,0],[.52,-20],[.74,-20],[.78,-10],[.84,0],[1,0]],p);
    const hu=[2,24,118],hd=[34,20,10],tr=.8*trem(p,.4,.47,7,1.8);
    for(const sd of[1,-1]){let h;if(p<.47)h=lerp3(sd>0?A.hL:A.hR,[hu[0],sd*hu[1],hu[2]+tr],up);else if(p<.52)h=lerp3([hu[0],sd*hu[1],hu[2]],[hd[0],sd*hd[1],hd[2]],ez(dn));
      else if(p<.74)h=[hd[0]+.8*Math.sin(p*60+sd),sd*hd[1],hd[2]];else h=lerp3([hd[0],sd*hd[1],hd[2]],sd>0?WR0:[WR0[0],-WR0[1],WR0[2]],st);
      if(sd>0)A.hL=h;else A.hR=h;const g=p>.04&&p<.82?FIST():HP(null,null);if(p>.4&&p<.74)g.fd=p<.52?[0,0,-1]:[.7,0,-.7];if(p>.06&&p<.4)g.fd=[0,0,1];if(sd>0)A.gL=g;else A.gR=g}
    A.jaw=Math.max(A.jaw,5*rise(p,.1,.2,.4,.47));A.hp=lin([[0,.12],[.4,-.05],[.47,0],[.52,.55],[.74,.55],[.84,.12],[1,.12]],p);
    if(p>=.47&&p<.74)slack(A,.15);else if(p>=.74&&p<.8)slack(A,.6);
    if(p>=.52&&p<.6)A.fx.push({k:'pound',t:(p-.52)/.08});A.tsw=.3*rise(p,.47,.52,.74,.84);A.tail=.25*rise(p,.47,.52,.74,.84)}
  else if(anim==='slam3'){A.look=0;A.lift=0;A.tL=A.tR=0;
    // three blows that come forward: the left fist, the right, both
    const H=(at,up,dn,hit,w)=>({up:sstep(at,up,p)*(1-sstep(dn,hit,p)),hit:p>=hit&&p<hit+.1});
    lightS(A,['wL'],p,0,.4);lightS(A,['wR'],p,.44,.64);lightS(A,['wL','wR'],p,.68,.9);A.jb=1;A.jph=p*9;
    A.cr=lin([[0,0],[.05,.3],[.4,.3],[.44,-.3],[.64,-.3],[.68,0],[1,0]],p);A.cp=-.25*rise(p,.68,.72,.86,.9);
    const hu=sd=>[4,sd*24,118],hd=(sd,two)=>two?[34,sd*20,10]:[36,sd*16,10];
    const L1=keys([[0,0],[.05,0],[.34,1],[.38,0],[.4,0],[.66,0],[.7,0],[.84,1],[.88,0],[1,0]],p),R1=keys([[0,0],[.46,0],[.6,1],[.63,0],[.7,0],[.84,1],[.88,0],[1,0]],p);
    const downL=(p>=.38&&p<.66)||(p>=.88&&p<.95),downR=(p>=.63&&p<.7)||(p>=.88&&p<.95);
    A.hL=downL?hd(1,p>=.88):L1>.02?lerp3([20,30,60],hu(1),L1):[20,30,60];A.hR=downR?hd(-1,p>=.88):R1>.02?lerp3([20,-30,60],hu(-1),R1):[20,-30,60];
    if(p>=.95){const k=sstep(.95,1,p);A.hL=lerp3(A.hL,WR0,k);A.hR=lerp3(A.hR,[WR0[0],-WR0[1],WR0[2]],k)}
    A.gL=A.gR=FIST();
    A.lean=lin([[0,.1],[.34,-.1],[.4,.6],[.42,.6],[.54,.3],[.6,-.05],[.64,.6],[.66,.6],[.78,.3],[.84,-.12],[.9,.75],[.95,.75],[1,0]],p);
    A.roll=lin([[0,0],[.4,.2],[.5,.1],[.64,-.2],[.75,-.1],[.9,0],[1,0]],p);
    A.B[2]=lin([[0,0],[.38,0],[.4,-16],[.44,-14],[.54,-4],[.62,0],[.64,-16],[.68,-14],[.78,-4],[.88,0],[.9,-20],[.95,-20],[1,0]],p);
    // dragged forward by the Shadow (the game moves it 45 px): the feet trail on their toes, the body stays back
    const dr=rise(p,.42,.46,.5,.54)+rise(p,.66,.7,.74,.78);A.fL[0]-=10*dr;A.fR[0]-=10*dr;A.tL=A.tR=.5*dr;A.lean-=.15*dr;
    A.hp=.12+.3*(downL||downR?1:0);A.jaw=3*(pls(p,.38,.05)+pls(p,.62,.05)+pls(p,.88,.06));
    if(p>=.9&&p<.95)slack(A,.2);for(const c of[.4,.64,.9])if(p>=c&&p<c+.08)A.fx.push({k:'pound',t:(p-c)/.08,one:c<.9?(c<.5?1:-1):0});
    A.tsw=.25*Math.sin(p*20);A.tail=.2*Math.sin(p*14)}
  else if(anim==='strings'){A.look=p<.4?1:0;
    lightS(A,['wL','wR'],p,0,.45);A.jb=p<.1?1:.2;A.jph=p*8;A.lid=.5*rise(p,.05,.1,.42,.5);
    const op=sstep(0,.08,p),wh=sstep(.38,.42,p),bk=sstep(.62,1,p);
    for(const sd of[1,-1]){const h0=sd>0?A.hL:A.hR,hs=[8,sd*66,82],hw=[34,sd*40,70];let h=lerp3(h0,hs,op);h=lerp3(h,hw,wh);h=lerp3(h,h0,bk);
      if(sd>0)A.hL=h;else A.hR=h;const fdS=[0,sd,0],fdW=[1,sd*.2,0];const g=HP(wh>.5?fdW:fdS,[0,0,1],[0,1,1],.8,1);
      if(bk>0){const k=bk;g.c=[k*.3+(1-k)*0,.3+.7*(1-sstep(.7,.85,p)),.35+.65*(1-sstep(.62,.75,p))];g.pt=1-k}if(op<.5){g.c=[.25,.3,.35];g.pt=0;g.fd=null;g.bk=null}
      if(sd>0)A.gL=g;else A.gR=g}
    A.lean=-.08*rise(p,.08,.2,.36,.4)+.15*rise(p,.4,.45,.6,.72);A.cx[2]+=8*rise(p,.08,.2,.4,.5);A.vib=.8*rise(p,.08,.12,.36,.4);
    if(p<.4&&op>.6)A.thr={k:sstep(.08,.4,p),tr:1-sstep(.08,.3,p)};A.jaw=2*rise(p,.36,.4,.46,.55)}
  else if(anim==='puppets'){A.look=p<.62?1:0;
    lightS(A,['wL','wR'],p,0,.85);A.jb=p<.1?1:.3;A.jph=p*8;
    const up=sstep(0,.08,p),bw=rise(p,.62,.68,.85,.95),fp=rise(p,.3,.34,.58,.62);
    for(const sd of[1,-1]){const h0=sd>0?A.hL:A.hR,hu=[20,sd*26,92+(p>.62&&p<.68?12*Math.sin(Math.PI*(p-.62)/.06):0)];let h=lerp3(h0,hu,up*(1-bw));
      const g=HP([1,0,-.25],[0,0,1],[.15,.15,.15],.2);
      // the fingers play the air, three waves a second
      if(fp>0)g.c=[0,1,2].map(i=>.15+.6*fp*(.5+.5*Math.sin(p*TAU*5.7+i*1.2+(sd>0?0:.9))));
      if(bw>0){if(sd<0){h=lerp3(h,[22,-4,80],bw);g.fd=[0,1,0];g.bk=[1,0,0];g.c=[.2,.2,.25]}else{h=lerp3(h,[10,58,74],bw);g.fd=[.2,1,.3];g.bk=[0,0,1];g.c=[0,0,0];g.th=0}}
      if(up<.5&&bw<.5){g.fd=null;g.bk=null;g.c=[.25,.3,.35]}
      if(sd>0){A.hL=h;A.gL=g}else{A.hR=h;A.gR=g}}
    A.cr=.15*fp*Math.sin(p*TAU*3);A.vib=.8*fp;A.lean=.4*bw;A.hp=.12+.25*bw;A.hr=.3*bw;A.jaw=Math.max(A.jaw,2*rise(p,.1,.14,.26,.3)*(.5+.5*Math.sin(p*80)));
    if(p>=.08&&p<.88)A.fthr={k:sstep(.08,.3,p),out:sstep(.85,.9,p)}}
  else if(anim==='lasso'){A.look=p<.68?1:0;
    lightS(A,['wR'],p,0,.72);A.jb=p<.1?1:.15;A.jph=p*8;A.lid=.55*rise(p,.06,.12,.66,.72);
    const up=sstep(.06,.28,p),tr=.6*trem(p,.28,.68,6.5,1.6),fl=pls(p,.69,.05),bk=sstep(.72,1,p);
    let h=lerp3(A.hR,[24,-34,96],up);h=add(h,[fl*10,0,tr-fl*4]);if(p>.72){const sh=1.5*Math.sin((p-.72)*90)*rise(p,.76,.8,.88,.92);h=add(h,[0,sh,0])}h=lerp3(h,A.hR,bk);A.hR=h;
    const g=HP(up>.5?[1,.15,-.08]:null,up>.5?[0,0,1]:null,up>.5?[0,1,1]:[.25,.3,.35],up>.5?.8:.3,up>.5?1:0);if(bk>.5){g.fd=null;g.bk=null;g.c=[.25,.3,.35];g.pt=0}A.gR=g;
    A.hr=.3*rise(p,.06,.2,.68,.74)-.2*rise(p,.8,.86,.92,1);A.ptip=rise(p,.08,.2,.66,.7);
    if(!o.game&&p>=.68&&p<.95)A.lasso={k:p<.8?(p-.68)/.12:1-(p-.8)/.15};A.jaw=1.5*pls(p,.86,.05)}
  else if(anim==='yank'){A.look=0;
    lightS(A,['wR'],p,.72,.98);A.jb=.3;A.jph=p*8;
    const J=c=>{const d=p-c;return d<0?0:d<.05?ez(d/.05):Math.max(0,1-(d-.05)/.15)*.6+.4*Math.exp(-(d-.05)*8)};const j=Math.max(J(.12),J(.39),J(.66))*(p<.72?1:0);
    const pull=rise(p,.05,.12,.7,.74);let h=lerp3(A.hR,[30,-28,80],pull);h=lerp3(h,[14,-24,78],j);
    const ch=rise(p,.72,.8,.9,.94),pn=rise(p,.92,.94,.97,1);h=lerp3(h,[-6,-34,100],ch);h=lerp3(h,[36,-14,62],pn);A.hR=h;
    A.gR=HP(ch+pn>.3?null:[1,.1,0],ch+pn>.3?null:[0,0,1],ch+pn>.3?[1,1,1]:[0,1,1],.8,ch+pn>.3?0:1);if(ch+pn>.3)A.gR=FIST();
    A.lean=-.25*j+.25*pn-.05*ch;A.cp=-.2*j;A.yaw=-.3*ch;A.B[0]+=6*pn-3*j;A.jaw=2*j;A.lid=.4*ch;
    if(!o.game)A.lasso={k:1,tied:1}}
  else if(anim==='snap'){A.look=0;
    const st=sstep(0,.12,p)*(1-sstep(.55,.62,p));slack(A,.1);tense(A,'h',p,.62);tense(A,'wL',p,.7);tense(A,'wR',p,.7);tense(A,'kL',p,.8);tense(A,'kR',p,.8);
    A.lean=-.32*st+.06*Math.sin(p*30)*st;A.B[0]-=8*st;A.hy=1.4*rise(p,.05,.2,.4,.6);A.lid=Math.sin(p*40)>.3&&p<.6?1:0;A.stars=p<.7?1-p/.7:0;
    // the arms windmill
    const wm=p*TAU*2.2;A.hL=lerp3(A.hL,[4+10*Math.cos(wm),44,74+16*Math.sin(wm)],st);A.hR=lerp3(A.hR,[4+10*Math.cos(wm+2),-44,74+16*Math.sin(wm+2)],st);
    A.gL=HP(null,null,[0,0,0],0);A.gR=HP(null,null,[0,0,0],0);A.jaw=3*st*(.5+.5*Math.sin(p*50));A.tsw=.4*st*Math.sin(p*25);A.jb=1;A.jph=p*10;
    if(p<.15)A.fx.push({k:'snapR',t:p/.15})}
  else if(anim==='vanish'){A.look=1;lightS(A,['up'],p,0,.45);A.S.up.v=1.4*rise(p,0,.03,.4,.45);A.jb=p<.12?1:.3;A.jph=p*8;
    A.cur={k:sstep(.06,.32,p)*(1-sstep(.55,.85,p)),w:rise(p,.06,.3,.6,.85),bulge:pls(p,.385,.13)};
    const yk=sstep(.45,.55,p);A.lift+=320*yk*yk;A.cx[2]+=40*rise(p,.4,.45,1,1.1);A.body=1-sstep(.5,.56,p);A.gL=A.gR=HP(null,null,[.4,.4,.45],.4);
    if(p>.3&&p<.45){A.hL[2]+=8;A.hR[2]+=8;A.lean=-.1}if(P2)A.sh.k=1-sstep(.45,.55,p)}
  else if(anim==='drop'){A.look=0;const z=o.z!=null?o.z:(p<.28?260*(1-(p/.28)*(p/.28)):0);A.lift=Math.max(0,z);
    if(p<.28){slack(A,.25);A.hL=[0,58,70];A.hR=[0,-58,70];A.gL=A.gR=HP(null,null,[0,0,0],0);A.fL=[-2,20,10];A.fR=[-2,-20,10];A.tL=A.tR=.3;
      A.lean=-.1;A.hp=-.2;A.lid=0;A.wide=1;A.jaw=3;A.cvis=1;A.vib=2;A.tsw=.5*Math.sin(p*30);A.jb=1;A.jph=p*10;if(!o.game)A.ring={k:p/.28};
      if(P2)A.sh.k=1-sstep(0,.1,p)}
    else{const re=sstep(.55,.9,p),k=1-re;heap(A,1);slack(A,.15);
      // the strings tense one by one and put it back together, a «tac» and a jolt each
      const T=[['h',.6],['wR',.7],['wL',.76],['kL',.84],['kR',.84]];for(const[s,a] of T)tense(A,s,p,a);
      const hk=sstep(.58,.62,p),ar=sstep(.68,.72,p),al=sstep(.74,.78,p),kn=sstep(.82,.9,p);
      A.hp=lerp(.6,.12,hk);A.hr=lerp(.7,0,hk);A.hy=lerp(.25,0,hk);A.droop=lerp(1,0,hk);A.lid=lerp(.5,0,hk);
      A.hR=lerp3([8,-50,4],[WR0[0],-WR0[1],WR0[2]+3*bump(cl((p-.7)/.06,0,1))],ar);A.hL=lerp3([8,50,4],[WR0[0],WR0[1],WR0[2]+3*bump(cl((p-.76)/.06,0,1))],al);
      if(ar>.5)A.gR=HP(null,null);if(al>.5)A.gL=HP(null,null);
      A.B=lerp3([2,0,-33],[0,0,0],kn);A.lean=lerp(.3,0,kn);A.roll=lerp(.14,0,kn);A.fL=lerp3([20,27,4],AN0,kn);A.fR=lerp3([20,-27,4],[AN0[0],-AN0[1],AN0[2]],kn);
      A.tL=A.tR=lerp(-.45,0,kn);A.fyL=A.fyR=lerp(.55,0,kn);A.kpk=1-kn;A.look=0;
      if(p>.9){const s=Math.sin((p-.9)/.1*Math.PI);A.B[2]+=1.5*s;A.hL[2]+=3*s;A.hR[2]+=3*s;A.roll=.06*Math.sin((p-.9)*60)*(1-sstep(.95,1,p))}
      for(const c of[.6,.7,.76,.84])if(p>=c&&p<c+.05)A.fx.push({k:'tac',t:(p-c)/.05});
      if(p<.36)A.fx.push({k:'thud',t:(p-.28)/.08});A.jb=p<.34?1:.2;A.jph=p*8;
      if(P2){A.sh.k=sstep(.45,.55,p);A.sh.gz=lerp(40,0,sstep(.5,.58,p))}}}
  else if(anim==='hand'){A.look=0;
    const up=rise(p,.0,.05,.75,.8),bt=Math.sin(p*TAU*4.5)*sstep(.05,.1,p)*(1-sstep(.7,.75,p)),dn=pls(p,.79,.04);
    for(const sd of[1,-1]){let h=lerp3(sd>0?A.hL:A.hR,[10,sd*34,118+5*bt*sd],up);h=add(h,[0,0,-30*dn]);if(sd>0)A.hL=h;else A.hR=h;const g=HP([0,sd*.3,1],[-1,0,0],[.1,.2,.3],.3);if(up<.4){g.fd=null;g.bk=null}if(sd>0)A.gL=g;else A.gR=g}
    A.hr=.15*bt;A.hy=.2*Math.sin(p*TAU*2.25);A.jaw=Math.max(A.jaw,3*up*(.5+.5*Math.sin(p*70)));A.lean=-.08*up+.12*dn;A.jb=.6;A.jph=p*9;
    if(P2){A.sh.eg=1+.5*rise(p,0,.08,.7,.8);A.sh.sq=rise(p,.34,.38,.78,.86);A.sh.free={k:rise(p,.08,.12,.16,.2)+rise(p,.86,.92,1,1.1),z:p<.5?60*sstep(.08,.2,p):60*(1-sstep(.86,1,p))}}}
  else if(anim==='rage'){A.look=0;A.k2=sstep(.6,.8,p);A.crk=sstep(.62,.8,p);
    const fall=sstep(0,.18,p),up=sstep(.58,.8,p);
    heap(A,fall*(1-up));slack(A,1-fall+up);A.S.up.b=p>=.05&&p<.5?cl((p-.05)/.08,0,1):-1;
    // the cross falls spinning to 110, a hand of shadow comes down from the mist and catches it, pulls it up
    A.cx[2]=lin([[0,0],[.18,0],[.42,-48],[.5,-48],[.58,-44],[.8,0],[1,0]],p);A.cyw=TAU*.75*sstep(.18,.42,p);A.cr=.4*rise(p,.18,.3,.42,.5);
    A.sh={k:sstep(.18,.4,p),eye:sstep(.2,.38,p)*(1-pls(p,.3,.04)-pls(p,.36,.04)),eg:1,sq:rise(p,.82,.86,.96,1),blink:1,gz:p<.5?lerp(70,0,sstep(.42,.5,p)):0,go:p<.5?1-sstep(.46,.5,p):0,free:null,breath:0,mistK:sstep(.2,.4,p)};
    if(p>=.58){A.lift=3*up;for(const c of[.62,.68,.74])if(p>=c&&p<c+.05)A.fx.push({k:'tac',t:(p-c)/.05,smoke:1})}
    A.smoke=rise(p,.62,.66,.85,1);A.hp=lerp(A.hp,-.35,rise(p,.8,.84,.96,1));A.jaw=Math.max(A.jaw,5*rise(p,.8,.83,.96,1)*(.6+.4*Math.sin(p*70)));A.lid=up>0&&up<1?0:A.lid;A.wide=rise(p,.58,.62,.8,.86)}
  else if(anim==='taunt'){A.look=0;
    // the whole turn of the head on its peg, like an owl (ratchet), the hood late; the jaw on the beat; two claps and a short bow
    A.hy=TAU*ez(cl(p/.55,0,1));A.tsw=-.5*Math.sin(Math.PI*cl(p/.6,0,1));A.jaw=Math.max(A.jaw,3*rise(p,.3,.33,.77,.8)*(.5+.5*Math.cos((p-.3)/.5*TAU*3)));
    const cl2=rise(p,.78,.82,.97,1),cp=Math.abs(Math.sin((p-.8)/.2*TAU*2))*cl2;
    A.hL=lerp3(A.hL,[26,6+5*cp,76],cl2);A.hR=lerp3(A.hR,[26,-6-5*cp,76],cl2);if(cl2>.3){A.gL=HP([.3,0,1],[0,1,0],[.1,.1,.1],.1);A.gR=HP([.3,0,1],[0,-1,0],[.1,.1,.1],.1)}
    A.lean=.2*rise(p,.85,.9,.96,1);A.jb=.5;A.jph=p*8;if(P2)A.sh.sq=rise(p,.1,.2,.8,.95);if(p>=.8&&p<1)for(const c of[.85,.95])if(p>=c&&p<c+.04)A.fx.push({k:'clap',t:(p-c)/.04})}
  else if(anim==='call'){A.look=1;
    const fw=rise(p,0,.15,.8,1);A.hR=lerp3(A.hR,[26,-28,76],fw);const g=HP([1,.1,0],[0,0,-1],[0,1,1],.6,1);
    const bk=pls(p,.32,.25)+pls(p,.67,.25);g.c=[.85*bk,1,1];if(fw<.5){g.fd=null;g.bk=null;g.c=[.25,.3,.35];g.pt=0}A.gR=g;
    A.hr=.3*fw;A.jaw=Math.max(A.jaw,1.6*fw*(.5+.5*Math.sin(p*45)));sway(.5)}
  else if(anim==='enter'){A.look=0;
    // .00-.30 the curtain goes up and shows a limp puppet hanging on slack strings; the strings tense one at a time
    A.cur={k:1-sstep(0,.3,p),w:rise(p,0,.05,.25,.32),bulge:0};
    const T=[['h',.31],['wR',.38],['wL',.44],['kR',.51],['kL',.56]];slack(A,.12);for(const[s,a] of T)tense(A,s,p,a);
    const hk=sstep(.305,.32,p),ar=sstep(.375,.39,p),al=sstep(.435,.45,p),kr=sstep(.505,.52,p),kl=sstep(.555,.57,p);
    A.hp=lerp(.85,.12,hk);A.hr=lerp(.2,0,hk);A.lid=lerp(1,0,sstep(.315,.33,p));A.eg=lerp(0,1,sstep(.31,.34,p));A.droop=lerp(.8,0,hk);
    A.hR=lerp3([6,-34,38],[WR0[0],-WR0[1],WR0[2]+6*bump(cl((p-.38)/.05,0,1))],ar);A.hL=lerp3([6,34,38],[WR0[0],WR0[1],WR0[2]+6*bump(cl((p-.44)/.05,0,1))],al);
    A.gL=A.gR=HP(null,null,[.4,.45,.5],.4);
    const kb=(kr+kl)/2;A.B[2]=lerp(-8,0,kb);A.lean=lerp(.2,0,kb);A.fR=lerp3([4,-11,9],[AN0[0],-AN0[1],AN0[2]],kr);A.fL=lerp3([4,11,9],AN0,kl);A.tR=lerp(.7,0,kr);A.tL=lerp(.7,0,kl);
    A.hint=pls(p,.32,.04)*1;
    A.hy=lin([[0,0],[.6,0],[.74,1.9],[.76,1.9],[.775,-.12],[.79,.04],[.81,0],[1,0]],p);if(p>.6&&p<.74)A.hy=1.9*ez((p-.6)/.14);
    A.jaw=Math.max(A.jaw,4*rise(p,.76,.78,.86,.9)*(.5+.5*Math.sin(p*90)));A.jb=p>.76&&p<.9?1:.15;A.jph=p*10;
    const bw=rise(p,.8,.86,.94,1);A.lean+=.55*bw;A.hp+=.3*bw;A.hR=lerp3(A.hR,[22,-4,80],bw);A.hL=lerp3(A.hL,[20,62,62],bw);
    if(bw>.3){A.gR=HP([0,1,0],[1,0,0],[.2,.2,.25],.3);A.gL=HP([.6,.8,-.2],[0,0,1],[0,0,0],0)}A.tsw=.6*bw;
    for(const c of[.31,.38,.44,.51,.56])if(p>=c&&p<c+.05)A.fx.push({k:'tac',t:(p-c)/.05})}
  else if(anim==='die'){A.look=0;const d=o.p2;
    A.eg=p<.1?.6+.4*Math.abs(Math.sin(p*90)):1;A.jaw=p<.1?2.5*(.5+.5*Math.sin(p*120)):A.jaw;
    snapS(A,'kL',p,.12);snapS(A,'kR',p,.2);snapS(A,'wL',p,.28);snapS(A,'wR',p,.36);snapS(A,'h',p,.46);if(!d)snapS(A,'up',p,.5);
    const kn=sstep(.2,.26,p),ar=sstep(.28,.33,p),al=sstep(.36,.41,p),hd=sstep(.46,.5,p),cr=sstep(.48,.68,p);
    A.B[2]=-18*kn;A.lean=.1*kn;A.fL=lerp3(A.fL,[14,12,4],sstep(.12,.18,p));A.fR=lerp3(A.fR,[14,-12,4],kn);A.tL=-.3*sstep(.12,.18,p);A.tR=-.3*kn;
    A.hL=lerp3(A.hL,[6,40,26],ar);A.hR=lerp3(A.hR,[6,-40,26],al);A.gL=A.gR=HP(null,null,[.35,.4,.45],.35);
    A.hp=lerp(.12,.85,hd);A.droop=hd;
    if(cr>0)heap(A,cr,-1);
    A.lid=Math.max(A.lid,sstep(.72,.84,p));A.eg=A.eg*(1-sstep(.72,.8,p));A.eyeL=1-sstep(.72,.78,p);A.eyeR=1-sstep(.78,.84,p);
    // the cross falls on the heap and bounces (.56-.70)
    A.cx[2]=lin([[0,0],[.56,0],[.68,-95],[.7,-90],[.72,-95],[1,-95]],p);A.cr=lin([[0,0],[.56,0],[.68,.9],[1,.9]],p);A.cp=lin([[0,0],[.56,0],[.68,.35],[1,.35]],p);A.cx[0]=lin([[0,0],[.56,0],[.68,10],[1,10]],p);
    if(d){A.sh={k:1-sstep(.6,.84,p),eye:1-sstep(.6,.84,p),eg:1,sq:0,blink:1,gz:0,go:sstep(.5,.54,p),free:null,breath:0,rise:sstep(.6,.84,p)}}
    // a bell comes off the hood, rolls in front of the heap and stops; the curtain comes down; it melts in sparks of gold
    A.bell=p>=.74?{k:sstep(.74,.86,p),out:1-sstep(.95,1,p)}:null;
    A.cur={k:sstep(.86,.95,p),w:rise(p,.86,.9,.95,1),bulge:0,melt:sstep(.95,1,p)};A.jb=rise(p,.48,.5,.66,.7);A.jph=p*10;
    for(const c of[.12,.2,.28,.36,.46])if(p>=c&&p<c+.05)A.fx.push({k:'ping',t:(p-c)/.05});A.fade=1-sstep(.95,1,p)}
  // the look of the head toward the hero (from the game) in the poses that aim
  A.lookK=A.look;
  return A}

// ------------------------------------------------------------------ frames
// the body: the lean round the hips; the lift (the hover of the second phase, the fall) moves everything
const bodyX=A=>frame({B:[A.B[0],A.B[1],A.B[2]+A.lift],lean:A.lean,roll:A.roll,yaw:A.yaw,s:A.s},44);
// the camera's direction (unit) in the model's space: what faces us has a positive dot with it
const camDir=V0=>nrm([V0.s,V0.c,cam.k/cam.zk]);

// ------------------------------------------------------------------ the legs: the breeches puffed round the thigh, the wooden knee ball with
// its peg and the golden eyelet of the string, the shin, the ankle ball, the lacquered pointed shoe with its little bell
function legGeo(X,A,sd){const hip=X.T([HIP[0],sd*HIP[1],HIP[2]]),f=sd>0?A.fL:A.fR,an=[f[0],f[1],f[2]+A.lift],
    pole0=X.Rd([1,sd*.12,.05]),pole=A.kpole&&A.kpk>0?nrm(lerp3(pole0,[A.kpole[0],sd*A.kpole[1],A.kpole[2]],A.kpk)):pole0,[kn,a2]=ik(hip,an,LTH,LSH,pole);
  const t=sd>0?A.tL:A.tR,fy=(sd>0?A.fyL:A.fyR)*sd,fw=[Math.cos(t)*Math.cos(fy),Math.cos(t)*Math.sin(fy),-Math.sin(t)],side=nrm(cross([0,0,1],fw)),up=nrm(cross(fw,side));
  // the knee points away from the line hip-ankle: the string's eyelet is on its front
  const mid=lerp3(hip,a2,.5);let kd=sub(kn,mid);if(len(kd)<.5)kd=X.Rd([1,0,0]);kd=nrm(kd);
  return{sd,hip,kn,an:a2,fw,side,up,eye:add(kn,mul(kd,6.6)),kd}}
function legDraw(V0,X,A,K,g){const{P,F}=V0,{sd,hip,kn,an,fw,side,up}=g,lat=X.Rd([0,sd,0]);
  // the breeches: a velvet puff round the top of the thigh, a golden band at the bottom, three soft folds
  const w=nrm(sub(kn,hip)),[pu,pv]=frm(w,X.Rd([1,0,0])),pc=add(lerp3(hip,kn,.36),mul(lat,.5)),FR3={u:pu,v:pv,w},Rd=[8.5,9.5,9.5],sil=ellSil(V0,pc,Rd,FR3,null,18),pa=smoothP(sil);
  const shin=()=>{const a=P(kn),b=P(an);caps3(a,4.4,b,3.8,K.wood,2.2);
      ctx.save();hull(a,4.4,b,3.8);ctx.clip();ctx.strokeStyle=K.grain;ctx.lineWidth=.8;for(const o2 of[-1.4,1.6]){const n=nrm([-(b[1]-a[1]),b[0]-a[0],0]);ctx.beginPath();ctx.moveTo(a[0]+n[0]*o2,a[1]+n[1]*o2+2);ctx.quadraticCurveTo((a[0]+b[0])/2+n[0]*(o2+.6),(a[1]+b[1])/2+n[1]*(o2+.6),b[0]+n[0]*o2*.8,b[1]+n[1]*o2*.8-2);ctx.stroke()}ctx.restore()},
    shoe=()=>shoeDraw(V0,A,K,g),fwd=F(fw)<-.35;
  if(fwd)shoe();shin();
  // the ankle ball
  ball3(P(an),3.6,K.wood,2);
  if(!fwd)shoe();
  // the breeches over the top of the thigh
  ctx.fillStyle=grad3(bbox(sil),K.plum);ctx.fill(pa);ctx.save();ctx.clip(pa);
  // the golden band at the bottom and the folds
  const bc=add(pc,mul(w,6.8)),rg=ringS(V0,bc,pu,pv,8.2,20),gr=[];for(let i=0;i<20;i++){const t=i/20*TAU,n=add(mul(pu,Math.cos(t)),mul(pv,Math.sin(t)));gr.push(F(n)>-.05?rg[i]:null)}
  const runs=[];let cur=[];for(let i=0;i<=20;i++){const q=gr[i%20];if(q)cur.push(q);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  K3.strokeRuns(runs,INK,3.4);K3.strokeRuns(runs,K.gold.b,1.8);
  ctx.strokeStyle='rgba(20,8,30,.35)';ctx.lineWidth=1;for(const a of[-.9,0,.9]){const n=add(mul(pu,Math.cos(a)),mul(pv,Math.sin(a)));if(F(n)<.15)continue;
    const q0=P(add(add(pc,mul(w,-6)),mul(n,6))),q1=P(add(add(pc,mul(w,4)),mul(n,8.4)));ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.quadraticCurveTo((q0[0]+q1[0])/2+1,(q0[1]+q1[1])/2,q1[0],q1[1]);ctx.stroke()}
  glowTop(P(pc),9,.1);ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke(pa);rimP(sil,.25);
  // the knee: a wooden ball, a dark peg on its outer side, a thin golden ring, the eyelet of the string in front
  const qk=P(kn);ball3(qk,6.8,K.wood,2.2);ctx.strokeStyle='rgba(255,205,69,.75)';ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(qk[0],qk[1],4.6,4.6,0,0,TAU);ctx.stroke();
  if(F(lat)>.1){const q=P(add(kn,mul(lat,6.4)));ctx.fillStyle=K.peg;ball(q,1.6);ctx.fill()}
  if(F(g.kd)>-.2){const q=P(g.eye);ctx.strokeStyle=INK;ctx.lineWidth=2;ball(q,1.4);ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.stroke()}}
function shoeDraw(V0,A,K,g){const{P,F}=V0,{an,fw,side,up}=g,at=(a,b,c)=>add(an,add(add(mul(fw,a),mul(side,b)),mul(up,c)));
  const c0=at(4.6,0,-2.6),Rd=[10,4,3.3],FR3={u:fw,v:side,w:up},sil=ellSil(V0,c0,Rd,FR3,null,16),pa=smoothP(sil);
  // the tip curls up: a short chain, a little golden bell on it
  const tp=[at(11.5,0,-2.2),at(14.4,0,-.8),at(15.6,0,1.4)],qs=tp.map(P);
  ctx.fillStyle=grad3(bbox(sil),K.shoe);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke(pa);
  ctx.fillStyle=INK;for(let i=0;i<2;i++){hull(qs[i],[2.6,1.9,1.3][i]+1.1,qs[i+1],[2.6,1.9,1.3][i+1]+1.1);ctx.fill()}
  ctx.fillStyle=K.shoe.b;for(let i=0;i<2;i++){hull(qs[i],[2.6,1.9,1.3][i]-.2,qs[i+1],[2.6,1.9,1.3][i+1]-.2);ctx.fill()}
  // the white light on the instep and the worn tip
  ctx.save();ctx.clip(pa);const qi=P(at(1,0,1.4));ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(qi[0]-.5,qi[1]-.4,2.2,1,-.3,0,TAU);ctx.fill();
  const qt=P(at(11,0,-1.6));ctx.fillStyle=K.wear;ctx.globalAlpha*=.55;ctx.beginPath();ctx.ellipse(qt[0],qt[1],2,1.2,0,0,TAU);ctx.fill();ctx.restore();rimP(sil,.22);
  const qb=P(add(tp[2],mul(up,-1.2)));ball3(qb,1.8,K.gold,1.2)}

// ------------------------------------------------------------------ the barrel doublet: harlequin diamonds of light violet and crimson with
// golden lines, three golden star buttons, the belt with the little mask of the buckle, the comedy mask embroidered on the back
function surfB(X,Rd,th,z){const zz=cl((z-BC[2])/Rd[2],-1,1),s=Math.sqrt(Math.max(0,1-zz*zz)),m=[s*Math.cos(th),s*Math.sin(th),zz];return{p:X.T(ellAt(BC,Rd,AXES,m)),n:X.Rd(ellN(Rd,AXES,m))}}
// a patch of the barrel drawn only where it faces us: the hidden part of its outline goes along the horizon (pushed out a little: the
// barrel's own outline clips it)
function patch(V0,pts,o){const{P,F}=V0,n=pts.length,f=pts.map(q=>F(q.n)),vis=f.map(v=>v>0);if(!vis.some(v=>v))return null;
  const out=[];for(let i=0;i<n;i++){const j=(i+1)%n;if(vis[i])out.push(P(pts[i].p));if(vis[i]!==vis[j]){const k=f[i]/(f[i]-f[j]),q=P(lerp3(pts[i].p,pts[j].p,k));out.push([q[0]+(q[0]-o[0])*.12,q[1]+(q[1]-o[1])*.12])}}
  return out.length>2?out:null}
function torsoDraw(V0,X,A,K,J){const{P,F}=V0,br=1+A.breath,Rd=[BRD[0]*br,BRD[1]*br,BRD[2]*(1+A.breath*.5)],sil=ellSil(V0,BC,Rd,AXES,X.T,28),pa=smoothP(sil),o0=P(X.T(BC));
  ctx.lineJoin='round';ctx.fillStyle=grad3(bbox(sil),K.vel);ctx.fill(pa);ctx.save();ctx.clip(pa);
  // the crimson diamonds (the rows at 58.5 and 75.5, a quarter turn off the violet ones)
  const dz=8.5,dth=Math.PI/8;ctx.fillStyle=grad3(bbox(sil),K.cri);ctx.beginPath();
  for(const zc of[58.5,75.5])for(let k=0;k<8;k++){const tc=k*Math.PI/4+dth,ring=[];
    const V4=[[tc,zc+dz],[tc+dth,zc],[tc,zc-dz],[tc-dth,zc]];for(let i=0;i<4;i++){const a=V4[i],b=V4[(i+1)%4];for(let j=0;j<3;j++){const u=j/3;ring.push(surfB(X,Rd,lerp(a[0],b[0],u),lerp(a[1],b[1],u)))}}
    const pp=patch(V0,ring,o0);if(pp){ctx.moveTo(pp[0][0],pp[0][1]);for(const q of pp)ctx.lineTo(q[0],q[1]);ctx.closePath()}}
  ctx.fill();
  // the golden lines: the edges of the diamonds, two families of spirals from z 50 to 84
  const runs=[];for(const dir of[1,-1])for(let k=0;k<8;k++){let cur=[];for(let i=0;i<=12;i++){const u=i/12,z=50+34*u,th=k*Math.PI/4+dir*u*Math.PI/2,s2=surfB(X,Rd,th,z);
      if(F(s2.n)>0)cur.push(P(s2.p));else if(cur.length){if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur)}
  for(const z of[50,84]){let cur=[];for(let i=0;i<=32;i++){const s2=surfB(X,Rd,i/32*TAU,z);if(F(s2.n)>0)cur.push(P(s2.p));else if(cur.length){if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur)}
  K3.strokeRuns(runs,'rgba(60,24,10,.45)',2.2);K3.strokeRuns(runs,K.gold.b,1.05);
  // the comedy mask embroidered on the back (dark plum, gold outline, empty almond eyes, the smile)
  backMask(V0,X,Rd,K);
  // the three golden star buttons on the front
  for(const z of[58,68,78]){const s2=surfB(X,Rd,0,z),f=F(s2.n);if(f<.08)continue;const q=P(s2.p),k=Math.pow(f,.6);star5(q,2.9,k,0);ctx.fillStyle=K.gold.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
    ctx.fillStyle='rgba(255,250,220,.8)';ball([q[0]-.6*k,q[1]-.7],.7);ctx.fill()}
  // the shading: the bottom and the far side darker, the light of the stage on the top
  {const b=bbox(sil),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,'rgba(255,240,255,.10)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(20,6,30,.32)');ctx.fillStyle=g;ctx.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1])}
  if(K.top){const b=bbox(sil);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,b[1],0,b[1]+(b[3]-b[1])*.4);g.addColorStop(0,rgba(K.top,.3*K.topA));g.addColorStop(1,rgba(K.top,0));ctx.fillStyle=g;ctx.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);ctx.restore()}
  ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke(pa);rimP(sil,.3);
  // the belt (a golden band at z 49) and its buckle, a smiling golden mask
  {const runs2=[];let cur=[];for(let i=0;i<=32;i++){const s2=surfB(X,Rd,i/32*TAU,49);if(F(s2.n)>-.02)cur.push(P(s2.p));else if(cur.length){runs2.push(cur);cur=[]}}if(cur.length)runs2.push(cur);
    K3.strokeRuns(runs2,INK,5);K3.strokeRuns(runs2,K.gold.b,3);K3.strokeRuns(runs2.map(r=>r.map(q=>[q[0],q[1]-.8])),'rgba(255,248,200,.7)',.8)}
  {const s2=surfB(X,Rd,0,49),f=F(s2.n);if(f>.05){const q=P(s2.p),k=Math.pow(f,.6);ctx.beginPath();ctx.ellipse(q[0],q[1],4.5*k,4.3,0,0,TAU);ctx.fillStyle=grad3([q[0]-4.5,q[1]-4.5,q[0]+4.5,q[1]+4.5],K.gold);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
    ctx.fillStyle='#3a1838';for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(q[0]+s*1.7*k,q[1]-.8,1*k,.7,s*.4,0,TAU);ctx.fill()}ctx.strokeStyle='#3a1838';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-2*k,q[1]+1);ctx.quadraticCurveTo(q[0],q[1]+2.8,q[0]+2*k,q[1]+1);ctx.stroke()}}}
// the mask of the comedy on the back: a shape in (across, up) on the back of the barrel
const BMASK=(()=>{const o=[];for(let i=0;i<=16;i++){const t=i/16*TAU,x=Math.sin(t),y=Math.cos(t);o.push([x*8.6*(1-.18*Math.max(0,-y)),71+y*(y>0?8.8:9.6)+(y<-.6?-.8:0)])}return o})();
function backMask(V0,X,Rd,K){const{P,F}=V0,cen=surfB(X,Rd,Math.PI,71);if(F(cen.n)<.1)return;const k=sstep(.1,.35,F(cen.n));
  const at=(u,z)=>{const zz=(z-BC[2])/Rd[2],s=Math.sqrt(Math.max(.05,1-zz*zz));return P(surfB(X,Rd,Math.PI-u/(Rd[1]*s),z).p)};
  ctx.save();ctx.globalAlpha*=k;const sh=BMASK.map(([u,z])=>at(u,z));poly(sh);ctx.fillStyle='rgba(38,16,52,.55)';ctx.fill();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.3;ctx.stroke();
  // the empty almond eyes, the smile, the gold of the embroidery on the cheeks
  for(const s of[-1,1]){const e=[[s*1.6,74],[s*3.6,75.4],[s*6,74.4],[s*3.8,73],[s*1.6,74]].map(([u,z])=>at(u,z));poly(e);ctx.fillStyle='#120610';ctx.fill();ctx.strokeStyle=K.gold.b;ctx.lineWidth=.9;ctx.stroke()}
  const sm=[[-5.4,68.4],[-2.6,66.2],[0,65.6],[2.6,66.2],[5.4,68.4]].map(([u,z])=>at(u,z));ctx.beginPath();ctx.moveTo(sm[0][0],sm[0][1]);for(const q of sm)ctx.lineTo(q[0],q[1]);ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.2;ctx.stroke();
  for(const s of[-1,1]){const q=at(s*5.6,70.4);ctx.fillStyle=K.gold.b;ball(q,.8);ctx.fill()}ctx.restore()}
// the coat tails: two tongues of violet velvet with a golden edge, hanging behind from the belt (late)
function tailsDraw(V0,X,A,K){const{P}=V0;for(const sd of[-1,1]){const sw=A.tail*(sd>0?1:.85),a=X.T([TAILA[0],sd*TAILA[1],TAILA[2]]),d=X.Rd(rotAx([TAILB[0]-TAILA[0],sd*(TAILB[1]-TAILA[1]),TAILB[2]-TAILA[2]],[0,1,0],-sw*.9)),
    lat=X.Rd([0,sd,0]),b=add(a,d),m=add(lerp3(a,b,.5),X.Rd([-2-2*sw,0,0])),pts=[add(a,mul(lat,-4.5)),add(m,mul(lat,-4.4)),add(b,mul(lat,-2.4)),add(b,add(mul(lat,0),X.Rd([0,0,-3]))),add(b,mul(lat,2.4)),add(m,mul(lat,4.4)),add(a,mul(lat,4.5))].map(P);
    ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);ctx.quadraticCurveTo(pts[3][0],pts[3][1]+1.5,pts[4][0],pts[4][1]);ctx.quadraticCurveTo(pts[5][0],pts[5][1],pts[6][0],pts[6][1]);ctx.closePath();
    ctx.fillStyle=grad3(bbox(pts),K.vel);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.save();ctx.clip();ctx.lineWidth=2.2;ctx.stroke();ctx.restore()}}

// ------------------------------------------------------------------ the arms: the puffed sleeve with the golden bands across it, the violet
// upper sleeve, the wooden elbow ball, the bare wooden forearm, the wrist ball with the eyelet of the string, the big white glove
function armGeo(X,A,sd){const S=X.T([SHJ[0],sd*SHJ[1],SHJ[2]]),h=sd>0?A.hL:A.hR,W=[h[0],h[1],h[2]+A.lift],[El,Wr]=ik(S,W,LUA,LFA,X.Rd([-.35,sd,-.5]));
  const g=sd>0?A.gL:A.gR,fa=nrm(sub(Wr,El));let u=g.fd?nrm(g.fd):fa,bk=g.bk?nrm(g.bk):X.Rd([0,sd,0]);if(Math.abs(dot(bk,u))>.95)bk=X.Rd([1,0,0]);
  const c=add(Wr,mul(u,11));return{sd,S,El,Wr,u,bk,c,g,puff:X.T([PUFF[0],sd*PUFF[1],PUFF[2]]),eye:add(Wr,[0,0,3.8])}}
function upperArmDraw(V0,X,A,K,a){const{P,F}=V0,qs=P(a.S),qe=P(a.El);caps3(qs,6,qe,5,K.vel,2.3);
  // the sleeve gathers at the elbow: a golden band
  {const d=nrm(sub(a.El,a.S)),[u,v]=frm(d,[0,0,1]),r=ringS(V0,add(a.El,mul(d,-3.5)),u,v,5.3,14);ctx.strokeStyle=INK;ctx.lineWidth=3.2;poly(r);ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.7;ctx.stroke()}
  puffDraw(V0,X,A,K,a);
  const q=qe;ball3(q,5,K.wood,2.1);const lat=X.Rd([0,a.sd,0]);if(F(lat)>.1){ctx.fillStyle=K.peg;ball(P(add(a.El,mul(lat,4.6))),1.3);ctx.fill()}}
function puffDraw(V0,X,A,K,a){const{P,F}=V0,c=a.puff,q=P(c),r=PUFFR;ball3(q,r,K.vel,2.4,.32);glowTop(q,r,.1);if(K.top){ctx.save();ctx.globalCompositeOperation='lighter';glowTop(q,r,.25*K.topA);ctx.restore()}
  // two golden bands crossing on its top (the near half only)
  const runs=[];for(const n of[X.Rd([1,0,0]),X.Rd([0,1,0])]){const[u,v]=frm(n,[0,0,1]),R=ringS(V0,c,u,v,r*.98,24);let cur=[];
    for(let i=0;i<=24;i++){const t=i%24/24*TAU,m=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));if(F(m)>.05)cur.push(R[i%24]);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur)}
  K3.strokeRuns(runs,INK,3.4);K3.strokeRuns(runs,K.gold.b,1.9);
  // the gathers where the sleeve goes in
  ctx.strokeStyle='rgba(20,8,30,.4)';ctx.lineWidth=1;for(const t of[-.7,.7]){const d=X.Rd([Math.sin(t)*.5,a.sd*.45,-.75]);if(F(d)<.1)continue;const q0=P(add(c,mul(nrm(d),r*.55))),q1=P(add(c,mul(nrm(d),r*.95)));ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.stroke()}}
function lowerArmDraw(V0,X,A,K,a,L2){const{P,F,D}=V0,qe=P(a.El),qw=P(a.Wr),gl=()=>{a.tips=glove(V0,a,K)};
  const fore=()=>{caps3(qe,4.5,qw,3.8,K.wood,2.2);ctx.save();hull(qe,4.5,qw,3.8);ctx.clip();ctx.strokeStyle=K.grain;ctx.lineWidth=.8;const n=nrm([-(qw[1]-qe[1]),qw[0]-qe[0],0]);
      for(const o2 of[-1.3,1.5]){ctx.beginPath();ctx.moveTo(qe[0]+n[0]*o2,qe[1]+n[1]*o2);ctx.quadraticCurveTo((qe[0]+qw[0])/2+n[0]*(o2+.7),(qe[1]+qw[1])/2+n[1]*(o2+.7),qw[0]+n[0]*o2,qw[1]+n[1]*o2);ctx.stroke()}ctx.restore();
      ball3(qw,3.8,K.wood,2);const qy=P(a.eye);ctx.strokeStyle=INK;ctx.lineWidth=2;ball(qy,1.3);ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.stroke()};
  if(D(a.c)<D(a.Wr)-2){gl();fore()}else{fore();gl()}}
// the white glove (boss3.js glove() made bigger): the palm, the violet cuff with the golden trim, three fingers and the thumb as soft
// capsules that bend one by one, the index straight to point; little wooden knuckles on the back. Returns the fingertips (3D)
function glove(V0,a,K){const{P,D,F}=V0,g=a.g,u=a.u,w=nrm(sub(a.bk,mul(u,dot(a.bk,u)))),v=cross(w,u),s=GS,c=a.c,sd=a.sd,
  at=(x,y,z)=>add(c,mul(add(add(mul(u,x),mul(v,y)),mul(w,z)),s)),L=parts(),tips=[],ts=-sd,ix=1-sd;
  const sil=ellSil(V0,c,[6.6*s,6.2*s,3.8*s],{u,v,w},null,16),pa=smoothP(sil);
  L.add(D(c),()=>{ctx.fillStyle=grad3(bbox(sil),K.ivory);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke(pa);rimP(sil,.3);
    if(F(w)>.15){ctx.save();ctx.globalAlpha*=sstep(.15,.4,F(w));ctx.fillStyle='rgba(150,120,90,.55)';for(let i=0;i<3;i++){ball(P(at(4.4,(i-1)*3.6,2.6)),.85);ctx.fill()}ctx.restore()}});
  // the cuff: a short wide ring behind the palm, its golden trim toward the fingers
  const cf=at(-7.5,0,0),cr=(o)=>{const R=[];for(let i=0;i<14;i++){const t=i/14*TAU;R.push(P(add(add(cf,mul(u,o*s)),add(mul(v,Math.cos(t)*5.6*s),mul(w,Math.sin(t)*4.4*s)))))}return R};
  L.add(D(cf)-.6,()=>{const R0=cr(-1.9),R1=cr(1.9),H=chull(R0.concat(R1));poly(H);ctx.fillStyle=grad3(bbox(H),K.vel);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
    ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.5;poly(R1);ctx.stroke()});
  const rk=1.1,fing=(b,dirs,rs,i)=>{const pts=[b];let q=b;for(const d of dirs){q=add(q,mul(d,s));pts.push(q)}tips[i]=q;
    L.add(D(lerp3(b,q,.5))+(dot(dirs[0],w)<-.3?-.3:.3),()=>{const P2=pts.map(P),bb=bbox(P2);bb[0]-=3;bb[1]-=3;bb[2]+=3;bb[3]+=3;chain(V0,pts,rs.map(r=>r*rk),K.ivory.b,{lw:2.2,fill:grad3(bb,K.ivory),rim:.2})})};
  for(let i=0;i<3;i++){const b=at(5,(i-1)*3.6,.3),k=cl(g.c[i]||0,0,1),pt=i===ix?g.pt:0,lr=(i-1);
    const op=[add(add(mul(u,4.4),mul(w,-.7)),mul(v,lr*.9)),add(add(mul(u,3.8),mul(w,-1.3)),mul(v,lr*.7))],fi=[add(mul(u,2.2),mul(w,-2.6)),add(mul(u,-1.6),mul(w,-2.4))],st=[mul(u,4.7),mul(u,4.3)];
    let d=[lerp3(op[0],fi[0],k),lerp3(op[1],fi[1],k)];if(pt>0)d=[lerp3(d[0],st[0],pt),lerp3(d[1],st[1],pt)];fing(b,d,[2.35,2.15,1.9],i)}
  const tb=at(.5,ts*5.2,-.4),tk=cl(g.th,0,1),td=[lerp3(add(mul(v,ts*2.8),mul(u,2.2)),add(mul(v,ts*1.8),mul(u,2.6)),tk),lerp3(add(mul(u,2.8),mul(v,ts*.6)),add(mul(u,1.8),mul(w,-1.4)),tk)];
  fing(tb,td,[2.3,2.1,1.85],3);run(L);
  // the tip of the index lights up when it points (the lasso)
  if(a.ptip>0){const q=P(tips[ix]);glowL(K.str,q,7,.6*a.ptip);star4(q,3.5*a.ptip,a.ptip,'#fffbe8')}
  return{idx:tips[ix],all:tips}}

// ------------------------------------------------------------------ the ruff: puffs of white round the neck, a golden thread under them
function ruffPts(X,A,hyK){const n=LOWFX?10:12,o=[],r0=hyK;for(let i=0;i<n;i++){const t=i/n*TAU+r0,c=X.T([RUFC[0]+Math.cos(t)*RUFR,Math.sin(t)*RUFR,RUFC[2]+(i%2?.6:-.4)]);o.push(c)}return o}
function ruffPuff(V0,c,K,k){const q=V0.P(c);ball3(q,RUFB*(k||1),K.ruff,1.8,.25)}
function ruffThread(V0,X,K){const{P,F}=V0,runs=[];let cur=[];for(let i=0;i<=24;i++){const t=i/24*TAU,c=X.T([RUFC[0]+Math.cos(t)*(RUFR-1),Math.sin(t)*(RUFR-1),RUFC[2]-3.4]),n=X.Rd([Math.cos(t),Math.sin(t),0]);
  if(F(n)>0)cur.push(P(c));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);K3.strokeRuns(runs,INK,3.2);K3.strokeRuns(runs,K.gold.b,1.6)}

// ------------------------------------------------------------------ the head: the hood (a velvet ball), the ivory face with the golden edge
// of the hood round it, the harlequin mask that makes a V of brows, the golden eyes in dark sockets with the wooden doll's eyelids, the
// little ball of a nose, the rosy cheeks, the painted smile with the marionette's jaw and two little fangs
function headDraw(V0,J,A,K){const{P,F}=V0,Hc=J.Hc,HR=J.HR,R=HOOD,q0=P(Hc),cv=J.cv,
    pt=(d,r)=>{let w=HR(d);const f=dot(w,cv);if(f<.03)w=nrm(add(sub(w,mul(cv,f)),mul(cv,.03)));return P(add(Hc,mul(w,r||R)))},vis=d=>dot(HR(d),cv);
  ctx.lineJoin='round';ball(q0,R);ctx.fillStyle=grad3([q0[0]-R,q0[1]-R,q0[0]+R,q0[1]+R],K.vel);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();
  // the seam over the hood, from the brow to the nape
  {const runs=[];let cur=[];for(let i=0;i<=16;i++){const a=-.2+i/16*2.6,d=[Math.cos(a)*.0+Math.sin(-a+Math.PI/2)*1,0,Math.sin(a)];const dd=nrm([Math.cos(a),0,Math.sin(a)]);if(vis(dd)>.05)cur.push(P(add(Hc,HR(mul(dd,R*.99)))));else if(cur.length){runs.push(cur);cur=[]}}
    if(cur.length)runs.push(cur);K3.strokeRuns(runs,'rgba(26,8,40,.45)',1.1)}
  rim(q0,R,q0,R,.3);glowTop(q0,R,.13);if(K.top){ctx.save();ctx.globalCompositeOperation='lighter';glowTop(q0,R,.28*K.topA);ctx.restore()}
  // the face
  const Xh={T:q=>add(Hc,HR(q)),Rd:HR};ctx.save();const cap=ellCap(V0,Xh,[0,0,0],[R,R,R],AXES,FACEN,FACEA,32,{alv:FACEAV,ck:'pu2f'});
  if(!cap){ctx.restore();return}
  ctx.fillStyle=grad3([q0[0]-R,q0[1]-R,q0[0]+R,q0[1]+R],K.ivory);ctx.fill();ctx.clip();
  // the dark lining of the hood shows at the edge on the far side
  // the cheeks
  for(const sd of[-1,1]){const d=dirAt(sd*.56,-.42),v=vis(d);if(v<.12)continue;const q=pt(d),k=sstep(.12,.4,v);ctx.fillStyle=rgba(K.cheek,.5*k);ctx.beginPath();ctx.ellipse(q[0],q[1],3.6*Math.pow(v,.7),2.5,0,0,TAU);ctx.fill()}
  // the mask: from the temples (its points up to z 119) to the cheekbones, a point down between the eyes; a thin golden edge
  {const top=[],bot=[];for(let i=0;i<=12;i++){const f=-1.02+2.04*i/12,af=Math.abs(f);top.push(dirAt(f,Math.min(.64,.15+.48*af+(af>.9?(af-.9)*.6:0))))}
    for(let i=0;i<=8;i++){const f=1.02-2.04*i/8;bot.push(dirAt(f,-.27+.13*f*f))}
    const sh=top.concat(bot).map(d=>pt(d,R+.1));poly(sh);const b=bbox(sh),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,K.mask.l);g.addColorStop(.5,K.mask.b);g.addColorStop(1,K.mask.d);
    ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.stroke()}
  // the eyes: gold that shines in a dark socket, looking a little down; the wooden eyelids of a doll close from the top
  const E=[1,-1].map(sd=>{const d=dirAt(sd*EYEF,EYEP),v=vis(d);return{sd,d,v,q:pt(d,R+.15)}}).filter(e=>e.v>.08).sort((a,b)=>a.v-b.v);
  for(const e of E){const wd=1+.18*A.wide,rx=4.4*wd*Math.pow(e.v,.7),ry=5*wd,q=e.q,eg=A.eg*(e.sd>0?(A.eyeL==null?1:A.eyeL):(A.eyeR==null?1:A.eyeR)),op=1-A.lid;
    ctx.fillStyle=K.mask.d;ctx.beginPath();ctx.ellipse(q[0],q[1],rx*1.3+.6,ry*1.18,0,0,TAU);ctx.fill();
    if(eg>.02&&op>.05){glowL(K.eyeG,q,ry*3.3,.42*eg*op*(1+.4*(A.eg>1?A.eg-1:0)));
      const g=ctx.createRadialGradient(q[0]-rx*.2,q[1]+ry*.1,.3,q[0],q[1]+ry*.15,ry*1.05);g.addColorStop(0,K.eyeC);g.addColorStop(.55,K.eye);g.addColorStop(1,cmix(K.eye,'#000000',.35));
      ctx.save();ctx.globalAlpha*=cl(eg,0,1);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill();
      if(op>.45&&rx>1.4){ctx.fillStyle='#ffffff';ball([q[0]-rx*.34,q[1]-ry*.42],.95);ctx.fill()}ctx.restore()}
    else{ctx.fillStyle='#0b0410';ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill()}
    if(A.lid>.02){ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],rx+.4,ry+.4,0,0,TAU);ctx.clip();const yl=q[1]-ry-.4+(2*ry+.8)*A.lid;
      ctx.fillStyle=K.mask.b;ctx.fillRect(q[0]-rx-1,q[1]-ry-1,2*rx+2,yl-(q[1]-ry-1));ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-rx-1,yl);ctx.lineTo(q[0]+rx+1,yl);ctx.stroke();ctx.restore()}}
  // the smile, the marionette's jaw between the two grooves (it drops when it talks, laughs or shouts), the dark mouth with a violet light
  {const dm=dirAt(0,-.66);if(vis(dm)>.04){const j=A.jaw,N=8,sm=[];for(let i=0;i<=N;i++){const f=-.45+.9*i/N;sm.push(pt(dirAt(f,-.66+.11*(f/.45)*(f/.45))))}
    const gl=[pt(dirAt(-.45,-.55)),pt(dirAt(-.41,-1.02))],gr=[pt(dirAt(.45,-.55)),pt(dirAt(.41,-1.02))],chin=[];for(let i=0;i<=6;i++){const f=.41-.82*i/6;chin.push(pt(dirAt(f,-1.02)))}
    if(j>.15){const dn=sm.map(q=>[q[0],q[1]+j]);
      ctx.beginPath();ctx.moveTo(sm[0][0],sm[0][1]);for(const q of sm)ctx.lineTo(q[0],q[1]);for(let i=dn.length-1;i>=0;i--)ctx.lineTo(dn[i][0],dn[i][1]);ctx.closePath();ctx.fillStyle=K.mouthIn;ctx.fill();
      if(!LOWFX){const m=sm[N>>1];ctx.save();ctx.clip();const g=ctx.createRadialGradient(m[0],m[1]+j*.6,.3,m[0],m[1]+j*.6,7);g.addColorStop(0,rgba(K.mouthL,.55));g.addColorStop(1,rgba(K.mouthL,0));ctx.fillStyle=g;ctx.fillRect(m[0]-9,m[1]-2,18,j+6);ctx.restore()}
      // the two little fangs at the top corners
      for(const i of[1,N-1]){const q=sm[i],h=Math.min(2.4,j*.8);ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(q[0]-1.1,q[1]-.2);ctx.lineTo(q[0]+1.1,q[1]-.2);ctx.lineTo(q[0],q[1]+h);ctx.closePath();ctx.fill();ctx.stroke()}
      // the jaw: the piece between the grooves, down by j
      ctx.beginPath();ctx.moveTo(dn[0][0],dn[0][1]);for(const q of dn)ctx.lineTo(q[0],q[1]);ctx.lineTo(gr[1][0],gr[1][1]+j);for(const q of chin)ctx.lineTo(q[0],q[1]+j);ctx.lineTo(gl[1][0],gl[1][1]+j);ctx.closePath();
      ctx.fillStyle=K.ivory.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
      ctx.strokeStyle=K.smile;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(dn[0][0],dn[0][1]);for(const q of dn)ctx.lineTo(q[0],q[1]);ctx.stroke()}
    else{ctx.strokeStyle=K.smile;ctx.lineWidth=1.45;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sm[0][0],sm[0][1]);for(const q of sm)ctx.lineTo(q[0],q[1]);ctx.stroke()}
    ctx.strokeStyle=rgba('106,29,68',.75);ctx.lineWidth=1.1;for(const G of[gl,gr]){ctx.beginPath();ctx.moveTo(G[0][0],G[0][1]+(j>.15?j:0));ctx.lineTo(G[1][0],G[1][1]+(j>.15?j:0));ctx.stroke()}}}
  // the cracks of the paint in the second phase: thin lines from the points of the mask down the temples, lit magenta, breathing
  if(A.crk>.02&&K.top){for(const sd of[-1,1]){const pts=[[1.0,.6],[1.05,.47],[1.0,.37],[1.07,.25],[1.03,.13]].map(([f,s2])=>dirAt(sd*f,s2));if(vis(pts[2])<.05)continue;const S=pts.map(d=>pt(d,R+.1));
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();S.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.strokeStyle='rgba(40,8,30,.7)';ctx.lineWidth=1.8;ctx.stroke();
    ctx.strokeStyle=rgba(K1.crk,.95*A.crk);ctx.lineWidth=.9;ctx.stroke();if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(K1.crk,.35*A.crk);ctx.lineWidth=3;ctx.stroke()}ctx.restore()}}
  ctx.restore();
  // the golden edge of the hood round the face
  if(cap.rim&&cap.rim.length>1){ctx.beginPath();ctx.moveTo(cap.rim[0][0],cap.rim[0][1]);for(const q of cap.rim)ctx.lineTo(q[0],q[1]);if(cap.full)ctx.closePath();ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle=INK;ctx.lineWidth=3.8;ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=2.2;ctx.stroke()}
  // the nose: a little ball that sticks out
  {const d=dirAt(0,-.22),v=vis(d);if(v>-.3){const q=P(add(Hc,mul(HR(d),R+1.5)));ctx.save();ctx.globalAlpha*=sstep(-.3,0,v);ball3(q,3.2,K.nose,1.4,.2);ctx.fillStyle='rgba(255,255,255,.75)';ball([q[0]-1,q[1]-1.1],.8);ctx.fill();ctx.restore()}}
  // the stars over the head (hit, snap)
  if(A.stars>0)C.stars(P(add(Hc,[0,0,R+8])),14,A.stars)}
// the two points of the hood: from the top of the head out and down to the bells (the purple one on its left, the crimson one on its
// right), later than the head; limp when nobody holds the strings
function tipPts(J,A,sd){const o=[];for(let i=0;i<TIP.length;i++){const l=[TIP[i][0],sd*TIP[i][1],TIP[i][2]],a=add(J.Hc,J.HR(l)),b=add(J.Hcl,J.HRl(l)),k=TIPLAG[i];
    let q=lerp3(a,b,k);if(A.droop>0){const dz=TIPDROOP[i]*A.droop;q=add(q,[0,0,-dz]);q=add(q,mul(J.HR([0,sd,0]),-dz*.25))}
    if(A.tsw)q=add(q,J.HR([0,sd*A.tsw*TIPLAG[i]*3,A.tsw*TIPLAG[i]*4]));o.push(q)}return o}
function bellAt(A,pts,sd){const t=pts[pts.length-1],ph=A.jph*TAU+(sd>0?0:1.3),j=A.jb;return add(t,[1.4*j*Math.sin(ph),1.8*j*Math.sin(ph+1),-4])}
function tipDraw(V0,J,A,K,sd){const{P}=V0,pts=J.tips[sd>0?1:0],T=sd>0?K.vel:K.cri,P2=pts.map(P),bb=bbox(P2);bb[0]-=6;bb[1]-=6;bb[2]+=6;bb[3]+=6;
  chain(V0,pts,TIPR,T.b,{lw:2.4,fill:grad3(bb,T),rim:.24});
  if(J.bellOff&&sd<0)return;bellDraw(V0,bellAt(A,pts,sd),K,A.jb)}
function bellDraw(V0,c,K,jb){const q=V0.P(c);if(jb>.3)glowL('255,214,110',q,8,.25*jb);ball3(q,3.2,K.gold,1.6,.3);
  ctx.strokeStyle='#5a3a08';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-1.9,q[1]+1.3);ctx.quadraticCurveTo(q[0],q[1]+2.5,q[0]+1.9,q[1]+1.3);ctx.stroke();
  ctx.fillStyle='#3a2408';ball([q[0],q[1]+2.6],.75);ctx.fill();ctx.fillStyle='rgba(255,255,240,.85)';ball([q[0]-1,q[1]-1.1],.7);ctx.fill()}
