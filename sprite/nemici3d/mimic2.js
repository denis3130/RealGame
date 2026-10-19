// IL MIMIC rifatto: «la cassa sbagliata», nome di lavoro «il Forziere Affamato» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più
// creepy e fatti meglio sia da fermi che nelle animazioni», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre:
// «sì, fai gli altri 12»). Design: docs/boss-classici-design/mimic.md. È il vecchio forziere della cripta che tutti vogliono aprire:
// quercia scura mezza marcia, angolari e fasce d'ottone, un'esca. Quando lo tocchi si sveglia: due occhi d'ambra nel buio sotto il
// coperchio, una gola di velluto rosso trapuntato piena di denti d'avorio (uno è d'oro) e in fondo il suo mucchio d'oro che fa luce dal
// basso; si alza su lunghe gambe pallide con le ginocchia al contrario e pianta a terra due braccia più lunghe di lei. Alto tre volte
// l'eroe, fermo come un mobile e poi veloce come un ragno, avido e beffardo. Prima di ogni colpo il tesoro si sveglia (tin-tin) e la sua
// luce corre nell'ottone fino alla parte che colpirà. A metà vita la serratura si apre: era un occhio. Resta della Classica: forme robuste
// da giocattolo, contorni scuri spessi, occhi con la lucina, niente sangue né carne (dentro è velluto coi bottoncini).
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), gambe e braccia a due ossa (ik), il coperchio con la sua cerniera,
// l'ordine di disegno dalla posa di riposo (gamba lontana, braccio lontano, cassa col suo dentro, coperchio, braccio vicino, gamba vicina,
// lingua); dipinto come la lanterna (tre toni, bordo caldo, bagliori morbidi). Ogni mossa dipende solo da p.
// Mosse: idle, walk (corsa a scatti: si muove solo per p < .55), hit, chomp (Il Morso), tongue (La Frustata), tongue3 (a tre, fase 2), grab e
// gulp (L'Assaggio: la presa e il boccone), coins (Sputo d'oro; Pioggia d'oro con o.p2), leap (un balzo della Tagliola) e stuck
// (Incastrato), hide / chest / pop (Il Gioco delle Casse: torna cassa, cassa chiusa, salta fuori), daze (Stordito), rage (Ha fame!),
// taunt (Presa in giro), lure (L'esca), enter (Entrata dalla cassa gemella), die (Sconfitta).
// Opzioni: o.p2, o.z (l'altezza del balzo data dal gioco), o.reach (la lingua della Frustata, px), o.reach3 e o.fan (la Frustata a tre),
// o.last (l'ultimo balzo resta piantato), o.mat ('moss', 'ash', 'mud', 'frost': il materiale della cripta lungo la fascia di fondo),
// o.torn (le ragnatele già strappate), la cassa chiusa: o.shake, o.lid, o.gold, o.good, o.slide, o.real, o.breath; o.noFx.
// Con LOWFX niente bagliori, ragnatele, bava, bottoncini, monete che saltano né righe di luce nelle fughe.
// Disegni per il gioco con lo stesso aspetto: N3.mimicChest (la cassa chiusa: casse gemelle e finte del Gioco delle Casse),
// N3.mimicCoin (una moneta d'oro in 3D), N3.mimicPlank (un'asse rotta). Nel gioco prende il nome 'mimic' (src/js/89-mimic-nuovo.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,hull,run,cmix,rgbOf,poly,line,bbox,
  blink,keys,sstep,hitK,frame,parts,reg,shine,chull,ik,starS,wa,softBall,softBox,KR}=C;
const{fxOn,pls,rise,flash,ga,grad3,lit,tone,T3,mixT,mixRgb,limbGrad}=C3K;
const DEG=Math.PI/180;
// ------------------------------------------------------------------ colours (three tones: light / base / shadow)
const K1={wood:T3('#a4643a','#74401f','#42200e'),seam:'#26110a',grain:'rgba(38,17,10,.35)',rot:'rgba(58,42,24,.6)',brass:T3('#ffe08a','#d9a640','#8c5e1c'),rivet:'#fff3c4',verd:'#5f9a7a',
  vel:T3('#c23a52','#7d1a2c','#3a0812'),button:'#ffd56a',dark:'#1a0608',gold:T3('#fff0a8','#ffc93c','#b07a1c'),goldG:'255,196,70',
  tooth:T3('#f6eed6','#d9caa6','#a8956e'),gtooth:T3('#ffe58a','#e0a830','#8a5a14'),tongue:T3('#f07a94','#c8466a','#7a1f3c'),tline:'#ffb0c0',drool:'rgba(220,235,210,.8)',
  limb:T3('#ece3d4','#c3b6a2','#85786a'),knuckle:'#d9c4b8',claw:T3('#f8efda','#c9b791','#5a4a38'),iris:'#ffb52e',irisC:'#ffe98a',eyeG:'255,170,50',web:'rgba(235,235,240,.55)',
  seamG:'255,196,70',lock:'#fff1c8',lockI:'#ff5a2a',lockC:'#ffc08a'};
const K2=Object.assign({},K1,{wood:T3('#94552e','#663818','#381a0a'),vel:T3('#a82a40','#601222','#2a0408'),iris:'#ff4a2a',irisC:'#ffb08a',eyeG:'255,80,40',goldG:'255,110,40',seamG:'255,138,58'});
const MAT={moss:T3('#6e9a3e','#4f7a2e','#2f4f1c'),ash:T3('#8a807a','#6a605c','#3e3836'),mud:T3('#7a6038','#5a4428','#36281a'),frost:T3('#f4fbff','#e8f6ff','#9cc8e8')};
const PALC={};
function pal(k2){k2=Math.round(cl(k2,0,1)*12)/12;if(PALC[k2])return PALC[k2];const K={};for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a!=='string'?mixT(a,b,k2):a===b?a:a[0]==='#'?cmix(a,b,k2):a.startsWith('rgba')?a:mixRgb(a,b,k2)}K.k2=k2;return PALC[k2]=K}
const rgbS=c=>rgbOf(c).join(',');
// ------------------------------------------------------------------ the body at rest (model units = px at sc 1; x forward, y its right, z up)
const CX=20,CY=26,CH=36,WT=2.5;                     // the chest (chest-local: x ±20, y ±26, z from 0 to 36), its walls
const LL=40,LT=4,LA=10,lidTop=lx=>LT+LA*Math.sin(Math.PI*cl(lx,0,LL)/LL);   // the arched lid from the hinge (back top edge) to its front
const HIP=[[-6,-15,0],[-6,15,0]],SHO=[[0,-26,24],[0,26,24]];                // chest-local hips and shoulders (the holes in its sides)
const FOOT=[[-2,-24,0],[-2,24,0]],HAND=[[24,-48,2],[24,48,2]];              // feet and hands on the floor (body-relative)
const EYE=[[12,-9,35],[12,9,35]];
// ------------------------------------------------------------------ the pose
function mPose(anim,p,o){const p2=!!o.p2&&anim!=='rage'&&anim!=='chest'&&anim!=='hide',ph=p*TAU,br=.5-.5*Math.cos(ph);
  const A={B:[0,0,p2?66:60],lean:0,roll:0,yaw:0,sw:0,th:(p2?25+3*Math.sin(ph):9+7*br)*DEG,feet:FOOT.map(f=>f.slice()),hands:HAND.map(h=>h.slice()),fing:[0,0],spread:[.3,.3],tap:[[0,0,0],[0,0,0]],
    legK:1,armK:1,medal:1,eye:{op:1,sq:0,lx:0,ly:0,mood:0},red:p2?1:0,third:p2?1:0,lockLook:0,crack:p2?1:0,seams:p2?.55+.25*br:0,gold:.3+.25*br,sig:null,tin:0,
    tg:{out:p2?30:22,lick:-1,sway:Math.sin(ph*2)*(p2?4:2),lash:null,glow:0,curl:0,side:0},torn:o.torn||p2?1:0,stars:0,drool:-1,glint:0,coins:[],shake:0,lidOff:null,fade:1,
    floorGlow:0,raise:[0,0],p2};
  const H=A.hands,Fe=A.feet;
  const tin=(a,b)=>{A.tin=Math.max(pls(p,a,.05),pls(p,b,.05))};
  if(anim==='walk'){const dart=p<.55,u=dart?p/.55:1,hold=sstep(.55,.6,p)*(1-sstep(.62,.72,p));A.B[2]=60-4*(dart?1:1-sstep(.6,.7,p))+2*Math.abs(Math.sin(u*TAU*2))*(dart?1:0);
    A.lean=6*DEG*(dart?1:1-sstep(.6,.7,p));A.th=(dart?10+14*(pls(p,.12,.06)+pls(p,.40,.06)):lerp(10,16,sstep(.6,.66,p)))*DEG;
    // four quick steps in diagonal pairs (left arm with right leg, then the opposite), supports at .11 .22 .33 .44; then the freeze
    const step=(ph0,S,Lf)=>{const f=((u*2+ph0)%1+1)%1;return f<.5?{x:S*(.5-2*f),z:0}:{x:S*(-.5+2*(f-.5)),z:Lf*Math.sin(Math.PI*2*(f-.5))}};
    const k=dart?1:1-sstep(.62,.75,p);for(let i=0;i<2;i++){const a=step(i?0:.5,30,9),l=step(i?.5:0,22,7);H[i]=[HAND[i][0]+a.x*k,HAND[i][1],HAND[i][2]+a.z*k];Fe[i]=[FOOT[i][0]+l.x*k,FOOT[i][1],l.z*k+(i===1&&!dart?3*hold:0)]}
    A.eye.lx=p>.6&&p<.75?.8*Math.sin((p-.6)*TAU*5):0;A.tap[1][1]=4*pls(p,.8,.04)}
  else if(anim==='hit'){const kb=hitK(p),kc=cl(kb,0,1);A.th=(8*(1-kc)+2)*DEG*(p<.1?.2:1);A.B[0]-=4*kb;A.roll=6*DEG*kb;A.eye.sq=p<.4?1:0;
    for(let i=0;i<2;i++){const sd=i?1:-1;H[i]=[HAND[i][0],HAND[i][1]+sd*6*kc,HAND[i][2]+8*kc];Fe[i]=[FOOT[i][0],FOOT[i][1]+sd*3*kc,0]}}
  else if(anim==='chomp'){tin(.03,.10);const prep=sstep(0,.45,p),lun=sstep(.45,.5,p)*(1-sstep(.72,.74,p)),slam=rise(p,.72,.74,.8,.84);
    A.sig={k:'lid',t:cl((p-.12)/.23,0,1),on:rise(p,.35,.38,.45,.5)};A.B[2]=lerp(60,50,prep)+10*sstep(.82,.9,p)*0;A.lean=(15*lun+30*slam)*DEG;A.gold=.3+.7*prep*(1-sstep(.7,.85,p));A.eye.sq=prep>.5?.6:0;
    const bite=p<.45?lerp(8,110,ez(prep)):p<.72?lerp(70,8,Math.abs(Math.sin((p-.45)/.27*Math.PI*1.5))):p<.84?lerp(8,30,sstep(.74,.82,p)):lerp(30,8,sstep(.84,1,p));A.th=bite*DEG;
    if(p>.84&&p<.97)A.roll=6*DEG*Math.sin((p-.84)*TAU*5)*(1-sstep(.9,.97,p));
    const up=prep*(1-sstep(.5,.7,p)),row=sstep(.45,.6,p)*(1-sstep(.72,.9,p));
    for(let i=0;i<2;i++){const sd=i?1:-1;H[i]=[lerp(lerp(HAND[i][0],10,up),-10,row),sd*lerp(lerp(48,46,up),56,row),lerp(lerp(2,124,up),4,row)];A.spread[i]=up}
    if(lun>0)for(let i=0;i<2;i++){const f=((p*14+i*.5)%1);Fe[i]=[FOOT[i][0]+10*Math.cos(f*TAU),FOOT[i][1],4*Math.max(0,Math.sin(f*TAU))]}
    if(p>.72&&p<.86)A.coins.push({k:'chips',t:(p-.72)/.14})}
  else if(anim==='tongue'||anim==='tongue3'){const tr=anim==='tongue3',t0=tr?.36:.5;tin(.03,tr?.09:.10);const back=sstep(0,t0,p)*(1-sstep(tr?.8:.75,tr?.92:.9,p));
    A.lean=-15*DEG*back;A.B[2]+=6*back;A.th=lerp(8,100,sstep(0,.3,p))*(1-sstep(tr?.86:.9,1,p))*DEG+8*DEG*sstep(tr?.86:.9,1,p);A.gold=.3+.6*back;
    A.tg.glow=sstep(.2*(t0/.5),t0,p)*(1-sstep(t0+.05,t0+.15,p));A.tg.curl=sstep(.05,.25,p)*(1-sstep(t0-.01,t0+.005,p));
    if(!tr){const out=sstep(.5,.525,p)*(1-sstep(.75,.9,p));if(out>0)A.tg.lash={len:(o.reach||200)*out,ang:0,wave:p>.53&&p<.75?(p-.53)/.22:-1,slap:pls(p,.6,.03)+pls(p,.7,.03),tip:o.tip||null,ext:out}}
    else{const fan=o.fan||[-.45,0,.45],R3=o.reach3||[200,200,200],T=[.40,.56,.72];let best=null;
      T.forEach((t,i)=>{const k=sstep(t,t+.03,p)*(1-sstep(t+.09,t+.15,p));if(k>0&&(!best||k>best.k))best={k,i}});
      if(best){const i=best.i,t=T[i];A.tg.lash={len:R3[i]*best.k,ang:fan[i],wave:p>t&&p<t+.1?(p-t)/.1:-1,slap:pls(p,t+.05,.03),tip:o.tips&&o.tips[i]||null,ext:best.k}}}
    for(let i=0;i<2;i++){const sd=i?1:-1;H[i]=[HAND[i][0]-6*back,HAND[i][1]+sd*4*back,HAND[i][2]]}}
  else if(anim==='grab'){tin(.03,.09);const prep=sstep(0,.55,p),shut=sstep(.55,.62,p),back=sstep(.62,.8,p),shakeH=rise(p,.8,.83,.89,.92);
    A.sig={k:'arms',t:cl((p-.1)/.25,0,1),on:rise(p,.35,.4,.55,.62)};A.B[2]=lerp(60,52,prep*(1-back));A.th=lerp(8,30,prep*(1-back))*DEG;A.gold=.3+.3*prep;
    if(p>.2&&p<.4)A.tg.lick=(p-.2)/.2;
    for(let i=0;i<2;i++){const sd=i?1:-1,a=[30,sd*70,20],b=[46,sd*4,14];let q=lerp3(HAND[i],a,prep);q=lerp3(q,b,shut);q=lerp3(q,HAND[i],back);if(shakeH>0)q=add(q,[0,sd*4*Math.sin(p*TAU*14)*shakeH,3*shakeH]);H[i]=q;A.spread[i]=prep*(1-shut)+.8*shut*(1-back)}
    if(p>.62&&p<.82)A.coins.push({k:'scratch',t:(p-.62)/.2})}
  else if(anim==='gulp'){const chew=[.2,.33,.46],slamIn=sstep(0,.1,p);A.B[2]-=4*(1-sstep(.7,.8,p));let th=lerp(30,4,slamIn);
    for(const c of chew)th=Math.max(th,15*rise(p,c-.06,c-.04,c-.02,c));if(p>.72)th=lerp(4,120,sstep(.72,.76,p))*(1-sstep(.85,1,p))+8*sstep(.85,1,p);A.th=th*DEG;
    A.sw=.06*Math.max(...chew.map(c=>pls(p,c+.02,.08)))+.12*rise(p,.55,.68,.72,.76);A.eye.mood=p>.12&&p<.55?1:p>=.55&&p<.75?2:0;A.eye.sq=p>.8?1:0;
    if(p>.75)A.tg.lash={len:60*rise(p,.75,.77,.9,1),ang:0,wave:-1,slap:0,up:1};A.B[0]-=5*rise(p,.75,.77,.8,.86);if(p>.8)A.roll=7*DEG*Math.sin((p-.8)*TAU*4)*(1-sstep(.92,1,p));
    for(let i=0;i<2;i++){const sd=i?1:-1;H[i]=lerp3([40,sd*12,70],HAND[i],sstep(.08,.25,p))}
    for(const c of chew)if(p>c&&p<c+.12)A.coins.push({k:'pop',t:(p-c)/.12,s:c})}
  else if(anim==='coins'){tin(.03,.10);const prep=sstep(0,.5,p),lun=sstep(.5,.55,p)*(1-sstep(.65,.8,p));A.sig={k:'seams',on:rise(p,.15,.25,.5,.6)};A.seams=Math.max(A.seams,A.sig.on);
    A.B[2]+=8*prep*(1-sstep(.65,.9,p));A.sw=.08*prep*(1-sstep(.65,.95,p));A.lean=18*DEG*lun;A.th=(p<.5?lerp(8,25,prep):lerp(100,8,sstep(.65,.95,p))*(p<.52?sstep(.5,.52,p):1))*DEG;
    if(p<.5)A.shake=.9*Math.sin(p*TAU*18*1.6)*rise(p,.15,.2,.45,.5);A.gold=.3+.7*rise(p,.15,.3,.6,.7);
    if(p>.5&&p<.62)A.coins.push({k:'puff',t:(p-.5)/.12});if(o.p2&&p>.55&&p<.75)A.coins.push({k:'fount',t:(p-.55)/.2});if(p>.72&&p<.82)A.coins.push({k:'drop',t:(p-.72)/.1});
    if(p>.8&&p<.9)A.tg.lick=.5;A.glint=pls(p,.85,.06)}
  else if(anim==='leap'){const air=p>.2&&p<.93,cr=sstep(0,.2,p)*(1-sstep(.2,.26,p))+(o.last?0:sstep(.93,1,p));A.sig={k:'legs',on:rise(p,0,.05,.2,.25)};
    const zz=o.z!=null?o.z:80*Math.sin(Math.PI*cl((p-.2)/.73,0,1));A.B[2]=lerp(60,46,cr)+(air?zz:0);A.th=(air?100:lerp(8,90,sstep(0,.2,p)))*DEG;
    A.lean=(air?60*sstep(.2,.45,p):0)*DEG;if(o.last&&p>=.93){A.lean=35*DEG;A.B[2]=12;A.th=40*DEG}else if(p>=.93)A.th=lerp(100,10,sstep(.93,.96,p))*DEG;
    for(let i=0;i<2;i++){const sd=i?1:-1,k=air?1:0;H[i]=air?[46,sd*40,A.B[2]-20]:lerp3(HAND[i],[0,sd*44,30],cr);Fe[i]=air?[-26,FOOT[i][1],A.B[2]-48]:FOOT[i].slice();A.spread[i]=k}
    if(p>.93&&p<1)A.coins.push({k:'chips',t:(p-.93)/.07,big:1})}
  else if(anim==='stuck'){const free=sstep(.8,.84,p),sh=rise(p,.82,.86,.94,1);A.lean=35*DEG*(1-free);A.B[2]=lerp(12,60,free);A.th=lerp(40,8,free)*DEG;A.roll=5*DEG*Math.sin(p*TAU*6)*sh;
    A.floorGlow=1-free;for(let i=0;i<2;i++){const sd=i?1:-1,kick=Math.sin(p*TAU*2+i*Math.PI);Fe[i]=lerp3([-30+8*kick,FOOT[i][1],50+10*kick],FOOT[i],free);H[i]=lerp3([20,sd*50,4],HAND[i],free)}
    if(p<.8&&p>.1)A.coins.push({k:'leak',t:((p-.1)/.35)%1});if(p>.8&&p<.95)A.coins.push({k:'chips',t:(p-.8)/.15,big:1})}
  else if(anim==='hide'||anim==='chest'||anim==='pop'){let k=anim==='chest'?0:anim==='hide'?1-sstep(.45,.7,p):sstep(0,.3,p);
    const legs=anim==='hide'?1-sstep(0,.3,p):anim==='pop'?sstep(0,.3,p):0,arms=anim==='hide'?1-sstep(.1,.45,p):anim==='pop'?sstep(0,.3,p):0,sit=anim==='hide'?sstep(.45,.52,p):anim==='pop'?1-sstep(.1,.3,p):1;
    A.legK=legs;A.armK=arms;A.medal=arms;A.B[2]=lerp(60,0,sit)+(anim==='pop'?10*pls(p,.45,.2):0);A.eye.op=anim==='hide'?1-sstep(.55,.7,p):anim==='pop'?sstep(0,.2,p):0;
    A.th=(anim==='hide'?lerp(8,0,sstep(.55,.6,p)):anim==='pop'?lerp(0,90,sstep(0,.25,p))*(1-sstep(.5,.9,p))+8*sstep(.5,.9,p):0)*DEG;A.red=A.third=A.crack=A.seams=0;A.gold=anim==='chest'?0:.3*A.eye.op;
    for(let i=0;i<2;i++){const sd=i?1:-1;Fe[i]=lerp3([-6,sd*15,A.B[2]],FOOT[i],legs);H[i]=lerp3([0,sd*26,A.B[2]+24],HAND[i],arms)}
    if(anim==='chest'||anim==='hide'&&p>.7){A.chest=1;A.legK=0;A.armK=0;A.tg.out=0;A.eye.op=0}
    if(anim!=='pop')A.tg.out*=1-sstep(0,.4,anim==='chest'?1:p)}
  else if(anim==='daze'){A.roll=6*DEG*Math.sin(ph);A.lean=6*DEG*Math.cos(ph);A.B[2]=56;A.th=60*DEG;A.gold=.7;A.eye.mood=3;A.stars=1;A.tg.out=26;A.tg.side=.8;
    for(let i=0;i<2;i++)Fe[i]=[FOOT[i][0],FOOT[i][1]*1.05,0]}
  else if(anim==='rage'){const k2=sstep(.6,.75,p),up=sstep(.2,.45,p),tr=rise(p,0,.02,.18,.2);A.red=k2;A.seams=k2*(.6+.4*Math.sin(p*TAU*6))+.5*tr*(Math.sin(p*TAU*30)>0?1:0);
    A.B[2]=lerp(60,66,up);A.shake=1.5*Math.sin(p*TAU*12*2.4)*tr;A.crack=sstep(.46,.48,p);A.third=sstep(.5,.58,p);A.lockLook=rise(p,.58,.59,.61,.62)*Math.sin((p-.58)/.04*TAU);
    A.th=lerp(8,120,sstep(.6,.75,p))*DEG;if(p>.75&&p<.95){const s=Math.abs(Math.sin((p-.75)/.2*Math.PI*3));A.th=lerp(80,120,s)*DEG}if(p>.95)A.th=lerp(120,25,sstep(.95,1,p))*DEG;
    A.gold=.4+.6*sstep(.6,.75,p);A.eye.op=1;A.torn=p>.65?1:0;if(p>.75&&p<.95)A.coins.push({k:'fount',t:(p-.75)/.2});
    for(let i=0;i<2;i++){const sd=i?1:-1,arms=up*(1-sstep(.74,.78,p)),slam=i?pls(p,.86,.05):pls(p,.78,.05);H[i]=lerp3(HAND[i],[10,sd*70,120],arms);if(slam>0)H[i]=add(HAND[i],[0,0,10*(1-slam)]);A.spread[i]=arms}}
  else if(anim==='taunt'){const up=sstep(0,.12,p)*(1-sstep(.88,1,p)),flap=p>.12&&p<.6?Math.abs(Math.sin((p-.12)/.48*Math.PI*6)):0;A.B[2]+=6*up+3*Math.abs(Math.sin((p-.12)/.48*Math.PI*3))*(p>.12&&p<.6?1:0);
    A.th=(p>.12&&p<.6?50*flap:8)*DEG;A.glint=p>.12&&p<.6?.6+.4*Math.sin(p*40):0;if(p>.6&&p<.8)A.tg.lick=(p-.6)/.2;A.eye.mood=p>.12&&p<.6?1:0;
    for(let i=0;i<2;i++){const sd=i?1:-1,rub=Math.sin(p*TAU*8)*3*up;H[i]=lerp3(HAND[i],[36,sd*(8+rub),40],up);A.spread[i]=.2}
    if(p>.82&&p<1)A.coins.push({k:'hic',t:(p-.82)/.18})}
  else if(anim==='lure'){const low=sstep(0,.25,p)*(1-sstep(.75,1,p));A.B[2]=lerp(60,52,low);A.th=lerp(8,20,low)*DEG;A.gold=.3+.5*low;A.floorGlow=.6*low;A.roll=4*DEG*Math.sin((p-.75)*TAU*2)*rise(p,.75,.8,.92,1);
    A.shake=.4*Math.sin(p*TAU*20)*low;const fn=pls(p,.35,.1)+pls(p,.55,.1);A.raise=[0,rise(p,.25,.3,.7,.75)];A.fing[1]=fn;A.hands[1]=lerp3(HAND[1],[34,40,14],rise(p,.22,.3,.7,.78))}
  else if(anim==='enter'){// from the twin chest: a hop back, it shakes, eyes in the slit, legs out in three jerks, arms, the lid, the cry
    const legs=sstep(.22,.25,p)*.33+sstep(.33,.35,p)*.33+sstep(.41,.43,p)*.34,hop=pls(p,.05,.1);A.legK=sstep(.2,.24,p);A.B[2]=60*legs+14*hop;A.armK=Math.max(sstep(.45,.5,p),sstep(.53,.58,p)*.999);A.medal=A.armK;
    A.shake=(2+2*sstep(.1,.22,p))*Math.sin(p*TAU*40)*rise(p,.1,.12,.2,.22);A.eye.op=sstep(.13,.15,p);A.drool=p>.18&&p<.3?(p-.18)/.12:-1;
    A.th=(p<.62?(p>.1&&p<.22?2+4*Math.abs(Math.sin(p*90)):0):lerp(0,110,sstep(.62,.72,p))*(1-sstep(.94,1,p))+8*sstep(.94,1,p))*DEG;A.torn=p>.68?1:0;A.gold=.15+.6*sstep(.62,.72,p);
    if(p>.7&&p<.8)A.tg.lick=(p-.7)/.1;A.tg.out=22*sstep(.62,.7,p);if(p>.84&&p<.94){A.lean=10*DEG*rise(p,.84,.86,.92,.94);A.th=lerp(70,110,Math.abs(Math.sin((p-.84)*60)))*DEG}
    for(let i=0;i<2;i++){const sd=i?1:-1,ak=i?sstep(.46,.56,p):sstep(.53,.62,p);Fe[i]=lerp3([-6,sd*15,A.B[2]],FOOT[i],A.legK);H[i]=lerp3([0,sd*26,A.B[2]+24],HAND[i],ak);
      if(p>.8&&p<.86)H[i]=add(HAND[i],[0,0,12*(1-pls(p,.82,.04))]);A.tap[i]=[0,4*pls(p,.6,.03),0]}
    if(p>.08&&p<.18)A.coins.push({k:'chips',t:(p-.08)/.1});if(p<.22){A.red=0;A.third=0}}
  else if(anim==='die'){A.fade=1-sstep(.85,1,p);const fold=sstep(.2,.4,p),sit=sstep(.38,.42,p),arms=1-sstep(.45,.62,p),off=p>=.65;A.B[0]-=4*rise(p,0,.08,.15,.2);A.roll=8*DEG*Math.sin(p*TAU*3)*rise(p,.15,.2,.35,.4);
    A.legK=1-fold*.98;A.B[2]=lerp(60,0,sit);A.armK=arms;A.medal=arms;A.eye.op=1-sstep(.58,.62,p);A.third=A.p2?1-sstep(.55,.6,p):0;A.red=A.p2?1-sstep(.5,.6,p):0;
    A.th=(p<.2?40*Math.abs(Math.sin(p*TAU*4)):p<.65?6:0)*DEG;A.gold=p<.65?.3:.9*(1-sstep(.85,1,p));
    if(off){const u=sstep(.65,.8,p);A.lidOff={u,spin:u*TAU*1.25,land:p>=.8}}if(p>.65&&p<.95)A.coins.push({k:'fount',t:(p-.65)/.3});A.tg.out=p>.7?18:22*(1-sstep(.4,.6,p));A.tg.side=p>.7?.6:0;
    for(let i=0;i<2;i++){const sd=i?1:-1,leg=i?sstep(.25,.32,p):sstep(.32,.39,p);Fe[i]=lerp3(FOOT[i],[-6+10,sd*28,0],leg);H[i]=lerp3([0,sd*26,A.B[2]+24],HAND[i],arms)}
    if(p>.38&&p<.5)A.coins.push({k:'dust',t:(p-.38)/.12})}
  else{// idle: planted like a piece of furniture; the lid breathes like bellows, the gold breathes with it, the eyes look round, the tongue licks
    A.eye.lx=-rise(p,.1,.14,.21,.25)+rise(p,.35,.39,.46,.5);if(p>.3&&p<.45)A.tg.lick=(p-.3)/.15;A.tap[1]=[.15,.2,.25].map(t=>4*pls(p,t,.04));
    A.th*=1-.9*pls(p,.62,.05);A.B[1]+=2*pls(p,.62,.03);A.roll=4*DEG*rise(p,.7,.75,.85,.9);if(A.p2)A.lockLook=.7*Math.sin(ph*2+1)}
  return A}
// ------------------------------------------------------------------ painting helpers
function rimK(pts,al,rgb){if(!pts||pts.length<3)return;const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),
  kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
// a two-bone pale limb (every outline first, then the fills; a knob on the joint)
function limb2(V0,a,j,e,r,T,o){o=o||{};const A2=V0.P(a),J=V0.P(j),E=V0.P(e),[r0,r1,r2]=r,kn=o.kn||5;
  ctx.fillStyle=INK;hull(A2,r0+1.4,J,r1+1.4);ctx.fill();hull(J,r1+1.4,E,r2+1.4);ctx.fill();ball(J,kn+1.4);ctx.fill();
  ctx.fillStyle=limbGrad(A2,J,Math.max(r0,r1),T);hull(A2,r0,J,r1);ctx.fill();ctx.fillStyle=limbGrad(J,E,Math.max(r1,r2),T);hull(J,r1,E,r2);ctx.fill();ctx.fillStyle=softBall(J,kn,o.knC||T.b,.3,.3);ball(J,kn);ctx.fill();
  if(!LOWFX){ctx.strokeStyle=wa(.22);ctx.lineWidth=1.2;ctx.lineCap='round';const n=(p,q)=>{let nx=-(q[1]-p[1]),ny=q[0]-p[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx*-.55+ny*-.83<0){nx=-nx;ny=-ny}return[nx,ny]};
    const n1=n(A2,J),n2=n(J,E);ctx.beginPath();ctx.moveTo(A2[0]+n1[0]*(r0-1.4),A2[1]+n1[1]*(r0-1.4));ctx.lineTo(J[0]+n1[0]*(r1-1.4),J[1]+n1[1]*(r1-1.4));ctx.moveTo(J[0]+n2[0]*(r1-1.4),J[1]+n2[1]*(r1-1.4));ctx.lineTo(E[0]+n2[0]*(r2-1.4),E[1]+n2[1]*(r2-1.4));ctx.stroke()}
  return{A2,J,E}}
// a band of brass round a limb (the bracer, the anklet), lit when the signal runs through it
function bracer(V0,a,b,r,K,glow){const A2=V0.P(a),B2=V0.P(b);ctx.lineCap='butt';ctx.strokeStyle=INK;ctx.lineWidth=Math.hypot(B2[0]-A2[0],B2[1]-A2[1])+2.4;const m=[(A2[0]+B2[0])/2,(A2[1]+B2[1])/2];
  const dx=B2[0]-A2[0],dy=B2[1]-A2[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*(r+1.2),ny=dx/l*(r+1.2);ctx.beginPath();ctx.moveTo(m[0]-nx,m[1]-ny);ctx.lineTo(m[0]+nx,m[1]+ny);ctx.stroke();
  ctx.strokeStyle=glow>.3?cmix(K.brass.l,'#fff6d0',glow):K.brass.b;ctx.lineWidth=Math.max(1,l);ctx.beginPath();ctx.moveTo(m[0]-nx*.86,m[1]-ny*.86);ctx.lineTo(m[0]+nx*.86,m[1]+ny*.86);ctx.stroke();
  if(glow>0&&!LOWFX)shine(K.goldG,m[0],m[1],r*2.4,.5*glow)}
// a cartoon amber eye with a vertical slit (or the moods: 1 happy half moons, 2 wide, 3 spirals); o: lx, ly, sq, op, red
function amber(q,r,K,e,glow){const op=cl(e.op,0,1);if(op<=.02)return;const sq=(1-.4*(e.sq||0))*(e.mood===2?1.15:1),ry=r*.9*sq;
  if(!LOWFX&&glow)shine(K.eyeG,q[0],q[1],r*2.6,.45*op);ctx.save();ctx.globalAlpha*=op;
  if(e.mood===1){ctx.strokeStyle=K.irisC;ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.arc(q[0],q[1]+r*.25,r*.7,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.restore();return}
  ctx.beginPath();ctx.ellipse(q[0],q[1],r,ry,0,0,TAU);const g=ctx.createRadialGradient(q[0],q[1],r*.1,q[0],q[1],r);g.addColorStop(0,K.irisC);g.addColorStop(.6,K.iris);g.addColorStop(1,cmix(K.iris,'#5a1e06',.5));ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
  if(e.mood===3){ctx.strokeStyle='#1b1612';ctx.lineWidth=1;ctx.beginPath();for(let t=0;t<=1;t+=.08){const an=t*9+(e.spin||0),rr=r*.85*t;ctx.lineTo(q[0]+Math.cos(an)*rr,q[1]+Math.sin(an)*rr*.9)}ctx.stroke()}
  else{const lx=q[0]+(e.lx||0)*r*.35,ly=q[1]+(e.ly||0)*r*.25;ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(lx,ly,Math.max(.6,r*.2),ry*.78,0,0,TAU);ctx.fill();
    ctx.fillStyle='#fff';ball([q[0]-r*.34,q[1]-ry*.4],Math.max(.5,r*.24));ctx.fill()}
  ctx.restore()}
// ------------------------------------------------------------------ the chest
// the faces of the walls: [normal, the four corners (chest-local)], front, right, back, left
const WALLS=[{n:[1,0,0],a:[CX,-CY],b:[CX,CY],k:'front'},{n:[0,1,0],a:[CX,CY],b:[-CX,CY],k:'right'},{n:[-1,0,0],a:[-CX,CY],b:[-CX,-CY],k:'back'},{n:[0,-1,0],a:[-CX,-CY],b:[CX,-CY],k:'left'}];
function chestDraw(V0,X,A,K,o,cl0){const{P,F}=V0,sw=1+(A.sw||0),T=q=>X.T([q[0]*sw,q[1]*sw,q[2]]),mat=o.mat&&MAT[o.mat];
  const crn=[];for(const z of[0,CH])for(const[x,y] of[[CX,-CY],[CX,CY],[-CX,CY],[-CX,-CY]])crn.push(P(T([x,y,z])));const Hh=chull(crn);
  ctx.lineJoin='round';poly(Hh);ctx.fillStyle=K.wood.d;ctx.fill();
  const vis=WALLS.map(w=>F(X.Rd(w.n))>.01),bands=[],rivets=[],seams=[],grains=[],corners=[],rot=[];
  // the bottom, when it shows (in the Tagliola and when it is stuck)
  if(F(X.Rd([0,0,-1]))>.05){const q=[[CX,-CY],[CX,CY],[-CX,CY],[-CX,-CY]].map(c=>P(T([c[0],c[1],0])));poly(q);ctx.fillStyle=K.wood.d;ctx.fill();ctx.strokeStyle=K.seam;ctx.lineWidth=1;ctx.stroke()}
  WALLS.forEach((w,i)=>{if(!vis[i])return;const pt=(u,z)=>P(T([lerp(w.a[0],w.b[0],u),lerp(w.a[1],w.b[1],u),z])),nW=X.Rd(w.n),Lw=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);
    const q=[pt(0,0),pt(1,0),pt(1,CH),pt(0,CH)];poly(q);const bb=bbox(q),g=ctx.createLinearGradient(0,bb[1],0,bb[3]),tn=lit(V0,nW);
    g.addColorStop(0,tone(K.wood,tn+.12));g.addColorStop(.55,tone(K.wood,tn-.05));g.addColorStop(1,tone(K.wood,tn-.35));ctx.fillStyle=g;ctx.fill();
    if(w.k==='front'&&A.th<.6&&!A.chest){const a=pt(.5,CH),b=pt(.5,CH-5),g2=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g2.addColorStop(0,'rgba(20,8,4,.5)');g2.addColorStop(1,'rgba(20,8,4,0)');poly(q);ctx.fillStyle=g2;ctx.fill()}
    // three planks: the seams at 12 and 24, grain, two nails each near the bands, a crack (front, top left), rot on the low plank
    for(const z of[12,24])seams.push([pt(.02,z),pt(.98,z+(i%2?.4:-.3))]);
    for(const z of[5,17,29])grains.push([pt(.1,z+1),pt(.42,z+.4)],[pt(.55,z-1),pt(.9,z-.6)]);
    if(w.k==='front'){seams.push([pt(.26,CH-1),pt(.31,CH-6),pt(.24,CH-10)]);rot.push([pt(.7,4),4.6,2],[pt(.2,6),3.2,1.5])}
    if(w.k==='right')rot.push([pt(.62,5),4,1.8]);
    // the brass: two bands (front and back at y ±16, the sides at x ±12), the band at the bottom, rivets every 8, the corners
    const bw=2.5/Lw,us=w.k==='front'||w.k==='back'?[(CY-16)/(2*CY),(CY+16)/(2*CY)]:[(CX-12)/(2*CX),(CX+12)/(2*CX)];
    for(const u of us){bands.push([pt(u-bw,0),pt(u+bw,0),pt(u+bw,CH),pt(u-bw,CH)]);for(let z=6;z<CH-2;z+=8)rivets.push(pt(u,z))}
    bands.push([pt(0,0),pt(1,0),pt(1,4),pt(0,4)]);for(let u=.06;u<1;u+=8/Lw)rivets.push(pt(u,2));
    const cs=9/Lw;for(const[u0,du] of[[0,cs],[1,-cs]])for(const[z0,dz] of[[0,9],[CH,-9]])corners.push([pt(u0,z0),pt(u0+du,z0),pt(u0,z0+dz)]);
    // the lock (a shield of brass, its keyhole with the warm dot of the sleeping treasure), the medallions over the shoulder holes,
    // the hinges at the back
    if(w.k==='front')A._lock={pt,nW};if(w.k==='right'||w.k==='left')(A._med||(A._med=[])).push({pt,nW,sd:w.k==='right'?1:-1});if(w.k==='back')A._hinge={pt}});
  ctx.strokeStyle=K.grain;ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();for(const l of grains){ctx.moveTo(l[0][0],l[0][1]);ctx.lineTo(l[1][0],l[1][1])}ctx.stroke();
  ctx.strokeStyle=K.seam;ctx.lineWidth=1.3;ctx.beginPath();for(const l of seams){ctx.moveTo(l[0][0],l[0][1]);for(const s of l)ctx.lineTo(s[0],s[1])}ctx.stroke();
  // the light of the treasure out of the seams (coins, the second phase)
  if(A.seams>.02){ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.seamG},${(LOWFX?.7:.55)*Math.min(1,A.seams)})`;ctx.lineWidth=1.6;ctx.beginPath();for(const l of seams.slice(0)){ctx.moveTo(l[0][0],l[0][1]);for(const s of l)ctx.lineTo(s[0],s[1])}ctx.stroke();ctx.restore()}
  ctx.fillStyle=K.rot;ctx.beginPath();for(const[q,rx,ry] of rot){ctx.moveTo(q[0]+rx,q[1]);ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU)}ctx.fill();
  // the material of the place along the bottom band, on the walls we see: moss tufts that hang, a crust of ash with an ember, mud
  // splashed up with duckweed, a crust of rime with three icicles
  if(mat)WALLS.forEach((w,wi)=>{if(!vis[wi])return;const pt=(u,z)=>P(T([lerp(w.a[0],w.b[0],u),lerp(w.a[1],w.b[1],u),z])),sd=wi*1.7;ctx.lineJoin='round';
    if(o.mat==='moss'){ctx.fillStyle=mat.b;ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();for(const u of[.1,.33,.58,.84]){const q=pt(u,4.5),rx=4+1.5*Math.sin(u*9+sd);ctx.moveTo(q[0]+rx,q[1]);ctx.ellipse(q[0],q[1],rx,3,0,0,TAU)}ctx.fill();ctx.stroke();
      ctx.strokeStyle=mat.d;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();for(const u of[.08,.13,.31,.36,.56,.61,.82,.87]){const q=pt(u,3),l=3+3*Math.abs(Math.sin(u*31+sd));ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+.5,q[1]+l)}ctx.stroke();
      ctx.fillStyle=mat.l;for(const u of[.1,.58]){const q=pt(u,5.5);ball(q,1.2);ctx.fill()}}
    else{const top=[],N=10;for(let i=0;i<=N;i++){const u=i/N,h=o.mat==='mud'?2.5+2.5*Math.abs(Math.sin(u*7.7+sd)):o.mat==='frost'?3+1.2*Math.sin(u*11+sd):1.8+1.4*Math.abs(Math.sin(u*5.3+sd));top.push(pt(u,h))}
      const q=[pt(0,0),...top,pt(1,0)];poly(q);ctx.fillStyle=o.mat==='frost'?mat.l:o.mat==='mud'?mat.l:mat.l;ctx.fill();ctx.strokeStyle=o.mat==='frost'?'#7fb2d6':INK;ctx.lineWidth=1;line(top);ctx.stroke();
      if(o.mat==='ash'){ctx.strokeStyle=mat.d;ctx.lineWidth=.9;ctx.beginPath();for(const u of[.22,.47,.71]){const a=pt(u,7),b=pt(u+.05,2.5);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
        const e=pt(.62+.1*wi%1,1.5);if(!LOWFX)shine('255,138,58',e[0],e[1],6,.7);ctx.fillStyle='#ff8a3a';ball(e,1.4);ctx.fill()}
      if(o.mat==='mud'){ctx.fillStyle='#7ab03a';ctx.strokeStyle=INK;ctx.lineWidth=.7;for(const u of[.27,.34,.72]){const e=pt(u,3.6);ctx.beginPath();ctx.ellipse(e[0],e[1],1.5,.9,0,0,TAU);ctx.fill();ctx.stroke()}
        ctx.fillStyle=mat.b;for(const u of[.15,.5,.86]){const e=pt(u,7+2*Math.sin(u*13));ball(e,1);ctx.fill()}}
      if(o.mat==='frost'){ctx.fillStyle='#ffffff';ctx.strokeStyle='#7fb2d6';ctx.lineWidth=.9;for(const u of[.24,.52,.79]){const a=pt(u-.03,3.5),b=pt(u+.03,3.5),c=pt(u,-3);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(b[0],b[1]);ctx.closePath();ctx.fill();ctx.stroke()}
        ctx.fillStyle='rgba(255,255,255,.8)';for(const u of[.1,.4,.66,.92]){const e=pt(u,8+3*Math.sin(u*17));ball(e,.8);ctx.fill()}}}});
  // the brass, all of it in one path
  ctx.beginPath();for(const b of bands){ctx.moveTo(b[0][0],b[0][1]);for(const q of b)ctx.lineTo(q[0],q[1]);ctx.closePath()}for(const c of corners){ctx.moveTo(c[0][0],c[0][1]);ctx.lineTo(c[1][0],c[1][1]);ctx.quadraticCurveTo((c[1][0]+c[2][0])/2*1+0,(c[1][1]+c[2][1])/2,c[2][0],c[2][1]);ctx.closePath()}
  const sig=A.sig&&A.sig.k==='seams'?A.sig.on:0;ctx.fillStyle=sig>.3?cmix(K.brass.b,K.brass.l,sig):K.brass.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
  ctx.fillStyle=K.rivet;ctx.beginPath();for(const q of rivets){ctx.moveTo(q[0]+1.2,q[1]);ctx.arc(q[0],q[1],1.2,0,TAU)}ctx.fill();
  // the lock: a shield of brass with the keyhole (in the second phase it cracks and opens: it was an eye)
  if(A._lock){const{pt,nW}=A._lock,u0=.5,w8=8/(2*CY),sh=[pt(u0-w8,28),pt(u0+w8,28),pt(u0+w8,16),pt(u0,10),pt(u0-w8,16)];poly(sh);ctx.fillStyle=softBox(bbox(sh),K.brass.b,.25,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
    const kq=pt(.5,20.5),f=F(nW);if(A.crack>0){ctx.strokeStyle='#5a3a10';ctx.lineWidth=1;ctx.beginPath();const a=pt(.47,27),b=pt(.45,23),c=pt(.53,14),d=pt(.55,18);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(kq[0]-2,kq[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.lineTo(kq[0]+2,kq[1]);ctx.stroke()}
    if(A.third>.02){const r=7*Math.pow(f,.4),op=A.third;ctx.save();ctx.beginPath();ctx.ellipse(kq[0],kq[1],r,r*.92*op+.2,0,0,TAU);ctx.fillStyle=K.lock;ctx.fill();ctx.clip();
      const lk=(A.lockLook||0)*r*.4;ctx.fillStyle=K.lockI;ball([kq[0]+lk,kq[1]],r*.66);ctx.fill();ctx.fillStyle=K.lockC;ball([kq[0]+lk,kq[1]-r*.1],r*.3);ctx.fill();
      ctx.fillStyle='#1b0a06';ctx.beginPath();ctx.arc(kq[0]+lk,kq[1]-r*.15,r*.2,0,TAU);ctx.moveTo(kq[0]+lk-r*.12,kq[1]-r*.1);ctx.lineTo(kq[0]+lk+r*.12,kq[1]-r*.1);ctx.lineTo(kq[0]+lk+r*.2,kq[1]+r*.45);ctx.lineTo(kq[0]+lk-r*.2,kq[1]+r*.45);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff';ball([kq[0]-r*.3,kq[1]-r*.35],r*.17);ctx.fill();ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(kq[0],kq[1],r,r*.92*op+.2,0,0,TAU);ctx.stroke();
      if(op<1){ctx.fillStyle=K.brass.b;for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(kq[0],kq[1]+sd*r*.92*op,r,r*(1-op)*.5+.3,0,0,TAU);ctx.fill()}}
      if(!LOWFX)shine(K.eyeG,kq[0],kq[1],r*2.4,.4*op)}
    else{ctx.fillStyle='#120804';ctx.beginPath();ctx.arc(kq[0],kq[1]-.8,2.2,0,TAU);ctx.moveTo(kq[0]-1,kq[1]);ctx.lineTo(kq[0]+1,kq[1]);ctx.lineTo(kq[0]+1.6,kq[1]+3.4);ctx.lineTo(kq[0]-1.6,kq[1]+3.4);ctx.closePath();ctx.fill();
      if(!A.chest||A.tin>0){const a=.6+.4*(A.gold||0)+A.tin;ctx.fillStyle=`rgba(255,200,90,${Math.min(1,a)})`;ball([kq[0],kq[1]-.6],.9);ctx.fill();if(!LOWFX&&A.tin>0){shine(K.goldG,kq[0],kq[1],12,.7*A.tin);const r2=P(add(X.T([CX+8*A.tin,0,20.5]),[0,0,0]));ctx.strokeStyle=`rgba(255,220,140,${.7*A.tin})`;ctx.lineWidth=2;seg(kq,r2);ctx.stroke()}}}}
  // the medallions over the shoulder holes: shut they are big studs, when the arms are out little doors open above the holes
  for(const m of A._med||[]){const{pt,nW,sd}=m,u=.5,c=pt(u,24),f=F(nW);if(f<.05)continue;const r=6.5,op=cl(A.medal,0,1);
    if(op>.05){ctx.fillStyle='#120804';ctx.beginPath();ctx.ellipse(c[0],c[1],r*.8*Math.pow(f,.5),r*.8,0,0,TAU);ctx.fill();ctx.strokeStyle=K.seam;ctx.lineWidth=1;ctx.stroke()}
    const dq=pt(u,24+r*(1+.0)*op*1.2);ctx.beginPath();ctx.ellipse(dq[0],op>.05?dq[1]-r*op*.3:c[1],r*Math.pow(f,.5),r*(1-.75*op),0,0,TAU);ctx.fillStyle=softBox([dq[0]-r,dq[1]-r,dq[0]+r,dq[1]+r],K.brass.b,.3,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    if(A.sig&&A.sig.k==='arms'&&A.sig.t<.35&&!LOWFX)shine(K.goldG,c[0],c[1],10,.6)}
  if(A._hinge){const{pt}=A._hinge;ctx.beginPath();for(const u of[(CY-14)/(2*CY),(CY+14)/(2*CY)]){const q=[pt(u-.08,CH),pt(u+.08,CH),pt(u+.08,CH-8),pt(u-.08,CH-8)];ctx.moveTo(q[0][0],q[0][1]);for(const s of q)ctx.lineTo(s[0],s[1]);ctx.closePath()}ctx.fillStyle=K.brass.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke()}
  A._lock=null;A._med=null;A._hinge=null;
  // the vertical corners we see, the outline, the warm rim
  ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<4;i++)if(vis[i]&&vis[(i+1)%4]){const c=WALLS[i].b,a=P(T([c[0],c[1],0])),b=P(T([c[0],c[1],CH]));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
  poly(Hh);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();rimK(Hh,.2,K.k2>.5?'255,170,90':'255,226,170');
  return Hh}
// the inside, seen through the opening between the rim and the lid: dark at the top front (where the eyes are), quilted velvet, the gold,
// the teeth on the rim; o.good: only velvet and gold (the good chest of the twins)
function insideDraw(V0,X,A,K,o,fx){const{P,F}=V0,sw=1+(A.sw||0),T=q=>X.T([q[0]*sw,q[1]*sw,q[2]]),i0=WT;
  const rim=[[CX-i0,-CY+i0],[CX-i0,CY-i0],[-CX+i0,CY-i0],[-CX+i0,-CY+i0]].map(c=>P(T([c[0],c[1],CH])));if(F(X.Rd([0,0,1]))<.02)return;
  ctx.save();poly(rim);ctx.clip();poly(rim);ctx.fillStyle=K.vel.d;ctx.fill();
  // the inner walls (velvet) down to the gold, the dark under the front rim
  const gl=A.gold||0,gz=(x)=>lerp(18,22,(CX-x)/(2*CX));
  for(const w of WALLS){const nI=X.Rd(mul(w.n,-1));if(F(nI)<.02)continue;const a=[w.a[0]-Math.sign(w.n[0])*i0,w.a[1]-Math.sign(w.n[1])*i0],b=[w.b[0]-Math.sign(w.n[0])*i0,w.b[1]-Math.sign(w.n[1])*i0];
    const q=[P(T([a[0],a[1],CH])),P(T([b[0],b[1],CH])),P(T([b[0],b[1],gz(b[0])])),P(T([a[0],a[1],gz(a[0])]))];poly(q);ctx.fillStyle=tone(K.vel,.35+.4*F(nI)+.2*gl);ctx.fill();
    // the quilting: diamonds with little gold buttons
    if(!LOWFX&&F(nI)>.15){ctx.strokeStyle='rgba(30,4,10,.45)';ctx.lineWidth=.8;ctx.beginPath();for(let u=.125;u<1;u+=.25){const s=P(T([lerp(a[0],b[0],u),lerp(a[1],b[1],u),CH-1])),e=P(T([lerp(a[0],b[0],u+.12),lerp(a[1],b[1],u+.12),gz(lerp(a[0],b[0],u))+1]));ctx.moveTo(s[0],s[1]);ctx.lineTo(e[0],e[1])}ctx.stroke();
      ctx.fillStyle=K.button;for(let u=.25;u<1;u+=.25){const s=P(T([lerp(a[0],b[0],u),lerp(a[1],b[1],u),CH-6]));ball(s,1);ctx.fill()}}}
  // the gold: a heap from 22 at the back to 18 at the front, coins and two gems, its light from below
  {const pile=[];for(let i=0;i<=10;i++){const t=i/10*TAU,x=Math.cos(t)*(CX-i0-1),y=Math.sin(t)*(CY-i0-1);pile.push(P(T([x,y,gz(x)+1.5*Math.max(0,Math.cos(t*2))])))}
    const cq=P(T([0,0,gz(0)+3]));ctx.beginPath();smoothPath(pile);const g=ctx.createRadialGradient(cq[0],cq[1]-4,1,cq[0],cq[1],30);g.addColorStop(0,K.gold.l);g.addColorStop(.5,K.gold.b);g.addColorStop(1,K.gold.d);ctx.fillStyle=g;ctx.fill();
    ctx.fillStyle=K.gold.d;ctx.strokeStyle='rgba(120,70,10,.7)';ctx.lineWidth=.7;for(let i=0;i<9;i++){const x=-14+(i*7.3)%28,y=-18+(i*11.7)%36,q=P(T([x,y,gz(x)+1.6]));ctx.beginPath();ctx.ellipse(q[0],q[1],2.6,1.3,0,0,TAU);ctx.stroke()}
    if(!o.good||true){const r=P(T([-6,-8,gz(-6)+2])),gq=P(T([6,10,gz(6)+2]));ctx.fillStyle='#e83a3a';ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(r[0],r[1]-2.4);ctx.lineTo(r[0]+2,r[1]);ctx.lineTo(r[0],r[1]+1.6);ctx.lineTo(r[0]-2,r[1]);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#3ad06a';ctx.beginPath();ctx.moveTo(gq[0],gq[1]-2.2);ctx.lineTo(gq[0]+1.8,gq[1]);ctx.lineTo(gq[0],gq[1]+1.5);ctx.lineTo(gq[0]-1.8,gq[1]);ctx.closePath();ctx.fill();ctx.stroke()}
    if(!LOWFX)shine(K.goldG,cq[0],cq[1]-2,26,.25+.55*gl)}
  if(!o.good){// the dark under the front rim, where the eyes are
    const d=[P(T([CX-i0,-CY+i0,CH])),P(T([CX-i0,CY-i0,CH])),P(T([CX-12,CY-i0,CH-6])),P(T([CX-12,-CY+i0,CH-6]))],dk=P(T([CX-6,0,CH-3]));
    const g=ctx.createLinearGradient(0,bbox(d)[1]-6,0,bbox(d)[3]+2);g.addColorStop(0,'rgba(26,6,8,.95)');g.addColorStop(1,'rgba(26,6,8,0)');poly(d);ctx.fillStyle=K.dark;ctx.fill();
    tongueDraw(V0,X,A,K,fx,'in');
    // the eyes
    for(let i=0;i<2;i++){const e=EYE[i],q=P(T(e));amber(q,6.5*(.85+.15*F(X.Rd([1,0,.3]))),K,Object.assign({},A.eye,{spin:(A.t||0)*9}),true)}}
  ctx.restore();
  // the teeth on the rim (front 7, two little fangs at the front corners, 4 on each side in the front half); never at the back
  if(!o.good){const TT=[];const row=(x0,y0,x1,y1,n,h0,h1,inw)=>{for(let i=0;i<n;i++){const u=(i+.5)/n,x=lerp(x0,x1,u),y=lerp(y0,y1,u),hh=lerp(h0,h1,(i*.618)%1),e=nrm([x1-x0,y1-y0,0]);
      TT.push([T([x-e[0]*2,y-e[1]*2,CH]),T([x+inw[0]*1.2+Math.sin(i*2.3)*.5,y+inw[1]*1.2,CH+hh]),T([x+e[0]*2,y+e[1]*2,CH])])}};
    {const Y7=[-18,-13.5,-4.5,0,4.5,13.5,18];Y7.forEach((y,i)=>{const hh=lerp(4,6,(i*.618)%1);TT.push([T([CX-1,y-2,CH]),T([CX-2.2+Math.sin(i*2.3)*.5,y,CH+hh]),T([CX-1,y+2,CH])])})}row(CX-4,-CY+1,CX-18,-CY+1,4,3,4.5,[0,1]);row(CX-4,CY-1,CX-18,CY-1,4,3,4.5,[0,-1]);
    for(const sd of[-1,1])TT.push([T([CX-1,sd*(CY-1)-sd*2.5,CH]),T([CX-1.5,sd*(CY-3.5),CH+8]),T([CX-1,sd*(CY-1)+sd*0,CH])]);
    const lit2=A.sig&&A.sig.k==='lid'?A.sig.on:0;ctx.fillStyle=lit2>.3?cmix(K.tooth.l,'#fff6d0',lit2):K.tooth.l;ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.lineJoin='round';
    ctx.beginPath();for(const t of TT){const[a,b,c]=t.map(q=>P(q));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath()}ctx.fill();ctx.stroke();
    // a coin stuck between two teeth
    {const q=P(T([CX-1,-6,CH+2]));ctx.fillStyle=K.gold.b;ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(q[0],q[1],2.4,1.6,.4,0,TAU);ctx.fill();ctx.stroke()}}}
function smoothPath(pts){const n=pts.length;const m=i=>[(pts[i][0]+pts[(i+1)%n][0])/2,(pts[i][1]+pts[(i+1)%n][1])/2];let s=m(n-1);ctx.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const e=m(i);ctx.quadraticCurveTo(pts[i][0],pts[i][1],e[0],e[1])}ctx.closePath()}
// the lid: hinged on the back top edge, arched, three planks, two straps over the arch, a band on the front and one on the back, the hasp
// of the lock; under it (when it opens) velvet and teeth (the middle one is gold)
function lidDraw(V0,X,A,K,o,fx){const{P,F}=V0,sw=1+(A.sw||0),th=A.th,c=Math.cos(th),s=Math.sin(th),loc=q=>[-CX+q[0]*c-q[2]*s,q[1],CH+q[0]*s+q[2]*c],
  T=q=>{const l=loc(q);return X.T([l[0]*sw,l[1]*sw,l[2]])},Dd=v=>X.Rd([v[0]*c-v[2]*s,v[1],v[0]*s+v[2]*c]);let off=null;
  if(A.lidOff){const u=A.lidOff.u;off={dx:lerp(0,-46,u),dz:A.lidOff.land?-CH-14:30*Math.sin(Math.PI*u)+(-CH-14)*u*u,rot:A.lidOff.spin}}
  const TT=off?(q=>{const l=[q[0]-LL/2,q[1],q[2]],rr=off.rot,cr=Math.cos(rr),sr=Math.sin(rr),x=l[0]*cr-l[2]*sr,z=l[0]*sr+l[2]*cr;return X.T([x+off.dx,l[1],z+CH+12+off.dz])}):T;
  const NX=6,top=[],P2=[];for(let i=0;i<=NX;i++){const lx=i/NX*LL;top.push(lx)}
  const under=off?false:F(Dd([0,0,-1]))>.02&&th>3*DEG;
  // the solid: the ends (arches), the top (in strips), the front and back edges
  const capPts=sd=>{const pts=[];for(let i=0;i<=NX;i++){const lx=i/NX*LL;pts.push(TT([lx,sd*CY,lidTop(lx)]))}pts.push(TT([LL,sd*CY,0]),TT([0,sd*CY,0]));return pts};
  const all=[];for(const sd of[-1,1])for(const q of capPts(sd))all.push(P(q));const Hh=chull(all);poly(Hh);ctx.fillStyle=K.wood.d;ctx.fill();
  // under the lid (when it shows): crimson velvet, quilted, lit from below by the gold (brighter toward the front edge)
  if(under){const q=[[0,-CY],[LL,-CY],[LL,CY],[0,CY]].map(c2=>P(TT([c2[0],c2[1],0]))),h0=P(TT([0,0,0])),h1=P(TT([LL,0,0])),g=ctx.createLinearGradient(h0[0],h0[1],h1[0],h1[1]),gl=A.gold||0;
    g.addColorStop(0,tone(K.vel,.18+.15*gl));g.addColorStop(1,tone(K.vel,.42+.45*gl));poly(q);ctx.fillStyle=g;ctx.fill();
    if(!LOWFX&&fx){ctx.strokeStyle='rgba(30,4,10,.4)';ctx.lineWidth=.8;ctx.beginPath();for(let k=-2;k<=2;k++){const a2=P(TT([3,k*10-8,0])),b2=P(TT([LL-6,k*10+8,0])),c3=P(TT([3,k*10+8,0])),d2=P(TT([LL-6,k*10-8,0]));ctx.moveTo(a2[0],a2[1]);ctx.lineTo(b2[0],b2[1]);ctx.moveTo(c3[0],c3[1]);ctx.lineTo(d2[0],d2[1])}ctx.stroke();
      ctx.fillStyle=K.button;for(let k=-2;k<=2;k++)for(const lx of[10,26]){const b2=P(TT([lx,k*10+(lx>20?0:5),0]));ball(b2,1);ctx.fill()}}}
  for(const sd of[-1,1]){const n=Dd([0,sd,0]);if(!off&&F(n)<=.01||off&&F(X.Rd([0,sd,0]))<=0)continue;const q=capPts(sd).map(P);poly(q);ctx.fillStyle=tone(K.wood,lit(V0,n)-.05);ctx.fill()}
  for(let i=0;i<NX;i++){const l0=i/NX*LL,l1=(i+1)/NX*LL,m=(l0+l1)/2,dz=(lidTop(l1)-lidTop(l0))/(l1-l0),n=nrm(Dd([-dz,0,1]));if(F(n)<=0)continue;
    const q=[[l0,-CY,lidTop(l0)],[l1,-CY,lidTop(l1)],[l1,CY,lidTop(l1)],[l0,CY,lidTop(l0)]].map(c2=>P(TT(c2)));poly(q);ctx.fillStyle=tone(K.wood,lit(V0,n));ctx.fill()}
  {const n=Dd([1,0,0]);if(F(n)>0){const q=[[LL,-CY,0],[LL,CY,0],[LL,CY,lidTop(LL)],[LL,-CY,lidTop(LL)]].map(c2=>P(TT(c2)));poly(q);ctx.fillStyle=tone(K.wood,lit(V0,n)-.1);ctx.fill()}}
  // the seams of its planks across it (at 13 and 27 from the hinge), the straps, the bands, the hasp, the hinges
  const topSide=F(Dd([0,0,1]))>-.2;
  if(topSide){ctx.strokeStyle=K.seam;ctx.lineWidth=1.2;ctx.beginPath();for(const lx of[13,27]){const a=P(TT([lx,-CY+1,lidTop(lx)])),b=P(TT([lx,CY-1,lidTop(lx)]));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
    const lit2=A.sig&&A.sig.k==='lid'?A.sig:null;
    for(const ly of[-16,16]){const r=[];for(let i=0;i<=NX;i++){const lx=i/NX*LL;r.push(P(TT([lx,ly,lidTop(lx)+.2])))}ctx.lineCap='butt';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=7.4;line(r);ctx.stroke();ctx.strokeStyle=K.brass.b;ctx.lineWidth=5;ctx.stroke();
      ctx.fillStyle=K.rivet;for(const i of[1,3,5]){ball(r[i],1.1);ctx.fill()}
      // the pearl of light that runs along the straps to the teeth
      if(lit2&&lit2.t>0&&lit2.t<1){const u=lit2.t*NX,i=Math.floor(u),q=lerp3([...r[i],0],[...r[Math.min(NX,i+1)],0],u-i);if(!LOWFX)shine(K.goldG,q[0],q[1],8,.8);ctx.fillStyle='#fff6d0';ball(q,2.2);ctx.fill()}}
    for(const[lx] of[[LL-.5],[.5]]){const r=[];for(let j=0;j<=8;j++){const ly=-CY+j*CY/4;r.push(P(TT([lx,ly,lidTop(lx)+.1])))}ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.2;line(r);ctx.stroke();ctx.strokeStyle=K.brass.d;ctx.lineWidth=3;ctx.stroke()}}
  // the hasp of the lock hanging from its front edge
  {const n=Dd([1,0,0]);if(F(n)>-.1){const q=[[LL+.4,-4,LT+1],[LL+.4,4,LT+1],[LL+.4,4,-8],[LL+.4,0,-10],[LL+.4,-4,-8]].map(c2=>P(TT(c2)));poly(q);ctx.fillStyle=softBox(bbox(q),K.brass.b,.25,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}}
  if(!off&&F(Dd([-1,0,.3]))>0){ctx.beginPath();for(const ly of[-14,14]){const q=[[-.4,ly-4,LT+2],[-.4,ly+4,LT+2],[-.4,ly+4,-5],[-.4,ly-4,-5]].map(c2=>P(TT(c2)));ctx.moveTo(q[0][0],q[0][1]);for(const s2 of q)ctx.lineTo(s2[0],s2[1]);ctx.closePath()}ctx.fillStyle=K.brass.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke()}
  poly(Hh);ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.stroke();rimK(Hh,.24,K.k2>.5?'255,170,90':'255,226,170');
  // the teeth under its front edge (the middle one is gold: the miser)
  if(under&&!o.good){const lit2=A.sig&&A.sig.k==='lid'?A.sig.on:0,TT2=[];for(let i=0;i<7;i++){const ly=[-19,-14,-5,0,5,14,19][i],hh=(i===3?5:3.6+.8*Math.abs(Math.sin(i*1.9)));TT2.push({g:i===3,q:[TT([LL-1,ly-2.1,0]),TT([LL-2,ly,-hh]),TT([LL-1,ly+2.1,0])]})}
      for(const sd of[-1,1])for(let i=0;i<3;i++){const lx=LL-6-i*6;TT2.push({q:[TT([lx-2,sd*(CY-1),0]),TT([lx,sd*(CY-2.2),-3.2]),TT([lx+2,sd*(CY-1),0])]})}
      for(const gpass of[false,true]){ctx.beginPath();for(const t of TT2){if(!!t.g!==gpass)continue;const[a,b,c2]=t.q.map(q=>P(q));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c2[0],c2[1]);ctx.closePath()}
        ctx.fillStyle=gpass?K.gtooth.b:(lit2>.3?cmix(K.tooth.l,'#fff6d0',lit2):K.tooth.l);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}
      if(A.glint>0&&!LOWFX){const g=P(TT([LL-2,0,-4]));starS(g[0]+2,g[1]-2,2.4,A.glint)}}
  // the cobwebs at the two back top corners, from the lid's end down to the side and back walls (torn the first time it opens wide: two
  // threads hang from the lid)
  if(!LOWFX&&fx&&!off)for(const sd of[-1,1]){if(F(X.Rd([-1,sd,.6]))<.05)continue;const W=q=>P(X.T([q[0]*sw,q[1]*sw,q[2]])),la=P(TT([1.5,sd*CY,lidTop(1.5)*.8])),lb=P(TT([5,sd*CY,lidTop(5)*.7]));
    ctx.strokeStyle=K.web;ctx.lineWidth=.7;ctx.lineCap='round';ctx.beginPath();
    if(!A.torn&&th<40*DEG){const k0=W([-CX,sd*CY,CH]),sb=W([-CX+10,sd*CY,CH-8]),bc=W([-CX,sd*(CY-10),CH-8]),ends=[la,sb,bc];
      for(const e of ends){ctx.moveTo(k0[0],k0[1]);ctx.lineTo(e[0],e[1])}
      for(const u of[.5,1]){const m=ends.map(e=>[lerp(k0[0],e[0],u),lerp(k0[1],e[1],u)]);for(let i=0;i<2;i++){const a=m[i],b=m[i+1];ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2*.8+k0[0]*.2,(a[1]+b[1])/2*.8+k0[1]*.2,b[0],b[1])}}}
    else{ctx.moveTo(la[0],la[1]);ctx.quadraticCurveTo(la[0]+sd,la[1]+5,la[0]+sd*.5,la[1]+10);ctx.moveTo(lb[0],lb[1]);ctx.lineTo(lb[0]-sd*.5,lb[1]+6)}
    ctx.stroke()}
  return Hh}
// the tongue: a chain of raspberry balls from the root in the mouth, over the front rim a little to its left (so the lock shows); hanging,
// licking the rim, or lashing out along the floor (A.tg.lash: len, ang, wave, slap; up: in the air after the spit). Two passes: 'in' (from
// the root to the rim, inside the mouth, clipped to the opening) and 'out' (from the rim on)
const TY=-8;
function tonguePts(X,A){const tg=A.tg,sw=1+(A.sw||0),T=q=>X.T([q[0]*sw,q[1]*sw,q[2]]),root=T([6,TY*.5,22]),lip=T([CX+2,TY,CH+1]);let pts=[],k0=1;
  if(tg.lash&&(tg.lash.len>4||tg.lash.tip&&tg.lash.ext>.03)){let L0=tg.lash.len,rt;const an=tg.lash.ang||0,ca=Math.cos(an),sa=Math.sin(an),base=X.T([0,0,0]),fw=X.Rd([1,0,0]),fx0=nrm([fw[0],fw[1],0]);
    if(tg.lash.tip&&A._face!=null){const c=Math.cos(A._face),s1=Math.sin(A._face),sc=A._sc||1,sx=tg.lash.tip[0]/sc,sy=tg.lash.tip[1]/sc/C.cam.k,tx=sx*c+sy*s1,ty=-sx*s1+sy*c,dx=tx-base[0],dy=ty-base[1],l=Math.hypot(dx,dy)||1;L0=Math.max(40,l)*tg.lash.ext;rt=[dx/l,dy/l,0]}
    else rt=[fx0[0]*ca-fx0[1]*sa,fx0[0]*sa+fx0[1]*ca,0];
    const B0=[base[0],base[1],0],f0=T([CX+3,TY*.6,CH-2]);pts.push(root,lip,f0);const N=9;for(let i=1;i<=N;i++){const s2=i/N,d=lerp(30,L0,s2),z=tg.lash.up?lerp(f0[2],8,s2):lerp(f0[2],2,Math.min(1,s2*3)),
      w=tg.lash.wave>=0?6*Math.sin((s2-tg.lash.wave*1.2)*TAU*1.5)*Math.max(0,1-Math.abs(s2-tg.lash.wave)*2):0;pts.push([B0[0]+rt[0]*d-rt[1]*w,B0[1]+rt[1]*d+rt[0]*w,z+(i===N?-1.5*(tg.lash.slap||0):0)])}}
  else if(tg.curl>.3){// rolled inside the mouth against the velvet
    const c0=T([2,0,24]);for(let i=0;i<6;i++){const a=i/6*TAU*.9,r=6-i*.6;pts.push(add(c0,X.Rd([Math.cos(a)*r,Math.sin(a)*r*.4,Math.sin(a)*r*.6])))}k0=pts.length-1}
  else{const out=tg.out||0;if(out<2)return null;const hang=out,side=tg.side||0,sw2=tg.sway||0,lk=tg.lick>=0?tg.lick:-1;
    if(lk>=0){// licks the rim from one side to the other
      const ly=lerp(-CY+6,CY-6,lk);pts=[root,T([CX-4,ly*.6,CH+3]),T([CX+1,ly,CH+4]),T([CX+3,ly*1.05,CH+1])]}
    else{pts.push(root,lip);for(let i=1;i<=4;i++){const s2=i/4;pts.push(T([CX+3+2*s2,TY*(1+.35*s2)+(sw2+side*10)*s2,CH-hang*s2]))}}}
  return{pts,k0}}
function tongueDraw(V0,X,A,K,fx,pass){const tp=A._tp;if(!tp)return;const{P}=V0,tg=A.tg,all=tp.pts,n0=all.length,rsA=all.map((_,i)=>lerp(4.2,2.4,i/(n0-1)));
  const a=pass==='in'?0:tp.k0,b=pass==='in'?tp.k0+1:n0;if(b-a<2)return;const pts=all.slice(a,b),rs=rsA.slice(a,b),n=pts.length;
  const glow=tg.glow||0,col=glow>.3?cmix(K.tongue.b,'#ffd0a0',glow*.7):K.tongue.b;C.chain(V0,pts,rs,col,{lw:2,rim:.2});
  const Q=pts.map(q=>P(q));ctx.strokeStyle=K.tline;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();Q.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]-rs[i]*.3):ctx.moveTo(q[0],q[1]-rs[i]*.3));ctx.stroke();
  const tip=b===n0;if(glow>0&&!LOWFX&&tip){const q=Q[n-1];shine('255,190,150',q[0],q[1],12,.6*glow)}
  // a drop of drool every 1.5 s (when it hangs)
  if(fx&&tip&&pass==='out'&&!tg.lash&&!LOWFX&&(tg.out||0)>8&&tg.lick<0){const u=((A.t||0)/1.5)%1,q=Q[n-1];ctx.fillStyle=K.drool;ctx.beginPath();ctx.ellipse(q[0],q[1]+2+u*10,1.2,1.8+u,0,0,TAU);ctx.fill()}}
// the eyes leave a soft amber light out of the slit, over the teeth and the lid's brow; in the shut chest (the flash of the real one, the
// shaking wrong one) two slits of amber show in the crack
function eyeGlow(V0,X,A,K,o){if(o.good||A.eye.op<.05)return;const fw=V0.F(X.Rd([1,0,.2]));if(fw<-.15)return;const sw=1+(A.sw||0),k=A.eye.op*cl(fw+.15,0,1);
  if(A.chest){for(const e of EYE){const q=V0.P(X.T([(CX-.5)*sw,e[1]*sw,CH+A.th/DEG*.3+.8]));if(!LOWFX)shine(K.eyeG,q[0],q[1],9,.5*k);ctx.save();ctx.globalAlpha*=k;
      ctx.fillStyle=K.iris;ctx.beginPath();ctx.ellipse(q[0],q[1],4.2,1.4,0,0,TAU);ctx.fill();ctx.fillStyle=K.irisC;ctx.beginPath();ctx.ellipse(q[0],q[1],2.2,.75,0,0,TAU);ctx.fill();ctx.fillStyle='#1b1612';ctx.fillRect(q[0]-.45,q[1]-1.2,.9,2.4);ctx.restore()}return}
  if(LOWFX)return;for(const e of EYE){const q=V0.P(X.T([e[0]*sw,e[1]*sw,e[2]]));shine(K.eyeG,q[0],q[1],10,.3*k)}}
// the coins and the chips the model draws itself (the game throws the real ones)
function coinsDraw(V0,X,A,K){const{P}=V0;for(const c of A.coins){const t=cl(c.t,0,1);
  if(c.k==='puff'||c.k==='fount'||c.k==='pop'||c.k==='hic'||c.k==='drop'||c.k==='leak'){const n=c.k==='puff'?7:c.k==='fount'?(LOWFX?4:8):1;const m=X.T([CX+4,0,CH+2]);
    for(let i=0;i<n;i++){let q;if(c.k==='puff'){const a=(i-(n-1)/2)*.2;q=[m[0]+Math.cos(a)*t*40,m[1]+Math.sin(a)*t*40,m[2]-t*14]}else if(c.k==='fount'){const a=i/n*TAU+Math.sin(i*7.3)*.5,u=cl((t-(i*.37%1)*.35)/.65,0,1),h=44+22*((i*.61)%1),d=(18+14*((i*.83)%1))*u;q=[m[0]+Math.cos(a)*d,m[1]+Math.sin(a)*d,m[2]+h*Math.sin(Math.PI*u)-(u>.5?(u-.5)*30:0)];if(u<=0||u>=1)continue}
      else if(c.k==='pop'){const s=X.T([CX,(c.s*37%1-.5)*30,12]);q=[s[0]+t*8,s[1],s[2]+16*Math.sin(Math.PI*t)]}else if(c.k==='hic'){q=[m[0]+t*24,m[1],m[2]+16*Math.sin(Math.PI*t)-t*t*30]}
      else if(c.k==='leak'){const s=X.T([CX+6,0,CH]);q=[s[0]+t*14,s[1]+(i-.5)*6,Math.max(1,s[2]*(1-t))]}else q=[m[0]+2,m[1],m[2]-t*CH];
      const s=P(q);ctx.fillStyle=K.gold.b;ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(s[0],s[1],3,1.5+1.2*Math.abs(Math.sin(t*12+i)),0,0,TAU);ctx.fill();ctx.stroke()}}
  else if(c.k==='chips'||c.k==='dust'){const m=X.T([CX+10,0,0]),n=c.big?8:5;C3K.dust(V0,[m[0],m[1],0],t,LOWFX?3:6,c.big?16:12,c.k==='dust'?'200,190,170':'180,150,110',.5);
    if(c.k==='chips'){ctx.fillStyle=K.wood.b;ctx.strokeStyle=INK;ctx.lineWidth=.8;for(let i=0;i<n;i++){const a=i/n*TAU+.6,d=20*t,z=14*Math.sin(Math.min(1,t*1.4)*Math.PI),s=P([m[0]+Math.cos(a)*d,m[1]+Math.sin(a)*d,z]);ctx.beginPath();ctx.rect(s[0]-1.6,s[1]-.9,3.2,1.8);ctx.fill();ctx.stroke()}}}
  else if(c.k==='scratch'){const m=X.T([40,0,0]);ctx.strokeStyle=`rgba(40,30,20,${.5*(1-t)})`;ctx.lineWidth=1.2;for(const dy of[-8,0,8]){const a=P([m[0],m[1]+dy,0]),b=P([m[0]-14*t,m[1]+dy,0]);seg(a,b);ctx.stroke()}}}}
// ------------------------------------------------------------------ the model
function mimic2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};if(anim==='chest'&&!o._live&&!o.noCache&&chestStill(o)){chestBlit(x,y,o.z||0,face,sc,o);return}const V0=V(face),{P,D,F}=V0,A=mPose(anim,p,o),fx=fxOn(o);A.t=p*(N3.meta.mimic2.dur[anim]||1);
  if(anim==='chest'||A.chest)chestOpts(A,o,p);const K=pal(A.red);
  const X=frame({B:[A.B[0],A.B[1]+(A.shake||0),A.B[2]],lean:A.lean,roll:A.roll,yaw:A.yaw},18),fade=A.fade;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(fade<1)ctx.globalAlpha*=fade;
  // its shadow: an ellipse under the chest, darker where the feet are; smaller and lighter up in the air
  if(!(typeof noShadow!=='undefined'&&noShadow)&&o.shadow!==false){const q=P(A.B[0],A.B[1],0),air=cl((A.B[2]-60)/120,0,.6),k=KR();ctx.fillStyle=`rgba(0,0,0,${.3*(1-air)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],44*(1-air*.5),18*k*(1-air*.5),0,0,TAU);ctx.fill();
    if(A.legK>.2)for(const f of A.feet){const s=P(f[0],f[1],0);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(s[0],s[1],7,3*k,0,0,TAU);ctx.fill()}}
  if(A.floorGlow>0&&!LOWFX){const q=P(X.T([CX+18,0,0])[0],X.T([CX+18,0,0])[1],0);shine(K.goldG,q[0],q[1],40,.4*A.floorGlow,18)}
  const L=parts(),R0={B:[0,0,60]},X0=frame(R0,18);
  for(let i=0;i<2;i++){const sd=i?1:-1;
    L.add(D(X0.T([HIP[i][0],HIP[i][1]+sd*6,-30]))-200*(A.legK<.05?1:0),()=>legDraw(V0,X,A,i,K));
    L.add(D(add(X0.T(SHO[i]),[12,sd*28,-20])),()=>armDraw(V0,X,A,i,K))}
  L.add(D(X0.T([0,0,18])),()=>{chestDraw(V0,X,A,K,o);if(!A.chest&&A.th>2.5*DEG||A.lidOff||A.chest&&A.th>6*DEG)insideDraw(V0,X,A,K,o,fx)});
  L.add(D(X0.T([0,0,CH+12])),()=>{if(A.lidOff&&!A.lidOff.land)return;lidDraw(V0,X,A,K,o,fx);eyeGlow(V0,X,A,K,o)});
  A._face=face;A._sc=sc;A._tp=o.good?null:tonguePts(X,A);if(A._tp){const tp=A._tp,q=A.tg.lash?tp.pts[Math.floor((tp.k0+tp.pts.length)/2)]:X0.T([CX+2,TY,CH+1]);L.add(D(q),()=>tongueDraw(V0,X,A,K,fx,'out'))}
  if(A.lidOff&&!A.lidOff.land)L.add(1e6,()=>lidDraw(V0,X,A,K,o,fx));
  run(L);if(A.lidOff&&A.lidOff.land)lidDraw(V0,X,A,K,o,fx);
  coinsDraw(V0,X,A,K);
  if(A.stars>0){const q=P(X.T([0,0,CH+30]));for(let i=0;i<3;i++){const an=(A.t||0)*5+i*TAU/3;starS(q[0]+Math.cos(an)*16,q[1]+Math.sin(an)*5,3,A.stars)}}
  ctx.restore()}
function legDraw(V0,X,A,i,K){if(A.legK<.03)return;const sd=i?1:-1,hip=X.T(HIP[i]),f=A.feet[i],foot=lerp3(hip,f,A.legK),pole=X.Rd([-1,sd*.35,.5]),[kn,ft]=ik(hip,foot,34*A.legK+.1,32*A.legK+.1,pole);
  const r=limb2(V0,hip,kn,ft,[6*A.legK+.8,4.8*A.legK+.6,3.6*A.legK+.5],K.limb,{kn:4.4*A.legK+.4,knC:K.knuckle});if(A.legK<.4)return;
  {const g=ctx.createLinearGradient(r.A2[0],r.A2[1],r.J[0],r.J[1]);g.addColorStop(0,'rgba(40,24,14,.38)');g.addColorStop(.7,'rgba(40,24,14,0)');ctx.fillStyle=g;hull(r.A2,6*A.legK+.8,r.J,4.8*A.legK+.6);ctx.fill()}
  const ank=lerp3(ft,kn,.2),sig=A.sig&&A.sig.k==='legs'?A.sig.on:0;bracer(V0,lerp3(ft,kn,.16),lerp3(ft,kn,.26),4.2,K,Math.max(sig,A.red>.5?.25:0));
  // three toes forward and out with little nails
  const fw=nrm([Math.cos(.0),0,0]),bw=X.Rd([1,sd*.3,0]);ctx.lineCap='round';const toes=[-.5,0,.5].map(a=>{const d=nrm([bw[0]*Math.cos(a)-bw[1]*Math.sin(a),bw[0]*Math.sin(a)+bw[1]*Math.cos(a),0]);return[V0.P(ft),V0.P(add(ft,add(mul(d,9),[0,0,ft[2]<4?-ft[2]+.5:-4])))]});
  ctx.strokeStyle=INK;ctx.lineWidth=4.6;ctx.beginPath();for(const[a,b] of toes){ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();ctx.strokeStyle=K.limb.b;ctx.lineWidth=2.4;ctx.stroke();
  ctx.fillStyle=K.claw.d;for(const[,b] of toes){ball(b,1.2);ctx.fill()}}
function armDraw(V0,X,A,i,K){if(A.armK<.03)return;const sd=i?1:-1,sh=X.T(SHO[i]),hT=A.hands[i],hand=lerp3(sh,hT,A.armK),pole=X.Rd([0,sd,.5]),[el,wr]=ik(sh,hand,50*A.armK+.1,48*A.armK+.1,pole);
  limb2(V0,sh,el,wr,[5.4*A.armK+.5,4.3*A.armK+.5,3.3*A.armK+.5],K.limb,{kn:4.2*A.armK+.3,knC:K.knuckle});if(A.armK<.4)return;
  const sig=A.sig&&A.sig.k==='arms'?(A.sig.t>=1?A.sig.on:sstep(.4,1,A.sig.t)):0;bracer(V0,lerp3(wr,el,.13),lerp3(wr,el,.21),4,K,Math.max(sig,A.red>.5?.25:0));
  // the hand: a small palm and three long fingers curling toward it, ivory claws with dark tips (spread: open wide)
  const fwd=nrm(sub(wr,el)),side=nrm(cross(fwd,[0,0,1])),dn=nrm(cross(side,fwd)),sp=A.spread[i]||0,fl=A.fing[i]||0;ctx.lineCap='round';
  const F3=[-1,0,1].map(j=>{const a=j*(.35+.4*sp),d=nrm(add(mul(fwd,Math.cos(a)),mul(side,Math.sin(a)))),lift=(A.tap[i]&&A.tap[i][j+1]||0)+(j===0?A.raise[i]*8:0),
    m=add(wr,add(mul(d,7),[0,0,lift*.5])),cu=j===0&&fl>0?fl:0,t=add(m,add(mul(d,6*(1-cu*.6)),mul(dn,-(4-6*sp)*(1-cu)+cu*6)));return[wr,m,add(t,[0,0,lift])]});
  ctx.strokeStyle=INK;ctx.lineWidth=4.4;ctx.beginPath();for(const f of F3){const q=f.map(V0.P);ctx.moveTo(q[0][0],q[0][1]);ctx.lineTo(q[1][0],q[1][1]);ctx.lineTo(q[2][0],q[2][1])}ctx.stroke();ctx.strokeStyle=K.limb.b;ctx.lineWidth=2.4;ctx.stroke();
  const wq=V0.P(wr);ctx.fillStyle=softBall(wq,3.6,K.limb.b,.3,.3);ctx.strokeStyle=INK;ctx.lineWidth=1.5;ball(wq,3.6);ctx.fill();ctx.stroke();
  for(const f of F3){const a=V0.P(f[1]),b=V0.P(f[2]),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,e=[b[0]+dx/l*5,b[1]+dy/l*5],w=1.6;ctx.beginPath();ctx.moveTo(b[0]-dy/l*w,b[1]+dx/l*w);ctx.lineTo(e[0],e[1]);ctx.lineTo(b[0]+dy/l*w,b[1]-dx/l*w);ctx.closePath();
    ctx.fillStyle=sig>.6?'#fff6d0':K.claw.l;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=K.claw.d;ball(e,.8);ctx.fill()}}
// the closed chest (pose 'chest', and N3.mimicChest): the options of the twin chests and of the fakes
function chestOpts(A,o,p){A.legK=0;A.armK=0;A.medal=0;A.B[2]=(o.z||0);A.tg.out=0;A.eye.op=0;A.red=A.third=A.crack=A.seams=0;A.chest=1;A.gold=0;
  let th=0;if(o.breath)th+=2*o.breath;if(o.real){th+=4*o.real;A.eye.op=o.real;A.red=o.p2?1:0}if(o.slide)A.roll=6*DEG*cl(o.slide,-1,1);
  if(o.shake){const k=o.shake;A.shake=Math.sin(k*120)*(1+k*3);th+=Math.abs(Math.sin(k*40))*(2+4*k)*(k>.1?1:0);if(k>.6){A.eye.op=sstep(.6,.7,k);A.red=0}if(k>.3&&k<.45)A.coins.push({k:'hic',t:(k-.3)/.15})}
  if(o.lid!=null){th=Math.max(th,cl(o.lid,0,1)*63);A.gold=o.gold!=null?o.gold:o.lid}A.th=th*DEG}
// the closed chest standing still is drawn once into a small image per direction, size and place (the Gioco delle Casse shows three at
// once, the twin chests two): a hop (z) moves the image, a slide tilts it, the shadow stays on the floor. Shaking, opening, the eyes'
// flash and the breath are drawn live.
const CHC={};let CHN=0;
const chestStill=o=>!(o.shake>0||o.lid>0||o.real>0||o.breath>0);
function chestBlit(x,y,z,face,sc,o){const fq=Math.round(face/(TAU/48)),f=fq*TAU/48,SS=Math.min(3,Math.max(1.5,Math.round((typeof cv!=='undefined'&&cv.width&&typeof VW!=='undefined'?cv.width/VW:2)*2)/2)),
    key=fq+'|'+Math.round(sc*40)+'|'+(o.mat||'')+'|'+(LOWFX?1:0)+'|'+SS+'|'+(o.torn?1:0);let c=CHC[key];
  if(!c){if(CHN>=32){for(const k in CHC)delete CHC[k];CHN=0}const W=Math.ceil(120*sc*SS),H=Math.ceil(130*sc*SS),c0=document.createElement('canvas');c0.width=W;c0.height=H;const g=c0.getContext('2d'),sv=ctx;ctx=g;
    try{g.setTransform(SS,0,0,SS,0,0);mimic2(W/SS/2,H/SS*.8,f,'chest',0,sc,{mat:o.mat,torn:o.torn,shadow:false,_live:1})}finally{ctx=sv}c=CHC[key]={cv:c0,ax:W/SS/2,ay:H/SS*.8,w:W/SS,h:H/SS};CHN++}
  if(o.shadow!==false&&!(typeof noShadow!=='undefined'&&noShadow)){const air=cl(z/120,0,.6),k=KR();ctx.fillStyle=`rgba(0,0,0,${.3*(1-air)})`;ctx.beginPath();ctx.ellipse(x,y,44*sc*(1-air*.5),18*sc*k*(1-air*.5),0,0,TAU);ctx.fill()}
  ctx.save();ctx.translate(x,y-z*sc*C.cam.zk);if(o.slide)ctx.rotate(6*DEG*cl(o.slide,-1,1)*Math.abs(Math.sin(f)));ctx.drawImage(c.cv,-c.ax,-c.ay,c.w,c.h);ctx.restore()}
const MV=['idle','walk','hit','chomp','tongue','tongue3','grab','gulp','coins','leap','stuck','hide','chest','pop','daze','rage','taunt','lure','enter','die'];
const DUR={idle:3,walk:.8,hit:.6,chomp:1.8,tongue:1.6,tongue3:2,grab:1.5,gulp:1.2,coins:1.6,leap:1.1,stuck:1,hide:.8,chest:1,pop:.5,daze:1,rage:2.4,taunt:1.1,lure:1.4,enter:2.8,die:3.4};
const LAB={idle:'Fermo',walk:'Corsa a scatti',hit:'Colpito',chomp:'Il Morso',tongue:'La Frustata',tongue3:'La Frustata a tre',grab:"L'Assaggio: la presa",gulp:"L'Assaggio: il boccone",
  coins:"Sputo d'oro",leap:'La Tagliola: un balzo',stuck:'Incastrato',hide:'Torna cassa',chest:'Cassa chiusa',pop:'Salta fuori',daze:'Stordito',rage:'Ha fame!',taunt:'Presa in giro',lure:"L'esca",enter:'Entrata',die:'Sconfitta'};
reg('mimic2',{n:'Il Mimic',g:'boss',sc:1,p2:true,an:MV,dur:DUR,lab:LAB},mimic2);
if(N3.mimic){const old=N3.mimic,oM=N3.meta.mimic;N3.meta.mimic2.old=(x,y,f,a,p)=>old(x,y,f,oM.an.includes(a)?a:'idle',p,oM.sc||1,{})}
// ------------------------------------------------------------------ drawings for the game, with the same look
// the closed chest of the twin chests and of the fakes of the Gioco delle Casse (z: the hop of the swaps)
N3.mimicChest=function(x,y,z,face,sc,o){o=Object.assign({},o||{},{z:z||0});mimic2(x,y,face==null?Math.PI/2:face,'chest',0,sc||1,o)};
// a gold coin in 3D (r 4.5): its rim, a star engraved, the light; spinning in the air with spin, lying on the floor with o.floor (o.glint)
N3.mimicCoin=function(x,y,z,spin,sc,o){sc=sc||1;o=o||{};const r=4.5*sc,K=pal(0);ctx.save();ctx.globalAlpha*=o.a==null?1:o.a;
  if(o.floor){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x,y+1,r*1.05,r*.5,0,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(x,y,r,r*.55,0,0,TAU);ctx.fillStyle=K.gold.b;ctx.fill();ctx.strokeStyle='#c88a1e';ctx.lineWidth=1.2*sc;ctx.stroke();
    ctx.strokeStyle='#9a5a16';ctx.lineWidth=.8*sc;ctx.beginPath();ctx.ellipse(x,y,r*.55,r*.3,0,0,TAU);ctx.stroke();if(o.glint>0)starS(x-r*.3,y-r*.3,2.4*sc,o.glint);ctx.restore();return}
  if(z>1){ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x,y,r*.8,r*.35,0,0,TAU);ctx.fill()}
  const w=Math.abs(Math.cos(spin||0)),q=[x,y-(z||0)];ctx.beginPath();ctx.ellipse(q[0],q[1],r*Math.max(.18,w),r,0,0,TAU);ctx.fillStyle=w>.3?K.gold.b:'#c88a1e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1*sc;ctx.stroke();
  if(w>.4){ctx.strokeStyle='#9a5a16';ctx.lineWidth=.8*sc;ctx.beginPath();ctx.ellipse(q[0],q[1],r*.55*w,r*.55,0,0,TAU);ctx.stroke();ctx.fillStyle='#fff6c8';ball([q[0]-r*.35*w,q[1]-r*.4],r*.22);ctx.fill()}ctx.restore()};
// a broken oak plank (length 16) with two nails (o.band: a piece of the brass band)
N3.mimicPlank=function(x,y,z,rot,sc,o){sc=sc||1;o=o||{};const K=pal(0);ctx.save();ctx.translate(x,y-(z||0));ctx.rotate(rot||0);ctx.scale(sc,sc);ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(-8,-2.5);ctx.lineTo(6,-2.5);ctx.lineTo(8,-1);ctx.lineTo(6.5,.5);ctx.lineTo(8,2.5);ctx.lineTo(-8,2.5);ctx.closePath();ctx.fillStyle=softBox([-8,-2.5,8,2.5],K.wood.b,.2,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
  ctx.fillStyle='#1b1612';for(const nx of[-5,3]){ball([nx,0],.7);ctx.fill()}if(o.band){ctx.fillStyle=K.brass.b;ctx.fillRect(-2,-2.5,4,5);ctx.strokeRect(-2,-2.5,4,5)}ctx.restore()};
for(const nm of['Chest','Coin','Plank'])N3['mimic2'+nm]=N3['mimic'+nm];
})();
