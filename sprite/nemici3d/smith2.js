// IL FABBRO INFERNALE rifatto: «il Gigante della Forgia» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio
// sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo
// il Golem: «sì, fai gli altri 12»). Design: docs/boss-classici-design/smith.md. Un gigante di bronzo nato nel cuore del vulcano, il fabbro
// e la sua fucina in un corpo solo: nel petto a botte arde una fornace dietro un portello tondo a grata, ai lati tre feritoie per parte
// (le costole) dove si vede salire la pressione; sulle spalle due spallacci-stufa di ghisa con due camini che fumano a ogni passo;
// l'avambraccio sinistro è un'incudine, sul destro è avvolta tre volte la catena del maglio (un blocco di ghisa grande quanto l'eroe); dal
// cappuccio di cuoio, nel buio, solo due occhi di brace sotto una fascia di ferro a V; sotto, una barba di ferro in tre trecce e un
// grembiule di cuoio rosso. Prima di ogni colpo il metallo che colpirà si arroventa (bianco vuol dire adesso); ogni mossa carica la
// pressione (o.press, le feritoie accese) e con tre file accese sfiata e la fornace resta aperta: lì si colpisce. A metà vita il cappuccio
// gli brucia in testa, si alza la criniera di fuoco e tutto il bronzo diventa rovente. Resta della Classica: forme robuste da giocattolo,
// colori pieni, occhi con la lucina, due zannette, niente sangue, ferite o cuciture.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia e gambe a due ossa (ik), ordine di disegno dalla posa di
// riposo, la testa con la sua telecamera (gira e si piega sul collo); dipinto come la lanterna (tre toni, bordo caldo, bagliori morbidi).
// Mosse: idle, walk, hit, slam (Martellata rovente), stuck (Maglio incastrato), anvil (Incudini dal cielo), swing / hold / yank (Lancio del
// maglio: il giro, la catena tesa, lo strattone), vent / vent2 (Sfiatata delle costole, doppia nella fase 2), open (Fornace aperta),
// spinup / spin / dizzy (Turbine del maglio, fase 2), rage (Si arroventa), taunt (Presa in giro), enter (Al lavoro), die (La forgia si
// spegne). Opzioni: o.p2 (seconda fase), o.press (0..3, le feritoie accese, dal gioco), o.noFx (niente fumo, vapore, scintille).
// Con LOWFX niente bagliori, fumo, vapore, scintille né braci; la criniera ferma; restano il calore, le feritoie e il portello (gli avvisi).
// Disegni per il gioco con lo stesso aspetto: N3.smithAnvil (l'incudine, anche quella da lavoro), N3.smithMaul (il maglio da solo),
// N3.smithChain (la catena), N3.smithHand (dove sono il polso e il maglio sullo schermo), N3.smithCrack (la crepa di lava), N3.smithJet (il
// getto della Sfiatata); gli stessi anche come N3.smith2Anvil ecc. Nel gioco prende il nome 'smith' (src/js/89-fabbro-nuovo.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,cmix,poly,bbox,
  sp,rotY,rotZ,look,blink,keys,sstep,hitK,frame,vol,ellPts,ellAt,ellN,AXES,caps,chain,disc3,leaf,eyes,mouth,floor,parts,reg,shine,smooth,chull,ik,stepper,revo,revoAt,stars}=C;
const{dir,trem,fxOn,pls,rise,flash,ga,strokeRuns,ellCap,fadeDraw,grad3,ellSil,hullE,svol3,rimP,lit,tone,facets,boxF,boxV,frm,band,limbGrad,T3,mixT,mixRgb,rotXv,rotAx}=C3K;

// ------------------------------------------------------------------ colours
const K1={bronze:T3('#e9ad6a','#a8652c','#4a250d'),iron:T3('#a2adb9','#5b6673','#262c35'),hi:'#e2eaf2',slot:'#12161c',brass:T3('#ffe196','#d29b3c','#7a5218'),
  apron:T3('#c46a3c','#8a3b20','#40170b'),hem:'#1f0d07',hood:T3('#7c4128','#4c2416','#230f08'),dark:'#140a06',lthr:T3('#6a3a22','#3e1f10','#1c0c05'),
  beard:T3('#7b7682','#46424d','#1e1c23'),bead:'#d29b3c',chain:T3('#8d97a3','#4f5864','#22272e'),wood:T3('#8a5a36','#5a3820','#2a180c'),
  eye:'#ffc23e',eyeC:'#fffbe8',eyeG:'255,190,80',mouth:'#3a1408',mouthL:'#ffd56a',fang:'#f2c088',vent:'#ff8a3a',rune:'#2a2018'};
const K2={bronze:T3('#ffbe7a','#c95a26','#5c1d0a'),iron:T3('#c49a8a','#6e4a46','#2e1a19'),hi:'#ffb366',slot:'#2a120c',brass:K1.brass,
  apron:T3('#a0502c','#5e2414','#2a0e06'),hem:'#2a0e06',hood:K1.hood,dark:'#3a1206',lthr:T3('#5e3420','#36190c','#180a04'),
  beard:T3('#a08a86','#5a4a4c','#2a1e20'),bead:'#ffb34a',chain:T3('#c08a70','#6e4636','#2e1a14'),wood:T3('#7a4a2a','#4a2a14','#22100a'),
  eye:'#ffe08a',eyeC:'#ffffff',eyeG:'255,110,40',mouth:'#ffd56a',mouthL:'#fff1c0',fang:'#ffd9a8',vent:'#ff9a3a',rune:'#ffd56a'};
// the cold statue of the defeat: ash bronze, cold iron, the leathers half grey
const KS={bronze:T3('#a39a90','#6b645c','#2f2b27'),iron:T3('#8a8d93','#55585e','#232428')};
const GREY='#3a302a',PALC={};
function pal(k2,cool){k2=Math.round(cl(k2,0,1)*12)/12;cool=Math.round(cl(cool,0,1)*12)/12;const id=k2+'|'+cool;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(cool>0){K.bronze=mixT(K.bronze,KS.bronze,cool);K.iron=mixT(K.iron,KS.iron,cool);K.chain=mixT(K.chain,KS.iron,cool);K.hi=cmix(K.hi,'#9a9ea4',cool);
    for(const k of['apron','hood','lthr','beard','wood','brass'])K[k]=mixT(K[k],T3(cmix(K[k].l,GREY,.5),cmix(K[k].b,GREY,.5),cmix(K[k].d,GREY,.5)),cool)}
  return PALC[id]=K}
// the fire of the furnace, the ramp of the heat (the metal that will strike goes red, orange, yellow, white: white means now)
const FIRE={core:'#fff6d6',hot:'#ffd56a',flame:'#ff8c2e',deep:'#d6431a',glow:'255,150,60'};
const RAMP=[[.25,'#9a2a1a'],[.5,'#ff5a1a'],[.75,'#ffb43a'],[1,'#fff4d6']];
function rampC(base,k){if(k<=0)return base;let a=[0,base];for(const r of RAMP){if(k<=r[0])return cmix(a[1],r[1],(k-a[0])/(r[0]-a[0]));a=r}return RAMP[3][1]}
const HTC={};
function heatT(T,k){k=Math.round(cl(k,0,1)*16)/16;if(k<=0)return T;const id=T.b+'|'+k;if(HTC[id])return HTC[id];const c=rampC(T.b,k),w=Math.min(1,k*1.5);
  return HTC[id]=T3(cmix(T.l,cmix(c,'#ffffff',.25),w),cmix(T.b,c,w),cmix(T.d,cmix(c,'#1a0804',.55),w))}

// ------------------------------------------------------------------ the body at rest (x forward, y to its right, z up; 0,0,0 the floor point)
const PROF=[[0,26],[8,30.5],[20,33],[32,32],[42,28],[48,21],[51,12]],AX=.82,ZB=36;     // the barrel of the chest (bronze)
const DOOR=[26.9,0,58],HOOPS=[[41,45],[75,79]],VROWS=[50,57.5,65];
const HIP=[-2,15,34],LTH=15.5,LSH=12,BOOT=[13,9,4.5];
const SHJ=[-2,40,77],LUA=25,LFA=27,FISTR=11;
const PAUL=[-3,35,80],PAULR=[17,16,13],CHB=[-8,40,90],CHD=nrm([-.22,.36,1]),CHL=26;
const HC=[13,0,92],HOOD=[15.5,15,16.5],BALD=[13.5,13.5,14];
const RF0=[16,44,26],LF0=[14,-45,24],GRIP=20,HANDLE=34;
const BRAID=[nrm([.74,-.36,-.62]),nrm([.8,0,-.66]),nrm([.74,.36,-.62])];
const VBAND=[nrm([.62,-.72,.30]),nrm([.97,0,.20]),nrm([.62,.72,.30])];
// the profile of the barrel at a height (the radius sideways; x is AX times it)
function rAt(dz){if(dz<=PROF[0][0])return PROF[0][1];for(let i=0;i<PROF.length-1;i++){const a=PROF[i],b=PROF[i+1];if(dz<=b[0])return lerp(a[1],b[1],(dz-a[0])/(b[0]-a[0]))}return PROF[PROF.length-1][1]}
// a point on the barrel (angle t round it: 0 in front, π/2 its right; height z), pushed out by `out`, and its normal; bs: the breath
function bar(t,z,out,bs){const dz=z-ZB,r=rAt(dz)*(bs||1)+(out||0),sl=(rAt(dz+.5)-rAt(dz-.5))*(bs||1);return{p:[Math.cos(t)*r*AX,Math.sin(t)*r,z],n:nrm([Math.cos(t)/AX,Math.sin(t),-sl])}}
const BARC={};
function barPts(bs){const k=Math.round(bs*400)/400;if(BARC[k])return BARC[k];const out=[];for(const[dz,r] of PROF)for(let i=0;i<18;i++){const t=i/18*TAU;out.push([Math.cos(t)*r*k*AX,Math.sin(t)*r*k,ZB+dz])}
  out.push([0,0,ZB+51.5]);return BARC[k]=out}

// ------------------------------------------------------------------ the moves (every one depends only on p; idle, walk, hold and spin close on themselves)
const MV=['idle','walk','hit','slam','stuck','anvil','swing','hold','yank','vent','vent2','open','spinup','spin','dizzy','rage','taunt','enter','die'];
const DUR={idle:3,walk:1.4,hit:.6,slam:2,stuck:1,anvil:1.8,swing:1.6,hold:.8,yank:1,vent:1.9,vent2:2.6,open:1.6,spinup:1,spin:.8,dizzy:1.2,rage:3,taunt:1.2,enter:3.2,die:4};
const kv=(K,p)=>keys(K,p);
// the maul in two hands: the right fist 22 from the head, the left 32 (along the handle)
const twoHands=(A,c,h)=>{A.mode='two';A.mc=c;A.mh=nrm(h);A.hR=add(c,mul(A.mh,22));A.hL=add(c,mul(A.mh,32))};
// the strike axis of a maul held in the swing plane (perpendicular to the handle, in the plane of the handle and of `up`)
const strike=(h,up)=>{const u=sub(up,mul(h,dot(up,h)));return len(u)<.05?nrm(cross(h,[0,1,0])):nrm(u)};
function sPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter',A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,fL:[3,-16,0],fR:[3,16,0],hL:LF0.slice(),hR:RF0.slice(),
    mode:'floor',mc:null,mh:null,ma:null,grip:GRIP,mdir:[1,0],hy:0,hp:0,hr:0,squint:0,eye:1,jaw:0,door:0,fire:.6,fireW:0,press:cl(o.press||0,0,3),ventW:[0,0,0],
    heat:{maul:P2?.55:0,chain:0,anvil:0,vent:0,chim:0},bs:1,shZ:0,mute:0,flame:P2?1:0,hood:P2?0:1,mane:P2?1:0,k2:P2?1:0,cool:0,wraps:3,anvRoll:0,
    braid:[0,0],blift:0,apF:0,apS:0,kneel:0,work:null,fx:[],stars:0,dflash:0,flashW:0,steam:0};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const puff=(c,sd,w)=>fx(P2?'flame':'puff',(p-c)/(w||.16),{sd});
  if(P2){A.hL=[14,-46,28];A.heat.maul=.55}
  if(anim==='walk'){// two heavy steps on bent knees, the chimney of the same side puffs at each one; the maul drags along the floor
    const st=stepper(p,.5),a=st(0,10,4),b=st(.5,10,4);A.fR=[3+a.x,16,a.z];A.fL=[3+b.x,-16,b.z];
    const imp=Math.max(0,Math.cos(TAU*2*(p-.04)));A.B=[0,0,-3*imp];A.s=-.03*imp;A.roll=-.05*Math.sin(ph);A.yaw=.04*Math.sin(ph);A.lean=.08;
    A.hy=-A.yaw;A.braid=[-.12*Math.sin(TAU*2*(p-.12)),.1*Math.sin(ph-.6)];A.apF=.12*Math.sin(ph-.5);A.apS=.08*Math.sin(TAU*2*(p-.1));
    A.hR=[16-3*Math.sin(ph),44,26+1.5*imp];A.mdir=[Math.cos(.07*Math.sin(ph)),Math.sin(.07*Math.sin(ph))];
    A.hL=[14+6*Math.sin(ph),-45,24+2*Math.max(0,Math.sin(ph))];
    puff(.02,1);puff(.52,-1);fx('spark',(p-.10)/.1,{at:[30,44,0],n:3});fx('spark',(p-.60)/.1,{at:[30,44,0],n:3});
    fx('dust',(p-.0)/.16,{at:[3,16,0],n:4,r:8});fx('dust',(p-.5)/.16,{at:[3,-16,0],n:4,r:8})}
  else if(anim==='hit'){const k=hitK(p);A.B=[-3*k,0,0];A.lean=-.08*k;A.hp=-.12*k;A.squint=.9*(1-sstep(.36,.44,p));A.door=.06*Math.sin(Math.PI*cl(p/.3,0,1));
    A.braid=[-.3*k,0];fx('steam',p/.4,{at:'vents'});fx('spark',p/.3,{at:[24,0,60],n:4})}
  else if(anim==='slam'){// MARTELLATA ROVENTE: plants the feet, drags the maul back and over the head with both hands (it heats from black to
    // white), holds it up trembling, then a sharp blow in front (.62): the head of the maul planted in [50,0,4]
    A.fL=[3+6*sstep(0,.1,p),-16,0];A.door=0;A.fire=.6+.4*pls(p,.04,.08);A.mute=sstep(0,.1,p);A.dflash=flash(p,.04,.08);
    A.heat.maul=keys([[0,0],[.1,0],[.22,.35],[.32,.7],[.42,1],[.62,1],[1,.6]],p);
    const K=[[0,[0,0,0,0]],[.1,[0,0,0,0]],[.26,[-.06,-.1,0,-.05]],[.42,[-.14,-.25,0,0]],[.58,[-.14,-.25,0,0]],[.62,[.28,.12,-5,0]],[.75,[.26,.1,-5,0]],[1,[.24,.08,-4,0]]];
    const v=kv(K,p);A.lean=v[0];A.hp=v[1];A.B=[0,0,v[2]];A.yaw=v[3];
    if(p<.1){A.mode='floor'}
    else if(p<.26){const k=ez((p-.1)/.16),c=lerp3([-10,34,9],[-6,18,70],k),h=nrm(lerp3([1,.3,1.2],[.5,-.3,1],k));A.mode='hand';A.mc=c;A.mh=h;A.hR=add(c,mul(h,GRIP))}
    else if(p<.42){const k=ez((p-.26)/.16);twoHands(A,lerp3([-8,10,108],[-16,0,134],k),lerp3([.6,-.1,-.75],[.55,0,-.84],k))}
    else if(p<.58){const t=trem(p,.42,.58,7,2);twoHands(A,[-16,0,134+.6*t],[.55,0,-.84]);A.squint=.7;A.B[1]=.6*t}
    else if(p<.62){const k=(p-.58)/.04,an=lerp(-1.0,1.0,ez(k)),c=[lerp(-16,50,ez(k)),0,lerp(134,4,k*k)];twoHands(A,c,[-Math.cos(an*.5)*.6,0,.8]);A.mc=c}
    else twoHands(A,[50,0,4],[-.6,0,.8]);
    if(p>=.62){const b=Math.max(pls(p,.75,.07),pls(p,.88,.07));A.shZ=-2*b;A.B[2]-=1.5*b}
    if(A.mh)A.ma=strike(A.mh,[1,0,0]);A.planted=p>=.62?1:0;
    fx('spark',(p-.12)/.14,{at:[-10,34,0],n:5});if(p>.32&&p<.6)fx('drip',((p-.32)*6)%1,{maul:1});
    fx('flash',(p-.62)/.12,{at:[50,0,4]});fx('dust',(p-.62)/.25,{at:[50,0,0],n:8,r:22});fx('steam',(p-.44)/.14,{at:'vents'})}
  else if(anim==='stuck'){// MAGLIO INCASTRATO: three tugs, two pants of steam; at .85 tears it out with a burst of embers and clods
    const yank=Math.max(pls(p,.15,.08),pls(p,.42,.08),pls(p,.68,.08));A.lean=.24-.06*yank;A.B=[-3*yank,0,-4];A.hp=-.06;A.roll=.04*yank*(p<.3?1:p<.55?-1:1);
    A.heat.maul=lerp(.6,.3,p);A.squint=.5;
    if(p<.85){twoHands(A,[50,0,4],[-.6,0,.8]);A.hR=add(A.hR,[-1.5*yank,0,0]);A.hL=add(A.hL,[-1.5*yank,0,0]);A.planted=1}
    else{const k=ez((p-.85)/.15);A.lean=lerp(.24,0,k);A.B[2]=lerp(-4,0,k);A.mode='floor';A.hR=lerp3([37,0,22],RF0,k);A.hL=lerp3([31,-6,30],LF0,k);A.mdir=[1,0];A.liftM=8*(1-k)}
    for(const c of[.30,.58])fx('steam',(p-c)/.14,{at:'vents'});for(const c of[.15,.42,.68])fx('dust',(p-c)/.14,{at:[50,0,0],n:4,r:9});
    fx('spark',(p-.85)/.15,{at:[50,0,6],n:8});fx('dust',(p-.85)/.15,{at:[50,0,0],n:7,r:16})}
  else if(anim==='anvil'){// INCUDINI DAL CIELO: the anvil of the forearm across the chest, face up; the maul held short over it; three DONG (four
    // in the second phase, the last one double); after each one it lifts its head to the ceiling, as if calling
    const D=P2?[.22,.38,.54,.70]:[.28,.50,.72],arm=sstep(0,.18,p)*(1-sstep(.85,1,p));A.anvRoll=1.57*arm;A.heat.anvil=.6*sstep(0,.18,p)*(1-sstep(.85,1,p));
    A.hL=lerp3(LF0,[34,8,70],arm);A.squint=.4*arm;
    let up=0;for(const d of D){const r=sstep(d-.08,d-.02,p)*(1-sstep(d-.02,d,p));up=Math.max(up,r)}
    const hit=D.reduce((m,d)=>Math.max(m,flash(p,d,.06)),0);
    A.mode='hand';A.grip=6;A.mh=nrm(lerp3([-10,0,17],[-.4,.3,.6],arm));const top=[30,22,96],low=[32,10,82],hand=lerp3(low,top,up);A.hR=lerp3(RF0,hand,arm);
    A.mc=sub(A.hR,mul(A.mh,6));A.ma=strike(A.mh,[0,0,-1]);if(arm<.05){A.mode='floor';A.mc=null}
    for(const d of D){A.hp-=.25*rise(p,d+.02,d+.04,d+.12,d+.14);fx('anvilhit',(p-d)/.12,{big:P2&&d===.70?1:0});fx('ringup',(p-d)/.14,{double:P2&&d===.70?1:0})}
    A.flashW=hit;A.lean=-.04*arm}
  else if(anim==='swing'){// LANCIO DEL MAGLIO: lets the handle slide to the pommel and takes the chain (it heats from the wrist), raises the
    // right hand over the head and spins the maul round on the chain (two turns, faster and faster), the last low turn forward and the
    // step with the left foot; at .60 it lets go (from here the game draws the maul); the three turns of chain on the forearm unwind
    const g=sstep(0,.12,p);A.heat.chain=sstep(.04,.5,p);A.heat.maul=.7*sstep(.12,.55,p);A.squint=.6*sstep(.1,.2,p);
    if(p<.12){A.mode='floor';A.hR=lerp3(RF0,[10,30,60],ez(p/.12))}
    else if(p<.60){const u=(p-.12)/.48,th=-1.2+TAU*2*u*u*(1+.15*(1-u)),H=lerp3([10,30,60],[0,12,120],sstep(0,.2,u));A.hR=H;A.yaw=.15*Math.sin(th);
      const low=sstep(.86,1,u),rr=40,c=add(H,[Math.cos(th)*rr,Math.sin(th)*rr,-4-58*low]);A.mode='chain';A.mc=c;A.mh=nrm(sub(H,c));A.ma=nrm(cross(A.mh,[0,0,1]));
      if(u>.86)A.fL=[3+8*sstep(.86,1,u),-16,2*Math.sin(Math.PI*sstep(.86,1,u))];fx('trail',u,{th})}
    else{const k=sstep(.60,.7,p);A.mode='none';A.hR=lerp3([0,12,120],[40,30,70],k);A.fL=[11,-16,0];A.lean=.06}
    A.wraps=3-sstep(.70,.74,p)-sstep(.80,.84,p)-sstep(.90,.94,p);A.hL=lerp3(LF0,[10,-40,40],g)}
  else if(anim==='hold'){// LA CATENA TESA: leaning back, the feet braced, both hands on the taut chain in front of the chest (the maul is far
    // away: the game draws it); the arms tremble
    const t=Math.sin(TAU*6*p*.8)*.7;A.lean=-.18;A.B=[-2,0,-1];A.fL=[11,-16,0];A.fR=[-3,16,0];A.hR=[24,6,52+t];A.hL=[24,-6,52-t];A.mode='none';A.wraps=0;A.squint=.5;A.heat.chain=P2?1:.4;
    puff(.5,1,.3);puff(.5,-1,.3)}
  else if(anim==='yank'){// LO STRATTONE: pulls the chain hand over hand (.05, .18, .31), takes the maul back by the handle (.40-.50) with half a
    // turn of the body; the three turns of chain go back onto the forearm (.55, .65, .75)
    const pulls=[.05,.18,.31];let pl=0;for(const c of pulls)pl=Math.max(pl,pls(p,c+.04,.1));A.lean=-.18+.08*pl;A.B=[-2*pl,0,-1];A.fL=[11,-16,0];A.heat.chain=P2?1:.4*(1-sstep(.5,.9,p));
    if(p<.40){const i=p<.18?0:p<.31?1:2,k=((p-pulls[i])/.13+1)%1;const a=[24+8*(1-k),6,52],b=[24+8*k,-6,52];A.hR=i%2?b:a;A.hL=i%2?a:[a[0],-6,52];A.mode='none';A.wraps=0}
    else{const k=sstep(.40,.50,p),r=sstep(.85,1,p);A.yaw=.4*(1-k);A.mode='floor';A.hR=lerp3([30,30,40],RF0,r);A.hL=lerp3([24,-6,52],LF0,sstep(.4,.6,p));A.lean=lerp(-.1,0,k);
      A.wraps=sstep(.55,.59,p)+sstep(.65,.69,p)+sstep(.75,.79,p);A.liftM=10*(1-r)}}
  else if(anim==='vent'||anim==='vent2'){// SFIATATA DELLE COSTOLE: the feet wide, the shoulders back, the chest out; the chimneys go silent; the vents
    // go white row after row; the door white, the braids rise, the body trembles harder and harder; the blast (jets from the vents, the
    // door and the grille), the arms wide; it deflates and pants, the door starts to open (the next move is 'open')
    const two=anim==='vent2',W1=two?[.06,.12,.18]:[.10,.20,.30],B1=two?.40:.55,E1=two?.55:.80;A.fL=[3,-22,0];A.fR=[3,22,0];A.mute=1;
    for(let j=0;j<3;j++)A.ventW[j]=sstep(W1[j],W1[j]+.04,p);A.press=3;
    let blast=rise(p,B1-.01,B1,E1-.06,E1);
    if(two){for(let j=0;j<3;j++)A.ventW[j]=Math.max(A.ventW[j]*(1-sstep(.55,.6,p)),sstep(.62+j*.025,.66+j*.025,p)*(1-sstep(.9,.95,p)));blast=Math.max(blast,rise(p,.75,.76,.86,.9))}
    const white=Math.max(...A.ventW);A.fireW=white;A.fire=.7+.3*white;A.lean=-.1*sstep(0,.08,p);A.blift=.5*white;
    const pre=two?[[.04,.40],[.56,.76]]:[[.04,.55]];let tr=0;for(const[a,b] of pre)if(p>a&&p<b)tr=.8*sstep(a,b,p)*Math.sin(TAU*7*p*(two?2.6:1.9));A.B[1]=tr;A.roll=.01*tr;
    const wide=Math.max(blast,two?0:0);A.hL=lerp3(LF0,[6,-62,60],wide);A.hR=lerp3(RF0,[6,62,60],wide);A.mode=wide>.1?'free':'floor';
    if(A.mode==='free'){A.mc=lerp3([26,44,9],[16,40,9],wide);A.mh=nrm([-1,.2,1.6]);A.ma=[0,1,0]}
    A.yaw=two&&p>.6?.39*sstep(.6,.74,p):0;A.jets=blast;A.steam=blast;
    const end=two?.90:.80;A.s=-.06*sstep(end,end+.05,p);A.door=sstep(two?.95:.85,1,p)*.3;fx('steam',(p-end)/.2,{at:'vents'})}
  else if(anim==='open'){// FORNACE APERTA: the door wide open (110°) and the fire roaring in sight; bent forward, the hands on the knees, the maul
    // on the floor; three big pants of steam out of the door; the vents go out one row at a time; the door slams shut (.85, the clang .90)
    A.door=sstep(0,.1,p)*(1-sstep(.85,.9,p));A.fire=1;A.mute=1;A.lean=.22*(1-sstep(.9,1,p));A.B=[0,0,-3*(1-sstep(.9,1,p))];A.eye=.5+.5*sstep(.92,.96,p);A.squint=.5*(1-sstep(.9,.95,p));
    const pant=Math.max(pls(p,.20,.1),pls(p,.50,.1),pls(p,.80,.1));A.bs=1+.03*pant;A.press=3-sstep(.23,.27,p)-sstep(.43,.47,p)-sstep(.63,.67,p);
    const bend=1-sstep(.9,1,p);A.hL=lerp3(LF0,[14,-22,24],bend);A.hR=lerp3(RF0,[14,22,24],bend);A.mode='free';A.mc=[30,44,9];A.mh=nrm([-.6,.3,1]);A.ma=[0,1,0];
    for(const c of[.20,.50,.80])fx('steam',(p-c)/.16,{at:'door'});fx('flash',(p-.9)/.08,{at:DOOR,small:1})}
  else if(anim==='spinup'){// RINCORSA DEL TURBINE: lowers the maul at arm's length to the floor on its right, drags it in a full circle round
    // itself (the body makes a whole turn), lifts it to the hips with both hands, white hot
    const turn=sstep(.15,.70,p);A.yaw=TAU*ez(turn);A.heat.maul=lerp(.55,1,sstep(.2,.9,p));A.apS=.6*sstep(.7,1,p);A.squint=.6;
    const lift=sstep(.70,1,p),a=A.yaw;
    if(p<.70){const c=[lerp(26,10,sstep(0,.15,p)),lerp(44,62,sstep(0,.15,p)),9];A.mode='hand';A.grip=26;A.mc=rotZ(c,a);A.mh=nrm(rotZ([-.15,-.6,1],a));A.hR=add(A.mc,mul(A.mh,26));A.ma=nrm(rotZ([1,0,0],a))}
    else{const c=rotZ([4,lerp(62,66,lift),lerp(9,34,lift)],a),h=nrm(rotZ([0,-1,lerp(.6,0,lift)],a));twoHands(A,c,h);A.ma=nrm(rotZ([1,0,0],a))}
    if(p<.7)A.hL=rotZ([10,-40,40],a);if(p>.15&&p<.7)fx('scrape',((p-.15)*8)%1,{});A.fL=rotZ([3,-16,0],a*.5);A.fR=rotZ([3,16,0],a*.5)}
  else if(anim==='spin'){// TURBINE DEL MAGLIO: a whole turn on itself (the rotation is in the model), the maul held straight out at the hips with
    // both hands, the apron opens like a bell, the braids fly out, spirals of fire from the chimneys
    const a=TAU*p;A.yaw=a;const c=rotZ([4,66,34],a),h=nrm(rotZ([0,-1,0],a));twoHands(A,c,h);A.ma=nrm(rotZ([1,0,0],a));A.heat.maul=1;A.apS=.9;A.apF=.5;A.squint=.7;A.braid=[0,.6];
    A.fL=rotZ([3,-16,0],a);A.fR=rotZ([3,16,0],a);fx('trail',p,{th:a,spin:1});fx('flame',(p*2)%1,{sd:1});fx('flame',(p*2+.5)%1,{sd:-1})}
  else if(anim==='dizzy'){// BARCOLLA: stops dead, the maul slips to the floor (clang .15), the door swings open, three unsure steps (.10, .35,
    // .60) with the head lolling, sparks circle over the head like stars; it bends and takes the maul back (.85-.95), the door shuts
    A.door=sstep(.05,.15,p)*(1-sstep(.92,.97,p));A.fire=1;A.stars=sstep(.1,.2,p)*(1-sstep(.8,.9,p));A.squint=.4;
    const steps=[[.10,-1],[.35,1],[.60,-1]];for(const[c,sd] of steps){const k=pls(p,c+.06,.14);if(sd<0)A.fL=[3+4*k,-16,3*k];else A.fR=[3+4*k,16,3*k]}
    A.roll=.10*Math.sin(TAU*(p-.05)*1.6)*(1-sstep(.8,.9,p));A.hr=.25*Math.sin(TAU*(p-.1)*1.6)*(1-sstep(.8,.9,p));A.hp=.1*Math.sin(TAU*p*2.4)*(1-sstep(.8,.9,p));
    const pick=rise(p,.80,.88,.95,1);A.lean=.3*pick;A.mode=p<.15?'two':'free';
    if(p<.15){twoHands(A,lerp3([4,66,34],[30,44,9],ez(p/.15)),lerp3([0,-1,0],[-.6,.3,1],ez(p/.15)))}
    else{A.mc=[30,44,9];A.mh=nrm([-.6,.3,1]);A.ma=[0,1,0];A.hR=lerp3([18,40,40],RF0,pick);if(p>.9){A.mode='floor'}}
    A.heat.maul=lerp(1,.55,sstep(.15,.6,p))}
  else if(anim==='rage'){// SI ARROVENTA: staggers back, the edges of the hood smoke; plants the feet and raises the maul and the anvil arm over the
    // head; CLANG (.30) the maul strikes the anvil over the head; the furnace roars, the hood catches fire and burns away (the bald bronze
    // head under it), the mane of fire rises (.62-.70), the bronze goes red-hot from the chest to the arms to the legs, the roar (.78)
    const back=rise(p,0,.06,.1,.14);A.B=[-4*back,0,0];A.fR=[3-6*back,16,0];
    const up=rise(p,.12,.28,.36,.44),roar=rise(p,.74,.78,.88,.92);
    A.hL=lerp3(LF0,[6,-18,118],up);A.hL=lerp3(A.hL,[8,-60,80],roar);A.anvRoll=1.57*up;
    if(up>.05&&p<.5){A.mode='hand';A.grip=8;A.mh=nrm([-.3,.2,-.9]);A.hR=lerp3(RF0,[8,18,128],up);A.mc=add(A.hR,mul(A.mh,-8));A.ma=strike(A.mh,[0,-1,0])}
    else if(roar>0){A.mode='hand';A.grip=GRIP;A.mh=nrm([-.3,.3,-1]);A.hR=lerp3([16,44,40],[8,62,96],roar);A.mc=sub(A.hR,mul(A.mh,GRIP));A.ma=strike(A.mh,[1,0,0])}
    A.flashW=flash(p,.30,.08);A.fire=.6+.4*sstep(.28,.36,p);A.fireW=sstep(.30,.36,p);A.dflash=flash(p,.02,.1);
    A.hood=1-sstep(.40,.60,p);A.burn=rise(p,.36,.40,.58,.62);A.mane=sstep(.62,.70,p);
    A.k2=sstep(.60,.85,p);A.grp={chest:sstep(.60,.70,p),arms:sstep(.68,.78,p),legs:sstep(.78,.86,p)};A.heat.maul=.55*sstep(.8,.95,p);
    A.hp=-.35*roar+.1*up;A.jaw=roar;A.squint=.6*rise(p,.06,.12,.6,.7);A.flame=sstep(.7,.85,p);
    if(p>.74&&p<.92)A.B[1]=.5*trem(p,.74,.92,7,3);
    fx('smoke',(p-.02)/.3,{at:'hood'});fx('ring',(p-.30)/.16,{at:[6,0,128],spark:1});fx('ash',(p-.40)/.4,{});fx('steam',(p-.78)/.18,{at:'vents'})}
  else if(anim==='taunt'){// PRESA IN GIRO: raises the maul upright beside its face and blows on it like on a smoking gun; taps it twice on the
    // anvil of the forearm (tin-tin); «HO-HO-HO» with the shoulders, three rings of smoke from the chimneys (of fire in the second phase)
    const r=rise(p,0,.15,.88,1);A.mode='hand';A.mh=nrm([0,0,-1]);A.grip=14;
    const tap=Math.max(pls(p,.45,.06),pls(p,.58,.06)),blow=rise(p,.15,.2,.32,.36);
    const H=lerp3(RF0,[18,24,84],r),T=[22,2,62];A.hR=lerp3(H,T,tap);A.mc=add(A.hR,mul(A.mh,-14));A.mc=r<.15?null:A.mc;if(!A.mc){A.mode='floor'}else A.ma=[0,1,0];
    A.hL=lerp3(LF0,[24,-14,56],rise(p,.38,.44,.62,.68));A.anvRoll=1.2*rise(p,.38,.44,.62,.68);A.hy=.35*blow;A.hp=.15*blow;
    const ho=Math.max(pls(p,.68,.07),pls(p,.78,.07),pls(p,.88,.07));A.shZ=2*ho;A.jaw=.5*ho;
    fx('blow',(p-.17)/.2,{});fx('spark',(p-.45)/.08,{at:[24,-2,62],n:2});fx('spark',(p-.58)/.08,{at:[24,-2,62],n:2});
    for(const c of[.68,.78,.88]){fx('ring',(p-c)/.2,{sd:1,fire:P2?1:0});fx('ring',(p-c-.02)/.2,{sd:-1,fire:P2?1:0})}}
  else if(anim==='enter'){// AL LAVORO: it is already there, turned away, bent over a work anvil on a stump with the tongs and a red-hot iron;
    // three blows; it stops with the maul half raised; snaps its head round over its right shoulder (the eyes light up), turns round toward
    // us (the head stays on us), throws away the tongs and the iron; a heavy step dragging the maul, the chimneys light: pff… pff… WHOOSH;
    // it roars with the arms wide; it lays the maul down
    const turn=ez(sstep(.52,.68,p));A.yaw=Math.PI*(1-turn);A.work={k:1-sstep(.95,.97,p)};
    const bent=1-sstep(.42,.55,p);A.lean=.22*bent;A.B=[0,0,-3*bent];
    const blows=[.06,.19,.32];let raise=0,hitk=0;for(const b of blows){raise=Math.max(raise,rise(p,b-.08,b-.03,b-.005,b));hitk=Math.max(hitk,flash(p,b,.05))}
    if(p>=.38)raise=sstep(.38,.46,p)*(1-sstep(.6,.7,p))*.6;
    const look0=sstep(.48,.54,p),hy0=2.1*look0;A.hy=hy0*(1-turn);A.hp=.1*look0*(1-turn);A.eye=sstep(.48,.52,p)+.0;A.squint=.5*look0;
    const rot=v=>rotZ(v,A.yaw);
    if(p<.68){const h=[lerp(18,12,raise),lerp(18,24,raise),lerp(34,74,raise)];A.hR=rot(h);A.mode='hand';A.grip=GRIP;A.mh=nrm(rot([-.2,.2,lerp(-1,.6,raise)]));A.mc=sub(A.hR,mul(A.mh,GRIP));A.ma=nrm(rot([1,0,0]));
      if(raise<.05&&p<.4){A.mh=nrm(rot([-.5,0,1]));A.mc=sub(A.hR,mul(A.mh,GRIP));A.ma=nrm(rot([0,0,1]))}}
    else{A.mode='floor';A.hR=RF0.slice()}
    // the tongs in the left hand (the iron on the anvil), thrown aside at .56
    if(p<.56){A.hL=rot([20,-10,30]);A.tongs={k:0}}else A.tongs={k:sstep(.56,.62,p),cool:sstep(.62,.97,p)};
    const roar=rise(p,.78,.82,.92,.95);if(roar>0){A.hL=lerp3(A.hL,[6,-62,70],roar);A.anvRoll=1.2*roar;A.hR=lerp3(A.hR,[8,62,96],roar);if(roar>.3){A.mode='hand';A.mh=nrm([-.3,.3,-1]);A.mc=sub(A.hR,mul(A.mh,GRIP));A.ma=strike(A.mh,[1,0,0])}}
    A.hp-=.35*roar;A.jaw=roar;A.steam=roar;
    {const st=sstep(.68,.78,p);A.fL=rot([3+8*Math.sin(Math.PI*st),-16,3*Math.sin(Math.PI*st)])}A.fR=rot([3,16,0]);
    A.mute=p<.68?1:0;A.flame=0;fx('puff',(p-.70)/.18,{sd:1});fx('puff',(p-.73)/.18,{sd:-1});fx('flame',(p-.76)/.2,{sd:1,big:1});fx('flame',(p-.765)/.2,{sd:-1,big:1});
    for(const b of blows){fx('workhit',(p-b)/.12,{});fx('puff',(p-b-.03)/.16,{sd:1});fx('puff',(p-b-.03)/.16,{sd:-1})}
    A.flashW=hitk*.6;fx('steam',(p-.8)/.16,{at:'vents'})}
  else if(anim==='die'){// LA FORGIA SI SPEGNE: the last blow makes it recoil; it staggers and plants the maul head down in front on its right
    // (.16), falls on the right knee (.22) and on the left (.30); the furnace coughs (three flickers), the chimneys cough black smoke; the
    // climax (.50): the door bursts open, a great sigh of white steam rises, the fire goes out, the bronze cools to grey; the eyes flicker
    // twice and go out (.52, .55); the head falls on the chest; the last embers roll out of the door; a statue
    const rec=rise(p,0,.04,.08,.12);A.B=[-5*rec,0,0];A.lean=-.18*rec;
    const kR=sstep(.18,.22,p),kL=sstep(.26,.30,p);A.kneel=Math.max(kR,kL);A.B[2]=-15*(.5*kR+.5*kL);A.fR=lerp3([3,16,0],[-14,16,0],kR);A.fL=lerp3([3,-16,0],[-14,-16,0],kL);
    A.lean+=.1*kL;A.mode=p<.12?'floor':'free';if(p>=.12){const k=ez(sstep(.12,.16,p));A.mc=lerp3([26,44,9],[24,30,6],k);A.mh=nrm(lerp3([-.5,0,1],[0,0,1],k));A.ma=nrm(lerp3([0,1,0],[1,0,0],k));A.planted=k>.9?.6:0;
      A.hR=add(A.mc,mul(A.mh,HANDLE+2))}
    A.hL=lerp3(LF0,[16,-26,26],kL);
    const fl=Math.max(pls(p,.33,.04),pls(p,.39,.04),pls(p,.45,.04));A.fire=p<.30?.6:p<.5?.6-.4*fl:Math.max(0,.6*(1-sstep(.5,.56,p)));A.door=p<.5?0:sstep(.5,.53,p);
    A.cool=sstep(.50,.72,p);A.eye=p<.5?1-.6*fl:Math.max(0,(1-sstep(.5,.51,p))+pls(p,.53,.02)*.8+pls(p,.555,.015)*.5)*(1-sstep(.56,.58,p));
    A.hp=.5*sstep(.55,.75,p);A.braid=[.2*sstep(.55,.7,p),0];A.press=(o.press||0)*(1-sstep(.5,.55,p));A.sigh=sstep(.5,.52,p);
    if(P2){A.mane=1-sstep(.5,.6,p);A.k2=1-.0*p}
    fx('spark',p/.12,{at:[24,0,60],n:6});fx('dust',(p-.16)/.2,{at:[24,30,0],n:6,r:12});fx('dust',(p-.22)/.2,{at:[-10,16,0],n:5,r:10});fx('dust',(p-.30)/.2,{at:[-10,-16,0],n:5,r:10});
    fx('smoke',(p-.35)/.2,{at:'chim',black:1});fx('smoke',(p-.42)/.2,{at:'chim',black:1});fx('sigh',(p-.5)/.5,{});fx('embers',(p-.75)/.25,{});fx('smoke',(p-.8)/.2,{at:'chim',thin:1})}
  else{// FERMO: the breath of a bellows; the barrel swells, the shoulders and the chimneys rise, the door goes from orange to yellow; breathing
    // out the two chimneys puff one after the other and the vents let out a thread of steam; the head looks round slowly and comes back to
    // you; the anvil hand stretches; the braids sway late; now and then a spark falls from the maul
    const br=P2?(p<.5?Math.sin(Math.PI*cl(p/.28,0,1)):Math.sin(Math.PI*cl((p-.5)/.28,0,1))):(p<.55?ez(p/.55):1-ez((p-.55)/.45));
    A.bs=1+.04*br;A.shZ=2*br;A.fire=.55+.3*br;A.hy=look(p,.35);A.squint=.6*pls(p,.86,.08);A.eye=.85+.15*br;
    A.braid=[.08*Math.sin(TAU*(p-.15)),.05*Math.sin(TAU*(p-.3))];A.hL=[LF0[0],LF0[1],LF0[2]+1.2*rise(p,.3,.36,.4,.45)];A.lgrip=rise(p,.3,.36,.4,.45);
    if(!P2){fx('puff',(p-.58)/.16,{sd:-1});fx('puff',(p-.66)/.16,{sd:1});fx('steam',(p-.62)/.14,{at:'vents',thin:1});fx('spark',(p-.2)/.1,{at:[30,44,0],n:1})}
    else{A.liftM=4}}
  return A}

// ------------------------------------------------------------------ the arms and the maul (shared by the drawing and by N3.smithHand)
function armOf(A,X,sd,lift){const shZ=A.shZ||0,S=X.T([SHJ[0],sd*SHJ[1],SHJ[2]+shZ]),f0=sd<0?A.hL:A.hR,fc=[f0[0],f0[1],f0[2]+lift],
    toS=nrm(sub(S,fc)),wT=add(fc,mul(toS,FISTR*.95)),pole=X.Rd([-.85,sd*.42,-.3]),[El,W]=ik(S,wT,LUA,LFA,pole),FC=add(W,sub(fc,wT));return{S,El,W,FC,fc}}
// where the maul is now: head centre c, strike axis a, handle direction h (from the head to the pommel), or null
function maulOf(A,armR,lift){const m=A.mode;if(m==='none')return null;
  if(m==='floor'){const fc=armR.FC,z=9+(A.liftM||0)+lift,dz=fc[2]-z,dh=Math.sqrt(Math.max(36,GRIP*GRIP-dz*dz)),md=A.mdir||[1,0],c=[fc[0]+md[0]*dh,fc[1]+md[1]*dh,z],h=nrm(sub(fc,c));
    return{c,h,a:nrm(sub([-md[1],md[0],0],mul(h,dot([-md[1],md[0],0],h))))}}
  if(m==='hand'){const h=A.mh,c=sub(armR.FC,mul(h,A.grip||GRIP));return{c:add(c,[0,0,0]),h,a:A.ma||strike(h,[0,0,1])}}
  if(m==='two'){const h=A.mh;return{c:sub(armR.FC,mul(h,22)),h,a:A.ma||strike(h,[1,0,0])}}
  if(!A.mc)return null;return{c:add(A.mc,[0,0,lift]),h:A.mh,a:A.ma||strike(A.mh,[1,0,0])}}

// ------------------------------------------------------------------ pieces
// a strip round a body (hoops, belt): f(t) gives {top, bot, n} in the body's rest frame; only the side facing us, filled with the tones T
function stripRound(V0,X,f,T,o){o=o||{};const N=o.N||36,S=[];for(let i=0;i<N;i++){const t=i/N*TAU,q=f(t);S.push({q,v:V0.F(X.Rd(q.n))})}
  let s0=-1;for(let i=0;i<N;i++)if(S[i].v<=0&&S[(i+1)%N].v>0){s0=(i+1)%N;break}
  const run0=[];if(s0<0){if(S[0].v<=0)return null;for(let i=0;i<=N;i++)run0.push(S[i%N].q)}else{let i=s0;while(S[i%N].v>0&&run0.length<=N){run0.push(S[i%N].q);i++}}
  if(run0.length<2)return null;const top=run0.map(r=>V0.P(X.T(r.top))),bot=run0.map(r=>V0.P(X.T(r.bot))),pts=top.concat(bot.slice().reverse());
  ctx.lineJoin='round';poly(pts);const b=bbox(pts),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,T.l);g.addColorStop(.45,T.b);g.addColorStop(1,T.d);ctx.fillStyle=o.fill||g;ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke();return{top,bot,run:run0}}
// a rivet (a small brass dome) at a body point with its normal
function rivet(V0,X,c,n,T,r){const f=V0.F(X.Rd(n));if(f<.15)return;const q=V0.P(X.T(c));ctx.save();ctx.globalAlpha*=cl((f-.15)*4,0,1);ctx.fillStyle=T.b;ctx.strokeStyle=INK;ctx.lineWidth=.8;ball(q,r||1.5);ctx.fill();ctx.stroke();
  ctx.fillStyle=T.l;ball([q[0]-.45,q[1]-.5],(r||1.5)*.45);ctx.fill();ctx.restore()}
// a fire disc (the furnace seen through the door): the heart, the tongues that move slowly (G.t, under 6 Hz)
function fireDisc(V0,c,n,r,k,white,open){const pts=disc3(V0,c,n,r,{N:22}),b=bbox(pts),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(b[2]-b[0],b[3]-b[1])/2;
  const g=ctx.createRadialGradient(cx,cy+R*.2,R*.1,cx,cy,R);g.addColorStop(0,white>.5?'#ffffff':FIRE.core);g.addColorStop(.35,cmix(FIRE.hot,'#fff8e0',white));g.addColorStop(.75,cmix(FIRE.flame,'#ffd27a',white*.6));g.addColorStop(1,cmix(FIRE.deep,'#ff8c2e',white*.5));
  ctx.save();ctx.globalAlpha*=cl(.35+.65*k,0,1);ctx.fillStyle=g;ctx.fill();ctx.clip();
  const t=(G&&G.t)||0;ctx.fillStyle=`rgba(255,246,214,${.55*k})`;for(let i=0;i<(open?3:2);i++){const ph=t*(2.1+i*.7)+i*2.1,x0=cx+(i-(open?1:.5))*R*.55+Math.sin(ph)*R*.12,h=R*(.75+.25*Math.sin(ph*1.3));
    ctx.beginPath();ctx.moveTo(x0-R*.22,cy+R*.6);ctx.quadraticCurveTo(x0-R*.25,cy,x0+Math.sin(ph*.8)*R*.1,cy+R*.6-h*1.4);ctx.quadraticCurveTo(x0+R*.25,cy,x0+R*.22,cy+R*.6);ctx.closePath();ctx.fill()}
  ctx.restore();return{q:[cx,cy],R}}
// a flame tongue on the screen from (x, y) up to h tall, w wide, swaying with ph (the mane, the chimneys, the apron)
function tongue(x,y,h,w,ph,lean,cols,al){const s=Math.sin(ph)*w*.35+(lean||0)*h;ctx.save();ctx.globalAlpha*=al==null?1:al;
  for(let i=0;i<3;i++){const k=1-i*.3,col=cols[i];ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w*k,y);ctx.quadraticCurveTo(x-w*k*.9,y-h*k*.55,x+s*k,y-h*k);ctx.quadraticCurveTo(x+w*k*.9,y-h*k*.55,x+w*k,y);ctx.closePath();ctx.fill();if(!i){ctx.strokeStyle='rgba(60,14,4,.55)';ctx.lineWidth=1;ctx.stroke()}}
  ctx.restore()}
const FL1=['#ff5a14','#ffa030','#fff0b0'];
// a chain between two 3D points: links every 6 (a flat ellipse, then a bar seen edge on), sagging (sag: how far below the straight line)
function chainLinks(V0,a,b,sag,T,hot,maxN){const L0=len(sub(b,a)),N=Math.max(2,Math.min(maxN||14,Math.round(L0/6))),pts=[];
  for(let i=0;i<=N;i++){const k=i/N,q=lerp3(a,b,k);q[2]-=sag*4*k*(1-k);pts.push(q)}
  const T2=hot>0?heatT(T,hot):T;ctx.lineCap='round';
  for(let i=0;i<N;i++){const q0=V0.P(pts[i]),q1=V0.P(pts[i+1]),mx=(q0[0]+q1[0])/2,my=(q0[1]+q1[1])/2,an=Math.atan2(q1[1]-q0[1],q1[0]-q0[0]),l=Math.hypot(q1[0]-q0[0],q1[1]-q0[1]);
    if(i%2===0){ctx.save();ctx.translate(mx,my);ctx.rotate(an);ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.ellipse(0,0,l*.62+1.2,2.1,0,0,TAU);ctx.stroke();ctx.strokeStyle=T2.b;ctx.lineWidth=1.8;ctx.stroke();
      ctx.strokeStyle=T2.l;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,-.5,l*.5,1.2,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.restore()}
    else{ctx.strokeStyle=INK;ctx.lineWidth=3.4;seg([mx-Math.cos(an)*l*.6,my-Math.sin(an)*l*.6],[mx+Math.cos(an)*l*.6,my+Math.sin(an)*l*.6]);ctx.stroke();ctx.strokeStyle=T2.b;ctx.lineWidth=1.6;ctx.stroke()}}
  if(hot>.5&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,130,50,${.3*(hot-.5)*2})`;ctx.lineWidth=6;ctx.beginPath();for(const q of pts){const s=V0.P(q);ctx.lineTo(s[0],s[1])}ctx.stroke();ctx.restore()}
  return pts}
// the maul: the head a block of cast iron (bevelled), its two striking faces polished, the brass band in the middle, the rune on its
// flanks; the wooden handle with two leather bands, the brass pommel with the ring of the chain
function maulDraw(V0,c,a,h,K,heat,o){o=o||{};a=nrm(a);h=nrm(sub(h,mul(a,dot(h,a))));const b=nrm(cross(a,h)),E=[a,h,b],{P,F}=V0,ord=[];
  const T=heat>0?heatT(K.iron,heat):K.iron,hi=heat>0?rampC(K.hi,Math.min(1,heat*1.1)):K.hi;
  const head=()=>{const fc=facets(V0,boxF(c,E,[15,9,9],2),T,{lw:2.4});facets(V0,boxF(c,E,[3.2,9.6,9.6],0),K.brass,{lw:2});
    // the striking faces: polished, with light scratches (and white hot to strike)
    for(const sd of[-1,1]){const n=mul(a,sd);if(F(n)<.05)continue;const f=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([u,v])=>P(add(add(c,mul(a,sd*15.2)),add(mul(h,u*7),mul(b,v*7)))));
      ctx.save();ctx.globalAlpha*=cl((F(n)-.05)*4,0,1);poly(f);ctx.fillStyle=hi;ctx.fill();ctx.strokeStyle='rgba(20,22,28,.5)';ctx.lineWidth=.8;ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.7;seg(lerp(f[0],f[1],.3),lerp(f[2],f[3],.6));ctx.stroke();ctx.restore()}
    // the rune of the smith on its flanks: a straight stroke with two arrow points ‹ ›
    for(const sd of[-1,1]){const n=mul(b,sd);if(F(n)<.1)continue;const at=(u,v)=>P(add(add(c,mul(b,sd*9.3)),add(mul(a,u),mul(h,v))));ctx.save();ctx.globalAlpha*=cl((F(n)-.1)*4,0,1);
      ctx.globalAlpha*=.75;ctx.strokeStyle=heat>.3?rampC(K.rune,heat):K.rune;ctx.lineWidth=1.1;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();const l0=at(-8,0),l1=at(8,0);ctx.moveTo(l0[0],l0[1]);ctx.lineTo(l1[0],l1[1]);
      for(const s of[-1,1]){const t0=at(s*8-s*2.4,-2.4),t1=at(s*8,0),t2=at(s*8-s*2.4,2.4);ctx.moveTo(t0[0],t0[1]);ctx.lineTo(t1[0],t1[1]);ctx.lineTo(t2[0],t2[1])}ctx.stroke();ctx.restore()}
    if(heat>.5&&!LOWFX){const q=P(c);shine('255,130,50',q[0],q[1],26,.45*(heat-.4))}
    return fc};
  const handle=()=>{const p0=add(c,mul(h,8.6)),p1=add(c,mul(h,HANDLE));chain(V0,[p0,p1],[3.8,3.8],K.wood.b,{lw:2.2,fill:limbGrad(P(p0),P(p1),3.8,K.wood),rim:.2});
    for(const d of[14,22])band(V0,add(c,mul(h,d-1.4)),add(c,mul(h,d+1.4)),4.4,K.lthr,{lw:1.6});
    const pq=add(c,mul(h,HANDLE+2.6)),q=P(pq);ctx.fillStyle=grad3([q[0]-4.6,q[1]-4.6,q[0]+4.6,q[1]+4.6],K.brass);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ball(q,4.6);ctx.fill();ctx.stroke();
    const rq=P(add(pq,mul(h,4.2)));ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(rq[0],rq[1],2.6,1.8,0,0,TAU);ctx.stroke();ctx.strokeStyle=K.brass.b;ctx.lineWidth=1.4;ctx.stroke();return pq};
  // the head and the handle in their depth order (o.part: only one of them)
  if(o.part==='head')head();else if(o.part==='handle')handle();else{const dh=V0.D(c),dk=V0.D(add(c,mul(h,20)));if(dh<dk){head();handle()}else{handle();head()}}
  return add(c,mul(h,HANDLE+6.8))}
// a flap of the apron: from its top edge (centre t0, across s, half width w at the top, wb at the bottom) down along d for L, bent along n;
// the hem in three scallops, two brass studs at the top corners; o.flames: three little flames on the hem (second phase)
function flapDraw(V0,t0,s,d,n,w,wb,L,bend,K,o){o=o||{};const{P}=V0,at=(u,v)=>add(add(add(t0,mul(s,u*lerp(w,wb,v))),mul(d,v*L)),mul(n,bend*v*v*L*.5));
  const pts=[];for(let i=0;i<=6;i++)pts.push(P(at(-1,i/6)));
  for(let i=1;i<=12;i++){const u=-1+i/6,sc=Math.abs(Math.sin(i/12*Math.PI*3));pts.push(P(add(at(u,1),mul(d,-1.6*sc))))}
  for(let i=6;i>=0;i--)pts.push(P(at(1,i/6)));
  ctx.lineJoin='round';poly(pts);ctx.fillStyle=C.softBox(bbox(pts),K.apron.b,.16,.34);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
  ctx.save();ctx.clip();ctx.strokeStyle=cmix(K.apron.d,'#000000',.2);ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=12;i++){const u=-1+i/6,sc=Math.abs(Math.sin(i/12*Math.PI*3)),q=P(add(at(u,1),mul(d,-1.6*sc-1.2)));ctx.lineTo(q[0],q[1])}ctx.stroke();
  // two soft folds
  ctx.strokeStyle='rgba(30,10,4,.35)';ctx.lineWidth=1.2;for(const u of[-.4,.35]){const a0=P(at(u,.2)),a1=P(at(u*1.1,.85));seg(a0,a1);ctx.stroke()}ctx.restore();
  if(o.studs)for(const u of[-.8,.8]){const q=P(at(u,.08));ctx.fillStyle=K.brass.b;ctx.strokeStyle=INK;ctx.lineWidth=.8;ball(q,1.6);ctx.fill();ctx.stroke()}
  if(o.flames&&!o.noFx){const t=(G&&G.t)||0;for(let i=0;i<3;i++){const u=-.6+i*.6,q=P(at(u,1));tongue(q[0],q[1]+1,5+1.5*Math.sin(t*5.3+i),2.4,t*6.2+i*2,0,FL1,.9)}}}

// ------------------------------------------------------------------ the model
function smith2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';const V0=V(face),{P,D,F}=V0,A=sPose(anim,p,o),fxk=fxOn(o);
  const lift=o.z!=null?o.z/sc:0;A.B[2]+=lift;const X=frame(A,0),fw=X.Rd([1,0,0]),fF=F(fw);
  const KB=pal(A.k2,A.cool),gk=n=>A.grp&&A.grp[n]!=null?A.grp[n]:A.k2,KC=pal(gk('chest'),A.cool),KA=pal(gk('arms'),A.cool),KL=pal(gk('legs'),A.cool);
  const hot=A.k2>.5;floor(V0,x,y,sc,[A.B[0]+4,A.B[1],0],58,18,.45,lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(X.T([0,0,58])),J={};
  // ---------------- the light of the furnace on the floor in front of the feet (stronger with the door open)
  if(!LOWFX&&A.fire>.05&&A.cool<1){const q=P([24,0,0]),al=(.14+.2*A.door)*cl(A.fire,0,1.2)*(1-A.cool);const g=ctx.createRadialGradient(q[0],q[1],2,q[0],q[1],60);g.addColorStop(0,`rgba(${FIRE.glow},${al})`);g.addColorStop(1,`rgba(${FIRE.glow},0)`);
    ctx.save();ctx.translate(0,q[1]);ctx.scale(1,.55);ctx.translate(0,-q[1]);ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],60,0,TAU);ctx.fill();ctx.restore()}
  // ---------------- the legs: thigh and shin of bronze, the kneecap, the boot of cast iron with the brass toe; always behind the barrel
  for(const sd of[-1,1]){const f=sd<0?A.fL:A.fR,ank=[f[0]-2,f[1],f[2]+9+lift],hip=X.T([HIP[0],sd*HIP[1],HIP[2]]),[kn,an]=ik(hip,ank,LTH,LSH,X.Rd([1,sd*.3,0]));
    const fd=nrm([Math.cos(A.yaw),Math.sin(A.yaw),0]),E=[fd,nrm(cross([0,0,1],fd)),[0,0,1]],bc=[f[0],f[1],f[2]+4.5+lift],T=KL.bronze,heat=hot&&A.k2>.5;
    L.add(dT-100+D(hip)*.01,()=>{const kneel=A.kneel||0;
      const boot=()=>{facets(V0,boxF(bc,[E[0],mul(E[1],-1),E[2]],BOOT,1.4),KL.iron,{lw:2.4});facets(V0,boxF(add(bc,mul(fd,13.2)),[E[0],mul(E[1],-1),E[2]],[2.4,9.4,4.8],0),KL.brass,{lw:1.8});
        for(const k of[-.5,0,.5]){const q=P(add(add(bc,mul(fd,13)),add(mul(E[1],k*7),[0,0,4.9])));ctx.fillStyle=KL.brass.l;ctx.strokeStyle=INK;ctx.lineWidth=.7;ball(q,1.2);ctx.fill();ctx.stroke()}
        band(V0,[ank[0],ank[1],ank[2]],[ank[0],ank[1],ank[2]+3],11,KL.iron,{lw:2})};
      const thigh=()=>chain(V0,[hip,kn],[11.5,10],T.b,{lw:2.8,fill:limbGrad(P(hip),P(kn),11.5,T),rim:.22});
      const shin=()=>chain(V0,[kn,add(ank,[0,0,2])],[9.5,10.5],T.b,{lw:2.8,fill:limbGrad(P(kn),P(ank),10.5,T),rim:.22});
      const cap=()=>{const q=P(add(kn,X.Rd([2,0,0])));ctx.fillStyle=grad3([q[0]-8,q[1]-8,q[0]+8,q[1]+8],T);ctx.strokeStyle=INK;ctx.lineWidth=2.4;ball(q,8);ctx.fill();ctx.stroke();rim(q,8,q,8,.25)};
      if(F(fd)>-.1){boot();shin();thigh();cap()}else{cap();thigh();shin();boot()}
      if(heat&&A.cool<.5)vein(V0,[add(hip,X.Rd([6,0,-2])),lerp3(hip,kn,.5),add(kn,X.Rd([6,0,2]))],gk('legs'))})}
  // ---------------- the barrel of the chest: bronze, the two hoops of cast iron with their rivets, the vents, the door, the grille at the back
  const bs=A.bs||1;
  L.add(dT,()=>{const T=KC.bronze,pts=barPts(bs).map(q=>P(X.T(q))),hp=svol3(V0,hullE(pts,.08),T,{lw:3,rim:.32,scr:1});J.hull=hp;
    ctx.save();ctx.clip(hp.path);
    {const b=bbox(hp),g=ctx.createLinearGradient(0,b[1]+(b[3]-b[1])*.5,0,b[3]);g.addColorStop(0,'rgba(20,8,2,0)');g.addColorStop(1,'rgba(20,8,2,.35)');ctx.fillStyle=g;ctx.fill(hp.path)}
    // the soot above the vents and round the pauldrons, the light marks of the hammer
    for(const[t,z,r] of[[.95,71,9],[-.95,71,9],[1.5,82,11],[-1.5,82,11]]){const s=bar(t,z,0,bs),f=F(X.Rd(s.n));if(f<0)continue;const q=P(X.T(s.p)),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],r);g.addColorStop(0,`rgba(30,18,10,${.35*f})`);g.addColorStop(1,'rgba(30,18,10,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fill()}
    ctx.strokeStyle='rgba(255,226,174,.35)';ctx.lineWidth=1;ctx.lineCap='round';
    for(const[t,z] of[[-.55,48],[.5,70],[-.35,71],[.9,48],[2.4,55],[-2.3,62],[3.0,50],[-1.2,47]]){const s=bar(t,z,.2,bs);if(F(X.Rd(s.n))<.15)continue;const a0=P(X.T(bar(t-.07,z+1.2,.2,bs).p)),a1=P(X.T(bar(t+.07,z+1.6,.2,bs).p)),m=P(X.T(s.p));ctx.beginPath();ctx.moveTo(a0[0],a0[1]);ctx.quadraticCurveTo(m[0],m[1]-1.2,a1[0],a1[1]);ctx.stroke()}
    // the veins of heat of the second phase: from the frame of the door up to the upper hoop
    if(hot&&A.cool<.5)for(const sd of[-1,1])vein(V0,[X.T(bar(sd*.42,60,.3,bs).p),X.T(bar(sd*.55,67,.3,bs).p),X.T(bar(sd*.48,74,.3,bs).p)],gk('chest'));
    // the vents (the ribs): three on each side of the door; the pressure lights them (from the bottom row up), white before the blast
    for(let j=0;j<3;j++)for(const sd of[-1,1]){const z=VROWS[j],S=[];for(let i=0;i<=6;i++){const t=sd*lerp(.78,1.42,i/6),s=bar(t,z,.1,bs);S.push({q:P(X.T(s.p)),v:F(X.Rd(s.n))})}
      const vis=S.filter(s=>s.v>.04).map(s=>s.q);if(vis.length<2)continue;const lam=[];for(let i=0;i<=6;i++){const t=sd*lerp(.78,1.42,i/6),s=bar(t,z+1.9,.3,bs);if(F(X.Rd(s.n))>.04)lam.push(P(X.T(s.p)))}
      const on=cl(A.press-j,0,1),w=A.ventW[j]||0,dead=A.cool;strokeRuns([vis],INK,3.4);strokeRuns([vis],K1.slot,2.2);
      if(on>0||w>0){const col=w>0?cmix(KB.vent,'#fff6e8',w):KB.vent;ctx.save();ctx.globalAlpha*=Math.max(on,w)*(1-dead);strokeRuns([vis],col,2.1);if(!LOWFX){ctx.globalCompositeOperation='lighter';strokeRuns([vis],`rgba(255,${w>0?220:140},${w>0?160:60},.5)`,5)}ctx.restore()}
      if(lam.length>1)strokeRuns([lam],KC.iron.l,1.2)}
    // the grille at the back between the shoulder blades
    {const s=bar(Math.PI,68,0,bs),f=F(X.Rd(s.n));if(f>.05){ctx.save();ctx.globalAlpha*=cl((f-.05)*4,0,1);const cor=[];for(const[dt,z] of[[-.32,61],[.32,61],[.34,68],[.32,75],[-.32,75],[-.34,68]]){cor.push(P(X.T(bar(Math.PI+dt,z,.4,bs).p)))}
      smooth(cor);ctx.fillStyle=KC.iron.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
      for(let j=0;j<3;j++){const z=64.5+j*3.5,a0=P(X.T(bar(Math.PI-.22,z,.6,bs).p)),a1=P(X.T(bar(Math.PI+.22,z,.6,bs).p)),on=cl(A.press-j,0,1),w=Math.max(...A.ventW);
        ctx.strokeStyle=K1.slot;ctx.lineWidth=1.8;seg(a0,a1);ctx.stroke();if(on>0||w>0){ctx.strokeStyle=cmix(KB.vent,'#fff6e8',w);ctx.globalAlpha*=Math.max(on,w)*(1-A.cool);ctx.lineWidth=1.3;ctx.stroke();ctx.globalAlpha/=Math.max(on,w)*(1-A.cool)||1}}ctx.restore()}}
    ctx.restore();
    // the two hoops of cast iron with their brass rivets (they stand a little out of the barrel)
    for(const[z0,z1] of HOOPS){const T2=KC.iron;stripRound(V0,X,t=>{const a=bar(t,z1,1.6,bs),b2=bar(t,z0,1.6,bs),m=bar(t,(z0+z1)/2,0,bs);return{top:a.p,bot:b2.p,n:m.n}},T2,{lw:2});
      for(let i=0;i<6;i++){const t=i/6*TAU+Math.PI/6,s=bar(t,(z0+z1)/2,2,bs);if(Math.abs(Math.sin(t))<.25&&Math.cos(t)>0&&z0>50)continue;rivet(V0,X,s.p,s.n,KC.brass,1.5)}}
    // the belt of dark leather, the buckle shaped like an anvil, the knot at the back
    stripRound(V0,X,t=>({top:[Math.cos(t)*23.6,Math.sin(t)*28.6,41],bot:[Math.cos(t)*23.6,Math.sin(t)*28.6,35],n:nrm([Math.cos(t)/23.6,Math.sin(t)/28.6,0])}),KC.lthr,{lw:2.2});
    if(fF>.05){const c=X.T([24.4,0,38]),q=P(c),E2=[fw,X.Rd([0,1,0]),X.Rd([0,0,1])];ctx.save();ctx.globalAlpha*=cl((fF-.05)*4,0,1);
      const ap=[[0,-3],[-5.5,-3],[-4,-1],[-2,-1],[-2.5,2.5],[2.5,2.5],[2,-1],[5.5,-1.5],[6,-3]].map(([u,v])=>P(add(c,add(mul(E2[1],u),mul(E2[2],-v)))));poly(ap);ctx.fillStyle=grad3(bbox(ap),KC.brass);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}
    if(fF<-.05){const c=X.T([-24.2,0,37]),q=P(c);ctx.fillStyle=KC.lthr.b;ctx.strokeStyle=INK;ctx.lineWidth=1.6;ball(q,3.4);ctx.fill();ctx.stroke();for(const s of[-1,1]){const e=P(X.T([-24.4,s*3,30]));seg(q,e);ctx.lineWidth=3.6;ctx.stroke();ctx.strokeStyle=KC.lthr.b;ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle=INK}}
    // the door of the furnace: the brass frame, the fire behind the grate of four bars, the hinge (its left) and the latch (its right); open it
    // turns on the hinge up to 110° outward and the fire is all in sight
    const dn=nrm([1,0,.05]),Dc=X.T(bar(0,58,.4,bs).p),Dn=X.Rd(dn),fD=F(Dn);
    if(fD>-.15){ctx.save();ctx.globalAlpha*=cl((fD+.15)*4,0,1);const Uy=X.Rd([0,1,0]),Uz=X.Rd(nrm([-.05,0,1]));
      const fr=disc3(V0,Dc,Dn,13.2,{N:24});ctx.fillStyle=grad3(bbox(fr),KC.brass);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
      const fire=A.cool>=1?0:cl(A.fire*(1-A.cool),0,1.2),inner=add(Dc,mul(Dn,-.3));
      if(fire>.02){const fq=fireDisc(V0,inner,Dn,11,fire,A.fireW,A.door>.2);J.doorQ=fq.q}else{disc3(V0,inner,Dn,11,{N:22});ctx.fillStyle='#1a1410';ctx.fill()}
      disc3(V0,inner,Dn,11,{N:22});ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
      // the plate of the door with its bars (shut, or swung open on the hinge)
      const th=1.92*cl(A.door,0,1),hinge=add(Dc,mul(Uy,-12)),swing=v=>rotAx(v,Uz,-th);
      const plate=()=>{const pc=add(hinge,swing(mul(Uy,12))),pn=swing(Dn),fp=F(pn);
        if(A.door>.02){const pts=disc3(V0,add(pc,mul(pn,.6)),pn,11.5,{N:22});ctx.fillStyle=fp>0?grad3(bbox(pts),KC.iron):KC.iron.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke()}
        ctx.save();if(A.door<=.02){disc3(V0,inner,Dn,11,{N:22});ctx.clip()}
        for(const yy of[-6,-2,2,6]){const hh=Math.sqrt(121-yy*yy),a0=P(add(add(pc,swing(mul(Uy,yy))),mul(Uz,-hh))),a1=P(add(add(pc,swing(mul(Uy,yy))),mul(Uz,hh)));
          ctx.strokeStyle=INK;ctx.lineWidth=4.2;seg(a0,a1);ctx.stroke();ctx.strokeStyle=KC.iron.b;ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle=KC.iron.l;ctx.lineWidth=.7;seg([a0[0]-.5,a0[1]],[a1[0]-.5,a1[1]]);ctx.stroke()}ctx.restore();
        // the latch on the free side
        const lq=P(add(add(pc,swing(mul(Uy,12.6))),mul(swing(Dn),.8)));ctx.fillStyle=KC.brass.b;ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.fillRect(lq[0]-1.6,lq[1]-2.6,3.2,5.2);ctx.strokeRect(lq[0]-1.6,lq[1]-2.6,3.2,5.2)};
      plate();
      for(const zz of[-5,5]){const q=P(add(add(hinge,mul(Uz,zz)),mul(Dn,1)));ctx.fillStyle=KC.brass.b;ctx.strokeStyle=INK;ctx.lineWidth=1;ball(q,2.2);ctx.fill();ctx.stroke()}
      if(!LOWFX&&fire>.05&&J.doorQ)shine(FIRE.glow,J.doorQ[0],J.doorQ[1],22+14*A.door,(.25+.35*A.door+.4*A.dflash)*Math.min(1,fire)*cl((fD+.15)*3,0,1));
      if(A.dflash>0){const q=P(Dc);ctx.save();ctx.globalAlpha*=A.dflash;ctx.fillStyle='#fff6d6';ball(q,10);ctx.fill();ctx.restore()}
      ctx.restore()}});
  // ---------------- the apron: three flaps of red leather from the belt; in front of the legs seen from the front, behind them from the back
  {const fl=hot&&A.cool<.5;const fr=()=>flapDraw(V0,X.T([24,0,37]),X.Rd([0,1,0]),X.Rd(nrm([.22+A.apF,0,-1])),fw,19,21,24,.25,KL,{studs:1,flames:fl,noFx:!fxk});
    L.add(fF>.1?dT+2:dT-102,fr);
    for(const sd of[-1,1]){const out=X.Rd(nrm([.25,sd,0])),dd=X.Rd(nrm([.1,sd*(.27+A.apS*1.2),-1+A.apS*.4]));L.add(F(X.Rd([0,sd,0]))>0?dT+1:dT-101,()=>flapDraw(V0,X.T([14,sd*24,37]),X.Rd(nrm([1,-sd*.25,0])),dd,out,9,10,20,.15,KL,{flames:fl,noFx:!fxk}))}}
  // ---------------- the arms: the shoulder in its pauldron-stove with the chimney, the upper arm, the brass elbow ring, the forearm (the anvil on
  // the left; on the right the bracer with the chain wound round it), the fist; the maul goes with the right fist
  const arms={},sdz=sd=>F(X.Rd([0,sd,0]));
  for(const sd of[-1,1]){const g=armOf(A,X,sd,lift);arms[sd]=g;const{S,El,W,FC}=g,T=KA.bronze;
    const dS=D(X.T([PAUL[0],sd*PAUL[1],PAUL[2]])),dF=D([FC[0],FC[1],Math.max(70,FC[2]-lift)]);
    // the pauldron-stove and its chimney
    L.add(dS+3,()=>{const Cc=X.T([PAUL[0],sd*PAUL[1],PAUL[2]+(A.shZ||0)]),pts=[];for(const q of ellPts([PAUL[0],sd*PAUL[1],PAUL[2]+(A.shZ||0)],PAULR,null,5,12,-.12))pts.push(P(X.T(q)));
      svol3(V0,hullE(pts,.08),KA.iron,{lw:2.8,rim:.3,scr:1});
      const ring=[];for(let i=0;i<=24;i++){const t=i/24*TAU,m=[Math.cos(t)*Math.sqrt(1-.0144),Math.sin(t)*Math.sqrt(1-.0144),-.12],c3=ellAt([PAUL[0],sd*PAUL[1],PAUL[2]+(A.shZ||0)],add(PAULR,[.6,.6,.6]),null,m),n=ellN(PAULR,null,m);
        ring.push({q:P(X.T(c3)),v:F(X.Rd(n))})}
      const runs=[];let cur=[];for(const r of ring){if(r.v>0)cur.push(r.q);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);strokeRuns(runs,INK,4.6);strokeRuns(runs,KA.brass.b,2.6);strokeRuns(runs.map(r=>r.map(q=>[q[0]-.4,q[1]-.6])),KA.brass.l,.8);
      for(let i=0;i<4;i++){const t=sd*(.2+i*.75)+Math.PI*.5*(sd<0?1:0),m=[Math.cos(t)*.75,Math.sin(t)*.75,.62],c3=ellAt([PAUL[0],sd*PAUL[1],PAUL[2]+(A.shZ||0)],add(PAULR,[.6,.6,.6]),null,nrm(m));rivet(V0,X,c3,ellN(PAULR,null,nrm(m)),KA.brass,1.5)}
      chimney(V0,X,A,sd,KA,fxk)});
    // the upper arm and the elbow ring
    const dU=Math.min(dS+2.5,dS+2.5),fUp=F(nrm(sub(El,W)));
    const upper=()=>{chain(V0,[S,El],[10.5,9.5],T.b,{lw:2.8,fill:limbGrad(P(S),P(El),10.5,T),rim:.22});if(hot&&A.cool<.5)vein(V0,[lerp3(S,El,.2),lerp3(S,El,.55),lerp3(S,El,.9)],gk('arms'))};
    const ax=nrm(sub(W,El)),elbow=()=>band(V0,add(El,mul(ax,-1.2)),add(El,mul(ax,2.4)),11.4,KA.brass,{lw:2});
    const fore=sd<0?()=>anvilArm(V0,X,El,W,A,KA):()=>chainArm(V0,El,W,A,KA);
    const fist=()=>{const q=P(FC);ctx.fillStyle=C.softBall(q,FISTR,T.b,.18,.32);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ball(q,FISTR);ctx.fill();ctx.stroke();rim(q,FISTR,q,FISTR,.24);
      const ins=X.Rd([0,-sd,0]),th=P(add(FC,add(mul(ins,8),[0,0,4])));if(F(ins)>-.4){ctx.fillStyle=C.softBall(th,4,T.b,.2,.3);ball(th,4);ctx.fill();ctx.lineWidth=1.8;ctx.stroke()}
      ctx.strokeStyle='rgba(40,16,4,.5)';ctx.lineWidth=1.1;const kq=P(add(FC,fw.map(v=>v*6)));for(const k of[-3,3]){const a0=[kq[0]+k-1,kq[1]-2],a1=[kq[0]+k+1,kq[1]+2.5];seg(a0,a1);ctx.stroke()}};
    // the maul in the right hand (or free on the floor): ordered with the fist
    let M=null;if(sd>0){M=maulOf(A,g,lift);J.maul=M}
    const drawM=part=>{if(!M)return;const tip=maulDraw(V0,M.c,M.a,M.h,KA,A.heat.maul,{part});J.pommel=tip;if(part==='head')return;
      // the free end of the chain: from the wrist to the ring of the pommel, sagging
      if(A.mode!=='none'){const wr=add(W,mul(ax,-2));if(A.mode==='chain')chainLinks(V0,wr,tip,1,KA.chain,A.heat.chain,6);else if(A.mode!=='free'&&A.mode!=='two')chainLinks(V0,wr,tip,6,KA.chain,A.heat.chain,6)}};
    // the handle always under the fist; the head of the maul under it too when it is farther, over it when it is nearer
    // (the elbow ring goes under the forearm when the forearm comes toward us)
    const fe=F(ax)>0?()=>{elbow();fore()}:()=>{fore();elbow()};
    const hand=()=>{if(M&&A.mode!=='free'){if(D(M.c)<=D(FC)){drawM();fe();fist()}else{drawM('handle');fe();fist();drawM('head')}}else{fe();fist()}};
    L.add(dS+2,upper);L.add(dF,hand);
    if(M&&A.mode==='free')L.add(D(M.c),()=>drawM());
    if(sd<0&&A.tongs)L.add(dF+.5,()=>tongsDraw(V0,A,FC,KA))}
  // ---------------- the head: its own camera on the neck; the leather hood (or the bald head of bronze in the second phase), the dark of the
  // face with the two eyes of ember, the iron band in a V on the forehead; the mane of fire behind; the beard of three iron braids
  const hy=(A.hy||0)-A.yaw*.0,hpR=(A.hp||0)-A.lean*.6,HR=v=>X.Rd(rotZ(rotX0(rotY(v,hpR),A.hr||0),hy)),Hc=X.T(add(HC,[0,0,(A.shZ||0)*.5])),HX={T:q=>add(Hc,HR(q)),Rd:HR};
  const dH=D(Hc)+4;
  L.add(dH,()=>headDraw(V0,HX,Hc,HR,A,KB,fxk));
  // the braids of the beard: from the lower rim of the face down over the collar (in front of the chest, under the head)
  L.add(D(HX.T([14,0,-14]))+(fF>0?6:-60),()=>braids(V0,HX,X,A,KB,fw));
  // the collar of the hood on the shoulders and on the chest, between the pauldrons
  if(A.hood>.01)L.add(dT+(fF>-.2?3:1),()=>ga(Math.min(1,A.hood*1.2),()=>{const c=X.T([6,0,83+(A.shZ||0)*.5]),pts=ellSil(V0,c,[20,24,8],null,null,16);svol3(V0,pts,KB.hood,{lw:2.6,scr:1,rim:.25})}));
  // ---------------- the work anvil of the entrance on its stump (behind it, once it has turned round)
  if(A.work&&A.work.k>.01)L.add(D([-36,0,10]),()=>ga(A.work.k,()=>anvilDraw(V0,[-36,0,0],0,{work:1,K:KB})));
  // ---------------- the effects
  if(fxk)for(const e of A.fx)fxDraw(V0,X,L,e,A,J,HX,arms,KB,lift);
  if(A.stars>0&&fxk){const q=P(HX.T([0,0,24]));L.add(999,()=>stars(q,16,A.stars))}
  if(A.jets>0)L.add(998,()=>jetsAt(V0,X,A,bs,!!o.p2||hot));
  if(A.sigh>0&&fxk)L.add(999,()=>sighDraw(V0,X,A,p));
  if(A.flashW>0)L.add(997,()=>{const q=J.flashQ||P(X.T([30,0,72]));ctx.save();ctx.globalAlpha*=A.flashW;const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],26);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ball(q,26);ctx.fill();ctx.restore()});
  run(L);ctx.restore()}
const rotX0=(v,a)=>a?[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)]:v;
// a vein of heat (second phase): metal that glows, never a cut
function vein(V0,pts3,k){if(k<=.02)return;const q=pts3.map(p=>V0.P(p));ctx.save();ctx.globalAlpha*=k;ctx.lineCap='round';ctx.lineJoin='round';if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,120,40,.45)';ctx.lineWidth=5;ctx.beginPath();for(const s of q)ctx.lineTo(s[0],s[1]);ctx.stroke();ctx.globalCompositeOperation='source-over'}
  ctx.strokeStyle='#ffd25c';ctx.lineWidth=1.6;ctx.beginPath();for(const s of q)ctx.lineTo(s[0],s[1]);ctx.stroke();ctx.restore()}
// a chimney on the pauldron: a tube of cast iron going up, out and back, the brass rim, the dark mouth with the ember inside
function chimney(V0,X,A,sd,K,fxk){const{P,F}=V0,b=X.T([CHB[0],sd*CHB[1],CHB[2]+(A.shZ||0)]),d=X.Rd(nrm([CHD[0],sd*CHD[1],CHD[2]])),tp=add(b,mul(d,CHL)),[u,v]=frm(d,[1,0,0]);
  const r0=C3K.ringS(V0,b,u,v,5.2,10),r1=C3K.ringS(V0,tp,u,v,6,10),H=chull(r0.concat(r1));const T=A.heat.chim>0?heatT(K.iron,A.heat.chim):K.iron;
  ctx.lineJoin='round';poly(H);ctx.fillStyle=limbGrad(P(b),P(tp),6,T);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
  band(V0,add(tp,mul(d,-2.6)),add(tp,mul(d,.2)),6.8,K.brass,{lw:2});
  if(F(d)>.05){const m=C3K.ringS(V0,add(tp,mul(d,.3)),u,v,5.4,14);poly(m);const b2=bbox(m),cx=(b2[0]+b2[2])/2,cy=(b2[1]+b2[3])/2,g=ctx.createRadialGradient(cx,cy,.5,cx,cy,6);
    const live=(1-A.cool)*(A.mute>.5?.4:1);g.addColorStop(0,cmix('#12161c',FIRE.flame,.9*live));g.addColorStop(.6,cmix('#12161c',FIRE.deep,.5*live));g.addColorStop(1,'#12161c');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
  // the fire of the second phase instead of the smoke: always, bent back when it walks
  if(A.flame>0&&A.cool<.6&&!(A.mute>.5)){const q=P(add(tp,mul(d,1))),t=(G&&G.t)||0;tongue(q[0],q[1],(9+3*Math.sin(t*5.7+sd))*A.flame,3.6,t*6.3+sd,-.15,['#ff7a2e','#ffb050','#fff6e0'],LOWFX?1:.92)}}
// the left forearm: an anvil of cast iron along it (the body, the table on the outside with its polished face, the horn past the elbow, the
// square hole); anvRoll turns its table up (held across the chest in the Incudini)
function anvilArm(V0,X,El,W,A,K){const{P,F}=V0,ax=nrm(sub(W,El)),o0=X.Rd([0,-1,0]),out0=nrm(sub(o0,mul(ax,dot(o0,ax)))),out=rotAx(out0,ax,-(A.anvRoll||0)),third=nrm(cross(ax,out)),c=lerp3(El,W,.52);
  const T=A.heat.anvil>0?heatT(K.iron,A.heat.anvil):K.iron,E=[ax,out,third];
  facets(V0,boxF(c,E,[11.5,6,7.5],1.5),T,{lw:2.4});
  const tc=add(c,mul(out,7.5)),FT=boxF(tc,E,[12.5,2.2,8.5],0);facets(V0,FT,T,{lw:2.2});
  // the polished face of the table (white hot to strike)
  if(F(out)>.05){const f=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([u,v])=>P(add(add(tc,mul(out,2.3)),add(mul(ax,u*11.6),mul(third,v*7.6)))));ctx.save();ctx.globalAlpha*=cl((F(out)-.05)*4,0,1);poly(f);
    ctx.fillStyle=A.heat.anvil>0?rampC(K.hi,A.heat.anvil):K.hi;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=.7;seg(lerp(f[0],f[3],.3),lerp(f[1],f[2],.45));ctx.stroke();
    const hq=P(add(add(tc,mul(out,2.4)),mul(ax,8)));ctx.fillStyle='#12161c';ctx.fillRect(hq[0]-1.3,hq[1]-1.3,2.6,2.6);ctx.restore()}
  // the horn: a six-sided cone from the table at the elbow end, back past the elbow and a little outward
  const hb=add(tc,mul(ax,-10)),hd=nrm(add(mul(ax,-1),mul(out,.28))),[u,v]=frm(hd,[0,0,1]),tipP=add(hb,mul(hd,13)),FS=[],R0=[];for(let i=0;i<6;i++){const a=i/6*TAU;R0.push(add(hb,add(mul(u,Math.cos(a)*6),mul(v,Math.sin(a)*6))))}
  for(let i=0;i<6;i++)FS.push([R0[i],R0[(i+1)%6],tipP]);FS.push(R0.slice());facets(V0,FS,T,{lw:2})}
// the right forearm: a bracer of dark leather with the chain wound round it three times (the turns unwind one by one)
function chainArm(V0,El,W,A,K){const{P}=V0,ax=nrm(sub(W,El));chain(V0,[El,W],[10,11],K.lthr.b,{lw:2.6,fill:limbGrad(P(El),P(W),11,K.lthr),rim:.18});
  const T=A.heat.chain>0?heatT(K.chain,Math.min(1,A.heat.chain*1.2)):K.chain;
  for(let i=0;i<3;i++){const k=cl((A.wraps==null?3:A.wraps)-i,0,1);if(k<=.02)continue;const c=lerp3(El,W,.32+i*.2);ga(k,()=>{const B=band(V0,add(c,mul(ax,-1.5)),add(c,mul(ax,1.5)),11.8,T,{lw:1.8});
    if(B&&i%2===0){ctx.strokeStyle='rgba(18,20,26,.55)';ctx.lineWidth=.9;for(let j=0;j<B.ra.length;j+=2){const q=B.ra[j],r=B.rb[j];seg(q,r);ctx.stroke()}}})}}
// the tongs of the entrance with the red-hot iron, then thrown aside (they cool down on the floor)
function tongsDraw(V0,A,FC,K){const{P}=V0,t=A.tongs;let a,b;if(t.k<=0){a=FC;b=add(FC,[-14,6,-14])}else{const k=t.k,land=[-6,-60,0],m=[lerp(FC[0],land[0],k),lerp(FC[1],land[1],k),lerp(FC[2],land[2],k)+18*Math.sin(Math.PI*k)*(1-k*.6)];a=m;b=add(m,[k>.95?10:-12,k>.95?2:4,k>.95?0:-10])}
  const qa=P(a),qb=P(b);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4;seg(qa,qb);ctx.stroke();ctx.strokeStyle=K.iron.b;ctx.lineWidth=2;ctx.stroke();
  const hot=1-(t.cool||0),ir=P(lerp3(a,b,1.15)),ir2=P(lerp3(a,b,1.45));ctx.strokeStyle=INK;ctx.lineWidth=4.6;seg(ir,ir2);ctx.stroke();ctx.strokeStyle=hot>.05?rampC('#3a3430',.4+.6*hot):'#3a3430';ctx.lineWidth=2.6;ctx.stroke();
  if(hot>.3&&!LOWFX)shine('255,140,50',(ir[0]+ir2[0])/2,(ir[1]+ir2[1])/2,10,.5*hot)}
// the head: the hood of leather (or, under it, the bald head of red-hot bronze), the dark of the face, the eyes, the iron V, the mouth, the mane
function headDraw(V0,HX,Hc,HR,A,K,fxk){const{P,F}=V0,T=HX.T,fwd=F(HR([1,0,0])),h=P(Hc),hood=A.hood,bald=1-hood,t=(G&&G.t)||0;
  // the mane of fire (behind the head seen from the front, in front of the nape from the back)
  const mane=()=>{if(A.mane<=.01)return;for(let i=0;i<9;i++){const a=-1.25+i*(2.5/8),m=nrm([-.35-.4*Math.cos(a*1.2),Math.sin(a),.55+.25*Math.cos(a)]),b=P(T(ellAt([0,0,0],BALD,null,m)));
    const L0=(i===4?24:7+4*Math.abs(Math.cos(a*2)))*A.mane,ph=LOWFX?i:t*5.2+i*1.7;tongue(b[0],b[1]+2,L0+3*Math.sin(ph*.7)*(LOWFX?0:1),3.4+(i===4?1.4:0),ph,-.1*Math.sin(a),FL1,.95)}};
  if(fwd>-.1)mane();
  const flap=()=>{if(hood<=.01)return;ga(hood,()=>svol3(V0,ellSil(V0,[-11,0,-6],[11,13,9],null,T,14),K.hood,{lw:2.6,scr:1,rim:.22}))};
  if(F(HR([-1,0,0]))<0)flap();
  // the bald head of the second phase (the eyes, the brow and the beard stay exactly where they were)
  if(bald>.01){const draw=()=>{const sk=svol3(V0,ellSil(V0,[0,0,0],BALD,null,T,14),K.bronze,{lw:2.8,rim:.3,scr:1});
      if(fwd>-.3){ctx.save();ctx.clip(sk.path);
        // the heavy brow in a V where the band was, the short broad nose, the white eyes in dark sockets, the lit mouth with two fangs
        const at=m=>({q:P(T(ellAt([0,0,0],BALD,null,m))),v:F(HR(ellN(BALD,null,m)))});
        eyes(null,h,13.5,{at,dir:[1,.3,.03],kind:'pip',sock:'#3a1206',col:'#ffffff',rx:3.2,ry:2.8,glow:K.eyeG,squint:A.squint*1.3,a:.6,b:.78,gap:1.4});
        const brow=VBAND.map(m=>nrm(add(m,[0,0,-.02]))).map(m=>at(m));if(brow[1].v>-.1){const pts=[];for(let i=0;i<=8;i++){const k=i/8,m=k<.5?nrm(lerp3(VBAND[0],VBAND[1],k*2)):nrm(lerp3(VBAND[1],VBAND[2],k*2-1));const r=at(m);if(r.v>.02)pts.push(r.q)}
          if(pts.length>1){strokeRuns([pts.map(q=>[q[0],q[1]+2.2])],'rgba(40,10,2,.5)',3.4);strokeRuns([pts],INK,5);strokeRuns([pts],K.bronze.l,3)}}
        const nq=at(nrm([1,0,-.08]));if(nq.v>.2){ctx.fillStyle=C.softBall(nq.q,3,K.bronze.b,.25,.3);ctx.strokeStyle=INK;ctx.lineWidth=1.4;ball(nq.q,3);ctx.fill();ctx.stroke()}
        C.mouth(null,h,13.5,nrm([1,0,-.36]),{at,kind:'open',open:.35+.65*A.jaw,w:3.6,h:2.6,dark:K.mouth,tongue:false,fang:K.fang,fh:1.8});
        ctx.restore()}};draw()}
  // the hood (it burns away from the face toward the nape: a bright edge eats the leather, the ash flies)
  if(hood>.01){const draw=()=>{const sk=svol3(V0,ellSil(V0,[0,0,0],HOOD,null,T,14),K.hood,{lw:3,rim:.3,scr:1});
      if(fwd>-.35){const cap=ellCap(V0,HX,[0,0,0],HOOD,null,nrm([1,0,-.12]),.62,30,{alv:.52,ck:'smface'});
        if(cap){const b=bbox(cap.rim||[[h[0],h[1]]]),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(b[2]-b[0],b[3]-b[1])/2+1,g=ctx.createRadialGradient(cx,cy,R*.1,cx,cy,R);g.addColorStop(0,K.dark);g.addColorStop(1,'#060302');
          ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
          // the thin light lip on the lower edge, the warm light of the furnace from below
          if(cap.rim){const lo=cap.rim.filter(q=>q[1]>cy+R*.25);if(lo.length>1){ctx.strokeStyle='rgba(255,200,140,.32)';ctx.lineWidth=1;ctx.beginPath();for(const q of lo)ctx.lineTo(q[0],q[1]+.8);ctx.stroke()}}
          const at=m=>({q:P(T(ellAt([0,0,0],HOOD,null,m))),v:F(HR(ellN(HOOD,null,m)))});
          ctx.save();ctx.beginPath();if(cap.rim)for(const q of cap.rim)ctx.lineTo(q[0],q[1]);ctx.closePath();
          const sq=cl(A.squint*1.3,0,1.3),on=cl(A.eye,0,1.2);
          if(on>.02){const E=eyes(null,h,15,{at,dir:[1,.30,.03],kind:'glow',col:cmix('#3a1408',K.eye,cl(on,0,1)),rx:2.6,ry:2.3,glow:K.eyeG,squint:sq,a:.55,b:.7,gap:1.2,light:on>.5});
            for(const e of E){if(e.rx<.6)continue;const s2=Math.max(.15,1-.35*sq);ctx.fillStyle=K.eyeC;ctx.globalAlpha*=cl(on,0,1);ctx.beginPath();ctx.ellipse(e.q[0],e.q[1],e.rx*.42,2.3*s2*.42,0,0,TAU);ctx.fill();ctx.globalAlpha/=cl(on,0,1)||1;
              if(!LOWFX)shine(K.eyeG,e.q[0],e.q[1],7.5*(.6+.4*on),.55*on*Math.min(1,e.v*2))}}
          if(A.jaw>.03)C.mouth(null,h,15,nrm([1,0,-.34]),{at,kind:'open',open:A.jaw,w:3.6,h:2.6,dark:K.mouth,tongue:false,fang:K.fang,fh:1.6});
          if(A.jaw>.03&&!LOWFX){const mq=at(nrm([1,0,-.34]));shine('255,190,90',mq.q[0],mq.q[1],8,.45*A.jaw)}
          ctx.restore()}
        // the iron band in a V on the forehead, with its three brass rivets (squinting, the point comes down)
        const tipM=nrm(add(VBAND[1],[0,0,-.1*A.squint])),path=[];for(let i=0;i<=10;i++){const k=i/10,m=k<.5?nrm(lerp3(VBAND[0],tipM,k*2)):nrm(lerp3(tipM,VBAND[2],k*2-1)),n=HR(ellN(HOOD,null,m));if(F(n)>.02)path.push(P(T(ellAt([0,0,0],add(HOOD,[.6,.6,.6]),null,m))))}
        if(path.length>1){strokeRuns([path],INK,5.8);strokeRuns([path],K.iron.b,3.6);strokeRuns([path.map(q=>[q[0],q[1]-1.1])],K.iron.l,1);
          for(const m of[VBAND[0],tipM,VBAND[2]]){const n=HR(ellN(HOOD,null,m));if(F(n)<.15)continue;const q=P(T(ellAt([0,0,0],add(HOOD,[1,1,1]),null,m)));ctx.fillStyle=K.brass.b;ctx.strokeStyle=INK;ctx.lineWidth=.8;ball(q,1.5);ctx.fill();ctx.stroke()}}}};
    if(hood<.99)fadeDraw(draw,h,26,hood);else draw();
    if(A.burn>0&&hood<.99&&hood>.01){// the edge of the burning leather: a soft orange glow round the hood, embers along it
      const pts=ellSil(V0,[0,0,0],add(HOOD,[.4,.4,.4]),null,T,16);ctx.save();ctx.globalAlpha*=A.burn*Math.min(1,hood*3);ctx.lineJoin='round';ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();
      if(!LOWFX){ctx.strokeStyle='rgba(255,120,40,.45)';ctx.lineWidth=6;ctx.stroke()}ctx.strokeStyle='#ffb040';ctx.lineWidth=1.6;ctx.stroke();for(let i=0;i<pts.length;i+=3){ctx.fillStyle=i%2?'#fff0b0':'#ff8a3a';ball(pts[i],1.3);ctx.fill()}ctx.restore()}}
  if(F(HR([-1,0,0]))>=0)flap();
  if(fwd<=-.1)mane()}
// the beard: three braids of iron from the lower rim of the face down over the collar, each four pieces with a brass bead and a brass tip
function braids(V0,HX,X,A,K,fw){const{P,F}=V0;if(F(HX.Rd([1,0,0]))<-.35)return;const sw=A.braid||[0,0],up=A.blift||0;
  for(let i=0;i<3;i++){const m=BRAID[i],b0=HX.T(ellAt([0,0,0],HOOD,null,m)),side=(i-1)*.18,pts=[b0];let q=b0;
    for(let j=0;j<4;j++){const d=nrm(X.Rd([.42-j*.08+sw[0]*(1+j*.4)+up*.6,side+sw[1]*(1+j*.3),-1+up*.9]));q=add(q,mul(d,3.6));pts.push(q)}
    const rs=[3.9,3.5,3,2.5,2.2],T=K.beard;chain(V0,pts,rs,T.b,{lw:2.2,fill:limbGrad(P(pts[0]),P(pts[4]),4.4,T),rim:.18});
    ctx.strokeStyle='rgba(220,220,235,.35)';ctx.lineWidth=.9;for(let j=0;j<4;j++){const a0=P(lerp3(pts[j],pts[j+1],.3)),a1=P(lerp3(pts[j],pts[j+1],.7));ctx.beginPath();ctx.moveTo(a0[0]-rs[j]*.5,a0[1]);ctx.lineTo(a1[0]+rs[j]*.4,a1[1]-1);ctx.stroke()}
    for(const[j,r] of[[2,2.2],[4,2.6]]){const qq=P(pts[j]);ctx.fillStyle=K.bead;ctx.strokeStyle=INK;ctx.lineWidth=1;ball(qq,r);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.5)';ball([qq[0]-r*.35,qq[1]-r*.35],r*.35);ctx.fill()}}}
// the jets of the blast: short jets of steam and fire from the vents, the door and the grille (the game draws the eight lanes)
function jetsAt(V0,X,A,bs,p2){const{P}=V0,k=A.jets,t=(G&&G.t)||0;if(k<=.02)return;
  const srcs=[];for(let j=0;j<3;j++)for(const sd of[-1,1])srcs.push({t:sd*1.1,z:VROWS[j]});srcs.push({t:0,z:58,big:1});srcs.push({t:Math.PI,z:68});
  for(const s of srcs){const b=bar(s.t,s.z,1,bs),n=X.Rd(b.n),L0=(s.big?30:22)*(.85+.15*Math.sin(t*23+s.z)),n0=LOWFX?2:4;
    for(let i=n0-1;i>=0;i--){const u=(i+.5)/n0,q=P(X.T(add(b.p,mul(b.n,L0*u)))),r=(s.big?3.6:2.6)+u*(s.big?7:5);
      if(p2&&i<2){ctx.fillStyle=`rgba(255,${150+i*40},70,${.75*k*(1-u*.4)})`;ball(q,r*.8);ctx.fill()}
      ctx.fillStyle=`rgba(240,243,246,${.62*k*(1-u*.55)})`;ball(q,r);ctx.fill()}
    const q0=P(X.T(add(b.p,mul(b.n,2))));ctx.fillStyle=`rgba(255,255,255,${.8*k})`;ball(q0,s.big?3.4:2.4);ctx.fill()}}
// the great sigh of white steam of the defeat: a column that rises over it
function sighDraw(V0,X,A,p){const k=cl((p-.5)/.5,0,1),{P}=V0,base=P(X.T([20,0,70]));for(let i=0;i<7;i++){const u=(k*1.4+i/7)%1,q=[base[0]+Math.sin(i*2.1+u*3)*8*u,base[1]-u*90];
  ctx.fillStyle=`rgba(236,240,244,${.45*(1-u)*(1-sstep(.7,1,k))})`;ball(q,6+u*16);ctx.fill()}}
// the effects of the moves
function fxDraw(V0,X,L,e,A,J,HX,arms,K,lift){const{P,D}=V0,t=e.t;
  const chimTop=sd=>{const b=X.T([CHB[0],sd*CHB[1],CHB[2]+(A.shZ||0)]),d=X.Rd(nrm([CHD[0],sd*CHD[1],CHD[2]]));return add(b,mul(d,CHL+1))};
  if(e.k==='puff'||e.k==='smoke'){const tops=e.at==='chim'?[chimTop(-1),chimTop(1)]:e.at==='hood'?[HX.T([-4,0,14])]:e.sd?[chimTop(e.sd)]:[];if(A.mute>.5&&e.k==='puff')return;
    for(const c of tops)L.add(D(c)+20,()=>{const q=P(add(c,[-3*t,0,4+t*20])),r=(e.thin?2:3.5)+t*(e.thin?3:8),col=e.black?'40,32,30':'52,46,44';ctx.fillStyle=`rgba(${col},${(e.thin?.25:.5)*(1-t)})`;ball(q,r);ctx.fill();
      if(!e.thin){ctx.fillStyle=`rgba(${col},${.35*(1-t)})`;ball([q[0]+r*.6,q[1]+r*.3],r*.7);ctx.fill()}})}
  else if(e.k==='flame'){if(A.cool>.6)return;const c=chimTop(e.sd);L.add(D(c)+20,()=>{const q=P(c),h=(e.big?26:16)*(1-t*.6);tongue(q[0],q[1],h*Math.sin(Math.PI*Math.min(1,t*1.4+.2)),e.big?6:4.4,t*20+e.sd,-.1,['#ff7a2e','#ffb050','#fff6e0'],1-t*.5)})}
  else if(e.k==='ring'){const tops=e.sd?[chimTop(e.sd)]:[e.at];for(const c of tops){if(!c)continue;L.add(D(c)+21,()=>{const q=P(add(c,[0,0,6+t*22])),r=3+t*9;ctx.strokeStyle=e.fire?`rgba(255,150,60,${.8*(1-t)})`:`rgba(60,54,52,${.65*(1-t)})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.45,0,0,TAU);ctx.stroke();
      if(e.spark){for(let i=0;i<10;i++){const a=i/10*TAU,qq=[q[0]+Math.cos(a)*r*2.2,q[1]+Math.sin(a)*r*1.1];ctx.fillStyle=`rgba(255,220,140,${1-t})`;ball(qq,1.4);ctx.fill()}}})}}
  else if(e.k==='steam'){const pts=[];if(e.at==='vents'){for(let j=0;j<3;j++)for(const sd of[-1,1])pts.push(X.T(bar(sd*1.1,VROWS[j],2,A.bs).p))}else if(e.at==='door')pts.push(X.T(bar(0,58,4,A.bs).p));else if(Array.isArray(e.at))pts.push(X.T(e.at));
    for(const c of pts)L.add(D(c)+15,()=>{const q=P(add(c,[0,0,t*14])),r=(e.thin?1.6:3)+t*(e.thin?3:7);ctx.fillStyle=`rgba(236,240,244,${(e.thin?.3:.55)*(1-t)})`;ball(q,r);ctx.fill()})}
  else if(e.k==='spark'){const c=add(e.at,[0,0,lift]);L.add(D(c)+12,()=>{for(let i=0;i<(e.n||4);i++){const a=i*2.4+.7,s=t*(14+i*3),q=P(add(c,[Math.cos(a)*s,Math.sin(a)*s,s*.9-t*t*20]));ctx.fillStyle=i%2?'#ffd36e':'#ff8a3a';ctx.globalAlpha=1-t;ball(q,1.5);ctx.fill();ctx.globalAlpha=1}})}
  else if(e.k==='drip'){const M=J.maul;if(!M)return;L.add(D(M.c)+2,()=>{const q=P(add(M.c,[0,0,-9-t*14]));ctx.fillStyle=`rgba(255,200,90,${1-t})`;ball(q,1.4);ctx.fill()})}
  else if(e.k==='dust'){const c=e.at;L.add(D(c)+5,()=>{for(let i=0;i<(e.n||5);i++){const a=i/(e.n||5)*TAU+.4,d=(e.r||10)*(.4+t*.9),q=P(add(c,[Math.cos(a)*d,Math.sin(a)*d,t*6+(i%2)*2]));ctx.fillStyle=`rgba(150,130,120,${.45*(1-t)})`;ball(q,2.2+t*4.5);ctx.fill()}})}
  else if(e.k==='flash'){const c=e.at;L.add(D(c)+30,()=>{const q=P(c),r=(e.small?16:34)*(.6+.4*t);const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],r);g.addColorStop(0,`rgba(255,250,230,${.9*(1-t)})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ball(q,r);ctx.fill()})}
  else if(e.k==='anvilhit'||e.k==='workhit'){const c=e.k==='workhit'?[-36,0,22]:(arms[-1]?lerp3(arms[-1].El,arms[-1].W,.5):[30,0,72]);L.add(D(c)+25,()=>{const q=P(e.k==='anvilhit'?add(c,X.Rd([0,0,6])):c);J.flashQ=q;
      if(t<.35){const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],e.big?22:14);g.addColorStop(0,`rgba(255,255,255,${1-t/.35})`);g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ball(q,e.big?22:14);ctx.fill()}
      for(let i=0;i<(e.big?12:8);i++){const a=-Math.PI/2+(i/(e.big?11:7)-.5)*2.2,s=t*(26+(i%3)*8);ctx.fillStyle=i%2?'#ffd36e':'#fff0b0';ctx.globalAlpha=1-t;ball([q[0]+Math.cos(a)*s,q[1]+Math.sin(a)*s+t*t*30],1.5);ctx.fill();ctx.globalAlpha=1}})}
  else if(e.k==='ringup'){const c=arms[-1]?lerp3(arms[-1].El,arms[-1].W,.5):[30,0,72];L.add(D(c)+26,()=>{const q=P(add(c,[0,0,t*30])),r=8+t*22;ctx.strokeStyle=`rgba(255,240,200,${.6*(1-t)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.35,0,0,TAU);ctx.stroke();
      if(e.double){ctx.beginPath();ctx.ellipse(q[0],q[1]-8,r*.8,r*.28,0,0,TAU);ctx.stroke()}})}
  else if(e.k==='trail'){const M=J.maul;if(!M)return;L.add(D(M.c)-1,()=>{const q=P(M.c);for(let i=1;i<6;i++){ctx.fillStyle=`rgba(255,${200-i*20},90,${.6-i*.1})`;const back=e.spin?rotZ(sub(M.c,X.T([0,0,34])),-i*.18):rotZ(sub(M.c,arms[1]?arms[1].FC:M.c),-i*.2),qq=P(add(e.spin?X.T([0,0,34]):(arms[1]?arms[1].FC:M.c),back));ball(qq,2.2-i*.25);ctx.fill()}})}
  else if(e.k==='scrape'){const M=J.maul;if(!M)return;L.add(D(M.c)+3,()=>{const q=P([M.c[0],M.c[1],0]);for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#ffd36e':'#ff8a3a';ctx.globalAlpha=1-t;ball([q[0]+Math.sin(i*2+t*6)*8,q[1]-t*12-i*2],1.4);ctx.fill();ctx.globalAlpha=1}})}
  else if(e.k==='blow'){const c=HX.T([18,0,-4]);L.add(D(c)+10,()=>{const q=P(add(c,[t*10,t*4,t*6]));ctx.fillStyle=`rgba(236,240,244,${.5*(1-t)})`;ball(q,2+t*5);ctx.fill();if(J.maul){const m=P(add(J.maul.c,[0,0,10+t*14]));ctx.strokeStyle=`rgba(60,54,52,${.5*(1-t)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(m[0]+Math.sin(t*9)*3,m[1],3+t*3,0,Math.PI*1.5);ctx.stroke()}})}
  else if(e.k==='ash'){const c=HX.T([0,0,8]);L.add(D(c)+18,()=>{for(let i=0;i<8;i++){const u=(t+i/8)%1,q=P(add(c,[Math.sin(i*1.9)*14*u,Math.cos(i*2.7)*12*u,u*30]));ctx.fillStyle=i%3?`rgba(138,128,120,${1-u})`:`rgba(255,160,70,${1-u})`;ctx.fillRect(q[0]-1.2,q[1]-1.2,2.4,2.4)}})}
  else if(e.k==='embers'){for(let i=0;i<3;i++){const k=cl(t*1.4-i*.2,0,1);if(k<=0)continue;const c=add(X.T(bar(0,52,4,A.bs).p),[k*(18+i*6),(i-1)*8*k,-Math.min(52,k*52)]);c[2]=Math.max(1,c[2]);
      L.add(D(c)+4,()=>{const q=P(c),hot=1-sstep(.6,1,k);ctx.fillStyle=cmix('#3a3430','#ff8a3a',hot);ctx.strokeStyle=INK;ctx.lineWidth=.8;ball(q,2);ctx.fill();ctx.stroke();if(hot>.2&&!LOWFX)shine('255,130,50',q[0],q[1],7,.4*hot)})}}}

// ------------------------------------------------------------------ for the game: the pieces of its attacks, with the same look
// the anvil of cast iron (30 long, 14 wide, 20 tall, the horn and the square hole): falling (z, rot), on the floor; o.hot 1..0 from orange
// to iron, o.p2 red-hot, o.brk 0..1 it breaks in three and crumbles, o.work the work anvil on its stump of wood, o.shadow false
function anvilDraw(V0,c,rot,o){o=o||{};const K=o.K||pal(o.p2?1:0,0),T=o.hot>0?heatT(K.iron,o.hot*.8):(o.p2?heatT(K.iron,.35):K.iron),fx=[Math.cos(rot),Math.sin(rot),0],fy=[-Math.sin(rot),Math.cos(rot),0],E=[fx,fy,[0,0,1]],{P}=V0;
  let base=c;if(o.work){// the stump with two iron bands
    const st=add(c,[0,0,0]),r=11;const tp=add(st,[0,0,14]);const ring=(z,rr)=>{const R=[];for(let i=0;i<14;i++){const a=i/14*TAU;R.push(P(add(st,[Math.cos(a)*rr,Math.sin(a)*rr,z])))}return R};
    const H=chull(ring(0,r).concat(ring(14,r*.95)));poly(H);ctx.fillStyle=grad3(bbox(H),T3('#8a6a44','#6b4a2a','#4a3220'));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
    for(const z of[3,11]){const R=ring(z,r+.4);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();for(let i=3;i<11;i++)ctx.lineTo(R[i][0],R[i][1]);ctx.stroke();ctx.strokeStyle=K.iron.b;ctx.lineWidth=1.4;ctx.stroke()}
    const top=ring(14,r*.95);poly(top);ctx.fillStyle='#9a7a52';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();base=add(c,[0,0,14])}
  const brk=o.brk||0,sp=brk*10,fall=sstep(.5,1,brk);
  const piece=(off,f)=>{ctx.save();if(brk>0)ctx.globalAlpha*=1-fall;f(add(base,off));ctx.restore()};
  // the waist and the foot, the body, the table with the polished face, the horn
  piece([-sp*.6,-sp*.3,-fall*6],b=>{facets(V0,boxF(add(b,[0,0,3]),E,[9,6,3],1),T,{lw:2.2});facets(V0,boxF(add(b,[0,0,9]),E,[6,4.2,3.4],1),T,{lw:2})});
  piece([sp*.5,sp*.4,-fall*6],b=>{const tc=add(b,[0,0,16]);facets(V0,boxF(tc,E,[11,7,4],1.2),T,{lw:2.2});const f=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([u,v])=>P(add(add(tc,[0,0,4.1]),add(mul(fx,u*10.4),mul(fy,v*6.4)))));poly(f);
    ctx.fillStyle=o.hot>0?rampC(K.hi,o.hot*.85):K.hi;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=.7;seg(lerp(f[0],f[3],.3),lerp(f[1],f[2],.5));ctx.stroke();const hq=P(add(add(tc,[0,0,4.2]),mul(fx,-7)));ctx.fillStyle='#12161c';ctx.fillRect(hq[0]-1.2,hq[1]-1,2.4,2)});
  piece([sp,-sp*.5,-fall*6],b=>{const hb=add(b,add(mul(fx,11),[0,0,16])),hd=fx,[u,v]=frm(hd,[0,0,1]),tipP=add(hb,mul(hd,10)),R0=[],FS=[];for(let i=0;i<6;i++){const a=i/6*TAU;R0.push(add(hb,add(mul(u,Math.cos(a)*4),mul(v,Math.sin(a)*4))))}
    for(let i=0;i<6;i++)FS.push([R0[i],R0[(i+1)%6],tipP]);FS.push(R0.slice());facets(V0,FS,T,{lw:2})});
  if((o.hot>.3||o.p2)&&!LOWFX&&!o.glowless){const q=P(add(base,[0,0,12]));shine('255,130,50',q[0],q[1],20,.35*Math.max(o.hot||0,o.p2?.5:0))}}
const SPR={};let SPRN=0;
// a picture drawn once (for the current scale of the canvas) and then only pasted: w x h round the origin at (ox, oy)
function sprite(key,w,h,ox,oy,draw){const T=ctx.getTransform(),S=Math.round(Math.hypot(T.a,T.b)*4)/4||1,k=key+'|'+S;let c=SPR[k];
  if(!c){if(++SPRN>160){for(const q in SPR)delete SPR[q];SPRN=0}c=document.createElement('canvas');c.width=Math.ceil(w*S);c.height=Math.ceil(h*S);const g=c.getContext('2d'),saved=ctx;ctx=g;
    try{g.setTransform(S,0,0,S,ox*S,oy*S);draw()}finally{ctx=saved}SPR[k]=c}
  ctx.drawImage(c,-ox,-oy,w,h)}
function smithAnvil(x,y,z,rot,sc,o){sc=sc||1;o=o||{};if(o.shadow!==false)shadow(x,y+1,17*sc*(1-Math.min(.5,(z||0)/300)),6*sc*(1-Math.min(.5,(z||0)/300)),.32);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  try{const brk=o.brk||0;if(brk>0||o.K){anvilDraw(V(Math.PI/2),[0,0,0],rot||0,o);return}
    const hq=Math.round(cl(o.hot||0,0,1)*6)/6,rq=Math.round((rot||0)*4)/4,key='anv|'+hq+'|'+(o.p2?1:0)+'|'+(o.work?1:0)+'|'+rq;
    sprite(key,64,o.work?64:46,32,o.work?50:32,()=>anvilDraw(V(Math.PI/2),[0,0,0],rq,Object.assign({},o,{hot:hq,glowless:1})));
    if((hq>.3||o.p2)&&!LOWFX)shine('255,130,50',0,o.work?-24:-10,20,.35*Math.max(hq,o.p2?.5:0))}finally{ctx.restore()}}
function smithMaul(x,y,z,rot,sc,o){sc=sc||1;o=o||{};const V0=V(Math.PI/2),K=pal(o.p2?1:0,0);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  try{let c,a,h;if(o.planted){c=[0,0,4];a=[0,0,1];h=nrm([-.3,0,1])}else if(o.drag){const an=o.a||0;c=[0,0,9];a=[Math.cos(an+Math.PI/2),Math.sin(an+Math.PI/2),0];h=nrm([-Math.cos(an),-Math.sin(an),.25])}
    else{const r=rot||0;c=[0,0,0];a=[Math.cos(r),0,Math.sin(r)];h=[-Math.sin(r),0,Math.cos(r)]}
    if(o.shadow!==false&&!o.planted){ctx.save();ctx.translate(0,z||0);shadow(0,1,16,6,.3);ctx.restore()}
    maulDraw(V0,c,a,h,K,o.hot==null?(o.p2?.55:0):o.hot,o)}finally{ctx.restore()}}
function smithChain(ax,ay,az,bx,by,bz,sc,o){o=o||{};const V0={P:q=>[q[0],q[1]-q[2]],D:()=>0,F:()=>1};const K=pal(o.p2?1:0,0);ctx.save();try{chainLinks(V0,[ax,ay,az||0],[bx,by,bz||0],(o.sag||0)*14,K.chain,o.hot||0,40)}finally{ctx.restore()}}
// the wrist (where the chain leaves the forearm) and the head of the maul, as screen offsets at sc 1 from the point of the feet
function smithHand(face,anim,p,o){o=o||{};const V0=V(face),A=sPose(MV.includes(anim)?anim:'idle',p,o),X=frame(A,0),g=armOf(A,X,1,0),W=add(g.W,mul(nrm(sub(g.W,g.El)),-2)),M=maulOf(A,g,0),h=V0.P(W);
  return{h:[h[0],h[1]],m:M?V0.P(M.c):null}}
// the crack of lava along a line: it runs (k 0..0.2), then it cools (0.2..1); with o.p2 it stays lava
function smithCrack(x,y,a,len0,k,sc,o){o=o||{};if(k<=0)return;const run0=Math.min(1,k/.2),cool=o.p2?Math.min(.35,sstep(.2,1,k)*.35):sstep(.2,1,k),L0=len0*run0,ca=Math.cos(a),sa=Math.sin(a)*.6;
  const pts=[];for(let s=0;s<=L0;s+=7){const w=Math.sin(s*.31+x*.1)*3.2;pts.push([x+ca*s-sa/.6*w*.0-Math.sin(a)*w,y+sa*s+Math.cos(a)*w*.6])}if(pts.length<2)return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const al=1-sstep(.75,1,k)*(o.p2?.3:1);ctx.globalAlpha*=al;
  ctx.strokeStyle='rgba(20,10,6,.85)';ctx.lineWidth=5;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();
  const col=cmix('#fff4d6',cmix('#ff5a1a','#3a1a10',cool),Math.min(1,cool*2+.3));if(!LOWFX&&cool<.8){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,120,40,${.45*(1-cool)})`;ctx.lineWidth=8;ctx.stroke();ctx.globalCompositeOperation='source-over'}
  ctx.strokeStyle=col;ctx.lineWidth=2.4;ctx.stroke();ctx.restore()}
// the jet of the blast along its lane: steam and fire low over the floor, k 0..1 its life
function smithJet(x,y,a,len0,k,sc,o){o=o||{};if(k<=0||k>=1)return;const ca=Math.cos(a),sa=Math.sin(a)*.6,grow=Math.min(1,k/.15),fade=1-sstep(.7,1,k),t=(G&&G.t)||0,L0=len0*grow;
  ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';
  for(let s=18;s<L0;s+=11){const u=s/len0,q=[x+ca*s,y+sa*s-6-4*u],r=5+u*9;ctx.fillStyle=o.p2&&s%22<11?`rgba(255,140,50,${.45*fade*(1-u*.5)})`:`rgba(236,240,244,${.4*fade*(1-u*.6)})`;ball([q[0]+Math.sin(t*20+s)*2,q[1]],r);ctx.fill()}
  ctx.restore()}

reg('smith2',{n:'Il Fabbro Infernale',g:'boss',sc:1,p2:true,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Cammina',hit:'Colpito',slam:'Martellata rovente',stuck:'Maglio incastrato',anvil:'Incudini dal cielo',swing:'Lancio del maglio',hold:'Catena tesa',yank:'Strattone',
    vent:'Sfiatata delle costole',vent2:'Doppia sfiatata (fase 2)',open:'Fornace aperta',spinup:'Rincorsa del turbine',spin:'Turbine del maglio',dizzy:'Barcolla',rage:'Si arroventa (fase 2)',taunt:'Presa in giro',enter:'Al lavoro (entrata)',die:'La forgia si spegne'}},smith2);
Object.assign(N3,{smithAnvil,smithMaul,smithChain,smithHand,smithCrack,smithJet,smith2Anvil:smithAnvil,smith2Maul:smithMaul,smith2Chain:smithChain,smith2Hand:smithHand,smith2Crack:smithCrack,smith2Jet:smithJet});
// «Prima e dopo»: the Fabbro of today
{const OLD=N3.smith,M0=N3.meta.smith;if(OLD&&M0)N3.meta.smith2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
