// Verità dell'ordine di disegno (piano §6.2): per ogni inquadratura la pagina disegna con il suo ordine, poi qui si rifà ogni voce come uno
// z-buffer (facce tagliate in triangoli da 8 px e scartate se girate di spalle come fa il motore, linee, sfere, i punti dei disegni a mano;
// esseri come cartelloni: eroe largo ±8 e alto 56, zombie ±9·sc e 46·sc) e si contano i pixel dove chi viene disegnato prima è davvero davanti
// (di più di 1 unità di profondità; una coppia conta da 3 px). La geometria viene da __MZ.prims (i pezzi nel mondo) e __MZ.proj (la stessa
// piega del motore), l'ordine da __MZ.order(), le voci da __MZ.entries(). Prove: 22 posizioni dell'eroe × 8 angoli a θ=45° (con gli zombie dei
// casi della tabella di ordine.md), più il confronto con l'ordine di prima (W.dbg.ord='ky') a 0°.
// Soglie (piano §6.2): totale ≤ 25.000 px; sugli esseri ≤ 400; a 0° ≤ 1.000; eroe in casa vicino a ogni muro: 0.
// Le coppie tra la base e la sporgenza dello stesso prop si contano a parte (come nell'audit: non entrano nel totale), e a parte le coppie
// che toccano la casa (la casa non è ancora divisa in muri: fase 4).
// Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/ordine.js [pagina] [cartella]   (predefiniti: anteprime/zombie.html,
// anteprime/zombie/vetrina/ordine: ordine.json con tutti i casi)
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html')),OUT=path.resolve(process.argv[3]||path.join(__dirname,'vetrina','ordine'));fs.mkdirSync(OUT,{recursive:true});
// le 22 posizioni dell'audit (agenti/ordine/run3.js), con gli zombie dei casi: [x, y, [[x, y, tipo, sc]…]]
const SC={casaN:[430,86],casaW:[373,190],casaE:[568,200],casaS:[400,203],porta:[470,205],portico:[470,236,[[452,236]]],cimE:[256,150,[[218,150]]],cimW:[218,150,[[256,150]]],
 cancello:[262,352,[[220,345],[222,362]]],lampione:[300,295,[[287,282,'lanterna',1.55],[287,266]]],albero:[570,528],alberoS:[560,578],tomba:[64,224],cripta:[68,157],colonna:[142,160],
 recintoN:[380,258],recintoS:[380,288],pozzoS:[538,432],pozzoE:[576,398],pozzoN:[537,360],cartello:[305,352,[[300,338]]],carriola:[403,395]};
const PSIS=[0,45,90,135,180,225,270,315],TABLE=['casaN','casaE','portico','lampione','cripta','cartello'],INHOUSE=['casaN','casaW','casaE','casaS'];
// la libreria della verità, iniettata nella pagina (verita.js)
const LIB=require('./verita.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForTimeout(2500);await p.addScriptTag({content:LIB});
  await p.evaluate(()=>{const M=__MZ,W=M.W;M.zombies(false);M.low(true);W.dbg.freeze=true;W.dbg.noShoot=true;M.hud(false);
    // un'inquadratura: eroe fermo in (x, y), zombie dati, telecamera ψ/θ sul perno dell'eroe; ritorna la valutazione
    // (prima un secondo di simulazione senza zombie: le trasparenze della casa e delle chiome arrivano al loro valore)
    window.__shot=(x,y,zs,psi,th,o)=>{o=o||{};const h=W.hero,C=M.CAM;M.cam(null);h.x=x;h.y=y;h.zh=M.heightAt(x,y);h.moving=false;h.tgZ=null;W.Z.length=0;M.sim(30,1/30);h.face=-Math.PI/2;h.aim=0;
      (zs||[]).forEach((z,i)=>W.Z.push({id:5000+i,kind:z[2]||'zombie',sc:z[3]||1.1,spd:0,hp:99,x:z[0],y:z[1],zh:M.heightAt(z[0],z[1]),face:Math.atan2(y-z[1],x-z[0]),p:0,anim:'walk',rise:1,die:0,flash:0}));
      for(const q of M.perches){q.away=0;q.t=1.5}W.flock.length=0;W.dbg.ord=o.ky?'ky':undefined;if(o.reset!==false)M.orderReset();
      M.view(psi,th);C.x=x;C.y=y;C.oy=24*C.CP;M.render(0);M.render(0);return __TR.evaluate(o)}});
  const all=[],T0=Date.now();
  for(const[name,[x,y,zs]] of Object.entries(SC))for(const psi of PSIS){const r=await p.evaluate(([x,y,zs,psi])=>__shot(x,y,zs,psi,45),[x,y,zs||[],psi]);all.push(Object.assign({name,psi},r))}
  const ky=[];for(const[name,[x,y,zs]] of Object.entries(SC)){const r=await p.evaluate(([x,y,zs])=>__shot(x,y,zs,0,45,{ky:true}),[x,y,zs||[]]);ky.push(Object.assign({name,psi:0},r))}
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
  const agg=new Map();for(const r of all)for(const q of r.bad){const k=q.a<q.b?q.a+' | '+q.b:q.b+' | '+q.a;const o=agg.get(k)||{k,w:0,n:0,psis:new Set()};o.w+=q.wrong;o.n++;o.psis.add(r.psi);agg.set(k,o)}
  console.log('\ncoppie peggiori (somma dei px, angoli):');for(const o of [...agg.values()].sort((a,b)=>b.w-a.w).slice(0,25))console.log(String(o.w).padStart(7)+'  '+o.k+'  ['+[...o.psis].join(',')+']');
  fs.writeFileSync(path.join(OUT,'ordine.json'),JSON.stringify({all,ky},null,0));
  console.log(`\n${all.length+ky.length} inquadrature in ${((Date.now()-T0)/1000).toFixed(1)} s`);console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
