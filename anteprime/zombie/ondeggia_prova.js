// Edifici solidi girando la visuale (difetti dell'anteprima 48, Denis: «si muovono leggermente, devono essere solidi come nella prima e seconda
// area»): per ogni edificio, girando la telecamera di 360° con l'eroe 150 px davanti, quanto si sposta di lato la cima rispetto alla base (la
// piega); gli edifici nuovi non devono ondeggiare più della casa del camposanto e del fienile (+10%). Poi: tutto quello che sta dentro un
// edificio nuovo o gli è attaccato si piega col suo ref. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/ondeggia_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:430,height:932}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{const M=__MZ,W=M.W,ZM=M.ZM,T=64;for(const z of[2,3,4])W.zoneOpen[z]=true;W.split=null;W.dbg.noSpawn=true;W.Z.length=0;
    const lay=M.layers();const byProp=new Map();for(const L of lay){const k=L.prop+'#'+L.pi;if(!byProp.has(k))byProp.set(k,[]);byProp.get(k).push(L)}
    const P=M.props;const sites=[['casa vecchia','house',null],['fienile','barn',null],['mulino a vento','windmill',null],['locanda','edificio','Locanda del Corvo'],['segheria','edificio','Segheria'],['fucina','fucina',null],['cappella','edificio','Cappella'],['campanile','campanile',null],['ruota','ruotaMulino',null]];
    const out={};
    for(const[nm,pn,hn] of sites){let best=null;for(const L of lay){if(L.prop!==pn)continue;const pr=P[L.pi];if(hn&&!(pr.house&&pr.house.name===hn))continue;if(!best||L.z1>best.z1)best=L}
      if(!best){out[nm]='?';continue}const pr=P[best.pi],bx=pr.bx,cx=(bx[0]+bx[2])/2,cy=(bx[1]+bx[3])/2;
      // l'eroe a 150 px a sud del centro (davanti), la visuale gira intorno all'eroe
      M.tp(cx,bx[3]+150);M.cam(cx,bx[3]+150);let mn=1e9,mx=-1e9,mny=1e9,mxy=-1e9;const z=best.z1;
      for(let a=0;a<360;a+=10){M.view(a,45);M.render(0);const q=M.proj(best.id,[[cx,cy,z],[cx,cy,0]]);if(!q)continue;const[t,b0]=q;
        // senza piega la cima sta dritta sopra la base (a 45° la cima è z·CP sopra): quello che resta è la piega
        const dx=t[0]-b0[0];if(dx<mn)mn=dx;if(dx>mx)mx=dx}
      out[nm]={z:Math.round(z),sway:Math.round(mx-mn),ref:pr.ref?pr.ref.map(v=>Math.round(v*100)/100):null,lk:pr.lk??1}}
    // chi sta sopra un edificio nuovo (dentro il suo riquadro) ha lo stesso ref dei suoi muri
    const odd=[];for(const hs of M.houses){if(!/Locanda|Cappella|Segheria|Fucina/.test(hs.name||''))continue;const main=(P.find(q=>q.house===hs)||{}).ref;for(const q of P){const b=q.bx;if(b[2]<hs.x+2||b[0]>hs.x+hs.w-2||b[3]<hs.y+2||b[1]>hs.y+hs.d-2)continue;if(q.ref!==main)odd.push(hs.name+': '+q.name)}}
    M.view(0,45);M.cam(null);return{out,odd}});
  const o=r.out,ref=Math.max(o['casa vecchia'].sway,o['fienile'].sway)*1.1;
  for(const n of['locanda','segheria','cappella','campanile','fucina'])ok(o[n].sway<=ref,`${n}: la cima si sposta di ${o[n].sway} px su un giro (casa ${o['casa vecchia'].sway}, fienile ${o['fienile'].sway})`);
  ok(!r.odd.length,`dentro gli edifici nuovi tutto si piega col ref dell'edificio (${r.odd.slice(0,4).join(', ')||'nessuno diverso'})`);
  console.log('ERR',JSON.stringify(errs.slice(0,3)));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
