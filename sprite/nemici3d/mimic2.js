// IL MIMIC rifatto: «la cassa sbagliata» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio sia da fermi che
// nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo il Golem: «sì,
// fai gli altri 12»). Design scelto dal direttore artistico tra tre proposte: docs/boss-classici-design/mimic.md («l'affamato»).
// Il vecchio forziere della cripta che tutti vogliono aprire: quercia scura mezza marcia, angolari e fasce d'ottone che luccicano come il
// tesoro delle casse gemelle. È un'esca: quando lo tocchi due occhi d'ambra si accendono nel buio sotto il coperchio, il coperchio si
// spalanca su una gola di velluto rosso trapuntato piena di denti d'avorio (uno è d'oro) e in fondo brilla il suo mucchio d'oro; la cassa
// si alza su lunghe gambe pallide con le ginocchia al contrario e pianta a terra due braccia più lunghe di lei, con tre artigli per mano.
// Fermo come un mobile e poi veloce come un ragno, avido e beffardo. Il suo cuore è il tesoro: prima di ogni colpo il tesoro «si sveglia»
// (tin-tin) e la sua luce corre nell'ottone fino alla parte che sta per colpire (è il suo avviso, come il cuore del Golem). A metà vita la
// serratura si apre: era un occhio. Resta della Classica: forme robuste da giocattolo, colori pieni, occhi con la lucina, mai sangue né
// carne (il dentro è velluto coi bottoncini, la lingua è rosa da cartone).
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia e gambe a due ossa (ik), ordine di disegno dalla posa di
// riposo (gamba e braccio lontani, cassa, il dentro ritagliato sull'apertura, coperchio, braccio e gamba vicini, lingua, monete); dipinto
// come la lanterna (tre toni, bordo caldo, bagliori morbidi). Unità del modello a sc 1: x avanti, y alla sua destra, z in su; l'origine è
// a terra sotto il centro della cassa.
// Mosse: idle, walk (corsa a scatti), hit, chomp (Morso), tongue (Frustata), tongue3 (Frustata a tre, fase 2), grab e gulp (l'Assaggio),
// coins (Sputo d'oro, Pioggia d'oro con o.p2), leap (un balzo della Tagliola), stuck (Incastrato), hide, chest, pop (il Gioco delle Casse),
// daze (Stordito), rage (Ha fame!), taunt (Presa in giro), lure (l'Esca), enter (Entrata), die (Sconfitta).
// Opzioni: o.p2 (fase 2), o.z (altezza data dal gioco nel balzo e nei saltelli), o.reach (lunghezza della lingua della Frustata),
// o.reach3 e o.fan (le tre lingue della Frustata a tre), o.last (l'ultimo balzo resta piantato), o.mat ('moss', 'ash', 'mud', 'frost':
// il materiale del posto sulla fascia di fondo), le opzioni della cassa (o.shake, o.lid, o.gold, o.good, o.slide, o.real, o.breath) e
// o.noFx. Con LOWFX niente bagliori, ragnatele, bava, bottoncini, monete che saltano né righe di luce nelle fughe.
// Disegni per il gioco con lo stesso aspetto: N3.mimicChest (la cassa chiusa: casse gemelle e finte del Gioco delle Casse), N3.mimicCoin
// (una moneta), N3.mimicPlank (un'asse rotta). Modello 'mimic2': nel gioco prende il nome 'mimic' (src/js/89-mimic-nuovo.js).
(()=>{const C=C3,K3=C3K,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,hull,rim,cmix,poly,bbox,chull,keys,sstep,hitK,frame,
  chain,disc3,parts,reg,shine,ik,softBox,rimPoly,run}=C;
const{rise,flash,pls,ga,strokeRuns,grad3,T3,mixT,cyl,limbGrad,lit,tone,fadeDraw,band,mixRgb}=K3;
const DEG=Math.PI/180,fxOn=o=>!o.noFx&&!LOWFX;
// the chest: half depth, half width, bottom and rim; the lid hinged on the back top edge, 4 thick at its edges, its arch 10 higher in the
// middle (closed, its top is at 110)
const DX=20,DY=26,ZB=60,ZT=96,LT=4,LA=10,ZC=78;
const MV=['idle','walk','hit','chomp','tongue','tongue3','grab','gulp','coins','leap','stuck','hide','chest','pop','daze','rage','taunt','lure','enter','die'];
const DUR={idle:3,walk:.8,hit:.6,chomp:1.8,tongue:1.6,tongue3:2,grab:1.5,gulp:1.2,coins:1.6,leap:1.1,stuck:1,hide:.8,chest:1,pop:.5,daze:1,rage:2.4,taunt:1.1,lure:1.4,enter:2.8,die:3.4};

// ------------------------------------------------------------------ colours: three tones per piece (light, base, shadow)
const K1={wood:T3('#a4643a','#74401f','#42200e'),joint:'#26110a',grain:'rgba(38,17,10,.35)',rot:'#3a2a18',
  brass:T3('#ffe08a','#d9a640','#8c5e1c'),stud:'#fff3c4',verd:'#5f9a7a',
  vel:T3('#c23a52','#7d1a2c','#3a0812'),btn:'#ffd56a',dark:'#1a0608',
  gold:T3('#fff0a8','#ffc93c','#b07a1c'),inner:'255,196,70',
  teeth:T3('#f6eed6','#d9caa6','#a8956e'),gtooth:T3('#ffe58a','#e0a830','#8a5a14'),
  tongue:T3('#f07a94','#c8466a','#7a1f3c'),stripe:'#ffb0c0',drool:'rgba(220,235,210,.8)',
  limb:T3('#ece3d4','#c3b6a2','#85786a'),knuck:'#d9c4b8',claw:T3('#f8efda','#c9b791','#8c7c5c'),clawTip:'#5a4a38',
  iris:'#ffb52e',core:'#ffe98a',pupil:'#1b1612',eglow:'255,170,50',web:'rgba(235,235,240,.55)'};
const K2=Object.assign({},K1,{wood:T3('#94552e','#663818','#381a0a'),vel:T3('#a82a40','#601222','#2a0408'),inner:'255,110,40',
  iris:'#ff4a2a',core:'#ffb08a',eglow:'255,80,40'});
const KMAT={moss:T3('#6e9a3e','#4f7a2e','#2f4f1c'),ash:T3('#8a807a','#6a605c','#3e3836'),mud:T3('#7a6038','#5a4428','#36281a'),frost:T3('#f4fbff','#e8f6ff','#9cc8e8')};
// the palette of a pose: the second phase blends in through the rage (k2)
const PK={};function pal(k2){k2=Math.round(cl(k2,0,1)*8)/8;if(k2<=0)return K1;if(k2>=1)return K2;if(PK[k2])return PK[k2];
  return PK[k2]=Object.assign({},K1,{wood:mixT(K1.wood,K2.wood,k2),vel:mixT(K1.vel,K2.vel,k2),inner:mixRgb(K1.inner,K2.inner,k2),iris:cmix(K1.iris,K2.iris,k2),
    core:cmix(K1.core,K2.core,k2),eglow:mixRgb(K1.eglow,K2.eglow,k2)})}

// ------------------------------------------------------------------ the pose
const D2=(a,b,p)=>sstep(a,b,p);
// a smooth go-and-back of the lid: from a to b over [p0,p1] (eased)
const ramp=(p,p0,p1,a,b)=>lerp(a,b,ez(cl((p-p0)/(p1-p0),0,1)));
const REST={feet:[[-2,-24,0],[-2,24,0]],hands:[[24,-48,2],[24,48,2]]};
function mPose(anim,p,o){const P2=!!o.p2&&anim!=='chest'&&anim!=='hide';
  const A={p2:P2,k2:P2?1:0,B:[0,0,0],hz:P2?66:60,lean:0,roll:0,yaw:0,s:0,sw:0,lid:(P2?25:11.5)*DEG,
    feet:REST.feet.map(q=>q.slice()),hands:REST.hands.map(q=>q.slice()),fRel:0,hRel:0,legK:1,armK:1,med:[1,1],
    fc:[.15,.15],fs:[0,0],tap:[0,0,0],hd:[null,null],beck:-1,
    eye:{o:1,lx:0,sq:0,hap:0,wide:0,spin:0,on:1},
    tg:{m:P2?'out':'hang',len:P2?30:22,sw:0,k:0,reach:0,ang:0,lit:0,wave:0,dir:null},
    glow:P2?.75:.55,wake:0,run:null,lit:{teeth:0,arms:0,legs:0,seams:0},jg:P2?.6:0,
    coins:-1,fount:-1,hic:-1,key:P2?1:0,keyL:0,crack:P2?1:0,web:0,stars:0,off:-1,fade:1,smoke:-1,pool:0,splint:-1,dust:-1,chest:0,shake:0,real:0,good:0,gold:0,
    gt:0,teethOut:P2?.6:0};
  const wake=(a,b)=>{A.wake=Math.max(pls(p,a,.06),pls(p,b,.06));A.glow=Math.min(1,A.glow+.45*A.wake)};
  const run=(g,a,b)=>{if(p>=a&&p<=b+.08)A.run={g,k:D2(a,b,p),a:1-D2(b,b+.08,p)}};
  const hold=v=>A.hands.map(()=>v);
  if(anim==='walk'){// THE SCUTTLE: four quick steps in diagonal pairs (left arm with right leg, then the other two), then a dead stop
    const dash=p<.55,sp=P2?62:56;
    // the offset of a limb along x (−1 back … +1 forward) and its lift: pair a swings at [0,.11] and [.22,.33]; pair b at [.11,.22],
    // [.33,.44], then holds forward with the foot a little up until it straightens (.60)
    const seg=(t,w)=>{for(const[a,b,from,to,sw] of w)if(t>=a&&t<=b){const u=(t-a)/(b-a);return{x:lerp(from,to,sw?ez(u):u),z:sw?Math.sin(Math.PI*u):0}}return{x:w[w.length-1][3],z:0}};
    const WA=[[0,.11,-1,1,1],[.11,.22,1,-1,0],[.22,.33,-1,1,1],[.33,.55,1,-1,0],[.55,1,-1,-1,0]],WB=[[0,.11,1,-1,0],[.11,.22,-1,1,1],[.22,.33,1,-1,0],[.33,.44,-1,1,1],[.44,1,1,1,0]];
    const a=seg(p,WA),b=seg(p,WB),bLift=p>=.44&&p<.62?3*(1-D2(.55,.62,p)):0;
    A.hands[0]=[24+15*a.x,-48,2+6*a.z];A.feet[1]=[-2+9*a.x,24,4*a.z];A.hands[1]=[24+15*b.x,48,2+6*b.z];A.feet[0]=[-2+9*b.x,-24,4*b.z+bLift];
    const kS=D2(.55,.62,p),kR=D2(.92,1,p);
    A.hz=lerp(lerp(sp,P2?66:60,kS),sp,kR);A.lean=lerp(lerp(6,0,kS),6,kR)*DEG;
    if(dash)A.B[2]=2*Math.abs(Math.sin(Math.PI*p/.11));
    A.lid=((P2?25:11)+14*pls(p,.12,.08)+14*pls(p,.40,.08)+8*rise(p,.58,.64,.9,.98))*DEG;A.lean+=3*DEG*rise(p,.58,.64,.9,.98);
    A.eye.lx=.8*rise(p,.6,.62,.66,.68)-.8*rise(p,.68,.7,.74,.76);A.tap[1]=pls(p,.80,.05);A.tg.sw=Math.sin(TAU*p*2)*1.6;A.roll=.03*Math.sin(TAU*p/.22)*(dash?1:0)}
  else if(anim==='hit'){// COLPITO (only for the pages): the lid slams shut, it recoils with a roll, the limbs splay; back with a shiver
    const k=hitK(p);A.lid=p<.1?ramp(p,0,.05,A.lid,0):lerp(0,A.lid,D2(.1,.5,p));A.B[0]=-4*k;A.roll=6*DEG*k;A.lean=-.08*k;
    A.hands=A.hands.map((q,i)=>[q[0]-6*k,q[1]*(1+.12*k),q[2]+8*Math.max(0,k)]);A.feet=A.feet.map(q=>[q[0],q[1]*(1+.08*k),q[2]]);A.eye.sq=1-D2(.3,.42,p);
    A.B[1]=.6*Math.sin(p*90)*(1-D2(.1,.6,p))*D2(.08,.12,p)}
  else if(anim==='chomp'){// IL MORSO: wakes (tin .03 .10), the light runs along the straps of the lid to its teeth; crouches with the arms up
    // like a mantis and the lid wide open; lunges forward biting three times (.50 .58 .66); the last bite slams the lid down (.74), it tears
    // it away (.82), shakes it, settles
    wake(.03,.10);run('lid',.12,.35);A.lit.teeth=rise(p,.33,.38,.68,.76);A.spark=p>.38&&p<.46?(p-.38)/.08:-1;
    const prep=ez(cl(p/.45,0,1));A.hz=lerp(A.hz,P2?56:50,prep);A.eye.sq=.4*rise(p,.1,.3,.7,.8);A.glow=Math.max(A.glow,.55+.4*prep*(1-D2(.7,.8,p)));
    const up=rise(p,.05,.4,.45,.6);A.hands=[-1,1].map(sd=>lerp3(REST.hands[sd<0?0:1],[10,sd*46,124],up));A.fs=[up,up];A.fc=[.1*(1-up),.1*(1-up)];
    let L=lerp(A.lid/DEG,110,D2(.0,.40,p));
    if(p>=.45){const B=[[.45,110],[.50,8],[.54,70],[.58,8],[.62,70],[.66,8],[.72,10],[.80,6],[.84,30],[1,A.p2?25:11.5]];L=keys(B,p)}
    A.lid=L*DEG;
    const lunge=rise(p,.45,.5,.72,.76);A.lean=(15*lunge+30*rise(p,.72,.74,.8,.83))*DEG;A.hz-=6*rise(p,.72,.74,.8,.83);
    // rowing back with the arms in the lunge, scuttling legs
    if(p>=.45&&p<.8){const r=D2(.45,.7,p);A.hands=[-1,1].map((sd,i)=>{const ph=Math.sin((p-.45)*TAU*6+i*Math.PI);return[lerp(10,-6,r)+10*ph,sd*lerp(46,52,r),lerp(124,10,D2(.45,.6,p))+8*Math.max(0,ph)]});
      A.feet=[-1,1].map((sd,i)=>{const ph=Math.sin((p-.45)*TAU*7+i*Math.PI);return[-2+7*ph,sd*24,3*Math.max(0,ph)]})}
    if(p>=.8){const k=D2(.8,.95,p);A.hands=[-1,1].map((sd,i)=>lerp3([-6,sd*52,10],REST.hands[i],k))}
    A.roll=6*DEG*Math.sin((p-.85)*TAU*4)*rise(p,.85,.87,.93,.95);
    if(p>.72&&p<.8)A.dust=(p-.72)/.08;A.tg.len=lerp(A.tg.len,6,up)}
  else if(anim==='tongue'||anim==='tongue3'){// LA FRUSTATA: wakes, leans back with the lid wide open (100°) and the coiled tongue lighting
    // up from the root to the tip; then the tongue shoots out along the floor (.50) and whips (two waves, slaps at .60 and .70), rolls back in
    const t3=anim==='tongue3',hit0=t3?.40:.50;wake(.03,t3?.09:.10);A.tg.lit=D2(.2,hit0,p)*(1-D2(t3?.82:.76,t3?.9:.82,p));
    const back=rise(p,0,hit0-.04,hit0,hit0+.06);A.lean=-15*DEG*back+6*DEG*rise(p,hit0,hit0+.03,.75,.85);A.hz+=6*back;
    A.lid=keys([[0,A.lid/DEG],[hit0-.06,100],[t3?.80:.75,100],[t3?.9:.9,A.p2?25:11.5],[1,A.p2?25:11.5]],p)*DEG;A.glow=Math.max(A.glow,.6+.35*rise(p,.1,.3,.75,.9));
    A.hands=[-1,1].map((sd,i)=>[24-8*back,sd*(48+6*back),2]);A.eye.sq=.35*rise(p,.1,.3,hit0,hit0+.05);A.eye.wide=rise(p,hit0,hit0+.02,hit0+.1,hit0+.2);
    const reach=o.reach||150;
    if(p<hit0){A.tg.m='coil';A.tg.k=D2(0,hit0-.05,p)}
    else if(!t3){const out=D2(hit0,hit0+.025,p),inn=D2(.75,.9,p);A.tg.m='lash';A.tg.reach=reach*out*(1-inn);A.tg.wave=p<.75?(p-.53)/.22:-1;A.tg.slap=Math.max(pls(p,.60,.04),pls(p,.70,.04))}
    else{const F=o.fan||[-.45,0,.45],R=o.reach3||[reach,reach,reach],T=[.40,.56,.72];let j=0;for(let i=0;i<3;i++)if(p>=T[i])j=i;
      const u=p-T[j],out=D2(0,.03,u),lift=j<2?D2(.07,.16,u):0,inn=D2(.8,.92,p),ang=j<2?lerp(F[j],F[j+1],lift):F[2];
      A.tg.m='lash';A.tg.ang=ang;A.tg.reach=lerp(R[j],j<2?R[j+1]:R[2],lift)*out*(1-inn)*(1-.55*Math.sin(Math.PI*lift));A.tg.lift=Math.sin(Math.PI*lift)*18;A.tg.wave=u<.07?u/.07:-1;
      A.tg.slap=pls(u,.04,.03)}}
  else if(anim==='grab'){// L'ASSAGGIO, la presa: wakes, the light runs down the arms to the bracers and the claws; it crouches with the arms
    // wide and low like a hug (claws spread, lid at 30°, licking the rim), snaps them shut in front (.55–.62); missing, it scratches the
    // floor pulling the hands back and shakes them, annoyed
    wake(.03,.09);run('arms',.10,.35);A.lit.arms=rise(p,.33,.38,.6,.7);
    const prep=ez(cl(p/.5,0,1));A.hz=lerp(A.hz,P2?58:52,prep*(1-D2(.85,1,p)));A.lid=lerp(A.lid/DEG,30,prep*(1-D2(.8,1,p)))*DEG;
    if(p<.55)A.hands=[-1,1].map((sd,i)=>lerp3(REST.hands[i],[30,sd*70,20],prep));
    else if(p<.62){const k=D2(.55,.6,p);A.hands=[-1,1].map(sd=>lerp3([30,sd*70,20],[46,sd*4,14],k))}
    else if(p<.8){const k=D2(.62,.8,p);A.hands=[-1,1].map(sd=>lerp3([46,sd*4,14],[30,sd*36,2],k))}
    else{const k=D2(.8,.98,p),sh=6*Math.sin((p-.8)*TAU*5)*rise(p,.8,.82,.9,.92);A.hands=[-1,1].map((sd,i)=>add(lerp3([30,sd*36,2],REST.hands[i],k),[0,sd*sh,4*Math.abs(Math.sin((p-.8)*TAU*5))*rise(p,.8,.82,.9,.92)]))}
    A.fs=[prep*(1-D2(.55,.6,p)),prep*(1-D2(.55,.6,p))];A.fc=[D2(.55,.6,p)*(1-D2(.62,.7,p)),D2(.55,.6,p)*(1-D2(.62,.7,p))];
    if(p>=.2&&p<=.4){A.tg.m='lick';A.tg.k=(p-.2)/.2}A.lean=6*DEG*rise(p,.5,.56,.66,.8);
    if(p>.62&&p<.8&&!LOWFX)A.scratch=(p-.62)/.18}
  else if(anim==='gulp'){// L'ASSAGGIO, il boccone: the hands push the morsel in and the lid slams (Gnam!); three chews, swelling, happy
    // crescents; something is wrong: eyes wide, it swells; it spits (.75: lid at 120°, tongue out, recoil); disgusted, it shakes the lid
    const push=rise(p,0,.06,.1,.16);A.hands=[-1,1].map((sd,i)=>lerp3(REST.hands[i],[34,sd*10,40],push));A.hz-=4*rise(p,.06,.12,.6,.7);
    let L=keys([[0,60],[.1,0],[.16,2],[.2,15],[.24,0],[.29,15],[.33,0],[.42,15],[.46,0],[.55,2],[.72,4],[.75,120],[.86,60],[1,A.p2?25:11.5]],p);A.lid=L*DEG;
    const chew=Math.max(pls(p,.2,.1),pls(p,.33,.1),pls(p,.46,.1));A.sw=.06*chew+.12*rise(p,.55,.68,.72,.76);A.eye.hap=rise(p,.12,.16,.5,.55);A.eye.wide=rise(p,.55,.58,.7,.75);
    A.eye.sq=rise(p,.8,.84,.95,1);A.hop=chew;if(p>.12&&p<.55&&!LOWFX)A.popc=[.22,.35,.48].map(c=>p>c&&p<c+.12?(p-c)/.12:-1);
    A.B[0]=-8*rise(p,.74,.76,.82,.95);A.lean=-.12*rise(p,.74,.76,.8,.9);A.roll=8*DEG*Math.sin((p-.8)*TAU*4)*rise(p,.8,.83,.95,1);
    if(p>=.74){A.tg.m='out';A.tg.len=lerp(30,22,D2(.9,1,p))}A.glow=Math.max(A.glow,.4+.4*chew)}
  else if(anim==='coins'){// SPUTO D'ORO: wakes, all the seams and the keyhole light up gold and the coins rattle inside; up on tiptoe, swollen;
    // it heaves forward with the mouth wide open (.50) and a puff of coins (with o.p2 a fountain up too, .55); coughs the last one (.72),
    // licks the gold tooth, deflates
    wake(.03,.10);A.lit.seams=rise(p,.15,.25,.55,.7);const sw=rise(p,.1,.45,.5,.75);A.sw=.08*sw;A.hz+=8*rise(p,.1,.4,.5,.62);
    A.B[1]=p>.15&&p<.5?Math.sin(p*1.6*TAU*18)*1:0;A.lid=keys([[0,A.lid/DEG],[.45,25],[.52,100],[.66,90],[.78,30],[1,A.p2?25:11.5]],p)*DEG;
    A.lean=18*DEG*rise(p,.48,.52,.62,.7);A.glow=Math.max(A.glow,.55+.4*rise(p,.15,.3,.62,.72));A.coins=p>=.5&&p<.66?(p-.5)/.16:-1;if(A.p2)A.fount=p>=.55&&p<.8?(p-.55)/.25:-1;
    A.hic=p>=.7&&p<.86?(p-.7)/.16:-1;A.gt=rise(p,.8,.82,.88,.9);if(p>=.8&&p<=.9){A.tg.m='lick';A.tg.k=.5+.25*Math.sin((p-.8)*TAU*5)}
    A.hands=[-1,1].map((sd,i)=>[24+6*sw,sd*(48+6*sw),2])}
  else if(anim==='leap'){// LA TAGLIOLA, un balzo: crouches deep (knees click, anklets lit, arms back, lid 90°), flies leaning forward with
    // the mouth open toward the floor, legs dangling back and the arms open like the jaws of a trap; comes down mouth first (CLANG .95)
    // and bounces back into the crouch of the next leap. With o.last it stays planted (the start of 'stuck')
    const cr=rise(p,0,.15,.2,.3),air=p>=.2&&p<.93,u=cl((p-.2)/.73,0,1);A.lit.legs=rise(p,.02,.12,.22,.3);
    A.hz=lerp(A.hz,46,cr);A.lid=keys([[0,A.lid/DEG],[.18,90],[.3,100],[.9,100],[.95,4],[1,o.last?40:90]],p)*DEG;
    A.hands=[-1,1].map((sd,i)=>lerp3(REST.hands[i],[-14,sd*44,20],cr));
    if(air){const z=o.z!=null?0:80*Math.sin(Math.PI*u);A.B[2]+=z;A.lean=55*DEG*ez(cl(u/.6,0,1));A.fRel=1;A.hRel=1;
      A.feet=[-1,1].map(sd=>[-22,sd*20,ZB-40+6*Math.sin(u*TAU*2+sd)]);A.hands=[-1,1].map(sd=>[34,sd*40,ZB-6-14*Math.sin(Math.PI*u)])}
    if(p>=.93){const k=D2(.93,.95,p);if(o.last){Object.assign(A,stuckBase(A,P2));A.lean=lerp(75,110,k)*DEG}
      else{const b=D2(.95,1,p);A.lean=lerp(lerp(55,75,k),0,b)*DEG;A.hz=lerp(lerp(46,20,k),46,b);A.dust=(p-.93)/.07}}
    A.eye.sq=.3*cr}
  else if(anim==='stuck'){// INCASTRATO: the teeth in the floor, the chest pitched over with its bottom up; the gold light makes a pool on the
    // floor and a few coins escape; the legs kick in the air, the arms lever with the elbows up; it tears free (.80) with a shower of
    // splinters, shakes and stands
    const free=D2(.8,.9,p);Object.assign(A,stuckBase(A,P2));const kick=Math.sin(p*TAU*2);
    A.feet=[-1,1].map((sd,i)=>[-6+10*(i?kick:-kick),sd*20,ZB-46+8*(i?-kick:kick)]);A.fRel=1;
    A.hands=[-1,1].map(sd=>[30,sd*54,2]);A.pool=1-free;A.esc=p<.8?(p*3)%1:-1;
    if(p>=.8){const b=D2(.8,.95,p);A.lean=lerp(110,0,b)*DEG;A.hz=lerp(7,P2?66:60,b);A.lid=lerp(40,P2?25:11.5,b)*DEG;A.fRel=b<.5?1:0;
      if(!A.fRel)A.feet=REST.feet.map(q=>q.slice());A.roll=5*DEG*Math.sin((p-.85)*TAU*3)*rise(p,.85,.88,.96,1);A.splint=(p-.8)/.2}}
  else if(anim==='hide'||anim==='chest'||anim==='pop'){// IL GIOCO DELLE CASSE: the legs fold under, the arms are sucked into the holes,
    // the medallions close, the chest sits down with a thud, the eyes go out like embers and the lid shuts (hide); the closed chest (chest);
    // everything springs out at once with a hop (pop)
    let leg=1,arm=1,sit=0,eyes=1,lid=A.lid/DEG;
    if(anim==='hide'){leg=1-D2(0,.3,p);arm=1-D2(.1,.45,p);sit=.8*D2(0,.3,p)+.2*D2(.42,.5,p);eyes=1-D2(.55,.7,p);lid=lerp(lid,0,D2(.5,.6,p))}
    else if(anim==='chest'){leg=0;arm=0;sit=1;eyes=0;lid=0}
    else{const k=D2(0,.3,p);leg=k;arm=k;sit=1-D2(0,.3,p);eyes=D2(.05,.2,p);lid=keys([[0,0],[.25,60],[.6,30],[1,A.p2?25:11.5]],p);A.B[2]+=10*rise(p,.3,.4,.4,.8)}
    A.legK=leg;A.armK=arm;A.med=[arm>0?Math.max(arm,anim==='pop'?D2(0,.15,p):0):0,arm>0?Math.max(arm,anim==='pop'?D2(0,.15,p):0):0];A.hz=lerp(A.hz,0,sit);A.lid=lid*DEG;
    A.eye.on=eyes;A.eye.o=eyes;A.glow*=eyes;A.tg.len*=eyes;if(eyes<.05)A.tg.m='none';
    if(anim!=='pop'){const k2=anim==='chest'?0:1-D2(.5,.7,p);A.k2*=k2;A.key*=k2;A.crack*=k2;A.jg*=k2;A.teethOut*=k2}
    if(anim==='chest'||anim==='hide'&&p>=.7)A.chest=1;if(anim==='hide'&&p>.48&&p<.6)A.dust=(p-.48)/.12;
    if(A.chest)chestOpts(A,o,p)}
  else if(anim==='daze'){// STORDITO: up but limp; the chest sways in a circle, the knees give a little, the lid hangs open with the gold
    // light, the tongue hangs to one side, the pupils spin, stars turn over the lid
    A.roll=6*DEG*Math.sin(TAU*p);A.lean=6*DEG*Math.cos(TAU*p);A.hz-=4+2*Math.sin(TAU*p*2);A.lid=60*DEG;A.tg.m='out';A.tg.len=26;A.tg.sw=1.5;A.tg.side=1;
    A.eye.spin=p;A.stars=1;A.starP=p;A.glow=.8;A.fc=[.5,.5]}
  else if(anim==='rage'){// HA FAME! (second phase): freezes and trembles, the coins rattle, the seams flicker; rises with the arms high and
    // wide; the lock plate cracks (.47) and the keyhole opens like an eyelid (.50–.58): it was an eye, it looks around (.58–.62); the lid
    // opens to 120° creaking, the light turns orange and the eyes red (.60–.75); a roar inside the chest, the lid slams three times, a
    // fountain of coins, the hands slam the floor (.78, .86); the new pose
    A.p2=true;A.k2=D2(.6,.75,p);A.hz=lerp(60,66,D2(.2,.45,p));const tr=p<.2?1:0;A.B[0]=tr*1.5*Math.sin(p*2.4*TAU*12);A.B[1]=tr*1.5*Math.cos(p*2.4*TAU*12);
    A.lit.seams=rise(p,0,.05,.18,.22)*(.5+.5*Math.sin(p*2.4*TAU*8));const up=rise(p,.2,.45,.74,.8);A.hands=[-1,1].map((sd,i)=>{const sl=Math.max(pls(p,.78,.05),pls(p,.86,.05));
      return add(lerp3(REST.hands[i],[14,sd*62,118],up),[0,0,-4*sl])});A.fs=[up,up];
    A.crack=D2(.47,.49,p);A.key=D2(.5,.58,p);A.keyL=p>.58&&p<.62?Math.sin((p-.58)/.04*TAU):0;
    A.lid=keys([[0,11.5],[.6,15],[.75,120],[.78,40],[.81,120],[.84,40],[.87,120],[.95,60],[1,25]],p)*DEG;A.glow=.6+.4*rise(p,.6,.7,.9,1);A.jg=D2(.6,.75,p);
    A.fount=p>=.76&&p<.98?(p-.76)/.22:-1;A.eye.sq=.3*rise(p,.0,.05,.4,.5);A.eye.wide=rise(p,.58,.62,.9,.95);A.teethOut=A.k2*.6;A.tg.m=p>.6?'out':'hang';A.tg.len=lerp(22,30,A.k2)}
  else if(anim==='taunt'){// PRESA IN GIRO, i denti a molla: up on its legs with the hands in front; the lid chatters six times very fast
    // (clac-clac-clac), three hops on the spot, the claws rub like a miser counting coins, the gold tooth glints; licks the whole rim;
    // a hiccup and a coin jumps out (.82)
    const up=rise(p,0,.12,.88,1);A.hz+=6*up;A.hands=[-1,1].map((sd,i)=>{const rub=Math.sin(p*TAU*8)*3*rise(p,.12,.2,.55,.6);return lerp3(REST.hands[i],[34,sd*(28+rub),44],up)});A.fc=[.5*up,.5*up];
    const ch=p>=.12&&p<.6?Math.abs(Math.sin((p-.12)/.48*6*Math.PI)):0;A.lid=lerp(A.lid/DEG,50*ch,rise(p,.1,.12,.58,.62))*DEG;A.B[2]+=4*Math.abs(Math.sin((p-.12)/.48*3*Math.PI))*rise(p,.12,.14,.58,.6);
    A.gt=rise(p,.2,.25,.5,.55);if(p>=.6&&p<=.8){A.tg.m='lick';A.tg.k=(p-.6)/.2}A.hic=p>=.82&&p<.98?(p-.82)/.16:-1;A.B[2]+=2*pls(p,.82,.04);A.eye.hap=rise(p,.12,.18,.55,.6)}
  else if(anim==='lure'){// L'ESCA: lowers itself, opens the lid a little and lets the gold light out on the floor; the middle finger of the
    // near hand rises and curls twice («come here»), the coins tinkle; closes with a sly sway
    const lo=rise(p,0,.25,.75,1);A.hz=lerp(A.hz,P2?58:52,lo);A.lid=lerp(A.lid/DEG,20,lo)*DEG;A.pool=.6*lo;A.glow=Math.max(A.glow,.55+.35*lo);
    A.beck=p>=.25&&p<.75?(p-.25)/.5:-1;A.roll=5*DEG*Math.sin((p-.75)*TAU*2)*rise(p,.75,.8,.92,1);A.B[1]=.4*Math.sin(p*TAU*20)*rise(p,.3,.35,.7,.75)}
  else if(anim==='enter'){// ENTRATA: the closed chest leaps back (.00–.10), shakes harder and harder with the lid jumping; two amber eyes in
    // the slit (.14), a drop of drool and the tips of the teeth (.18); the legs come out and it rises in three jerks (.25 .33 .41); the
    // medallions open (.46 .53) and the arms unroll with clicking joints, the fingers drum (.60); the lid opens to 110° with a long creak,
    // the cobwebs tear, the tongue licks the rim (.70–.80); it slams its hands on the floor (.82) and screams (.84–.94); the rest pose
    const jump=rise(p,0,.05,.05,.1);A.B[2]=14*Math.sin(Math.PI*cl(p/.1,0,1));A.web=p<.66?1:0;
    const sh=p>=.1&&p<.22?(2+2*D2(.1,.22,p))*Math.sin(p*2.8*TAU*14):0;A.B[1]=sh;
    const lift=keys([[.22,0],[.25,20],[.31,20],[.33,40],[.39,40],[.41,60],[1,60]],cl(p,.22,1));A.hz=p<.22?0:lift;A.legK=p<.22?0:D2(.22,.26,p);
    const am=[D2(.46,.56,p),D2(.53,.62,p)];A.armK=Math.max(am[0],am[1]);A.armKs=am;A.med=[D2(.45,.48,p),D2(.52,.55,p)];
    A.eye.on=D2(.13,.16,p);A.eye.o=A.eye.on;A.glow=.2+.5*D2(.14,.3,p)+.3*rise(p,.62,.72,.9,1);A.tg.m=p<.66?'none':p<.7?'hang':p<.8?'lick':'hang';A.tg.k=(p-.7)/.1;A.drip=p>.17&&p<.3?(p-.17)/.13:-1;
    let L=p<.1?0:p<.22?(2+4*D2(.1,.22,p))*Math.abs(Math.sin(p*2.8*TAU*7)):p<.62?6:keys([[.62,6],[.72,110],[.84,110],[.86,40],[.88,110],[.9,40],[.92,110],[1,11.5]],p);A.lid=L*DEG;
    A.hands=[-1,1].map((sd,i)=>{const slam=pls(p,.82,.04);return add(REST.hands[i],[0,0,10*rise(p,.76,.8,.81,.83)-2*slam])});A.tap=[pls(p,.6,.03),pls(p,.62,.03),pls(p,.64,.03)];
    A.lean=8*DEG*rise(p,.84,.86,.92,.94);A.eye.wide=rise(p,.84,.86,.92,.94);if(p<.22)A.chest=1;A.teethTip=D2(.17,.2,p)}
  else if(anim==='die'){// SCONFITTA: staggers back with the lid slamming (.05 .12); the legs fold one after the other like a folding chair
    // (.25 the right, .32 the left) and it sits down with a thud (.40); the arms are sucked into the holes (.45–.65), the eyes go out with
    // two puffs of smoke (.60); the lid jumps off with a «boing» (.65, the high moment), turns in the air and falls behind (.80); a fountain
    // of coins; the tongue falls limp on the rim (.70); an old empty chest that fades (.85–1)
    A.B[0]=-6*rise(p,0,.1,.2,.4);A.lean=-.12*rise(p,0,.1,.2,.4);A.lid=keys([[0,11.5],[.03,40],[.05,0],[.09,40],[.12,0],[.2,20],[.6,20],[.65,20]],cl(p,0,.65))*DEG;
    const lr=D2(.22,.28,p),ll=D2(.29,.35,p);A.legKs=[1-ll,1-lr];A.legK=Math.max(1-lr,1-ll);A.roll=8*DEG*(lr-ll)*(1-D2(.38,.42,p));A.hz=p<.36?lerp(60,40,(lr+ll)/2):lerp(40,0,D2(.36,.4,p));
    const am=[1-D2(.45,.55,p),1-D2(.5,.6,p)];A.armKs=am;A.armK=Math.max(am[0],am[1]);A.med=am.slice();A.eye.on=1-D2(.58,.6,p);A.eye.o=A.eye.on;A.smoke=p>=.6&&p<.8?(p-.6)/.2:-1;
    A.off=p>=.65?D2(.65,.8,p):-1;A.fount=p>=.65&&p<.95?(p-.65)/.3:-1;A.glow=p<.65?.55:.9*(1-D2(.8,1,p));A.tg.m=p<.7?'hang':'limp';A.tg.len=p<.7?22:14;
    A.fade=1-D2(.85,1,p);if(p>.38&&p<.5)A.dust=(p-.38)/.12;A.k2=A.p2?(1-D2(.55,.62,p)):0;A.key=A.p2?1-D2(.58,.62,p):0}
  else{// FERMO: planted on its four limbs like a piece of furniture; the lid breathes like a bellows and the gold breathes with it; the eyes
    // look left (.10–.25) and right (.35–.50), then stay on you; the tongue licks the rim (.30–.45); the right fingers drum (.15 .20 .25); a
    // dry jerk and the clac of the lid (.62, its blink); the head on one side like a curious dog (.70–.90)
    const br=.5-.5*Math.cos(TAU*p);A.lid=(P2?25+3*Math.sin(TAU*p):lerp(8,15,br))*DEG;const cl2=pls(p,.62,.05);A.lid*=1-cl2;A.B[2]+=2*pls(p,.62,.03);
    A.glow=(P2?.7:.42)+.25*br;A.eye.lx=-rise(p,.08,.12,.23,.27)+rise(p,.33,.37,.48,.52);A.eye.o=1-.6*cl2;
    if(!P2&&p>=.30&&p<=.45){A.tg.m='lick';A.tg.k=(p-.30)/.15}A.tg.sw=Math.sin(TAU*p*2);
    A.tap=[pls(p,.15,.04),pls(p,.20,.04),pls(p,.25,.04)];A.roll=4*DEG*rise(p,.70,.76,.84,.90);A.keyL=Math.sin(TAU*p*2)*.7;A.jg=P2?.45+.4*br:0;
    A.drip=(p*2)%1}
  if(o.p2&&anim!=='rage'&&anim!=='chest'&&anim!=='hide')A.p2=true;
  return A}
// the pitched over pose of the Trap (the start of 'stuck'): its bottom up, the mouth in the floor
function stuckBase(A,P2){return{lean:110*DEG,hz:7,lid:40*DEG,fRel:1,feet:[[-6,-20,ZB-46],[-6,20,ZB-46]],hands:[[30,-54,2],[30,54,2]],pool:1,eye:Object.assign({},A.eye,{wide:.6})}}
// the options of the closed chest (the twin chests and the fakes of the game of the chests)
function chestOpts(A,o,p){A.web=1;A.tg.m='none';A.eye.on=0;A.glow=0;
  if(o.shake){const k=cl(o.shake,0,1),t=k*1.1;A.B[1]+=(1+k*3)*Math.sin(t*(30+t*30));A.lid=(2+5*k)*Math.abs(Math.sin(t*22))*DEG;A.esc=k>.3&&k<.55?(k-.3)/.25:-1;
    if(k>.6){A.eye.on=D2(.6,.75,k);A.eye.o=A.eye.on*.6}A.teethTip=D2(.5,.8,k)}
  if(o.lid!=null){A.lid=o.lid*110*DEG}if(o.gold!=null)A.glow=o.gold*.9;if(o.good)A.good=1;
  if(o.slide)A.roll=6*DEG*cl(o.slide,-1,1);if(o.real){A.eye.on=Math.max(A.eye.on,o.real);A.eye.o=A.eye.on;A.lid+=2*DEG*o.real;if(o.p2)A.eyeRed=1}
  if(o.breath)A.lid+=2*DEG*o.breath}

// ------------------------------------------------------------------ helpers of the drawing
const DIRS=[[1,0,0],[0,1,0],[-1,0,0],[0,-1,0]];
// a closed path of many little round marks (one fill)
const dots=(pts,r)=>{ctx.beginPath();for(const q of pts){ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU)}};
// the pearl of light that runs along a path (the signal): a soft glow and a white core at the fraction k of the screen polyline
function pearl(pts,k,a,K){if(!pts||pts.length<2||a<=0)return;let L=0;const S=[0];for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);S.push(L)}
  const d=k*L;let i=1;while(i<pts.length-1&&S[i]<d)i++;const u=(d-S[i-1])/Math.max(1e-6,S[i]-S[i-1]),q=[lerp(pts[i-1][0],pts[i][0],u),lerp(pts[i-1][1],pts[i][1],u)];
  if(!LOWFX)shine(K.inner,q[0],q[1],9,.75*a);ctx.fillStyle=`rgba(255,250,220,${.95*a})`;ball(q,1.7);ctx.fill()}

// ------------------------------------------------------------------ THE MODEL
function mimic2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const A=mPose(anim,p,o);
  if(A.fade<.99){if(A.fade<=.01)return;fadeDraw(()=>body(x,y,face,anim,p,sc,o,A),[x,y-70*sc],120*sc,A.fade);return}
  body(x,y,face,anim,p,sc,o,A)}
function body(x,y,face,anim,p,sc,o,A){const V0=V(face),{P,D,F}=V0,fx=fxOn(o),K=pal(A.k2),Bz=A.B[2]+(A.hz-60)+(o.z||0);
  const X=frame({lean:A.lean,roll:A.roll,yaw:A.yaw,s:A.s,B:[A.B[0],A.B[1],Bz]},ZC),CT=X.T,CP=q=>P(CT(q)),Fv=n=>F(X.Rd(n));
  const dX=DX*(1+A.sw),dY=DY*(1+A.sw),th=A.lid;
  // its shadow: an ellipse under the chest, darker where the feet stand (smaller and fainter as it rises)
  if(o.shadow!==false&&!(typeof noShadow!=='undefined'&&noShadow)){const c=CT([0,0,ZB]),lift=cl(Math.max(0,c[2]-A.hz)/120,0,.6),q=P([c[0],c[1],0]),k=1-lift*.6;
    ctx.save();ctx.fillStyle=`rgba(0,0,0,${(.34*(1-lift)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(x+q[0]*sc,y+q[1]*sc,24*sc*k*(1+A.sw),10*sc*k,0,0,TAU);ctx.fill();
    if(A.legK>.3&&lift<.2){ctx.fillStyle='rgba(0,0,0,.16)';for(const f of A.feet){const fq=P(A.fRel?CT(f):f);if((A.fRel?CT(f):f)[2]<6){ctx.beginPath();ctx.ellipse(x+fq[0]*sc,y+fq[1]*sc,7*sc,3*sc,0,0,TAU);ctx.fill()}}}ctx.restore()}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const L=parts(),dC=D(CT([0,0,ZC]));
  // the lid: a point of the lid (lx from the hinge to the front edge, ly across, lz up) in the chest's frame; flying off in the defeat
  const LL=2*dX,top=lx=>LT+LA*Math.sqrt(Math.max(0,1-((lx-LL/2)/(LL/2))**2)),c0=Math.cos(th),s0=Math.sin(th);
  let LP,LRd;
  // (it lands on the floor behind it: the floor is at 60 − hz in the chest's frame)
  if(A.off>=0){const k=A.off,ang=th+ez(k)*(TAU-th),ca=Math.cos(ang),sa=Math.sin(ang),hc=[-dX-34*k,0,lerp(ZT,ZB-A.hz,k)+60*Math.sin(Math.PI*k)],
      cx=LL/2,cz=LT;LP=(lx,ly,lz)=>{const qx=lx-cx,qz=lz-cz;return[hc[0]+qx*ca-qz*sa,ly,hc[2]+qx*sa+qz*ca+cz]};LRd=v=>X.Rd([v[0]*ca-v[2]*sa,v[1],v[0]*sa+v[2]*ca])}
  else{LP=(lx,ly,lz)=>[-dX+lx*c0-lz*s0,ly,ZT+lx*s0+lz*c0];LRd=v=>X.Rd([v[0]*c0-v[2]*s0,v[1],v[0]*s0+v[2]*c0])}
  const LS=(lx,ly,lz)=>P(CT(LP(lx,ly,lz)));
  const upF=Fv([0,0,1]),open=th>1.5*DEG||A.off>=0,botF=Fv([0,0,-1]);
  // the order of the pieces: decided by the rest pose (far leg and arm, chest, the inside, lid, near arm and leg, tongue); when the chest is
  // pitched over (its opening facing away) the lid goes behind it, the legs (on its bottom, now up) in front
  const sideF=sd=>Fv([0,sd,0]),flip=upF<-.05;
  const order={farLeg:0,farArm:1,chest:2,inside:3,lid:4,nearArm:5,nearLeg:6};
  if(flip){order.lid=D(CT(LP(LL/2,0,LT)))<dC?1.5:4;order.farLeg=3.6;order.nearLeg=6}
  const near=sideF(1)>=sideF(-1)?1:-1;
  // ---- the legs
  for(const sd of[-1,1]){const i=sd<0?0:1,k=A.legKs?A.legKs[i]:A.legK;if(k<.04)continue;
    L.add(dC+((sd===near?order.nearLeg:order.farLeg)-3)*30,()=>legDraw(V0,X,A,K,sd,i,k))}
  // ---- the arms
  for(const sd of[-1,1]){const i=sd<0?0:1,k=A.armKs?A.armKs[i]:A.armK;if(k<.04)continue;
    L.add(dC+((sd===near?order.nearArm:order.farArm)-3)*30,()=>armDraw(V0,X,A,K,sd,i,k,dY,fx))}
  // ---- the chest, the inside, the lid
  L.add(dC+(order.chest-3)*30,()=>chestDraw(V0,X,A,K,dX,dY,fx,o));
  if(open&&upF>.02&&!A.good||A.good&&open)L.add(dC+(order.inside-3)*30,()=>insideDraw(V0,X,A,K,dX,dY,fx,LS));
  L.add(dC+(order.lid-3)*30,()=>lidDraw(V0,X,A,K,dX,dY,LL,top,LP,LRd,LS,fx));
  // ---- the tongue (in front; lying on the floor behind the chest when it looks away)
  if(A.tg.m!=='none'&&A.tg.m!=='coil'&&!A.good){const T=tonguePts(A,dX,dY,X);if(T){const mid=T.pts[Math.floor(T.pts.length/2)],behind=A.tg.m==='lash'?D(mid)<dC-12:Fv([1,0,0])<0;
    L.add(dC+(behind?-75:120),()=>tongueDraw(V0,T,A,K,fx))}}
  // ---- the coins it spits, its fountain, the hiccup, the escaping coins; the stars; the cobwebs
  if(fx&&(A.coins>=0||A.fount>=0||A.hic>=0||A.esc>=0||A.popc))L.add(dC+200,()=>coinsDraw(V0,X,A,K,dX))
  run(L);
  if(A.stars>0){const q=CP([0,0,ZT+30]);for(let i=0;i<3;i++){const an=(A.starP||0)*TAU+i*TAU/3;C.starS(q[0]+Math.cos(an)*17,q[1]+Math.sin(an)*6,3.4,A.stars)}}
  if(A.smoke>=0&&fx)for(const sd of[-1,1]){const q=CP([12,sd*9,99+A.smoke*14]);ctx.fillStyle=`rgba(90,84,80,${(.5*(1-A.smoke)).toFixed(3)})`;ball(q,2+A.smoke*5);ctx.fill()}
  if(A.dust>=0&&A.dust<1&&fx)K3.dust(V0,[A.B[0]+(A.lean>0?24:0),A.B[1],0],A.dust,8,26,'196,184,160',.45);
  if(A.splint>=0&&A.splint<1&&fx){const k=A.splint;for(let i=0;i<7;i++){const a=i*.9+.3,q=CP([24+Math.cos(a)*20*k,Math.sin(a)*26*k,4+30*Math.sin(Math.PI*Math.min(1,k*1.2))*(.6+.4*Math.cos(i))]);
    ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(a+k*8);ctx.globalAlpha*=1-k;ctx.fillStyle=i%3?K.wood.b:'#8a8478';ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.fillRect(-3,-1,6,2);ctx.strokeRect(-3,-1,6,2);ctx.restore()}}
  ctx.restore()}

// ------------------------------------------------------------------ THE CHEST
function chestDraw(V0,X,A,K,dX,dY,fx,o){const{P,F}=V0,CT=X.T,CP=q=>P(CT(q)),W={0:2*dY,1:2*dX,2:2*dY,3:2*dX};
  const FC=[{k:0,n:[1,0,0],a:[dX,-dY],b:[dX,dY]},{k:1,n:[0,1,0],a:[dX,dY],b:[-dX,dY]},{k:2,n:[-1,0,0],a:[-dX,dY],b:[-dX,-dY]},{k:3,n:[0,-1,0],a:[-dX,-dY],b:[dX,-dY]}];
  const fp=(f,u,z,out)=>{const q=[lerp(f.a[0],f.b[0],u),lerp(f.a[1],f.b[1],u),z];if(out){q[0]+=f.n[0]*out;q[1]+=f.n[1]*out}return CT(q)};
  const fs=(f,u,z,out)=>P(fp(f,u,z,out));
  const corners=[];for(const z of[ZB,ZT])for(const[cx,cy] of[[dX,-dY],[dX,dY],[-dX,dY],[-dX,-dY]])corners.push(CP([cx,cy,z]));const H=chull(corners);
  // the faces we see, three tones (the light from the upper left), darker toward the bottom
  const vis=FC.map(f=>F(X.Rd(f.n))>.015);
  ctx.lineJoin='round';
  // the bottom (only when it is pitched over: two holes where the legs go in, planks)
  if(F(X.Rd([0,0,-1]))>.02){const b=[[dX,-dY],[-dX,-dY],[-dX,dY],[dX,dY]].map(c=>CP([c[0],c[1],ZB]));poly(b);ctx.fillStyle=softBox(bbox(b),tone(K.wood,.25),.08,.3);ctx.fill();
    ctx.strokeStyle=K.joint;ctx.lineWidth=1.1;ctx.beginPath();for(const xx of[-dX/3,dX/3]){const a=CP([xx,-dY+1,ZB]),c=CP([xx,dY-1,ZB]);ctx.moveTo(a[0],a[1]);ctx.lineTo(c[0],c[1])}ctx.stroke();
    ctx.fillStyle='#1a0c06';for(const sd of[-1,1]){const q=CP([-6,sd*15,ZB]);ctx.beginPath();ctx.ellipse(q[0],q[1],4.5,3,0,0,TAU);ctx.fill()}}
  for(const f of FC){if(!vis[f.k])continue;const pts=[fs(f,0,ZB),fs(f,1,ZB),fs(f,1,ZT),fs(f,0,ZT)],nW=X.Rd(f.n),lt=lit(V0,nW);
    poly(pts);ctx.fillStyle=softBox(bbox(pts),tone(K.wood,.15+.8*lt),.1,.22);ctx.fill();
    const g0=fs(f,.5,(ZB+ZT)/2),g1=fs(f,.5,ZB),gr=ctx.createLinearGradient(g0[0],g0[1],g1[0],g1[1]);gr.addColorStop(0,'rgba(24,8,2,0)');gr.addColorStop(1,'rgba(24,8,2,.4)');ctx.fillStyle=gr;ctx.fill();
    f.pts=pts;f.lt=lt}
  // planks: the seams at 72 and 84, the grain, the crack on the front, the rotten patches; the seams glow in the second phase or before the
  // Spit of Gold
  {const S=new Path2D(),G2=new Path2D();for(const f of FC){if(!vis[f.k])continue;for(const z of[72,84]){const a=fs(f,.02,z),b=fs(f,.98,z+(f.k%2?.4:-.3));S.moveTo(a[0],a[1]);S.lineTo(b[0],b[1])}
      for(let j=0;j<3;j++){const z0=ZB+6+j*12;for(let g=0;g<2;g++){const u0=.08+g*.45+.05*j,a=fs(f,u0,z0+(g?2:-2)),b=fs(f,u0+.3,z0+(g?2.6:-1.2)),m=fs(f,u0+.15,z0+(g?1.2:-2.6));G2.moveTo(a[0],a[1]);G2.quadraticCurveTo(m[0],m[1],b[0],b[1])}}}
    ctx.strokeStyle=K.grain;ctx.lineWidth=.8;ctx.stroke(G2);ctx.strokeStyle=K.joint;ctx.lineWidth=1.25;ctx.lineCap='round';ctx.stroke(S);
    const sg=Math.max(A.lit.seams||0,A.jg||0);if(sg>.02&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${A.k2>.5?'255,138,58':'255,200,90'},${(.75*sg).toFixed(3)})`;ctx.lineWidth=1.6;ctx.stroke(S);ctx.restore()}}
  if(vis[0]){const f=FC[0],c=[fs(f,.17,95.4),fs(f,.22,91),fs(f,.16,87.5),fs(f,.2,85)];strokeRuns([c],K.joint,1.1);
    ctx.fillStyle=K.rot;ctx.globalAlpha*=.55;for(const[u,z,rx,ry] of[[.26,64.5,5,2],[.8,66,3.5,1.6]]){const q=fs(f,u,z);ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill()}ctx.globalAlpha/=.55}
  if(vis[1]){const q=fs(FC[1],.6,65);ctx.fillStyle=K.rot;ctx.globalAlpha*=.5;ctx.beginPath();ctx.ellipse(q[0],q[1],4,1.7,0,0,TAU);ctx.fill();ctx.globalAlpha/=.5}
  // the brass: two straps up each face, the band round the bottom, the eight corner brackets, the studs every 8
  for(const f of FC){if(!vis[f.k])continue;const Wf=W[f.k],hw=2.5/Wf,us=f.k%2?[.5-12/Wf,.5+12/Wf]:[.5-16/Wf,.5+16/Wf],BR=new Path2D(),HL=new Path2D(),ST=[];
    for(const u of us){const q=[fs(f,u-hw,ZB,.5),fs(f,u+hw,ZB,.5),fs(f,u+hw,ZT,.5),fs(f,u-hw,ZT,.5)];BR.moveTo(q[0][0],q[0][1]);for(const c of q)BR.lineTo(c[0],c[1]);BR.closePath();
      const h0=fs(f,u-hw*.5,ZB+1,.6),h1=fs(f,u-hw*.5,ZT-1,.6);HL.moveTo(h0[0],h0[1]);HL.lineTo(h1[0],h1[1]);for(let z=ZB+8;z<ZT-2;z+=8)ST.push(fs(f,u,z,.7))}
    {const q=[fs(f,0,ZB,.5),fs(f,1,ZB,.5),fs(f,1,ZB+4,.5),fs(f,0,ZB+4,.5)];BR.moveTo(q[0][0],q[0][1]);for(const c of q)BR.lineTo(c[0],c[1]);BR.closePath();const h0=fs(f,.04,ZB+3.4,.6),h1=fs(f,.96,ZB+3.4,.6);HL.moveTo(h0[0],h0[1]);HL.lineTo(h1[0],h1[1]);
      for(let s=8;s<Wf-4;s+=8)ST.push(fs(f,s/Wf,ZB+2,.7))}
    // the corner brackets: a rounded triangle at each corner of the face, a stud in it
    for(const[u0,z0,du,dz] of[[0,ZT,1,-1],[1,ZT,-1,-1],[0,ZB,1,1],[1,ZB,-1,1]]){const c=fs(f,u0,z0,.6),a=fs(f,u0+du*9/Wf,z0,.6),b=fs(f,u0,z0+dz*9,.6),m=fs(f,u0+du*4/Wf,z0+dz*4,.6);
      BR.moveTo(c[0],c[1]);BR.lineTo(a[0],a[1]);BR.quadraticCurveTo(m[0],m[1],b[0],b[1]);BR.closePath();ST.push(fs(f,u0+du*3/Wf,z0+dz*3,.8))}
    ctx.fillStyle=tone(K.brass,.2+.75*f.lt);ctx.fill(BR);ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke(BR);ctx.strokeStyle=K.brass.l;ctx.lineWidth=.7;ctx.stroke(HL);
    ctx.fillStyle=K.stud;dots(ST,1.15);ctx.fill();ctx.strokeStyle='rgba(90,60,20,.85)';ctx.lineWidth=.55;ctx.stroke();
    if(!LOWFX&&f.k===0){ctx.fillStyle=K.verd;ctx.globalAlpha*=.7;dots([fs(f,us[0],ZB+21,.8),fs(f,us[1]+.02,ZB+5,.8)],.9);ctx.fill();ctx.globalAlpha/=.7}}
  // the shadow under the edge of the lid on the front (the lid nearly closed)
  if(vis[0]&&A.lid<30*DEG&&A.off<0){const f=FC[0],a=fs(f,.5,ZT),b=fs(f,.5,ZT-5),g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,'rgba(12,4,2,.45)');g.addColorStop(1,'rgba(12,4,2,0)');
    poly([fs(f,0,ZT),fs(f,1,ZT),fs(f,1,ZT-5),fs(f,0,ZT-5)]);ctx.fillStyle=g;ctx.fill()}
  // the lock plate (its «nose»): a brass shield, the keyhole with the warm point of the sleeping treasure; in the second phase the keyhole
  // is an eye
  if(vis[0])lockDraw(V0,X,A,K,FC[0],fs);
  // the medallions over the shoulder holes: closed, two big studs; when the arms come out they open like little doors hinged at the top
  for(const f of[FC[1],FC[3]]){if(!vis[f.k])continue;const sd=f.k===1?1:-1,i=sd<0?0:1,m=A.med[i]||0,c=[0,sd*dY,84],n=[0,sd,0];
    if(m>.02){ctx.fillStyle='#160904';disc3(V0,CT(add(c,[0,sd*.3,0])),X.Rd(n),5.2);ctx.fill();
      if(!LOWFX){ctx.fillStyle=tone(K.wood,.9);ctx.beginPath();for(let j=0;j<5;j++){const a=j/5*TAU+.4,q0=CP(add(c,[Math.cos(a)*5.2,sd*.4,Math.sin(a)*5.2])),q1=CP(add(c,[Math.cos(a+.18)*7.4,sd*.6,Math.sin(a+.18)*7.4])),q2=CP(add(c,[Math.cos(a+.35)*5.2,sd*.4,Math.sin(a+.35)*5.2]));ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1])}ctx.fill()}}
    // the little door: turns out round the hinge on its top edge
    const ang=m*100*DEG,hinge=add(c,[0,sd*.8,6.5]),nr=[0,sd*Math.cos(ang),Math.sin(ang)],dn=[0,sd*Math.sin(ang),-Math.cos(ang)],cc=add(hinge,mul(dn,6.5));
    const fv=F(X.Rd(nr)),pts=disc3(V0,CT(cc),X.Rd(nr),6.5,{N:18});ctx.fillStyle=fv>0?grad3(bbox(pts),K.brass):K.brass.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
    if(fv>0){ctx.strokeStyle=K.brass.d;ctx.lineWidth=.9;disc3(V0,CT(add(cc,mul(nr,.3))),X.Rd(nr),4.2,{N:14});ctx.stroke();const q=P(CT(add(cc,mul(nr,.6))));ctx.fillStyle=K.stud;ball(q,1.5);ctx.fill();ctx.strokeStyle='rgba(90,60,20,.85)';ctx.lineWidth=.6;ctx.stroke()}}
  // the material of the place along the bottom band (the Mimic dressed as a chest of that crypt)
  if(o.mat&&KMAT[o.mat])matDraw(V0,X,FC,vis,fs,o.mat,A);
  // the outline, the edges between two faces we see, the warm rim
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();
  ctx.beginPath();for(let k=0;k<4;k++)if(vis[k]&&vis[(k+1)%4]){const c=FC[k].b,a=CP([c[0],c[1],ZB]),b=CP([c[0],c[1],ZT]);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();
  rimPoly(H,.24);
  // the cobwebs on the two top back corners (once it opens wide they are torn: two threads)
  if(!LOWFX&&F(X.Rd([-1,0,0]))>-.2)websDraw(V0,X,A,K,dX,dY)}

function lockDraw(V0,X,A,K,f,fs){const U=y=>(y-f.a[1])/(f.b[1]-f.a[1]);
  const sh=[[-8,88],[8,88],[8,76],[0,70],[-8,76]].map(([y,z])=>fs(f,U(y),z,.9));ctx.lineJoin='round';poly(sh);ctx.fillStyle=grad3(bbox(sh),K.brass);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
  {const a=fs(f,U(-6.5),86.6,1),b=fs(f,U(6.5),86.6,1);ctx.strokeStyle=K.brass.l;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  ctx.fillStyle=K.stud;dots([fs(f,U(-5.5),85,1),fs(f,U(5.5),85,1),fs(f,U(0),72.6,1)],.9);ctx.fill();
  if(A.crack>.02){ctx.save();ctx.globalAlpha*=A.crack;strokeRuns([[fs(f,U(-2),86,1.1),fs(f,U(-4.5),83,1.1),fs(f,U(-3.5),79,1.1),fs(f,U(-7),77,1.1)],[fs(f,U(2.5),74,1.1),fs(f,U(4),77,1.1),fs(f,U(6.5),76,1.1)]],'#5a3a10',1);ctx.restore()}
  const kc=fs(f,U(0),80,1.1),r=2.2;
  if(A.key<.03){ctx.fillStyle='#120804';ball(kc,r);ctx.fill();const t=[fs(f,U(-.9),79.5,1.1),fs(f,U(.9),79.5,1.1),fs(f,U(1.5),75.4,1.1),fs(f,U(-1.5),75.4,1.1)];poly(t);ctx.fill();
    if(A.glow>.05&&!A.chest){if(!LOWFX)shine(K.inner,kc[0],kc[1],6,.5*A.glow);ctx.fillStyle=`rgba(255,214,120,${(.35+.55*A.glow).toFixed(3)})`;ball([kc[0],kc[1]+.4],1);ctx.fill()}return}
  // the eye of the keyhole: white, the orange iris, a pupil shaped like a keyhole, eyelids of brass that part
  const k=A.key,rx=7,ry=6.2*k,lk=A.keyL||0;if(!LOWFX)shine(K.eglow,kc[0],kc[1],14,.4*k);
  ctx.save();ctx.beginPath();ctx.ellipse(kc[0],kc[1],rx,Math.max(.4,ry),0,0,TAU);ctx.fillStyle='#fff1c8';ctx.fill();ctx.clip();
  const ic=[kc[0]+lk*2.6,kc[1]+.4];ctx.fillStyle='#ff5a2a';ball(ic,4.6);ctx.fill();ctx.fillStyle='#ffc08a';ball([ic[0]-.6,ic[1]-.8],2.2);ctx.fill();
  ctx.fillStyle='#1b0a06';ball([ic[0],ic[1]-.9],1.6);ctx.fill();ctx.beginPath();ctx.moveTo(ic[0]-.8,ic[1]-.4);ctx.lineTo(ic[0]+.8,ic[1]-.4);ctx.lineTo(ic[0]+1.3,ic[1]+2.6);ctx.lineTo(ic[0]-1.3,ic[1]+2.6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffffff';ball([ic[0]-1.8,ic[1]-2.2],.9);ctx.fill();ctx.restore();
  ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(kc[0],kc[1],rx,Math.max(.4,ry),0,0,TAU);ctx.stroke();
  // the brass lids over and under it
  ctx.fillStyle=K.brass.b;for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(kc[0],kc[1]+s*(ry+1.2),rx+.6,2,0,s<0?Math.PI:0,s<0?TAU:Math.PI);ctx.fill();ctx.stroke()}}

function matDraw(V0,X,FC,vis,fs,mat,A){const T=KMAT[mat];
  for(const f of FC){if(!vis[f.k])continue;const W=f.k%2?40:52;
    if(mat==='moss'){const pts=[];for(let s=3;s<W-2;s+=5.5){const u=s/W,q=fs(f,u,ZB+1.2,.8);pts.push([q,2.2+1.4*Math.abs(Math.sin(s*1.7+f.k)),3+3*Math.abs(Math.sin(s*.9+f.k*2))])}
      ctx.fillStyle=T.b;ctx.beginPath();for(const[q,r,h] of pts){ctx.moveTo(q[0]+r,q[1]);ctx.ellipse(q[0],q[1]+h*.3,r,h*.6,0,0,TAU)}ctx.fill();ctx.fillStyle=T.l;ctx.beginPath();for(const[q,r] of pts){ctx.moveTo(q[0]+r*.6,q[1]-.6);ctx.ellipse(q[0],q[1]-.6,r*.6,1,0,0,TAU)}ctx.fill()}
    else if(mat==='ash'){ctx.strokeStyle=T.l;ctx.globalAlpha*=.65;ctx.lineWidth=1.4;ctx.beginPath();for(let s=6;s<W-4;s+=9){const a=fs(f,s/W,ZB+5,.8),b=fs(f,(s+2)/W,ZB+13,.8);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();ctx.globalAlpha/=.65;
      if(f.k===0){const q=fs(f,.66,ZB+2,.9);if(!LOWFX)shine('255,138,58',q[0],q[1],5,.6);ctx.fillStyle='#ff8a3a';ball(q,1.1);ctx.fill()}}
    else if(mat==='mud'){ctx.fillStyle=T.b;ctx.beginPath();for(let s=4;s<W-3;s+=7){const q=fs(f,s/W,ZB+2+2*Math.abs(Math.sin(s)),.8);ctx.moveTo(q[0]+2.4,q[1]);ctx.ellipse(q[0],q[1],2.4,1.4,0,0,TAU)}ctx.fill();
      ctx.fillStyle='#7ab03a';dots([fs(f,.3,ZB+1,.9),fs(f,.36,ZB+.6,.9),fs(f,.71,ZB+1.2,.9)],.8);ctx.fill()}
    else if(mat==='frost'){const a=fs(f,0,ZB+2.6,.8),b=fs(f,1,ZB+2.6,.8),c=fs(f,1,ZB,.8),d=fs(f,0,ZB,.8);poly([a,b,c,d]);ctx.fillStyle='rgba(244,251,255,.75)';ctx.fill();
      if(f.k===0){ctx.fillStyle=T.l;ctx.strokeStyle='rgba(120,170,210,.8)';ctx.lineWidth=.6;for(const u of[.22,.5,.79]){const q=fs(f,u,ZB,.9);ctx.beginPath();ctx.moveTo(q[0]-1.3,q[1]);ctx.lineTo(q[0],q[1]+4.5+2*Math.sin(u*9));ctx.lineTo(q[0]+1.3,q[1]);ctx.closePath();ctx.fill();ctx.stroke()}}}}}

function websDraw(V0,X,A,K,dX,dY){const{P}=V0,CT=X.T;ctx.save();ctx.strokeStyle=K.web;ctx.lineWidth=.6;
  for(const sd of[-1,1]){const hub=CT([-dX,sd*dY,ZT]);
    if(A.web>.5&&A.lid<20*DEG&&A.off<0){const ends=[[-dX,sd*dY,ZT-11],[-dX+9,sd*dY,ZT+5+A.lid*20],[-dX,sd*(dY-10),ZT+6+A.lid*30]].map(q=>P(CT(q))),h=P(hub);
      ctx.beginPath();for(const e of ends){ctx.moveTo(h[0],h[1]);ctx.lineTo(e[0],e[1])}for(const k of[.35,.6,.85]){for(let j=0;j<ends.length-1;j++){const a=[lerp(h[0],ends[j][0],k),lerp(h[1],ends[j][1],k)],b=[lerp(h[0],ends[j+1][0],k),lerp(h[1],ends[j+1][1],k)];
        ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2+(h[0]-(a[0]+b[0])/2)*.15,(a[1]+b[1])/2+(h[1]-(a[1]+b[1])/2)*.15,b[0],b[1])}}ctx.stroke()}
    else{const q=P(hub);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.quadraticCurveTo(q[0]+sd*1.5,q[1]+5,q[0]+sd*.6,q[1]+10);ctx.stroke()}}ctx.restore()}

// ------------------------------------------------------------------ THE INSIDE (a jewel box, never flesh): clipped on the opening
function insideDraw(V0,X,A,K,dX,dY,fx,LS){const{P,F}=V0,CT=X.T,CP=q=>P(CT(q)),w=2.2,op=[[dX-w,-dY+w,ZT],[dX-w,dY-w,ZT],[-dX+w,dY-w,ZT],[-dX+w,-dY+w,ZT]].map(CP);
  ctx.save();poly(op);ctx.clip();
  // the velvet of the far walls (quilted in diamonds, with little gold buttons)
  poly(op);ctx.fillStyle=K.vel.d;ctx.fill();
  const WALL=[{n:[-1,0,0],a:[dX-w,-dY+w],b:[dX-w,dY-w]},{n:[1,0,0],a:[-dX+w,dY-w],b:[-dX+w,-dY+w]},{n:[0,-1,0],a:[dX-w,dY-w],b:[-dX+w,dY-w]},{n:[0,1,0],a:[-dX+w,-dY+w],b:[dX-w,-dY+w]}];
  for(const wl of WALL){const v=F(X.Rd(wl.n));if(v<=.02)continue;const fp=(u,z)=>CP([lerp(wl.a[0],wl.b[0],u),lerp(wl.a[1],wl.b[1],u),z]),q=[fp(0,ZT),fp(1,ZT),fp(1,74),fp(0,74)];
    poly(q);ctx.fillStyle=softBox(bbox(q),tone(K.vel,.3+.5*lit(V0,X.Rd(wl.n))),.12,.3);ctx.fill();
    const Wl=Math.hypot(wl.b[0]-wl.a[0],wl.b[1]-wl.a[1]),S=new Path2D(),Bt=[];for(let s=-22;s<Wl+22;s+=7){const a=fp(s/Wl,ZT+1),b=fp((s+22)/Wl,74),c=fp((s+22)/Wl,ZT+1),d=fp(s/Wl,74);S.moveTo(a[0],a[1]);S.lineTo(b[0],b[1]);S.moveTo(c[0],c[1]);S.lineTo(d[0],d[1])}
    for(let s=3.5;s<Wl;s+=7)for(const z of[ZT-4.5,ZT-15.5])Bt.push(fp(s/Wl,z));
    ctx.strokeStyle=K.vel.d;ctx.lineWidth=.9;ctx.stroke(S);if(!LOWFX){ctx.fillStyle=K.btn;dots(Bt,.8);ctx.fill()}}
  // the dark at the top inside, under the lid
  {const a=CP([dX-w,0,ZT]),b=CP([dX-12,0,ZT-6]),g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,K.dark);g.addColorStop(1,'rgba(26,6,8,0)');poly(op);ctx.fillStyle=g;ctx.fill()}
  // the heap of gold: up to 82 at the back and 78 at the front, coins on it, a red and a green gem; it lights the inside from below
  {const c=CP([0,0,80]),R=Math.max(30,dY*1.2),g=ctx.createRadialGradient(c[0]-4,c[1]-3,2,c[0],c[1],R);g.addColorStop(0,K.gold.l);g.addColorStop(.45,K.gold.b);g.addColorStop(1,K.gold.d);
    const surf=[];for(const[u,v] of[[.9,-.9],[.9,.9],[-.9,.9],[-.9,-.9]])surf.push(CP([u*(dX-w),v*(dY-w),u>0?78:82]));poly(surf);ctx.fillStyle=g;ctx.fill();
    // coins: little ellipses lying on the heap, a few standing on their edge
    {const CO=[];for(let i=0;i<14;i++){const u=Math.sin(i*2.39)*.82,v=Math.cos(i*3.71)*.84,z=lerp(78,82,(1-u)/2)+.4;CO.push(CP([u*(dX-w),v*(dY-w),z]))}
      ctx.fillStyle=K.gold.l;ctx.strokeStyle='rgba(150,96,20,.85)';ctx.lineWidth=.6;ctx.beginPath();for(const q of CO){ctx.moveTo(q[0]+2.6,q[1]);ctx.ellipse(q[0],q[1],2.6,1.3,0,0,TAU)}ctx.fill();ctx.stroke();
      const gr=CP([-6,-8,81.6]),gg=CP([4,10,80.6]);for(const[q,c1,c2] of[[gr,'#ff4a5a','#a01828'],[gg,'#5affb0','#128a5a']]){ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(q[0],q[1]-2.6);ctx.lineTo(q[0]+2.4,q[1]);ctx.lineTo(q[0],q[1]+1.8);ctx.lineTo(q[0]-2.4,q[1]);ctx.closePath();ctx.fill();
        ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(q[0],q[1]-2.6);ctx.lineTo(q[0]-2.4,q[1]);ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(q[0],q[1]-2.6);ctx.lineTo(q[0]+2.4,q[1]);ctx.lineTo(q[0],q[1]+1.8);ctx.lineTo(q[0]-2.4,q[1]);ctx.closePath();ctx.stroke()}}
    if(!LOWFX&&A.glow>.02)shine(K.inner,c[0],c[1],26+10*A.glow,.32+.4*A.glow+.3*A.wake)}
  // the tongue coiled in the mouth (before the Lash): only through the opening
  if(A.tg.m==='coil'){const T=tonguePts(A,dX,dY,X);if(T)tongueDraw(V0,T,A,K,fx)}
  // the eyes in the dark behind the front rim, over the gold
  if(!A.good&&A.eye.on>.02)eyesDraw(V0,X,A,K);
  ctx.restore();
  // the teeth of the rim: seven at the front with two little fangs at the corners, four on each side in the front half (ivory, crooked);
  // lit from below by the gold, white-gold when the bite is coming
  if(!A.good&&F(X.Rd([0,0,1]))>.02)rimTeeth(V0,X,A,K,dX,dY)}

function eyesDraw(V0,X,A,K0){const K=A.eyeRed?Object.assign({},K0,{iris:K2.iris,core:K2.core,eglow:K2.eglow}):K0,{P,F}=V0,E=A.eye,v=F(X.Rd([1,0,0]));if(v<.04)return;const S=[-1,1].map(sd=>({sd,c:X.T([12,sd*9,94.5]),q:P(X.T([12,sd*9,94.5]))})).sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const s of S){const q=s.q,r=6.5*E.on,rx=r*(.42+.58*Math.min(1,v*1.25)),op=Math.max(0,E.o)*(1-.4*E.sq)*(1+.15*E.wide),ry=r*Math.max(.08,Math.min(1,op));if(r<.4)continue;
    if(!LOWFX)shine(K.eglow,q[0],q[1],r*2.4,.55*E.on);
    if(E.hap>.5){ctx.strokeStyle=K.iris;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(q[0],q[1]+r*.25,rx*.8,r*.55,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();continue}
    if(op<.1){ctx.strokeStyle=K.iris;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(q[0]-rx*.8,q[1]);ctx.lineTo(q[0]+rx*.8,q[1]);ctx.stroke();continue}
    const g=ctx.createRadialGradient(q[0]-rx*.2,q[1]-ry*.25,.5,q[0],q[1],Math.max(rx,ry));g.addColorStop(0,K.core);g.addColorStop(.55,K.iris);g.addColorStop(1,cmix(K.iris,'#5a1a06',.5));
    ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fillStyle=g;ctx.fill();
    // the slit pupil: it follows you (look), it widens when something is wrong, it turns in a spiral when dazed
    let px=q[0]+E.lx*rx*.38,py=q[1];if(E.spin){const a=E.spin*TAU*2+s.sd;px=q[0]+Math.cos(a)*rx*.35;py=q[1]+Math.sin(a)*ry*.35}
    ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.clip();ctx.fillStyle=K.pupil;ctx.beginPath();ctx.ellipse(px,py,rx*(.16+.22*E.wide),ry*.82,0,0,TAU);ctx.fill();
    if(E.spin&&!LOWFX){ctx.strokeStyle='rgba(27,22,18,.7)';ctx.lineWidth=.7;ctx.beginPath();for(let i=0;i<14;i++){const a=i*.6+E.spin*TAU,rr=i*.32;ctx.lineTo(q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*ry/Math.max(1,rx))}ctx.stroke()}ctx.restore();
    ctx.strokeStyle='rgba(60,20,4,.85)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.stroke();
    if(op>.3){ctx.fillStyle='#ffffff';ball([q[0]-rx*.4,q[1]-ry*.45],Math.max(.6,r*.17));ctx.fill()}}}

function rimTeeth(V0,X,A,K,dX,dY){const{P}=V0,CT=X.T,w=1.1,T=[],gl=A.lit.teeth||0,tipK=A.teethTip!=null?A.teethTip:1;
  const tooth=(c,dir,h,wd,lean)=>{const e=nrm([dir[1],-dir[0],0]);T.push([P(CT(add(c,mul(e,-wd)))),P(CT(add(add(c,[0,0,h*tipK]),mul(e,lean)))),P(CT(add(c,mul(e,wd))))])};
  for(let i=0;i<7;i++){const y=lerp(-dY+7,dY-7,i/6);tooth([dX-w,y,ZT],[0,1,0],4+2*Math.abs(Math.sin(i*2.7)),1.9,.5*Math.sin(i*1.9))}
  for(const sd of[-1,1]){tooth([dX-w-.4,sd*(dY-2.6),ZT],[0,1,0],8,2.2,-sd*.8);for(let i=0;i<4;i++)tooth([dX-5-i*4.4,sd*(dY-w),ZT],[1,0,0],3.5+1.5*Math.abs(Math.sin(i*3.1+sd)),1.7,.4*Math.sin(i*2.3))}
  const pa=new Path2D();for(const t of T){pa.moveTo(t[0][0],t[0][1]);pa.lineTo(t[1][0],t[1][1]);pa.lineTo(t[2][0],t[2][1]);pa.closePath()}
  ctx.fillStyle=gl>.05?cmix(K.teeth.l,'#fffbe8',gl):K.teeth.b;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.lineJoin='round';ctx.stroke(pa);
  if(gl>.05&&!LOWFX){const c=P(CT([dX,0,ZT+3]));shine('255,240,190',c[0],c[1],22,.5*gl)}}

// ------------------------------------------------------------------ THE LID
function lidDraw(V0,X,A,K,dX,dY,LL,top,LP,LRd,LS,fx){const{P,F}=V0,NS=8,lx=i=>i/NS*LL;
  const pts=[];for(let i=0;i<=NS;i++)for(const sd of[-1,1])pts.push(LS(lx(i),sd*dY,top(lx(i))));for(const sd of[-1,1])for(const xx of[0,LL])pts.push(LS(xx,sd*dY,0));const H=chull(pts);
  ctx.lineJoin='round';
  // the underside (velvet and the teeth hanging from its front edge: seven, the middle one of gold, and three on each side)
  const dn=F(LRd([0,0,-1]));
  if(dn>.02&&!A.good){const u=[LS(0,-dY,0),LS(LL,-dY,0),LS(LL,dY,0),LS(0,dY,0)];poly(u);ctx.fillStyle=softBox(bbox(u),tone(K.vel,.35),.1,.3);ctx.fill();
    const S=new Path2D(),Bt=[];for(let s=-30;s<LL+30;s+=7.5){const a=LS(s,-dY+1,0),b=LS(s+30,dY-1,0),c=LS(s+30,-dY+1,0),d=LS(s,dY-1,0);S.moveTo(a[0],a[1]);S.lineTo(b[0],b[1]);S.moveTo(c[0],c[1]);S.lineTo(d[0],d[1])}
    ctx.save();poly(u);ctx.clip();ctx.strokeStyle=K.vel.d;ctx.lineWidth=.9;ctx.stroke(S);if(!LOWFX){for(let i=1;i<5;i++)for(let j=1;j<7;j++)Bt.push(LS(i*LL/5,-dY+j*2*dY/7,0));ctx.fillStyle=K.btn;dots(Bt,.8);ctx.fill()}
    if(A.glow>.05){const c=LS(LL*.6,0,0),g=ctx.createRadialGradient(c[0],c[1],2,c[0],c[1],40);g.addColorStop(0,`rgba(${K.inner},${(.35*A.glow).toFixed(3)})`);g.addColorStop(1,`rgba(${K.inner},0)`);ctx.fillStyle=g;poly(u);ctx.fill()}ctx.restore();
    // its teeth
    const gl=A.lit.teeth||0,T=[],GT=[];const tooth=(lx0,ly0,h,wd,along,gold)=>{const e=along?[0,1,0]:[1,0,0],a=LS(lx0-e[0]*wd,ly0-e[1]*wd,0),b=LS(lx0+e[0]*wd,ly0+e[1]*wd,0),t=LS(lx0+.4,ly0+.3*Math.sin(lx0+ly0),-h);(gold?GT:T).push([a,t,b])};
    for(let i=0;i<7;i++){const y=lerp(-dY+7,dY-7,i/6);tooth(LL-1.6,y,i===3?5.4:3.8+1.6*Math.abs(Math.sin(i*1.7)),1.9,1,i===3)}
    for(const sd of[-1,1])for(let i=0;i<3;i++)tooth(LL-6-i*5,sd*(dY-1.6),3+1.2*Math.abs(Math.sin(i*2.1)),1.6,0,0);
    for(const[L0,col] of[[T,gl>.05?cmix(K.teeth.l,'#fffbe8',gl):K.teeth.b],[GT,K.gtooth.b]]){if(!L0.length)continue;const pa=new Path2D();for(const t of L0){pa.moveTo(t[0][0],t[0][1]);pa.lineTo(t[1][0],t[1][1]);pa.lineTo(t[2][0],t[2][1]);pa.closePath()}
      ctx.fillStyle=col;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke(pa)}
    if(GT.length&&(A.gt>.02)){const q=GT[0][1];C.starS?C.starS(q[0]+2,q[1]-1,3*A.gt,A.gt):0}
    if(gl>.05&&!LOWFX){const c=LS(LL,0,-2);shine('255,240,190',c[0],c[1],22,.5*gl)}}
  // the end caps (the profile of the arch on the two sides)
  for(const sd of[-1,1]){const f=F(LRd([0,sd,0]));if(f<=.02)continue;const pr=[];for(let i=0;i<=NS;i++)pr.push(LS(lx(i),sd*dY,top(lx(i))));pr.push(LS(LL,sd*dY,0),LS(0,sd*dY,0));
    poly(pr);ctx.fillStyle=softBox(bbox(pr),tone(K.wood,.15+.75*lit(V0,LRd([0,sd,0]))),.1,.22);ctx.fill();
    // the band of brass round its edge
    const ed=[];for(let i=0;i<=NS;i++)ed.push(LS(lx(i),sd*(dY+.3),top(lx(i))-1.4));strokeRuns([ed],INK,4.2);strokeRuns([ed],tone(K.brass,.3+.6*lit(V0,LRd([0,sd,0]))),2.4)}
  // the arch on top, plank by plank
  const segs=[];for(let i=0;i<NS;i++){const a=lx(i),b=lx(i+1),n=nrm([-(top(b)-top(a)),0,b-a]),nW=LRd(n),f=F(nW);if(f<=.01)continue;segs.push(i);
    const q=[LS(a,-dY,top(a)),LS(b,-dY,top(b)),LS(b,dY,top(b)),LS(a,dY,top(a))];poly(q);ctx.fillStyle=tone(K.wood,.15+.8*lit(V0,nW));ctx.fill()}
  if(segs.length){
    // the seams of the three planks (13 and 27 from the hinge), the grain, the two straps of brass over the arch, the bands along its edges
    const S=new Path2D();for(const s of[13,27]){if(!segs.some(i=>lx(i)<=s&&lx(i+1)>=s))continue;const a=LS(s,-dY+.5,top(s)+.1),b=LS(s,dY-.5,top(s)+.1);S.moveTo(a[0],a[1]);S.lineTo(b[0],b[1])}ctx.strokeStyle=K.joint;ctx.lineWidth=1.2;ctx.stroke(S);
    const G2=new Path2D();for(const[s,yy] of[[6,-14],[20,4],[33,-6],[9,10],[24,-20]]){if(!segs.some(i=>lx(i)<=s&&lx(i+1)>=s))continue;const a=LS(s,yy,top(s)+.1),b=LS(s+1.5,yy+9,top(s+1.5)+.1);G2.moveTo(a[0],a[1]);G2.lineTo(b[0],b[1])}ctx.strokeStyle=K.grain;ctx.lineWidth=.8;ctx.stroke(G2);
    const lt=lit(V0,LRd([0,0,1])),ST=[],runs=[];for(const yy of[-16,16]){const r=[];for(let i=0;i<=NS;i++)r.push(LS(lx(i),yy,top(lx(i))+.35));runs.push(r);for(const i of[1,4,7])ST.push(LS(lx(i),yy,top(lx(i))+.6))}
    ctx.lineCap='butt';strokeRuns(runs,INK,6.6);strokeRuns(runs,tone(K.brass,.25+.7*lt),4.4);strokeRuns(runs.map(r=>r.map(q=>[q[0]-.6,q[1]-.7])),K.brass.l,1);ctx.fillStyle=K.stud;dots(ST,1.1);ctx.fill();
    if(A.run&&A.run.g==='lid')for(const r of runs)pearl(r,A.run.k,A.run.a,K);
    if(A.lit.teeth>.05&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(runs,`rgba(255,220,140,${(.45*A.lit.teeth).toFixed(3)})`,3);ctx.restore()}}
  // the front and the back edge of the lid (bands of brass), the hasp over the lock, the hinges
  for(const[xx,nx] of[[LL,1],[0,-1]]){const f=F(LRd([nx,0,0]));if(f<=.02)continue;const q=[LS(xx,-dY,0),LS(xx,dY,0),LS(xx,dY,LT),LS(xx,-dY,LT)];poly(q);ctx.fillStyle=tone(K.brass,.2+.7*lit(V0,LRd([nx,0,0])));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
    const ST=[];for(let s=-dY+5;s<dY-3;s+=8)ST.push(LS(xx+nx*.3,s,LT/2));ctx.fillStyle=K.stud;dots(ST,.95);ctx.fill();
    if(nx>0&&!A.good){const hp=[[-4,LT-.5],[4,LT-.5],[4,-6.5],[2.5,-8.5],[-2.5,-8.5],[-4,-6.5]].map(([yy,zz])=>LS(LL+.7,yy,zz));poly(hp);ctx.fillStyle=grad3(bbox(hp),K.brass);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
      const sl=[LS(LL+.9,-1,-2.5),LS(LL+.9,1,-2.5),LS(LL+.9,1,-6),LS(LL+.9,-1,-6)];poly(sl);ctx.fillStyle='#2a1406';ctx.fill()}
    if(nx<0){for(const yy of[-14,14]){const q2=[LS(-.6,yy-4,LT),LS(-.6,yy+4,LT),LS(-.6,yy+4,-5),LS(-.6,yy-4,-5)];poly(q2);ctx.fillStyle=K.brass.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke()}}}
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.stroke();rimPoly(H,.26)}

// ------------------------------------------------------------------ LIMBS: pale as old wax, brass bracers and anklets, knobbly joints
function legDraw(V0,X,A,K,sd,i,k){const{P,D}=V0,hip=X.T([-6,sd*15,ZB+1]);let foot=A.fRel?X.T(A.feet[i]):A.feet[i];
  const L1=34*k,L2=32*k;if(k<1)foot=lerp3(add(hip,[0,0,-4]),foot,k);const pole=A.fRel?X.Rd([-1,sd*.45,.15]):[-1,sd*.45,.15],[knee,ank]=ik(hip,foot,L1,L2,pole);
  const T=K.limb,lit2=(A.lit.legs||0);
  const s1=()=>cyl(V0,hip,4.4*Math.max(.5,k),knee,3.7*Math.max(.5,k),T),s2=()=>cyl(V0,knee,3.7*Math.max(.5,k),ank,2.7*Math.max(.5,k),T);
  if(D(lerp3(hip,knee,.5))<D(lerp3(knee,ank,.5))){s1();jointBall(P(knee),4.6*Math.max(.5,k),K);s2()}else{s2();jointBall(P(knee),4.6*Math.max(.5,k),K);s1()}
  // the anklet of brass, 6 over the foot
  const ax=nrm(sub(knee,ank)),a0=add(ank,mul(ax,7.5)),a1=add(ank,mul(ax,4));band(V0,a0,a1,3.6*Math.max(.5,k),lit2>.05?T3('#fff3c4','#ffe08a','#c89a40'):K.brass,{lw:1.6});
  if(lit2>.05&&!LOWFX){const q=P(lerp3(a0,a1,.5));shine(K.inner,q[0],q[1],8,.6*lit2)}
  if(A.p2&&A.jg>.05&&!LOWFX){const q=P(lerp3(a0,a1,.5));ctx.strokeStyle=`rgba(255,138,58,${(.6*A.jg).toFixed(3)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(q[0],q[1],2.8,0,TAU);ctx.stroke()}
  // the foot: three toes forward and out, with little nails
  const fw=nrm([X.Rd([1,0,0])[0],X.Rd([1,0,0])[1],0]),sdv=nrm([X.Rd([0,1,0])[0],X.Rd([0,1,0])[1],0]),toes=[];
  if(ank[2]<8||!A.fRel){for(const a of[-.45,0,.45]){const d=nrm(add(mul(fw,Math.cos(a+sd*.25)),mul(sdv,Math.sin(a+sd*.25)))),t=add(ank,[d[0]*9*k,d[1]*9*k,-Math.min(2.5,ank[2])]);toes.push([P(ank),P(t)])}}
  else{const dn=X.Rd([0,0,-1]);for(const a of[-.35,0,.35]){const d=nrm(add(dn,mul(sdv,Math.sin(a)*1.2))),t=add(ank,mul(d,8*k));toes.push([P(ank),P(t)])}}
  ctx.fillStyle=INK;for(const[a,b] of toes){hull(a,2.4,b,1.6);ctx.fill()}ctx.fillStyle=T.b;for(const[a,b] of toes){hull(a,1.4,b,.7);ctx.fill()}ctx.fillStyle=K.claw.b;for(const[,b] of toes){ball(b,1.1);ctx.fill()}}
function jointBall(q,r,K){ctx.fillStyle=INK;ball(q,r+1.2);ctx.fill();ctx.fillStyle=C.softBall(q,r,K.knuck,.14,.32);ball(q,r);ctx.fill();if(!LOWFX)rim(q,r,q,r,.22)}
function armDraw(V0,X,A,K,sd,i,k,dY,fx){const{P,D}=V0,sh=X.T([0,sd*(dY-1),84]);let hand=A.hRel?X.T(A.hands[i]):A.hands[i];
  const L1=50*k,L2=48*k;if(k<1)hand=lerp3(sh,hand,k);const pole=[0,sd,.7],[elb,wr]=ik(sh,hand,L1,L2,pole);
  const T=K.limb,la=A.lit.arms||0,kk=Math.max(.45,k);
  const s1=()=>cyl(V0,sh,4.2*kk,elb,3.5*kk,T),s2=()=>cyl(V0,elb,3.5*kk,wr,2.8*kk,T);
  if(D(lerp3(sh,elb,.5))<D(lerp3(elb,wr,.5))){s1();jointBall(P(elb),4.6*kk,K);s2()}else{s2();jointBall(P(elb),4.6*kk,K);s1()}
  // the signal running down the arm (from the medallion to the bracer and the claws)
  if(A.run&&A.run.g==='arms')pearl([P(sh),P(elb),P(wr)],A.run.k,A.run.a,K);
  // the bracer, 8 over the wrist
  const ax=nrm(sub(elb,wr)),b0=add(wr,mul(ax,11)),b1=add(wr,mul(ax,7));band(V0,b0,b1,3.6*kk,la>.05?T3('#fff3c4','#ffe08a','#c89a40'):K.brass,{lw:1.6});
  {const q=P(lerp3(b0,b1,.5));ctx.fillStyle=K.stud;dots([[q[0]-1.2,q[1]],[q[0]+1.2,q[1]]],.7);ctx.fill();if(la>.05&&!LOWFX)shine(K.inner,q[0],q[1],9,.6*la);
    if(A.p2&&A.jg>.05&&!LOWFX){ctx.strokeStyle=`rgba(255,138,58,${(.6*A.jg).toFixed(3)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(q[0],q[1],2.6,0,TAU);ctx.stroke()}}
  handDraw(V0,X,A,K,sd,i,wr,sub(wr,elb),kk,la)}
// a hand: a small palm and three long fingers that bend toward the palm, ivory claws with a dark point
function handDraw(V0,X,A,K,sd,i,wr,fore,k,la){const{P,D}=V0,fd0=nrm(fore),onFloor=wr[2]<9;
  // the direction of the fingers: on the floor they spread forward along it; up in the air they go on from the forearm
  let fwd,side;if(onFloor){const h=nrm([fd0[0],fd0[1],0]);fwd=len([fd0[0],fd0[1]])<.2?nrm([X.Rd([1,0,0])[0],X.Rd([1,0,0])[1],0]):h;side=[-fwd[1],fwd[0],0]}
  else{fwd=fd0;side=nrm(cross(fwd,[0,0,1]));if(len(side)<.2)side=[0,1,0]}
  const curl=cl(A.fc[i]||0,0,1),spread=cl(A.fs[i]||0,0,1),palm=add(wr,mul(fwd,3*k)),F3=[];
  for(let j=0;j<3;j++){const a=(j-1)*(.42+.35*spread),tap=i===1?A.tap[j]||0:0,beck=A.beck>=0&&j===1&&i===(A.nearI!=null?A.nearI:1)?A.beck:-1;
    let d=nrm(add(mul(fwd,Math.cos(a)),mul(side,Math.sin(a))));
    const up=onFloor?[0,0,1]:nrm(cross(side,fwd));let b=add(palm,mul(d,2.4*k)),c1=curl,lift=tap*4;
    if(beck>=0){const bk=Math.max(Math.abs(Math.sin(beck*Math.PI*2)),0);c1=.2+.8*bk;lift=6*(1-bk)+3}
    const m=add(add(b,mul(d,8.5*k*Math.cos(c1*.9))),mul(up,(onFloor?-1.2:0)+lift*.6+8.5*k*Math.sin(c1*.9)*(onFloor?.2:-.6)));
    const d2=nrm(add(mul(d,Math.cos(c1*1.9)),mul(up,(onFloor?-.55:0)+(lift>0?.5:0)-Math.sin(c1*1.9)*(onFloor?.3:1)))),t=add(m,mul(d2,7.5*k));
    const tf=onFloor&&t[2]<.5?[t[0],t[1],.5]:t,cl0=add(tf,mul(d2,6.5*k));F3.push({b,m,t:tf,c:cl0,dd:D(tf)})}
  F3.sort((a,b)=>a.dd-b.dd);
  ctx.fillStyle=INK;ball(P(palm),4*k+1.1);ctx.fill();ctx.fillStyle=C.softBall(P(palm),4*k,K.limb.b,.14,.3);ball(P(palm),4*k);ctx.fill();
  for(const f of F3){const b=P(f.b),m=P(f.m),t=P(f.t),c=P(f.c);
    ctx.fillStyle=INK;hull(b,2.6*k+1.1,m,2.3*k+1.1);ctx.fill();hull(m,2.3*k+1.1,t,1.8*k+1.1);ctx.fill();
    ctx.fillStyle=K.limb.b;hull(b,2.6*k,m,2.3*k);ctx.fill();hull(m,2.3*k,t,1.8*k);ctx.fill();ctx.fillStyle=K.knuck;ball(m,2*k);ctx.fill();
    // the claw: an ivory cone with a dark point
    const ex=c[0]-t[0],ey=c[1]-t[1],el=Math.hypot(ex,ey)||1,nx=-ey/el*1.8*k,ny=ex/el*1.8*k;ctx.beginPath();ctx.moveTo(t[0]+nx,t[1]+ny);ctx.quadraticCurveTo(t[0]+ex*.6+nx*.6,t[1]+ey*.6+ny*.6,c[0],c[1]);ctx.lineTo(t[0]-nx,t[1]-ny);ctx.closePath();
    ctx.fillStyle=la>.05?'#fff6d8':K.claw.l;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();ctx.fillStyle=K.clawTip;ball(c,.75*k);ctx.fill();
    if(la>.05&&!LOWFX)shine(K.inner,c[0],c[1],6,.55*la)}}

// ------------------------------------------------------------------ THE TONGUE: raspberry pink, a chain of seven balls
const TR=[4.2,3.9,3.6,3.3,3,2.7,2.4];
function tonguePts(A,dX,dY,X){const T=A.tg,CT=X.T,R=[],tw=T.sw||0;let pts;
  // (the root just inside the rim: deeper in, it showed through the front of the chest)
  const ty=T.m==='lash'||T.m==='lick'||T.m==='coil'?0:7,root=[dX-3.5,ty*.8,ZT-.5],lip=[dX+.6,ty,ZT+.6];
  if(T.m==='hang'||T.m==='out'||T.m==='limp'){const ln=T.len,fw=T.m==='out'?8:T.m==='limp'?2:2.4,side=T.side?6:0;pts=[root,lip];
    for(let i=1;i<=4;i++){const u=i/4;pts.push([dX+fw*u+(T.m==='limp'?0:1.5)+tw*.5*u,ty+tw*1.6*u*u+side*u*u,ZT+(T.m==='out'?3*u:0)-ln*u])}}
  else if(T.m==='lick'){const k=T.k,y=lerp(-dY+6,dY-6,k<.5?k*2:2-k*2),out=Math.sin(Math.PI*cl(k*1.1,0,1));pts=[root,[dX+.6,y*.5,ZT+.6],[dX+2.2,y*.85,ZT-1.4-out],[dX+2.8,y,ZT-3.6-out]]}
  else if(T.m==='coil'){const k=T.k;pts=[root];for(let i=0;i<6;i++){const a=i/6*Math.PI*1.7,r=lerp(9,3,i/6);pts.push([5+Math.cos(a)*r*.8,Math.sin(a)*r,88+i*1.4+4*k])}}
  else if(T.m==='lash'){const ang=T.ang||0,ca=Math.cos(ang),sa=Math.sin(ang),reach=Math.max(0,T.reach),lift=T.lift||0;pts=[root,lip];if(reach<4)return tonguePts(Object.assign({},A,{tg:Object.assign({},T,{m:'hang',len:8})}),dX,dY,X);
    const n=7;for(let i=1;i<=n;i++){const s=reach*i/n,down=Math.min(1,s/30),wave=T.wave>=0?Math.sin((s/Math.max(40,reach))*TAU*1.5-T.wave*TAU*2)*7*(1-.6*(1-s/reach)):0,
        z=lerp(ZT-4,2,down)+lift*Math.sin(Math.PI*i/n)+(T.slap&&i===n?6*T.slap:0);
      const base=[dX+4+s*ca-wave*sa,s*sa+wave*ca,z];pts.push(base)}
    // the points of the lash are on the floor of the room: the chest's frame only for the root and the lip
    const P3=[CT(pts[0]),CT(pts[1])],o=CT([0,0,0]);for(let i=2;i<pts.length;i++){const q=pts[i];const r=X.Rd([q[0],q[1],0]);P3.push([o[0]+r[0],o[1]+r[1],q[2]])}
    return{pts:P3,R:[4.2,4].concat(Array.from({length:n},(_,i)=>lerp(3.9,2.7,i/(n-1))))}}
  else return null;
  return{pts:pts.map(CT),R:TR.slice(0,pts.length).concat(Array(Math.max(0,pts.length-7)).fill(2.4))}}
function tongueDraw(V0,T,A,K,fx){const{P}=V0,col=A.tg.lit>.05?cmix(K.tongue.b,'#ffd0a0',A.tg.lit*.7):K.tongue.b;
  const P2=chain(V0,T.pts,T.R,col,{noRim:1,kl:.22,kd:.32,lw:2.4});
  ctx.strokeStyle=K.stripe;ctx.globalAlpha*=.75;ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();for(let i=1;i<P2.length;i++){const q=P2[i];i===1?ctx.moveTo(q[0]-.6,q[1]-.8):ctx.lineTo(q[0]-.6,q[1]-.8)}ctx.stroke();ctx.globalAlpha/=.75;
  if(A.tg.lit>.05&&!LOWFX){const n=P2.length,j=Math.min(n-1,Math.round(A.tg.lit*(n-1)));shine('255,200,160',P2[j][0],P2[j][1],10,.6*A.tg.lit)}
  // a drop of drool from the tip every 1.5 s
  if(fx&&A.drip!=null&&A.drip>=0&&(A.tg.m==='hang'||A.tg.m==='out')){const t=P2[P2.length-1],d=A.drip;ctx.fillStyle=`rgba(220,235,210,${(.8*(1-d)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(t[0],t[1]+3+d*10,1.2,1.8+d,0,0,TAU);ctx.fill()}}

// ------------------------------------------------------------------ COINS: spat, the fountain, the hiccup, escaping, popping from the seams
function coinsDraw(V0,X,A,K,dX){const{P}=V0,CT=X.T,mouth=[dX+2,0,ZT+2];
  if(A.coins>=0){const k=A.coins,n=LOWFX?4:6;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.24,d=8+k*60*(.8+.2*Math.sin(i*2.1)),q=CT([mouth[0]+d*Math.cos(a),d*Math.sin(a),mouth[2]-8*k+16*Math.sin(Math.min(1,k*1.3)*Math.PI)*(.7+.3*Math.cos(i))]);
    coinAt(P(q),k*14+i*1.3,1-Math.max(0,k-.7)/.3,1)}}
  if(A.fount>=0){const k=A.fount,n=LOWFX?4:6;for(let i=0;i<n;i++){const u=(k+i/n*.35)%1,a=i*1.05,q=CT([4+Math.cos(a)*u*30,Math.sin(a)*u*30,ZT+8+90*u-110*u*u]);if(q[2]<2)continue;coinAt(P(q),u*12+i,1,1)}}
  if(A.hic>=0){const k=A.hic,q=CT([dX+4+18*k,4,ZT+4+22*Math.sin(Math.PI*k)-ZT*0*k]);coinAt(P([q[0],q[1],Math.max(1,q[2]-ZT*k*k*.9)]),k*10,1,1)}
  if(A.esc>=0){const k=A.esc,q=CT([dX+6+10*k,-6,ZT+12*Math.sin(Math.PI*k)]);coinAt(P([q[0],q[1],Math.max(1,q[2]*(1-k)+ (1-k)*0)]),k*9,1-k*.3,.9)}
  if(A.popc)A.popc.forEach((k,j)=>{if(k<0)return;const f=j%2?1:-1,q=CT([j===1?dX+1:6,f*(j===1?0:DY+1),72+12*j+14*Math.sin(Math.PI*k)]);coinAt(P(q),k*9+j,1-k,.8)})}
function coinAt(q,spin,a,s){if(a<=.02)return;const r=4.5*(s||1),w=Math.abs(Math.cos(spin))*r+.6;ctx.save();ctx.globalAlpha*=Math.min(1,a);ctx.fillStyle='#ffc93c';ctx.strokeStyle='#8a5a14';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(q[0],q[1],w,r,0,0,TAU);ctx.fill();ctx.stroke();if(w>2){ctx.strokeStyle='#c88a1e';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(q[0],q[1],w*.65,r*.65,0,0,TAU);ctx.stroke()}
  ctx.fillStyle='rgba(255,246,200,.85)';ctx.beginPath();ctx.ellipse(q[0]-w*.3,q[1]-r*.35,w*.25+.2,r*.25,0,0,TAU);ctx.fill();ctx.restore()}

// ------------------------------------------------------------------ the drawings for the game
// N3.mimicChest(x, y, z, face, sc, o): the closed chest (the twin chests and the fakes): o.mat, o.shake, o.lid, o.gold, o.good, o.slide, o.real,
// o.breath, o.shadow, o.p2 (the red eyes of o.real)
N3.mimicChest=function(x,y,z,face,sc,o){o=Object.assign({},o||{});o.z=(z||0);mimic2(x,y,face==null?Math.PI/2:face,'chest',0,sc||1,o)};
// N3.mimicCoin(x, y, z, spin, sc, o): a coin of gold in 3D (r 4.5): spinning in flight, or lying on the floor (o.floor) with a glint (o.glint)
N3.mimicCoin=function(x,y,z,spin,sc,o){o=o||{};sc=sc||1;const a=o.a==null?1:o.a;if(a<=.02)return;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  if(o.floor){ctx.globalAlpha*=a;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(.6,1.2,4.8,2.4,0,0,TAU);ctx.fill();ctx.fillStyle='#ffc93c';ctx.strokeStyle='#8a5a14';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,4.5,2.4,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#9a5a16';ctx.lineWidth=.6;ctx.beginPath();for(let i=0;i<5;i++){const an=-Math.PI/2+i*TAU*2/5;ctx.lineTo(Math.cos(an)*2,Math.sin(an)*1.1)}ctx.closePath();ctx.stroke();
    if(o.glint>0&&!LOWFX){shine('255,246,200',-1,-.6,7,.7*o.glint);ctx.fillStyle=`rgba(255,255,240,${o.glint})`;ctx.beginPath();ctx.moveTo(-1,-3.4);ctx.lineTo(-.5,-.9);ctx.lineTo(1.6,-.6);ctx.lineTo(-.5,-.3);ctx.lineTo(-1,2.2);ctx.lineTo(-1.5,-.3);ctx.lineTo(-3.6,-.6);ctx.lineTo(-1.5,-.9);ctx.closePath();ctx.fill()}}
  else{if(z>2){ctx.save();ctx.translate(0,z||0);ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,1,4,1.6,0,0,TAU);ctx.fill();ctx.restore()}coinAt([0,0],spin||0,a,1)}
  ctx.restore()};
// N3.mimicPlank(x, y, z, rot, sc, o): a broken plank of oak (16 long, two nails; o.band: with a piece of the brass band)
N3.mimicPlank=function(x,y,z,rot,sc,o){o=o||{};sc=sc||1;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);ctx.rotate(rot||0);ctx.globalAlpha*=o.a==null?1:o.a;
  ctx.beginPath();ctx.moveTo(-8,-2.4);ctx.lineTo(6,-2.6);ctx.lineTo(7.4,-1);ctx.lineTo(6.2,.2);ctx.lineTo(8,1.4);ctx.lineTo(6.4,2.6);ctx.lineTo(-8,2.4);ctx.closePath();
  const g=ctx.createLinearGradient(0,-2.6,0,2.6);g.addColorStop(0,K1.wood.l);g.addColorStop(.5,K1.wood.b);g.addColorStop(1,K1.wood.d);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke();
  ctx.strokeStyle=K1.grain;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-6,-.6);ctx.lineTo(3,-.9);ctx.moveTo(-4,1.2);ctx.lineTo(4,1);ctx.stroke();
  if(o.band){ctx.fillStyle=K1.brass.b;ctx.fillRect(-4.5,-2.6,3.2,5.2);ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.strokeRect(-4.5,-2.6,3.2,5.2)}
  ctx.fillStyle='#5a5048';ctx.beginPath();ctx.arc(-6.4,0,.7,0,TAU);ctx.arc(4.4,0,.7,0,TAU);ctx.fill();ctx.restore()};
// the same with the model's name
for(const n of['Chest','Coin','Plank'])N3['mimic2'+n]=N3['mimic'+n];
// the numbers the game reads: how long each move is, when the bites, lashes and landings happen
N3.mimicInfo={dur:DUR,bites:[.50,.58,.66],lash:.50,lash3:[.40,.56,.72],grab:[.55,.62],spit:.75,coins:.50,fount:.55,land:.93,free:.80,hide:{sit:.50,lid:.60},pop:.40,
  enter:{back:.10,thuds:[.25,.33,.41],clicks:[.46,.53],creak:.62,hands:.82,cry:.84},die:{sit:.40,clou:.65}};

reg('mimic2',{n:'Il Mimic',g:'boss',sc:1,p2:true,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Corsa a scatti',hit:'Colpito',chomp:'Il Morso',tongue:'La Frustata',tongue3:'La Frustata a tre (fase 2)',grab:"L'Assaggio: la presa",gulp:"L'Assaggio: il boccone",
    coins:"Sputo d'oro",leap:'La Tagliola: un balzo',stuck:'Incastrato',hide:'Torna cassa',chest:'Cassa chiusa',pop:'Salta fuori',daze:'Stordito',rage:'Ha fame! (fase 2)',
    taunt:'Presa in giro',lure:"L'esca",enter:'Entrata',die:'Sconfitta'}},mimic2);
// «Prima e dopo»: the Mimic of today
{const OLD=N3.mimic,M0=N3.meta.mimic;if(OLD&&M0)N3.meta.mimic2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
