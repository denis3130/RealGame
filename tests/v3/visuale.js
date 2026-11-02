// La visuale in terza e prima persona della modalità zombie (src/js/105-visuale-3d.js, anteprime/mk_visuale.py): prima python3 tests/v3/mk.py.
// La partita parte in terza persona; il terreno e la mappa in 3D; camminare va dove guarda la telecamera, girare la visuale la gira; si spara
// allo zombie davanti; in prima persona l'arma in mano e il colpo dalla canna; in casa il tetto sparisce; la telecamera non entra nei muri;
// la Bara; dall'alto torna come prima; effetti bassi; i tempi. Foto in tests/v3/vi_*.png.
const {chromium}=require('playwright');const path=require('path');const D=path.join(__dirname,'/');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});// (the test browser draws 3D without a graphics card: slow, so 1×)
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:1});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  let nok=0,nno=0;const ok=(t,c,x)=>{if(c)nok++;else nno++;console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''))};
  await p.goto('file://'+path.join(__dirname,'test_v3.html'));await p.waitForTimeout(2500);const E=s=>p.evaluate(s=>window.__E(s),s),J=async s=>JSON.parse(await E(s));
  await E(`try{closeSheet()}catch(e){};SAVE.modo='zombie';SAVE.hero='arciere';SAVE.runs=Math.max(1,SAVE.runs||0);zGo();0`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&ZM.W.director.st)`))break}
  for(let i=0;i<90;i++){await p.waitForTimeout(300);if(await E(`!!(window.__V3&&__V3.built&&__V3.on)`))break}
  await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;__V3.noLow=1;__V3.low=false;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);await p.waitForTimeout(800);
  const s0=await J(`JSON.stringify({mode:__V3.mode,on:ZM.W.v3.on,btn:(document.getElementById('v3btn')||{}).textContent||'',ground:G3.ground.length,pages:V3A.pages.length,gl:__V3.gl.getError(),tb:Math.round(__V3.tBuild)})`);
  ok('la partita parte da sola in terza persona, col bottone «Visuale» e il mondo in 3D (terreno, fogli delle texture)',s0.mode==='terza'&&s0.on&&/Terza persona/.test(s0.btn)&&s0.ground>0&&s0.pages>0&&s0.gl===0,s0);
  await p.screenshot({path:D+'vi_terza.png'});
  // walking: forward goes where the camera looks; after turning the view, the new way
  const walk=async(key,ms)=>{const a=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y,__V3.th])`);await p.keyboard.down(key);await p.waitForTimeout(ms);await p.keyboard.up(key);await p.waitForTimeout(150);
    const c=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);return{d:Math.hypot(c[0]-a[0],c[1]-a[1]),a:Math.atan2(c[1]-a[1],c[0]-a[0]),th:a[2]}};
  const dA=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  const w1=await walk('KeyW',2200);ok('in terza persona la levetta in su (W) porta l\'eroe dove guarda la telecamera',w1.d>25&&dA(w1.a,w1.th)<.3,w1);
  const th0=await E(`__V3.th`);await p.keyboard.down('KeyE');await p.waitForTimeout(900);await p.keyboard.up('KeyE');await p.waitForTimeout(900);const th1=await E(`__V3.th`);
  const w2=await walk('KeyW',2200);ok('girando la visuale (E) la telecamera gira e l\'eroe cammina nella direzione nuova',dA(th0,th1)>.3&&w2.d>20&&dA(w2.a,th1)<.3,{th0,th1,w2});
  const w3=await walk('KeyD',2200);ok('a destra (D) va alla destra della telecamera',w3.d>20&&dA(w3.a,th1+Math.PI/2)<.35,w3);
  // a zombie ahead: the hero shoots it
  const put=(off,dist)=>E(`(()=>{const h=ZM.W.hero,f=__V3.th+(${off});for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const k=window.__MZ.addZombie('zombie',h.x+Math.cos(f)*${dist},h.y+Math.sin(f)*${dist},0);const z=ZM.W.Z[k];z.hp=99999;z.q=1;z.stun=999;return 1})()`);
  await put(0,150);await p.waitForTimeout(600);const n0=await E(`MZ.shots`);await p.waitForTimeout(4000);const n1=await E(`MZ.shots`),f1=await E(`__V3.figs`);await p.screenshot({path:D+'vi_terza_spara.png'});
  ok('uno zombie davanti: in terza persona l\'eroe gli spara, zombie ed eroe disegnati',n1-n0>=1&&/z/.test(f1)&&/h/.test(f1),{colpi:n1-n0,figure:f1});
  // first person
  await E(`v3Set('prima');0`);await p.waitForTimeout(1500);await put(.05,140);await p.waitForTimeout(600);const m0=await E(`MZ.shots`);await p.waitForTimeout(4000);
  const fp=await J(`JSON.stringify({mode:__V3.mode,shots:MZ.shots-${m0},vm:__V3.vmMuz,figs:__V3.figs,btn:document.getElementById('v3btn').textContent})`);await p.screenshot({path:D+'vi_prima.png'});
  ok('in prima persona: l\'arma in mano (la bocca dell\'arma sullo schermo), niente eroe, lo zombie davanti preso',fp.mode==='prima'&&/Prima persona/.test(fp.btn)&&fp.shots>=1&&Array.isArray(fp.vm)&&!/h/.test(fp.figs)&&/z/.test(fp.figs),fp);
  await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);
  // in the house: no roof
  await E(`v3Set('terza');0`);await p.waitForTimeout(400);
  const hs=await J(`(()=>{const H=ZM.houses[0],h=ZM.W.hero;h.x=H.x+H.w*.5;h.y=H.y+H.d*.55;return JSON.stringify([H.x,H.y,H.w,H.d])})()`);await p.waitForTimeout(3500);
  const inH=await J(`JSON.stringify({a:ZM.houses[0].a,roof:v3TagVis(ZM.houses[0],'roof'),k:__V3.camK})`);await p.screenshot({path:D+'vi_casa.png'});
  ok('in casa il tetto sparisce e la telecamera resta dentro i muri',inH.a<.5&&!inH.roof&&inH.k<1,{hs,inH});
  await E(`v3Set('prima');0`);await p.waitForTimeout(1500);await p.screenshot({path:D+'vi_casa_prima.png'});
  // the ground drawings of the match (the Bomb's fire, the Trap): laid on the ground
  await E(`v3Set('terza');(()=>{const h=ZM.W.hero,f=__V3.th;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);ZABS.fires.push({x:h.x+Math.cos(f)*90,y:h.y+Math.sin(f)*90,r:58,t:.5,T:30});ZABS.traps.push({x:h.x+Math.cos(f)*45+12,y:h.y+Math.sin(f)*45,a:0,t:1,shut:0})})();0`);
  await p.waitForTimeout(2500);const dc=await J(`JSON.stringify({cv:!!__V3.decCv,fires:ZABS.fires.length,traps:ZABS.traps.length})`);await p.screenshot({path:D+'vi_a_terra.png'});
  ok('a terra si vedono il fuoco della Bomba e la Tagliola (i disegni a terra della partita)',dc.cv&&dc.fires>0&&dc.traps>0,dc);await E(`ZABS.fires.length=0;ZABS.traps.length=0;0`);
  // the Bara
  await E(`v3Set('terza');0`);
  const bx=await J(`(()=>{const B=ZM.bara();if(!B)return 'null';const h=ZM.W.hero;h.x=B.x;h.y=B.y+95;window.__MZ.view(0);return JSON.stringify([B.x,B.y])})()`);await p.waitForTimeout(3000);
  const bf=await E(`__V3.figs`);await p.screenshot({path:D+'vi_bara.png'});ok('la Bara delle Sorprese si vede',bx&&/b/.test(bf),{bx,bf});
  // back from above, and again
  await E(`v3Set('alto');0`);await p.waitForTimeout(900);const al=await J(`JSON.stringify({on:ZM.W.v3.on,disp:__V3.cv.style.display})`);await p.screenshot({path:D+'vi_alto.png'});
  ok('«Dall\'alto» torna la visuale di oggi (il 3D spento)',!al.on&&al.disp==='none',al);
  await E(`v3Set('terza');0`);await p.waitForTimeout(700);ok('e si torna in terza persona',await E(`ZM.W.v3.on&&__V3.mode==='terza'`));
  // low effects; the time of a frame
  await E(`LOWFX=true;0`);await p.waitForTimeout(900);await p.screenshot({path:D+'vi_lowfx.png'});await E(`LOWFX=false;0`);
  const t=await J(`JSON.stringify({ms:+__V3.ms.toFixed(1),gl:__V3.gl.getError(),err:__V3.err})`);ok('nessun errore di disegno (WebGL e del file)',t.gl===0&&t.err===0,t);
  const mem=await J(`JSON.stringify({pages:V3A.pages.length,tb:Math.round(__V3.tBuild)})`);ok('al massimo tre fogli di texture (la memoria del telefono)',mem.pages<=3,mem);
  console.log(`${nok} OK, ${nno} NO`);console.log(errs.slice(0,8).join('\n')||'nessun errore');await b.close()})();
