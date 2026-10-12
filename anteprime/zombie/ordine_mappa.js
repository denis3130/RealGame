// Verità dell'ordine di disegno sulla mappa intera (area_mappa): come ordine.js (z-buffer, 8 angoli a θ=45°), nei punti dei prop nuovi e
// dell'area allargata, con il cancello aperto (senza il velo) e, per il cancello, anche chiuso. Coordinate in caselle della pianta (y+2 nel
// mondo). Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/ordine_mappa.js [pagina] [cartella]
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html')),OUT=path.resolve(process.argv[3]||path.join(__dirname,'vetrina','ordine'));fs.mkdirSync(OUT,{recursive:true});
const P=(x,y)=>[x*64,(y+2)*64],Z=(x,y,k,s)=>[x*64,(y+2)*64,k,s];
const SC={cancelloS:[...P(6.45,12.75),[Z(6.3,11.95),Z(6.55,11.7)]],cancelloN:[...P(6.45,11.8)],archi:[...P(5.95,12.7)],
 fienileW:[...P(10.55,6.1),[Z(10.6,5.75)]],fienileS:[...P(13.2,8.65)],fienileN:[...P(13.2,3.75)],fienileE:[...P(15.65,6.0)],fienileDentro:[...P(12.4,6.0),[Z(12.9,5.5)]],fienileStalle:[...P(14.0,5.0)],
 colonicaE:[...P(5.05,6.0)],colonicaS:[...P(2.25,7.95)],colonicaN:[...P(2.25,4.05)],colonicaDentro:[...P(2.25,5.9)],portico:[...P(4.45,5.7),[Z(4.6,6.3)]],
 tettoia:[...P(8.8,11.7),[Z(9.5,10.9)]],tettoiaDentro:[...P(9.2,10.8)],pollaio:[...P(2.25,11.6)],cuccia:[...P(4.6,10.95)],maiali:[...P(2.2,9.6),[Z(2.6,9.2)]],
 pompa:[...P(5.6,7.95)],pozzo:[...P(7.8,7.25)],rimessa:[...P(13.2,9.8)],orto:[...P(11.6,10.0),[Z(12.0,10.6)]],mais:[...P(8.0,3.55),[Z(8.0,3.1)]],
 latrina:[...P(12.3,15.7),[Z(12.4,15.3)]],legna:[...P(8.6,13.8)],stendi:[...P(10.9,13.95)],lanterna:[...P(12.5,17.6)],quercia:[...P(13.1,22.9)],
 casaN:[...P(9.6,14.65)],bara:[...P(4.45,17.4)],
 // la Bara ferma nel mondo nei suoi tre posti, chiusa e aperta (con la mano e l'arma), con l'eroe e uno zombie accanto: [x, y, zombie, {bara:[posto, stato]}]
 baraCim:[...P(4.92,17.66),[Z(4.92,15.86)],{bara:[0,'chiusa']}],baraCimA:[...P(4.92,17.66),[Z(4.92,15.86)],{bara:[0,'aperta']}],
 baraTet:[...P(9.55,11.45),[Z(10.3,10.85)],{bara:[1,'chiusa']}],baraTetA:[...P(9.55,11.45),[Z(10.3,10.85)],{bara:[1,'aperta']}],
 baraFie:[...P(12.2,5.6),[Z(12.95,5.0)],{bara:[2,'chiusa']}],baraFieA:[...P(12.2,5.6),[Z(12.95,5.0)],{bara:[2,'aperta']}]};
const PSIS=[0,45,90,135,180,225,270,315],TABLE=['fienileDentro','colonicaDentro','tettoia','cancelloS','latrina','baraCimA','baraTetA','baraFieA'],INHOUSE=['fienileDentro','fienileStalle','colonicaDentro'];
// la libreria della verità, iniettata nella pagina (verita.js)
const LIB=require('./verita.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(500);await p.evaluate(()=>{__MZ.coins(9999);__MZ.buyNow('cancello')});await p.waitForTimeout(3500);await p.addScriptTag({content:LIB});
  await p.evaluate(()=>{const M=__MZ,W=M.W;M.zombies(false);M.low(true);W.dbg.freeze=true;W.dbg.noShoot=true;M.hud(false);
    // un'inquadratura: eroe fermo in (x, y), zombie dati, telecamera ψ/θ sul perno dell'eroe; ritorna la valutazione
    // (prima un secondo di simulazione senza zombie: le trasparenze della casa e delle chiome arrivano al loro valore)
    window.__shot=(x,y,zs,psi,th,o)=>{o=o||{};const h=W.hero,C=M.CAM;M.cam(null);h.x=x;h.y=y;h.zh=M.heightAt(x,y);h.moving=false;h.tgZ=null;W.Z.length=0;const B=M.box().b;M.boxTo(o.bara?o.bara[0]:0);B.st='ferma';B.t=0;M.sim(30,1/30);h.face=-Math.PI/2;h.aim=0;
      if(o.bara&&o.bara[1]==='aperta'){B.st='offre';B.t=1.2;B.gun='pompa';B.T=3.3}
      (zs||[]).forEach((z,i)=>W.Z.push({id:5000+i,kind:z[2]||'zombie',sc:z[3]||1.1,spd:0,hp:99,x:z[0],y:z[1],zh:M.heightAt(z[0],z[1]),face:Math.atan2(y-z[1],x-z[0]),p:0,anim:'walk',rise:1,die:0,flash:0}));
      for(const q of M.perches){q.away=0;q.t=1.5}W.flock.length=0;W.dbg.ord=o.ky?'ky':undefined;if(o.reset!==false)M.orderReset();
      M.view(psi,th);C.x=x;C.y=y;C.oy=24*C.CP;M.render(0);M.render(0);return __TR.evaluate(o)}});
  const all=[],T0=Date.now();
  for(const[name,[x,y,zs,o]] of Object.entries(SC))for(const psi of PSIS){const r=await p.evaluate(([x,y,zs,psi,o])=>__shot(x,y,zs,psi,45,Object.assign({same:true,top:14},o)),[x,y,zs||[],psi,o||{}]);all.push(Object.assign({name,psi},r))}
  const ky=[];for(const[name,[x,y,zs,o]] of Object.entries(SC)){const r=await p.evaluate(([x,y,zs,o])=>__shot(x,y,zs,0,45,Object.assign({ky:true},o)),[x,y,zs||[],o||{}]);ky.push(Object.assign({name,psi:0},r))}
  await p.evaluate(()=>{__MZ.W.dbg.ord=undefined});
  const S=(arr,f)=>arr.reduce((s,r)=>s+(f?f(r):r.tot),0);
  console.log('caso       ψ:'+PSIS.map(a=>String(a).padStart(11)).join('')+'   (pixel nell\'ordine sbagliato; tra parentesi quelli sugli esseri)');
  for(const name of Object.keys(SC)){const rs=all.filter(r=>r.name===name);console.log(name.padEnd(10)+'   '+rs.map(r=>' '+(r.tot+(r.ess?'('+r.ess+')':'')).padStart(10)).join(''))}
  const tot=S(all),ess=S(all,r=>r.ess),z0=S(all.filter(r=>r.psi===0)),casa=S(all,r=>r.casa),corvi=S(all,r=>r.corvi),stesso=S(all,r=>r.stesso),inh=S(all.filter(r=>INHOUSE.includes(r.name)),r=>r.ess);
  console.log(`\ntotale ${tot} px (soglia 25.000) · esseri ${ess} (soglia 400) · a 0° ${z0} (soglia 1.000) · eroe in casa vicino ai muri, sugli esseri ${inh} (soglia 0)`);
  console.log(`  di cui con la casa (non ancora divisa, fase 4) ${casa} · senza la casa ${tot-casa} · corvi posati ${corvi} · base/sporgenza dello stesso prop (a parte) ${stesso}`);
  console.log(`  a 0° con l'ordine di prima (ky): ${S(ky)} px (esseri ${S(ky,r=>r.ess)}), con il nuovo ${z0} (esseri ${S(all.filter(r=>r.psi===0),r=>r.ess)})`);
  console.log('\ntabella (pixel sugli esseri) a 0/45/90/180/270:');for(const name of TABLE)console.log('  '+name.padEnd(9)+[0,45,90,180,270].map(a=>{const r=all.find(q=>q.name===name&&q.psi===a);return String(r?r.ess:'-').padStart(6)}).join(''));
  // le coppie peggiori sommate su tutti i casi
  const agg=new Map(),aggS=new Map();for(const r of all)for(const q of r.bad.filter(q=>q.same)){const k=q.a<q.b?q.a+' | '+q.b:q.b+' | '+q.a;const o=aggS.get(k)||{k,w:0,psis:new Set()};o.w+=q.wrong;o.psis.add(r.psi);aggS.set(k,o)}
  for(const r of all)for(const q of r.bad.filter(q=>!q.same)){const k=q.a<q.b?q.a+' | '+q.b:q.b+' | '+q.a;const o=agg.get(k)||{k,w:0,n:0,psis:new Set()};o.w+=q.wrong;o.n++;o.psis.add(r.psi);agg.set(k,o)}
  console.log('\ncoppie peggiori (somma dei px, angoli):');for(const o of [...agg.values()].sort((a,b)=>b.w-a.w).slice(0,25))console.log(String(o.w).padStart(7)+'  '+o.k+'  ['+[...o.psis].join(',')+']');
  console.log('\nstesso prop, base/sporgenza (somma dei px, angoli):');for(const o of [...aggS.values()].sort((a,b)=>b.w-a.w).slice(0,12))console.log(String(o.w).padStart(7)+'  '+o.k+'  ['+[...o.psis].join(',')+']');
  fs.writeFileSync(path.join(OUT,'ordine_mappa.json'),JSON.stringify({all,ky},null,0));
  console.log(`\n${all.length+ky.length} inquadrature in ${((Date.now()-T0)/1000).toFixed(1)} s`);console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
