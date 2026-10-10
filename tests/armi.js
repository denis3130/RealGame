// Checks and draws the zombie-mode weapons (sprite/armi/disegno_armi.js). Run `python3 tests/mk.py` first. Usage: node tests/armi.js
// - every gun: fires, throws its cases, reloads to full, in its own controller (prints what happened and any error)
// - the coffin: a whole opening (pay, open, swaps, offer, take, close) and an escape (sink, come out again)
// - previews in sprite/armi/: armi.png (the 8 guns with their rounds and boxes), eroe_armi.png (the hero holding them in 8 directions),
//   ricariche.png (each gun's shot and reload, frame by frame), bara.png (the coffin's show), bara_fuga.png (the escape)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'..','sprite','armi');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts/.test(m.text()))errs.push(m.text())});
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:50,introSeen:1,runs:3,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1000);
await p.evaluate(c=>__E(c),fs.readFileSync(path.join(OUT,'disegno_armi.js'),'utf8'));
const save=(n,d)=>fs.writeFileSync(path.join(OUT,n),Buffer.from(d.split(',')[1],'base64'));

// 1. every gun's controller: hold the trigger until the magazine is empty, then it reloads by itself; count shots, cases, magazines
const chk=await p.evaluate(()=>__E(`(()=>{const A=ARMI,out=[];for(const id of A.ORDINE){const D=A.DATI[id],g=A.nuova(id),n={sparo:0,colpi:0,bossolo:0,caricatore:0,pronta:0,suoni:{}};let t=0;
  for(;t<30&&n.pronta<1;t+=1/120){const ev=g.update(1/120,true);if(!D.auto&&g.st!=='ricarica')g.prev=false;for(const e of ev){if(e.k==='sparo'){n.sparo++;n.colpi+=e.ang.length}else if(e.k==='suono')n.suoni[e.w]=(n.suoni[e.w]||0)+1;else n[e.k]+=(e.n||1)}
    A.held(id,Object.assign({hands:true},g.pose()))}
  out.push(id+': '+n.sparo+' spari ('+n.colpi+' proiettili), '+n.bossolo+' bossoli, '+n.caricatore+' caricatori, ricaricata in '+t.toFixed(1)+' s, poi '+g.mag+'/'+g.res+'  suoni '+JSON.stringify(n.suoni))}return out})()`));
console.log(chk.join('\n'));

// 2. the board of the 8 guns
save('armi.png',await p.evaluate(()=>__E(`(()=>{const A=ARMI,CW=800,CH=290,cols=2,PAD=24,W=CW*cols+PAD*3,H=CH*4+PAD*5+70;const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 g.fillStyle='#1d1814';g.fillRect(0,0,W,H);g.fillStyle='#f4e9d8';g.font='bold 40px sans-serif';g.fillText('Armi della modalità zombie',PAD,58);
 const saved=ctx;ctx=g;const MUN={pistola:'p9',revolver:'p44',mitraglietta:'smg',mitra:'rif',mitragliatrice:'lmg',pompa:'cart',tattica:'cartV',lanciarazzi:'razzo'};
 A.ORDINE.forEach((id,i)=>{const D=A.DATI[id],R=A.RAR[D.rar],x0=PAD+(i%cols)*(CW+PAD),y0=70+PAD+Math.floor(i/cols)*(CH+PAD);
  g.save();g.beginPath();g.roundRect(x0,y0,CW,CH,22);g.fillStyle='#4f4236';g.fill();g.clip();g.fillStyle=R.c;g.fillRect(x0,y0,CW,8);g.restore();g.lineWidth=4;g.strokeStyle='#120e0b';g.beginPath();g.roundRect(x0,y0,CW,CH,22);g.stroke();
  const M=A.G[id],L=M.len,sc=id==='pistola'||id==='revolver'?6.2:id==='mitraglietta'?5.6:id==='tattica'?5.2:id==='mitragliatrice'?4.6:4.3,mid=(L[0]+L[1])/2*1.35*sc;
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x0+300,y0+CH-46,(L[1]-L[0])*1.35*sc*.42,12,0,0,Math.PI*2);g.fill();
  A.arma(id,x0+300-mid,y0+CH*.52+(id==='lanciarazzi'?18:6),0,{sc,hands:true,skin:'#f2c9a0',glow:1});
  g.fillStyle='#fff6e6';g.font='bold 30px sans-serif';g.fillText(D.n,x0+24,y0+48);g.font='bold 18px sans-serif';const rw=g.measureText(R.n).width+22;g.fillStyle=R.c;g.beginPath();g.roundRect(x0+24,y0+60,rw,28,14);g.fill();g.fillStyle='#1d1814';g.fillText(R.n,x0+35,y0+80);
  g.fillStyle='#e8dcc8';g.font='17px sans-serif';g.fillText(D.d,x0+24,y0+CH-22,CW-48);
  const st=[['Danno',D.pel>1?D.dmg+' × '+D.pel:String(D.dmg)],['Colpi al secondo',String(D.rate)],['Caricatore',D.mag+' + '+D.res],['Ricarica',(id==='pompa'||id==='tattica'?D.rel+' s a cartuccia':D.rel+' s')]];
  st.forEach(([a,v],k)=>{g.fillStyle='#bfae95';g.font='bold 15px sans-serif';g.fillText(a,x0+560,y0+40+k*40);g.fillStyle='#fff6e6';g.font='bold 19px sans-serif';g.fillText(v,x0+560,y0+60+k*40)});
  A.munizione(MUN[id],x0+CW-170,y0+CH-78,id==='lanciarazzi'?7:4.4,-.5);A.cassaMun(D.mun,x0+CW-70,y0+CH-46,.6,3.6)});
 ctx=saved;return cv.toDataURL('image/png')})()`)));

// 3. the hero holding each gun in the 8 directions (the game's own drawRig; its held() draws the gun with ARMI.inMano)
save('eroe_armi.png',await p.evaluate(()=>__E(`(()=>{const A=ARMI,K=3,W=108,H=90,LW=K*44,TH=K*13,DIRS=[Math.PI/2,Math.PI/4,0,-Math.PI/4,-Math.PI/2,-3*Math.PI/4,Math.PI,3*Math.PI/4],
   DN=['Davanti','Davanti-destra','Destra','Dietro-destra','Dietro','Dietro-sinistra','Sinistra','Davanti-sinistra'];
 const cv=document.createElement('canvas');cv.width=W*K*8+LW;cv.height=H*K*8+TH;const g=cv.getContext('2d');g.fillStyle='#5a4c3e';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#2a221c';g.fillRect(0,0,cv.width,TH);g.fillRect(0,0,LW,cv.height);
 g.fillStyle='#f4e9d8';g.font='bold '+(K*5.2)+'px sans-serif';g.textAlign='center';DN.forEach((d,i)=>g.fillText(d,LW+W*K*(i+.5),TH*.68));g.textAlign='left';g.font='bold '+(K*6)+'px sans-serif';
 A.ORDINE.forEach((id,j)=>{const n=A.DATI[id].n.replace(' da ',' da\\u00a0').split(' ');n.forEach((w,k)=>g.fillText(w,K*3,TH+H*K*(j+.5)+k*K*7-(n.length-1)*K*3.5+K*2))});
 const _h=held;held=function(S,o,B){if(S.held!=='armaZ')return _h(S,o,B);A.inMano(S.gun,B,{hands:true,skin:S.skin})};const saved=ctx;ctx=g;
 try{A.ORDINE.forEach((id,j)=>{const sty=Object.assign({},HERO,{held:'armaZ',gun:id,quiver:false});
   DIRS.forEach((f,i)=>{ctx.save();ctx.translate(LW,TH);ctx.scale(K,K);ctx.beginPath();ctx.rect(W*i,H*j,W,H);ctx.clip();drawRig(W*i+W/2,H*j+H*.6,f,0,false,sty,{});ctx.restore()})})}
 finally{held=_h;ctx=saved}return cv.toDataURL('image/png')})()`)));

// 4. every gun's shot and reload, frame by frame, from its own controller, with the cases and magazines it throws
save('ricariche.png',await p.evaluate(()=>__E(`(()=>{const A=ARMI,K=4,W=120,H=64,NF=12,cv=document.createElement('canvas');cv.width=W*K*NF;cv.height=H*K*8;const g2=cv.getContext('2d');g2.fillStyle='#5a4c3e';g2.fillRect(0,0,cv.width,cv.height);
 const saved=ctx;ctx=g2;
 A.ORDINE.forEach((id,j)=>{const D=A.DATI[id],g=A.nuova(id),dt=1/120,sh=id==='pompa'||id==='tattica';let t=0;A.FX.splice(0);
  const hold=id==='mitragliatrice'?.9:D.auto?.3:dt*1.5,relAt=id==='lanciarazzi'?99:Math.max(hold,.55)+.25,R=sh?D.rel*3+.4:id==='lanciarazzi'?D.rel+.35:D.rel,
    shot=id==='mitragliatrice'?[0,.3,.62,.68,1]:sh?[0,.017,.06,.24,.34]:id==='lanciarazzi'?[0,.017,.06,.15,.3]:id==='revolver'?[0,.017,.06,.15,.5]:[0,.017,.05,.1,.25],
    r0=id==='lanciarazzi'?0:relAt,nr=NF-shot.length,C=shot.concat([...Array(nr)].map((_,i)=>r0+(id==='lanciarazzi'?.36:0)+R*(i+.5)/nr*(id==='lanciarazzi'?(R-.35)/R:1))).sort((a,b)=>a-b);
  const fr=[];let ci=0,rel=false;
  for(let s=0;ci<C.length&&s<2400;s++){if(!rel&&t>=relAt&&id!=='lanciarazzi'){rel=true;if(g.mag>=D.mag)g.mag=D.mag-3;g.ricarica()}
   const ev=g.update(dt,t<hold),P=A.punti(id,0,0,0,g.pose());for(const e of ev){if(e.k==='bossolo'){const q=id==='revolver'?P.mag:P.eject;if(q)A.espelli(id,q[0],q[1],0,1,20-q[1],e.n||1)}if(e.k==='caricatore'&&P.mag)A.espelliCar(id,P.mag[0],P.mag[1],0,1,20-P.mag[1])}
   A.fxUpdate(dt);while(ci<C.length&&t>=C[ci]-1e-9){fr.push({t,pose:g.pose(),st:g.st,fx:A.FX.map(q=>({...q}))});ci++}t+=dt}
  fr.forEach((f,i)=>{ctx.save();ctx.scale(K,K);ctx.beginPath();ctx.rect(W*i,H*j,W,H);ctx.clip();const cx=W*i+W*.42,cy=H*j+H*.55;ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(W*i,H*j+H-1,W,1);ctx.fillRect(W*i+W-1,H*j,1,H);
   A.arma(id,cx,cy,0,Object.assign({hands:true,skin:'#f2c9a0'},f.pose));A.FX.splice(0,A.FX.length,...f.fx);ctx.save();ctx.translate(cx,cy);A.fxDraw('suolo');A.fxDraw('aria');ctx.restore();
   ctx.fillStyle='#fff';ctx.font='bold 5px sans-serif';ctx.fillText(f.t.toFixed(2)+'s '+f.st,W*i+2,H*j+6);ctx.restore()})});
 A.FX.splice(0);ctx=saved;return cv.toDataURL('image/png')})()`)));

// 5. the coffin: an opening (taking the gun) and an escape
const bara=await p.evaluate(()=>__E(`(()=>{const A=ARMI,res={},log=[];
 for(const[name,fuga,T] of[['bara',false,[0.01,.3,.6,.86,1.12,1.42,2.4,3.4,4.4,5.4,6,7,7.3,7.7,8.1,8.6]],['bara_fuga',true,[5.4,5.8,6.45,6.75,7.05,7.3,7.6,7.9,8.2,8.6,9.4,10.4,10.9,11.3,11.8,12.4]]]){
  const K=3,W=130,H=120,cols=8,rows=Math.ceil(T.length/cols),cv=document.createElement('canvas');cv.width=W*K*cols;cv.height=H*K*rows;const g=cv.getContext('2d');g.fillStyle='#4a3f34';g.fillRect(0,0,cv.width,cv.height);
  const saved=ctx;ctx=g;const b=A.nuovaBara(65,92);b.T=3.3;if(fuga)b.usi=5;b.paga(20,112,'pistola');if(fuga)b.forza(true);let t=0,ti=0,off=-1,seen={};
  while(ti<T.length&&t<16){const ev=b.update(1/120);for(const e of ev){seen[e.k==='suono'?e.w.replace(/\\d+$/,''):e.k]=1;if(e.k==='offerta')off=t}if(off>=0&&t-off>1.6&&b.st==='offre')b.prendi();
   while(ti<T.length&&t>=T[ti]){const i=ti%cols,j=Math.floor(ti/cols);ctx.save();ctx.scale(K,K);ctx.translate(W*i,H*j);ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();ctx.fillStyle='#5a4c3e';ctx.fillRect(0,0,W,H);
     b.draw();ctx.fillStyle='#fff';ctx.font='bold 6px sans-serif';ctx.fillText(t.toFixed(2)+'s '+b.st,3,8);ctx.restore();ti++}t+=1/120}
  ctx=saved;res[name]=cv.toDataURL('image/png');log.push(name+': '+Object.keys(seen).join(', '))}
 res.log=log;return res})()`));
save('bara.png',bara.bara);save('bara_fuga.png',bara.bara_fuga);console.log(bara.log.join('\n'));
console.log(errs.length?'ERRORI:\n'+errs.slice(0,10).join('\n'):'nessun errore');await b.close()})();
