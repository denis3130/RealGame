// Il salvataggio in tre blocchi (anteprima 48, punto 55 del piano): un salvataggio vecchio (un oggetto solo, con dati Classici, Zombie e
// condivisi) si legge intero; alla prima scrittura nel telefono diventa {v:2, classica, zombie, condivisa} con ogni voce al suo posto (anche le
// mezze voci: Essenza di muschio e bustine Classiche nella Classica, Rottami e bustine Zombie nella Zombie); ricaricando la pagina tutto torna
// identico; il codice di salvataggio va e torna; un salvataggio rovinato (numeri impossibili, cose indossate ma non possedute, troppe bustine)
// si rimette a posto senza perdere quello che si possiede; le monete di una partita zombie non entrano mai nel salvataggio.
// Uso: python3 tests/mk.py && node tests/salvataggio.js
const {chromium}=require('playwright');const http=require('http'),fsS=require('fs');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fsS.createReadStream(__dirname+'/test.html').pipe(r)});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
const VECCHIO={gold:4321,gems:77,trophies:850,trBest:900,runs:14,introSeen:1,handSeen:1,pname:'Denis',
  items:{arco_frassino:{lvl:3,cards:12},giubba:{lvl:2,cards:4},balestra:{lvl:1,cards:7}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},
  slots:[{type:'legno',state:'ready'},null,null,null],mat:{ess:33,rot:21},bustine:{classica:{c:2,r:1,e:0,l:0,m:0},zombie:{c:0,r:3,e:1,l:0,m:0}},
  z:{guns:{pistola:{lvl:2,cards:5},revolver:{lvl:1,cards:2}},acc:{},gun:'revolver'},lucky:{inv:{cassa:2},slots:[null,null,null,null],slot5:null,next5:0,shop:{day:'',bought:{},seen:0},pick:null},
  zRec:9,zN:5,zKills:140,skins:{},skinLv:{},skinCards:{},pets:{owned:{},eq:[],cards:{}}};
const ROTTO={...VECCHIO,gold:-50,gems:'molti',trophies:1.5e3+.7,items:{arco_frassino:{lvl:99,cards:-3},giubba:{lvl:0,cards:2.6}},eq:{arma:'spada_fantasma',armatura:'giubba',anello:null,amuleto:null},
  z:{guns:{pistola:{lvl:2,cards:5}},acc:{},gun:'lanciarazzi'},bustine:{classica:{c:500,r:-2,e:0,l:0,m:0},zombie:{c:0,r:0,e:0,l:0,m:0}},lucky:{inv:{cassa:-4},slots:[null,null,null,null],slot5:null,next5:0,shop:{day:'',bought:{},seen:0},pick:'cassa'},skin:'mantello_inesistente'};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const URL='http://127.0.0.1:'+srv.address().port+'/test.html';
  const apri=async(save)=>{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(s=>{if(localStorage.getItem('qa_once'))return;localStorage.setItem('qa_once',1);localStorage.setItem('cripta_save_v1',s)},JSON.stringify(save));
    await p.goto(URL);await p.waitForTimeout(1500);return{p,ctx,errs,E:s=>p.evaluate(s=>__E(s),s)}};
  // ---- 1. un salvataggio vecchio, letto e riscritto in tre blocchi
  let{p,ctx,errs,E}=await apri(VECCHIO);
  const m1=await E(`({gold:SAVE.gold,gems:SAVE.gems,tr:SAVE.trophies,it:SAVE.items.arco_frassino.lvl,ess:SAVE.mat.ess,rot:SAVE.mat.rot,zg:SAVE.z.gun,zr:SAVE.zRec,bc:SAVE.bustine.classica.c,bz:SAVE.bustine.zombie.r,lu:SAVE.lucky.inv.cassa})`);
  ok(m1.gold===4321&&m1.gems===77&&m1.tr===850&&m1.it===3&&m1.ess===33&&m1.rot===21&&m1.zg==='revolver'&&m1.zr===9&&m1.bc===2&&m1.bz===3&&m1.lu===2,'il salvataggio vecchio si legge intero ('+JSON.stringify(m1)+')');
  await E(`save()`);const raw=await p.evaluate(()=>JSON.parse(localStorage.getItem('cripta_save_v1')));
  const C=raw.classica||{},Z=raw.zombie||{},S=raw.condivisa||{};
  ok(raw.v===2&&C.items&&C.eq&&C.slots&&C.trophies===850&&!S.items&&!Z.items,'scritto in tre blocchi: oggetti, casse e coppe nella Classica');
  ok(Z.z&&Z.z.gun==='revolver'&&Z.lucky&&Z.zRec===9&&Z.zN===5&&!C.z&&!S.z,'armi e accessori zombie, Lucky Cards, record e partite nella Zombie');
  ok(S.gold===4321&&S.gems===77&&S.skins&&S.pets&&S.pname==='Denis'&&!C.gold&&!Z.gold,'oro, cristalli, vestiti, compagni e profilo nel blocco condiviso');
  ok(C.mat&&C.mat.ess===33&&C.mat.rot===undefined&&Z.mat&&Z.mat.rot===21&&Z.mat.ess===undefined,'materiali divisi: Essenza di muschio Classica, Rottami Zombie');
  ok(C.bustine&&C.bustine.classica&&!C.bustine.zombie&&Z.bustine&&Z.bustine.zombie&&!Z.bustine.classica,'bustine divise per modalità');
  const prima=await E(`JSON.stringify(SAVE)`);
  // ---- 2. ricaricando torna identico (un solo SAVE in memoria)
  await p.reload();await p.waitForTimeout(1500);const dopo=await E(`JSON.stringify(SAVE)`);
  const pA=JSON.parse(prima),pB=JSON.parse(dopo),keys=k=>Object.keys(k).sort().join();
  ok(keys(pA)===keys(pB)&&JSON.stringify(pA.items)===JSON.stringify(pB.items)&&JSON.stringify(pA.z)===JSON.stringify(pB.z)&&JSON.stringify(pA.mat)===JSON.stringify(pB.mat)&&JSON.stringify(pA.bustine)===JSON.stringify(pB.bustine)&&pA.gold===pB.gold,'ricaricando la pagina il salvataggio torna identico');
  // ---- 3. il codice di salvataggio va e torna
  const code=await E(`(()=>{const c=saveCode(),o=readCode(c);return!!o&&o.gold===SAVE.gold&&o.z.gun===SAVE.z.gun&&o.mat.rot===SAVE.mat.rot})()`);
  const code2=await E(`(()=>{const c=btoa(unescape(encodeURIComponent(JSON.stringify(saveBlocks(SAVE))))),o=readCode(c);return!!o&&o.gold===SAVE.gold&&o.items.arco_frassino.lvl===SAVE.items.arco_frassino.lvl})()`);
  ok(code&&code2,'il codice di salvataggio si legge (sia quello di un oggetto solo sia quello a blocchi)');
  ok(!errs.length,'nessun errore ('+JSON.stringify(errs.slice(0,2))+')');await ctx.close();
  // ---- 4. un salvataggio rovinato si rimette a posto senza perdere niente di posseduto
  ({p,ctx,errs,E}=await apri(ROTTO));
  const m4=await E(`({gold:SAVE.gold,gems:SAVE.gems,tr:SAVE.trophies,a:SAVE.items.arco_frassino,g:SAVE.items.giubba,arma:SAVE.eq.arma,zg:SAVE.z.gun,bc:SAVE.bustine.classica.c,br:SAVE.bustine.classica.r,lu:SAVE.lucky.inv.cassa,pick:SAVE.lucky.pick,skin:SAVE.skin,ess:SAVE.mat.ess})`);
  ok(m4.gold>=0&&Number.isInteger(m4.gems)&&m4.gems>=0&&Number.isInteger(m4.tr),`numeri impossibili rimessi a posto (oro ${m4.gold}, cristalli ${m4.gems}, coppe ${m4.tr})`);
  ok(m4.a.lvl===10&&m4.a.cards===0&&m4.g.lvl===1&&m4.g.cards===2,'livelli tra 1 e 10, carte intere e non negative ('+JSON.stringify([m4.a,m4.g])+')');
  ok(m4.arma==='arco_frassino'&&m4.zg==='pistola'&&m4.skin===null,`ciò che è indossato ma non posseduto torna a quello di partenza (arma ${m4.arma}, arma zombie ${m4.zg}, vestito ${m4.skin})`);
  ok(m4.bc===99&&m4.br===0&&m4.lu===0&&m4.pick===null,`tetti e zeri: bustine ${m4.bc} (al massimo 99), Lucky Cards ${m4.lu}, scelta ${m4.pick}`);
  ok(m4.ess===33,'quello che si possiede resta (Essenza '+m4.ess+')');await ctx.close();
  // ---- 5. le monete della partita zombie non diventano una valuta
  ({p,ctx,errs,E}=await apri(VECCHIO));
  const m5=await E(`(()=>{const g0=SAVE.gold;save();const raw=localStorage.getItem('cripta_save_v1');return{coins:/"coins"/.test(raw),g0}})()`);
  ok(!m5.coins,"nel salvataggio non c'è nessuna moneta di partita (coins)");await ctx.close();
  console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close();srv.close()})();
