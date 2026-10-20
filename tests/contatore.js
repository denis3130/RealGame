// Prova del contatore (FASE 9, src/js/101-contatore.js): acceso come nell'anteprima (window.MB_CONTATORE), il chip coi fotogrammi al
// secondo, il pannello (adesso, per schermata, telefono), una cassa, la mappa zombie con «Parti della mappa», «Copia»; poi Impostazioni →
// Contatore spento e acceso; senza MB_CONTATORE non c'è. Foto tests/cnt_menu.png, cnt_cassa.png, cnt_mappa.png.
// Uso: python3 tests/mk.py && node tests/contatore.js
const {chromium}=require('playwright');const path=require('path');let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
const SAVE0={gold:5000,gems:500,trophies:900,runs:12,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},zN:2,
  items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},set:{q:'auto',mv:.5,sv:.5}};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:false,hasTouch:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(s=>{window.MB_CONTATORE=1;localStorage.setItem('cripta_save_v1',JSON.stringify(s))},SAVE0);
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(2500);const E=s=>p.evaluate(s=>__E(s),s);
  // 1. il chip nel menu
  const chip=await p.evaluate(()=>{const c=document.getElementById('cntChip');return c?{t:c.textContent,h:c.hidden,r:c.getBoundingClientRect().toJSON()}:null});
  ok(chip&&!chip.h&&/\d+ fps/.test(chip.t)&&chip.r.width<140,`il chip c'è nel menu: «${chip&&chip.t}» (${chip&&Math.round(chip.r.width)}×${chip&&Math.round(chip.r.height)} px)`);
  await p.click('#cntChip');await p.waitForTimeout(700);
  const pn=await p.evaluate(()=>{const e=document.getElementById('cntPanel');const r=e.getBoundingClientRect();return{h:e.hidden,t:e.innerText,w:r.width,b:r.bottom,sw:document.documentElement.scrollWidth}});
  ok(!pn.h&&/Adesso · Menu Classica/.test(pn.t)&&/Per schermata/i.test(pn.t)&&/Telefono/i.test(pn.t)&&pn.w<=390&&pn.sw<=390,`il pannello si apre: adesso, per schermata, telefono, dentro lo schermo (${Math.round(pn.w)} px)`);
  await p.screenshot({path:path.join(__dirname,'cnt_menu.png')});
  await p.click('#cntPanel button[data-a="chiudi"]');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>document.getElementById('cntPanel').hidden),'«Chiudi» lo chiude');
  // 2. una cassa
  await E(`openChest('oro',{slot:true});0`);await p.waitForTimeout(500);for(let i=0;i<4;i++){await p.mouse.click(195,520);await p.waitForTimeout(700)}
  await p.click('#cntChip');await p.waitForTimeout(700);await p.screenshot({path:path.join(__dirname,'cnt_cassa.png')});
  const tc=await E('cntText()');ok(/Casse: \d+ fps/.test(tc),'la cassa ha la sua riga: '+(tc.split('\n').find(l=>/^Casse/.test(l))||'').slice(0,110));
  await p.click('#cntPanel button[data-a="chiudi"]');
  await E(`(()=>{const d=$('cdone');for(let i=0;i<8&&d.hidden;i++)$('cscene').click();if(!d.hidden)d.click();$('chestScr').hidden=true;return 0})()`);await p.waitForTimeout(400);
  // 4. Impostazioni → Contatore
  await E(`openSheet('set');0`);await p.waitForTimeout(300);
  ok(await p.evaluate(()=>!!document.querySelector('#sheet [data-perf="0"]')),'Impostazioni ha la riga «Contatore»');
  await p.click('#sheet [data-perf="0"]');await p.waitForTimeout(300);
  ok(await p.evaluate(()=>document.getElementById('cntChip').hidden)&&await E('SAVE.set.perf===false'),'«Spento» lo nasconde e lo ricorda');
  await p.click('#sheet [data-perf="1"]');await p.waitForTimeout(800);
  ok(await p.evaluate(()=>!document.getElementById('cntChip').hidden),'«Acceso» lo rimette');
  await E(`closeSheet();0`);await p.waitForTimeout(300);
  // 3. la mappa zombie e le parti
  await E(`SAVE.modo='zombie';zGo();0`);await p.waitForFunction(()=>__E('ZG.on&&!LOAD.on'),null,{timeout:120000,polling:200});await p.waitForTimeout(4000);
  await p.click('#cntChip');await p.waitForTimeout(700);
  ok(await p.evaluate(()=>{const b=document.querySelector('#cntPanel button[data-a="parti"]');return!!b&&!b.hidden}),'sulla mappa c\'è «Parti della mappa»');
  await p.click('#cntPanel button[data-a="parti"]');await p.waitForTimeout(6500);
  const tm=await E('cntText()');const parts=tm.split('\n').find(l=>/^Parti della mappa/.test(l))||'';
  ok(/mondo/.test(parts)&&/buio/.test(parts),'parti della mappa misurate: '+parts.slice(0,160));
  ok(await E('ZM.W.dbg.tm==null'),'finita la misura i tempi della mappa sono spenti');
  ok(/Mappa zombie: \d+ fps/.test(tm),'la mappa ha la sua riga: '+(tm.split('\n').find(l=>/^Mappa zombie/.test(l))||'').slice(0,140));
  await p.screenshot({path:path.join(__dirname,'cnt_mappa.png')});
  // «Copia»: il testo nel riquadro (qui la copia può non riuscire)
  await p.click('#cntPanel button[data-a="copia"]');await p.waitForTimeout(400);
  ok(await p.evaluate(()=>{const t=document.querySelector('#cntPanel textarea');return!!t&&!t.hidden&&/Contatore Mossbound/.test(t.value)}),'«Copia» mette il testo nel riquadro');
  await p.waitForTimeout(1200);ok(await p.evaluate(()=>{const t=document.querySelector('#cntPanel textarea');return!!t&&!t.hidden&&/Contatore Mossbound/.test(t.value)}),'il riquadro resta mentre il pannello si aggiorna');
  console.log(tm);
  await p.click('#cntPanel button[data-a="chiudi"]');
  // 5. senza MB_CONTATORE (il gioco vero) non c'è
  const p2=await ctx.newPage();await p2.addInitScript(s=>{window.MB_CONTATORE=0;localStorage.setItem('cripta_save_v1',JSON.stringify(s))},SAVE0);
  await p2.goto('file://'+path.join(__dirname,'test.html'));await p2.waitForTimeout(2000);
  ok(await p2.evaluate(()=>!document.getElementById('cntChip')&&window.requestAnimationFrame.toString().includes('[native code]')),'nel gioco vero niente contatore e niente da misurare');
  console.log('ERR',JSON.stringify(errs.slice(0,4)));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
