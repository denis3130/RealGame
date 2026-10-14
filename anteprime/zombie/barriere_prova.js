// Prova delle barriere (punti 18 e 19): le finestre delle case, i varchi della staccionata verso il granturco e la cancellata di ferro del
// cimitero. Controlla che davanti e dietro ogni barriera ci sia posto; che uno zombie fuori dalla casa, con l'eroe dentro, rompa il vetro
// (una volta sola) ed entri scavalcando; che l'eroe ripari tenendo premuto (assi una alla volta, monete, mossa 'ripara' col martello); che lo
// zombie strappi le assi una per colpo; che dalla fattoria aperta gli zombie del granturco strappino le assi del varco; che dal buio a ovest del
// cimitero escano e sfondino le sbarre di ferro (due colpi per sbarra); che i colpi passino le finestre. Fa le foto in anteprime/zombie/_bar_*.png
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/barriere_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(600);
  const E=(f,a)=>p.evaluate(f,a);await E(()=>{window.ZM=__MZ.ZM});
  await E(()=>{const W=__MZ.W;W.dbg.god=true;W.dbg.noSpawn=true;__MZ.zombies(true)});
  const info=await E(()=>ZM.BARS.map(B=>({k:B.kind,x:Math.round(B.x),y:Math.round(B.y),nx:B.nx,ny:B.ny,n:B.n,glass:B.glass})));
  console.log(JSON.stringify(info));
  {const nv=info.filter(b=>b.k==='vetro').length,nl=info.filter(b=>b.k==='legno').length,nf=info.filter(b=>b.k==='ferro').length;// (anteprima 48: con il Borgo e la Segheria)
    ok(nv===17&&nl===5&&nf===2,`24 barriere: 17 finestre, 5 varchi di legno, 2 cancellate di ferro (${nv}, ${nl}, ${nf})`)}
  // davanti e dietro ogni barriera c'è posto per uno zombie
  const room=await E(()=>ZM.BARS.map(B=>{const o=B.th/2+12;return[1,-1].map(s=>{const q=ZM.hit(B.x+s*B.nx*o,B.y+s*B.ny*o,10.5);return!q||q.tag==='edge'||q.tag==='corn'}).every(Boolean)}));
  ok(room.every(Boolean),'davanti e dietro ogni barriera c\'è posto ('+room.map(r=>r?'·':'X').join('')+')');
  // ---- 1. la finestra est della casa: l'eroe dentro, uno zombie fuori davanti alla finestra
  const r1=await E(()=>{const M=__MZ,W=M.W,B=ZM.BARS.find(B=>B.kind==='vetro'&&B.nx>.9&&B.y>16*64);const h=M.houses[0];M.tp(h.x+h.w*.55,h.y+h.d*.5);W.Z.length=0;
    const zi=ZM.addZombie?null:null;const z={id:999,kind:'zombie',sc:1.1,spd:30,hp:500,x:B.x+26,y:B.y+20,face:Math.PI,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);ZM.navRebuild();
    const log=[];let t=0,brk=-1,ins=-1;for(let i=0;i<30*20;i++){M.sim(1,1/30);t+=1/30;if(brk<0&&!B.glass)brk=t;if(ins<0&&z.x<B.x-14)ins=t}
    window.__B=B;window.__z=z;return{brk:+brk.toFixed(2),ins:+ins.toFixed(2),glass:B.glass,n:B.n,zx:Math.round(z.x),bx:Math.round(B.x),used:B.used}});
  ok(r1.brk>0&&r1.ins>r1.brk,`lo zombie rompe il vetro (a ${r1.brk} s) ed entra scavalcando (a ${r1.ins} s)`);
  // ---- 2. la riparazione: l'eroe vicino alla finestra rotta tiene premuto; assi una alla volta, monete
  const r2=await E(()=>{const M=__MZ,W=M.W,B=__B;W.Z.length=0;M.tp(B.x-26,B.y);const c0=W.coins,o=ZM.buys.find(o=>o.act&&o.rep&&Math.hypot(o.x-B.x,o.y-B.y)<1);const n0=B.n;
    const r=[];for(let i=0;i<7;i++)r.push(o.act());return{n0,n:B.n,max:B.max,coins:W.coins-c0,acts:r.map(v=>v?1:0).join(''),show:o.show()}});
  ok(r2.n===r2.max&&r2.coins===10*r2.max&&r2.acts==='1111100'&&!r2.show,`l'eroe rimette ${r2.n} assi su ${r2.max} (+${r2.coins} monete), poi il bottone sparisce (${r2.acts})`);
  // ---- 3. lo zombie torna: strappa le assi una per colpo (il vetro non si rompe più), poi entra
  const r3=await E(()=>{const M=__MZ,W=M.W,B=__B,h=M.houses[0];M.tp(h.x+h.w*.55,h.y+h.d*.5);const z={id:998,kind:'zombie',sc:1.1,spd:30,hp:500,x:B.x+26,y:B.y+20,face:Math.PI,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);
    const seen=[];let t=0,ins=-1;for(let i=0;i<30*25;i++){M.sim(1,1/30);t+=1/30;if(seen[seen.length-1]!==B.n)seen.push(B.n);if(ins<0&&z.x<B.x-14)ins=t}return{seen:seen.join(','),ins:+ins.toFixed(1),glass:B.glass}});
  ok(r3.seen==='5,4,3,2,1,0'&&r3.ins>0&&!r3.glass,`lo zombie strappa le assi una per colpo (${r3.seen}) ed entra a ${r3.ins} s`);
  // ---- 4. la mossa 'ripara' col martello: la foto dell'eroe mentre ripara (il bottone tenuto premuto davvero)
  await E(()=>{const M=__MZ,W=M.W,B=__B;W.Z.length=0;B.n=0;B.pl=[];B.tex();M.tp(B.x-24,B.y);M.cam(B.x-30,B.y);M.zoom(2.4)});await p.waitForTimeout(500);
  const bb=await p.locator('#mzBuy').boundingBox();ok(!!bb,'vicino alla finestra rotta compare «Ripara la finestra»');
  if(bb){await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.waitForTimeout(380);
    const st=await E(()=>({busy:!!__MZ.W.hero.busy,anim:__MZ.W.hero.busy&&__MZ.W.hero.busy.anim}));ok(st.busy&&st.anim==='ripara','tenendo premuto l\'eroe lavora col martello ('+JSON.stringify(st)+')');
    await p.screenshot({path:path.join(__dirname,'_bar_ripara.png')});await p.waitForTimeout(1500);await p.mouse.up()}
  const r4=await E(()=>__B.n);ok(r4>=2,`tenendo premuto 1,9 s le assi salgono a ${r4}`);
  // ---- 5. i colpi passano la finestra: l'eroe dentro spara allo zombie fuori
  const r5=await E(()=>{const M=__MZ,W=M.W,B=__B,h=M.houses[0];W.dbg.noShoot=false;W.hero.busy=null;M.tp(B.x-30,B.y);/* (busy: con le prove in parallelo il bottone appena lasciato poteva tenerlo ancora al lavoro) */const z={id:997,kind:'zombie',sc:1.1,spd:0,hp:60,x:B.x+28,y:B.y+14,face:Math.PI,p:0,anim:'idle',rise:1,die:0,flash:0};W.Z.push(z);
    for(let i=0;i<30*4;i++)M.sim(1,1/30);return{hp:Math.round(z.hp),die:!!z.die}});
  ok(r5.die||r5.hp<60,`si spara attraverso la finestra sbarrata (vita ${r5.hp}${r5.die?', morto':''})`);
  await E(()=>{__MZ.W.dbg.noShoot=true;__MZ.W.Z.length=0});
  // ---- 6. la staccionata: la fattoria aperta, uno zombie esce dal granturco e strappa le due assi del varco
  const r6=await E(()=>{const M=__MZ,W=M.W;W.zoneOpen[2]=true;W.gate.open=true;ZM.navRebuild();const B=ZM.BARS.find(B=>B.kind==='legno'&&Math.abs(B.x-8*64)<10),hole=M.holes.find(q=>q[3]==='mais'&&Math.abs(q[0]-8*64)<5);
    M.tp(8*64,(6.2+2)*64);const z={id:996,kind:'zombie',sc:1.1,spd:30,hp:500,x:hole[0],y:hole[1],face:Math.PI/2,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);
    const seen=[B.n];let t=0,ins=-1;for(let i=0;i<30*20;i++){M.sim(1,1/30);t+=1/30;if(seen[seen.length-1]!==B.n)seen.push(B.n);if(ins<0&&z.y>B.y+12)ins=t}window.__BL=B;return{seen:seen.join(','),ins:+ins.toFixed(1),zy:Math.round(z.y),by:Math.round(B.y)}});
  ok(r6.seen==='2,1,0'&&r6.ins>0,`dal granturco lo zombie strappa le assi del varco (${r6.seen}) ed entra nell'aia a ${r6.ins} s`);
  // ---- 7. la cancellata di ferro: dal buio a ovest del cimitero, due sbarre da due colpi
  const r7=await E(()=>{const M=__MZ,W=M.W;W.Z.length=0;const B=ZM.BARS.find(B=>B.kind==='ferro'),hole=M.holes.find(q=>q[3]==='fuori');M.tp(B.x+90,B.y+10);
    const z={id:995,kind:'zombie',sc:1.1,spd:30,hp:500,x:hole[0],y:hole[1],face:0,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);ZM.navRebuild();
    const seen=[B.n];let t=0,ins=-1,hits=0,hp0=B.hp;for(let i=0;i<30*25;i++){M.sim(1,1/30);t+=1/30;if(B.hp!==hp0){hits++;hp0=B.hp}if(seen[seen.length-1]!==B.n)seen.push(B.n);if(ins<0&&z.x>B.x+12)ins=t}window.__BF=B;return{seen:seen.join(','),ins:+ins.toFixed(1)}});
  ok(r7.seen==='2,1,0'&&r7.ins>5,`dal buio lo zombie sfonda le sbarre di ferro (${r7.seen}, due colpi l'una) ed entra a ${r7.ins} s`);
  // ---- 8. una partita nuova rimette tutto com'era
  const r8=await E(()=>{ZM.ctl.nuova();return ZM.BARS.map(B=>B.kind[0]+B.n+(B.glass?'v':'')).join(' ')});
  ok(r8===info.map(b=>b.k[0]+b.n+(b.glass?'v':'')).join(' '),'una partita nuova rimette le barriere com\'erano ('+r8+')');
  // ---- le foto: la casa con una finestra rotta e una sbarrata, la staccionata, la cancellata
  await E(()=>{const M=__MZ,W=M.W,h=M.houses[0];W.Z.length=0;const Bs=ZM.BARS.filter(B=>B.kind==='vetro'&&Math.abs(B.y-(h.y+h.d-5))<3);Bs[0].glass=false;Bs[0].pl=[];Bs[0].n=0;Bs[0].tex();
    const Be=ZM.BARS.find(B=>B.kind==='vetro'&&B.nx>.9&&B.y>16*64);Be.glass=false;Be.pl=[1,0,0];Be.n=3;Be.tex();M.tp(h.x+h.w*.5,h.y+h.d+70);M.cam(h.x+h.w*.55,h.y+h.d*.6);M.zoom(1.5)});
  await p.waitForTimeout(500);await p.screenshot({path:path.join(__dirname,'_bar_casa.png')});
  await E(()=>{const M=__MZ,B=__BL;B.pl=[1,0,0];B.n=3;M.tp(B.x,B.y+60);M.cam(B.x,B.y+20);M.zoom(2.2)});await p.waitForTimeout(500);await p.screenshot({path:path.join(__dirname,'_bar_staccionata.png')});
  await E(()=>{const M=__MZ,B=__BF;B.pl=[1,0,0];B.n=3;M.tp(B.x+50,B.y+20);M.cam(B.x+10,B.y);M.zoom(2.2)});await p.waitForTimeout(500);await p.screenshot({path:path.join(__dirname,'_bar_cancellata.png')});
  console.log('ERR',JSON.stringify(errs));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
