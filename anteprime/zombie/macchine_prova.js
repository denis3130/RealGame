// Prova delle macchine (punti 21, 22 e 23): la Credenza degli Elisir (prezzi che salgono, mai lo stesso elisir due volte, al massimo 4, gli
// effetti veri: danno, critici, corsa, ricarica, vita × 2,5, vampiro, impulso), la valvola della caldaia (senza vapore la Forgia non va), la
// Forgia delle Anime (sblocco, due livelli, l'arma sull'incudine e la pistola in mano intanto, il nome nuovo, il danno, al massimo 2), i colpi
// dell'arma a muro che non tolgono il potenziamento, la partita nuova che rimette tutto. Foto in anteprime/zombie/_mac_*.png
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/macchine_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(500);
  const E=(f,a)=>p.evaluate(f,a);await E(()=>{window.ZM=__MZ.ZM;const W=__MZ.W;W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;__MZ.zombies(true)});
  const run=s=>E(n=>{for(let i=0;i<n;i++)__MZ.sim(1,1/30)},Math.round(s*30));
  const M0=await E(()=>({e:ZM.macchine.ELI.length,f:ZM.macchine.FORGE.length,v:ZM.macchine.VALVES.length}));ok(M0.e===1&&M0.f===1&&M0.v===1,'sulla mappa: una Credenza, una Forgia, una valvola ('+JSON.stringify(M0)+')');
  // ---- la Credenza: quattro elisir diversi, prezzi 1.500, 2.000, 2.500, 3.000; il quinto no
  const e1=await E(async()=>{const M=__MZ,W=M.W,K=ZM.macchine,o=ZM.buys.find(b=>b.id==='elisir0');M.tp(o.x,o.y);const out=[];
    for(let i=0;i<5;i++){M.coins(20000);const c0=W.coins,r=o.act();for(let k=0;k<60;k++)M.sim(1,1/30);out.push({r,paid:c0-W.coins,own:K.PK.own.slice()})}return out});
  const pr=e1.map(x=>x.paid).join(',');ok(pr==='1500,2000,2500,3000,0',`prezzi ${pr} (l'ultimo: rifiutato perché ne hai già 4)`);
  ok(new Set(e1[3].own).size===4&&!e1[4].r,`quattro elisir tutti diversi (${e1[3].own.join(', ')}), il quinto non si beve`);
  const sub=await E(()=>ZM.buys.find(b=>b.id==='elisir0').sub());ok(/già 4/.test(sub||''),'il bottone lo dice: «'+sub+'»');
  await p.waitForTimeout(400);await E(()=>{const M=__MZ,o=ZM.buys.find(b=>b.id==='elisir0');M.tp(o.x-10,o.y);M.cam(o.x+10,o.y-20);M.zoom(2.2)});await p.waitForTimeout(500);await p.screenshot({path:path.join(__dirname,'_mac_credenza.png')});
  // ---- gli effetti, uno alla volta (da capo, con drink)
  const fx=await E(()=>{const M=__MZ,W=M.W,K=ZM.macchine,D=W.director,res={};
    const reset=()=>{ZM.ctl.nuova();W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;ZM.fortuna.applyMods()};const pk=id=>K.PERK.find(p=>p.id===id);
    reset();const base=Object.assign({},W.mods),v0=D.PZ.vita;
    K.drink(pk('furia'));ZM.fortuna.applyMods();res.dmg=W.mods.dmg/(base.dmg||1);
    K.drink(pk('istinto'));ZM.fortuna.applyMods();res.crit=W.mods.crit;K.drink(pk('passo'));ZM.fortuna.applyMods();res.spd=W.mods.spd/(base.spd||1);
    K.drink(pk('mani'));ZM.fortuna.applyMods();res.rel=W.mods.relK;
    reset();K.drink(pk('cuore'));res.vita=[v0,D.PZ.vita,D.hp];reset();res.vita2=[D.PZ.vita,D.hp];
    K.drink(pk('vampiro'));D.hp=50;D.shotHit();res.vamp=D.hp-50;
    reset();K.drink(pk('impulso'));K.drink(pk('impatto'));ZM.fortuna.applyMods();res.pierce=W.mods.pierce;res.kb=W.mods.kb;
    const h=W.hero;W.Z.length=0;const z={id:991,kind:'zombie',sc:1.1,spd:0,hp:999,x:h.x,y:h.y-40,face:0,p:0,anim:'idle',rise:1,die:0,flash:0};W.Z.push(z);W.dbg.god=false;D.on=true;D.inv=0;
    let pushed=0;for(let k=0;k<12&&!pushed;k++){D.inv=0;K.PK.pushCd=0;K.PK.lastHp=D.hp;D.hurtHero(5);ZM.macchine.PK.lastHp;for(let i=0;i<2;i++)M.sim(1,1/30);if(Math.hypot(z.x-h.x,z.y-h.y)>60)pushed=1}W.dbg.god=true;
    res.push=pushed;res.zd=Math.round(Math.hypot(z.x-h.x,z.y-h.y));W.Z.length=0;return res});
  ok(fx.dmg===2,`Doppi Danni: danno × ${fx.dmg}`);ok(fx.crit>=.2,`Istinto Mortale: critici ${fx.crit}`);ok(Math.abs(fx.spd-1.25)<.01,`Passo Svelto: corsa × ${fx.spd}`);ok(fx.rel===2,`Mani Svelte: ricarica × ${fx.rel} più veloce`);
  ok(fx.vita[1]===Math.round(fx.vita[0]*2.5)&&fx.vita[2]===fx.vita[1]&&fx.vita2[0]===fx.vita[0]&&fx.vita2[1]===fx.vita[0],`Cuore di Pietra: vita ${fx.vita[0]} → ${fx.vita[1]}, e la partita nuova la rimette a ${fx.vita2[0]} (${fx.vita2[1]})`);
  ok(fx.vamp>0,`Colpo Vampirico: un colpo a segno ridà ${fx.vamp} di vita`);ok(fx.pierce===1&&fx.kb>0,`Doppio Impatto: passa ${fx.pierce} zombie in più e spinge (${fx.kb})`);
  ok(fx.push===1,`Impulso Difensivo: colpito, respinge lo zombie (a ${fx.zd} px)`);
  // ---- la Forgia: fredda senza vapore; la valvola; lo sblocco; due livelli
  const f1=await E(()=>{const M=__MZ,W=M.W,K=ZM.macchine,fo=ZM.buys.find(b=>b.id==='forgia0'),va=ZM.buys.find(b=>b.id==='valvola0');ZM.ctl.nuova();W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;M.coins(30000);
    const r={};M.tp(fo.x,fo.y);r.cold=fo.act();r.coldSub=fo.sub();M.tp(va.x,va.y);r.vShow=va.show();r.valve=va.act();for(let i=0;i<60;i++)M.sim(1,1/30);r.power=K.power();r.vShow2=va.show();
    M.tp(fo.x,fo.y);const c0=W.coins;r.unlock=fo.act();r.paidU=c0-W.coins;ZM.equip('revolver');const c1=W.coins;r.up1=fo.act();r.paid1=c1-W.coins;r.heroGun=W.gunId;r.item=K.FORGE[0].item&&K.FORGE[0].item.id;return r});
  ok(f1.cold===false&&/vapore/.test(f1.coldSub),`senza vapore la Forgia non va («${f1.coldSub}»)`);ok(f1.vShow&&f1.valve&&f1.power&&!f1.vShow2,'la valvola della caldaia si apre gratis e dà il vapore (poi il bottone sparisce)');
  ok(f1.unlock&&f1.paidU===1000,`la Forgia si sblocca con ${f1.paidU}`);ok(f1.up1&&f1.paid1===2500&&f1.heroGun==='pistola'&&f1.item==='revolver',`il Revolver va sull'incudine (${f1.paid1}) e intanto l'eroe ha la ${f1.heroGun}`);
  await E(()=>{const M=__MZ,f=ZM.macchine.FORGE[0],o=ZM.buys.find(b=>b.id==='forgia0');M.tp(o.x-14,o.y);M.cam(f.anvil[0]+10,f.anvil[1]-6);M.zoom(2.2)});await p.waitForTimeout(1300);await p.screenshot({path:path.join(__dirname,'_mac_forgia.png')});
  const f2=await E(()=>{const M=__MZ,W=M.W,K=ZM.macchine,fo=ZM.buys.find(b=>b.id==='forgia0');for(let i=0;i<30*5;i++)M.sim(1,1/30);const r={st:K.FORGE[0].st,label:fo.label()};r.take=fo.act();const g=ZM.gun();ZM.fortuna.applyMods();
    r.gun=W.gunId;r.pap=g.pap;r.nome=g.nome;r.dmg=W.mods.dmg;M.coins(30000);const c=W.coins;fo.act();for(let i=0;i<30*5;i++)M.sim(1,1/30);fo.act();const g2=ZM.gun();ZM.fortuna.applyMods();r.pap2=g2.pap;r.nome2=g2.nome;r.dmg2=W.mods.dmg;r.paid2=c-W.coins;
    r.max=fo.act();r.maxLabel=fo.label();
    // i colpi al muro del Revolver: resta forgiato
    const wb=ZM.buys.find(b=>b.id==='muro_revolver');g2.mag=0;g2.res=0;M.tp(wb.x,wb.y);r.wall=wb.act();const g3=ZM.gun();r.wallPap=g3.pap;r.wallMag=g3.mag;return r});
  ok(f2.st==='pronta'&&/Prendi/.test(f2.label),`dopo il lavoro l'arma aspetta sull'incudine («${f2.label}»)`);
  ok(f2.take&&f2.gun==='revolver'&&f2.pap===1&&f2.nome==='Revolver temprato'&&Math.abs(f2.dmg-2)<.01,`ripresa: ${f2.nome}, danno × ${f2.dmg}`);
  ok(f2.pap2===2&&f2.nome2==='Revolver delle Anime'&&Math.abs(f2.dmg2-3.2)<.01&&f2.paid2===5000,`secondo livello (${f2.paid2}): ${f2.nome2}, danno × ${f2.dmg2}`);
  ok(f2.max===false&&/massimo/i.test(f2.maxLabel),`al terzo no: «${f2.maxLabel}»`);ok(f2.wall&&f2.wallPap===2&&f2.wallMag>0,'i colpi comprati al muro non tolgono il potenziamento');
  // ---- la pistola sull'incudine: l'eroe resta senz'arma finché non la riprende
  const f3=await E(()=>{const M=__MZ,W=M.W,K=ZM.macchine,fo=ZM.buys.find(b=>b.id==='forgia0');ZM.equip('pistola');M.coins(30000);M.tp(fo.x,fo.y);fo.act();const r={un:!!W.hero.unarmed};for(let i=0;i<30*5;i++)M.sim(1,1/30);fo.act();r.un2=!!W.hero.unarmed;r.pap=ZM.gun().pap;r.nome=ZM.gun().nome;return r});
  ok(f3.un&&!f3.un2&&f3.pap===1&&f3.nome==='Pistola temprata',`forgiando la pistola l'eroe resta senz'arma, poi riprende la ${f3.nome}`);
  // ---- i colpi forgiati: viola che saltano (foto) e la partita nuova rimette tutto
  await E(()=>{const M=__MZ,W=M.W,K=ZM.macchine,fo=ZM.buys.find(b=>b.id==='forgia0');ZM.equip('mitra');const g=ZM.gun();g.pap=2;g.nome=K.nomeF('mitra',2);W.dbg.noShoot=false;const h=W.hero;M.tp(fo.x-60,fo.y-120);
    for(let i=0;i<4;i++)W.Z.push({id:900+i,kind:'zombie',sc:1.1,spd:0,hp:4000,x:h.x+70+i*14,y:h.y-30+i*16,face:Math.PI,p:0,anim:'idle',rise:1,die:0,flash:0});M.cam(h.x+50,h.y);M.zoom(1.8)});
  await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,'_mac_colpi.png')});
  const r9=await E(()=>{const M=__MZ,W=M.W,K=ZM.macchine;W.dbg.noShoot=true;W.Z.length=0;ZM.ctl.nuova();ZM.fortuna.applyMods();return{own:K.PK.own.length,power:K.power(),open:K.FORGE[0].open,item:K.FORGE[0].item,un:!!W.hero.unarmed,gun:W.gunId,pap:ZM.gun().pap||0,dmg:W.mods.dmg,icons:document.querySelectorAll('#mzPerk canvas').length}});
  ok(!r9.own&&!r9.power&&!r9.open&&!r9.item&&!r9.un&&!r9.pap&&r9.icons===0,'una partita nuova rimette tutto com\'era ('+JSON.stringify(r9)+')');
  console.log('ERR',JSON.stringify(errs));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
