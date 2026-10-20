// Prova: gli zombie nascono solo nelle zone aperte (Denis, 14 ottobre: «se una zona non l'ho ancora sbloccata vorrei che i zombie non
// spawnassero da lì, solo in zone dove ho il via libera»). Con la sola zona di partenza aperta, molti zombie dei round: tutti nascono nel
// Camposanto e mai accanto a una barriera chiusa; i morti evocati dal Becchino con l'eroe appoggiato alla barriera del Borgo restano di qua;
// aperto il Borgo, gli zombie escono anche lì. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/zone_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground&&__MZ.W.director,null,{timeout:60000});await p.waitForTimeout(400);
  // 1. many zombies with only the start open: where they are born
  const a=await p.evaluate(()=>{const M=__MZ,W=M.W,D=W.director;W.dbg.freeze=true;W.dbg.god=true;let s=77;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};
    const born={},seen=new Set(),near=[];let n=0;
    for(let i=0;i<400;i++){W.Z.length=0;const h=W.hero;const z=M.ZM.spawn({kind:'zombie',q:1});if(!z)continue;n++;const id=W.zoneIdAt(z.x,z.y);born[id]=(born[id]||0)+1;if(M.ZM.shutNear(z.x,z.y,110))near.push([Math.round(z.x),Math.round(z.y)])}
    // the hero in different places of the start (by the Borgo's barrier, by the gate, in the middle)
    const spots=(W.lures||[]).filter(L=>!L.isOpen()).map(L=>[L.x,L.y]).concat(W.gate?[[W.gate.x,W.gate.y]]:[]);const per=[];
    for(const[x,y] of spots){W.hero.x=x+(W.zoneIdAt(x-60,y)===1?-50:W.zoneIdAt(x,y+60)===1?0:50);W.hero.y=y+(W.zoneIdAt(x,y+60)===1?50:0);if(W.zoneIdAt(W.hero.x,W.hero.y)!==1)continue;
      let bad=0,k=0;for(let i=0;i<60;i++){W.Z.length=0;const z=M.ZM.spawn({kind:'zombie',q:1});if(!z)continue;k++;if(W.zoneIdAt(z.x,z.y)!==1||M.ZM.shutNear(z.x,z.y,110))bad++}per.push({x:Math.round(W.hero.x),y:Math.round(W.hero.y),k,bad})}
    return{n,born,near:near.length,per}});
  ok(a.n>300&&Object.keys(a.born).length===1&&a.born[1]===a.n,`solo la partenza aperta: ${a.n} zombie, nati tutti nel Camposanto (${JSON.stringify(a.born)})`);
  ok(a.near===0,`nessuno nasce accanto a una barriera o al cancello chiusi (${a.near})`);
  ok(a.per.length>0&&a.per.every(q=>q.bad===0),'con l\'eroe vicino alle barriere chiuse: '+a.per.map(q=>`(${q.x},${q.y}) ${q.k} nati, ${q.bad} fuori posto`).join(' · '));
  // 1b. (20 ottobre, Denis: «i zombie continuano a spawnare nelle aree ancora chiuse e quindi troppo lontani dal player») con l'eroe in 60 punti
  // della partenza: nessuno nasce a meno di 120 px da una zona chiusa e la distanza tipica è vicina (mediana delle mediane sotto i 300 px)
  const v=await p.evaluate(()=>{const M=__MZ,W=M.W,Z=M.ZM;const pos=[];for(let x=150;x<890;x+=70)for(let y=1040;y<1790;y+=70)if(W.zoneIdAt(x,y)===1&&!Z.hit?.(x,y,14))pos.push([x,y]);
    let border=0,tot=0;const meds=[];for(const[x,y] of pos){W.hero.x=x;W.hero.y=y;M.sim(2,1/30);const ds=[];for(let i=0;i<20;i++){W.Z.length=0;const z=Z.spawn({kind:'zombie',q:1});if(!z)continue;tot++;ds.push(Math.hypot(z.x-x,z.y-y));if(!Z.farOpen(z.x,z.y,120))border++}
      ds.sort((a,b)=>a-b);if(ds.length)meds.push(ds[ds.length>>1])}meds.sort((a,b)=>a-b);return{n:pos.length,tot,border,med:Math.round(meds[meds.length>>1]),p90:Math.round(meds[Math.floor(meds.length*.9)])}});
  ok(v.tot>v.n*15&&v.border===0&&v.med<300&&v.p90<420,`l'eroe in ${v.n} punti della partenza: ${v.tot} zombie, ${v.border} accanto a una zona chiusa, distanza tipica ${v.med} px (9 volte su 10 sotto i ${v.p90})`);
  // 2. the gravedigger's dead, with the hero leaning on the Borgo's barrier
  const e=await p.evaluate(()=>{const M=__MZ,W=M.W,D=W.director,L=(W.lures||[]).find(L=>L.zone===3&&!L.isOpen());if(!L)return{none:1};
    // the hero on the start's side of it
    const cand=[[L.x-40,L.y],[L.x,L.y+40],[L.x+40,L.y],[L.x,L.y-40]].find(q=>W.zoneIdAt(q[0],q[1])===1);if(!cand)return{none:2};W.hero.x=cand[0];W.hero.y=cand[1];if(M.ZM.navRebuild)M.ZM.navRebuild();
    let bad=0,tot=0;for(let i=0;i<40;i++){W.Z.length=0;D.evoca?D.evoca(3):0;for(const z of W.Z){tot++;if(W.zoneIdAt(z.x,z.y)!==1)bad++}}return{tot,bad,hero:[Math.round(W.hero.x),Math.round(W.hero.y)]}});
  ok(!e.none&&e.tot>0&&e.bad===0,`i morti evocati dal Becchino con l'eroe alla barriera del Borgo ${JSON.stringify(e.hero)}: ${e.tot} evocati, ${e.bad} dall'altra parte`);
  // 3. the Borgo open: they come out there too
  const o=await p.evaluate(()=>{const M=__MZ,W=M.W,B=M.ZM.buys.filter(b=>/^zona/.test(b.id||'')&&/3/.test(b.id)&&!/2|4/.test(b.id))[0];if(!B)return{nobuy:1};W.coins=99999;B.act();W.dbg.noSpawn=true;for(let i=0;i<6;i++)M.sim(1,1/30);// (the walking distances are made again on the next frames)
    const born={};for(let i=0;i<300;i++){W.Z.length=0;const z=M.ZM.spawn({kind:'zombie',q:1});if(!z)continue;const id=W.zoneIdAt(z.x,z.y);born[id]=(born[id]||0)+1}return born});
  ok(o[3]>0&&!o[2]&&!o[4],`aperto il Borgo escono anche lì (${JSON.stringify(o)}), mai dalla Fattoria e dalla Segheria chiuse`);
  console.log('\nERR',JSON.stringify(errs));console.log(fails?fails+' prove NON passate':'tutte le prove passate');await b.close();process.exit(fails?1:0)})();
