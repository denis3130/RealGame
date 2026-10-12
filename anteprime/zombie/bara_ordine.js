// La Bara delle Sorprese ferma nel mondo nella verità a z-buffer (verita.js): nei suoi tre posti, chiusa e aperta (con la mano e l'arma),
// l'eroe in 8 punti intorno (dove si può stare) e 8 angoli della telecamera: conta le inquadrature in cui la Bara c'è, quelle in cui si copre
// con qualcosa e le coppie con la Bara nell'ordine sbagliato (da 3 px). Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/bara_ordine.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');const LIB=require('./verita.js');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(500);
  await p.evaluate(()=>{__MZ.coins(9999);__MZ.buyNow('cancello')});await p.waitForTimeout(3500);await p.addScriptTag({content:LIB});
  let tot={n:0,x:0,touch:0,bad:0,px:0};
  for(let spot=0;spot<3;spot++)for(const stato of['chiusa','aperta']){
    const r=await p.evaluate(([spot,stato])=>{const M=__MZ,W=M.W;M.zombies(false);M.low(true);W.dbg.freeze=true;W.dbg.noShoot=true;M.hud(false);W.Z.length=0;const q=M.boxTo(spot),B=M.box().b;
      if(stato==='aperta'){B.st='offre';B.t=1.2;B.gun='pompa';B.T=3.3}else{B.st='ferma';B.t=0}
      const out=[],h=W.hero;
      for(let k=0;k<8;k++){const a=k*Math.PI/4,x=q[0]+Math.cos(a)*52,y=q[1]+Math.sin(a)*40;if(M.hit(x,y,10))continue;h.x=x;h.y=y;h.zh=M.heightAt(x,y);h.moving=false;
        for(const psi of[0,45,90,135,180,225,270,315]){M.cam(null);M.view(psi,45);M.CAM.x=x;M.CAM.y=y;M.CAM.oy=24*M.CAM.CP;M.orderReset();M.render(0);M.render(0);
          const X=M.entries().find(e=>e.id==='X'),res=__TR.evaluate({truth:true,top:60}),withX=(res.truth||[]).filter(t=>t[0]==='X'||t[1]==='X');
          out.push({k,psi,hasX:!!X,nX:withX.length,bad:res.bad.filter(bb=>bb.a.startsWith('X')||bb.b.startsWith('X'))})}}
      M.boxTo(0);B.st='ferma';B.t=0;return out},[spot,stato]);
    const bad=r.filter(o=>o.bad.length),px=bad.reduce((s,o)=>s+o.bad.reduce((t,q)=>t+q.wrong,0),0);
    console.log(`posto ${spot} ${stato.padEnd(7)} inquadrature ${r.length}, Bara presente ${r.filter(o=>o.hasX).length}, che si copre con qualcosa ${r.filter(o=>o.nX).length}, con errori ${bad.length} (${px} px sbagliati)`);
    for(const o of bad)console.log('   eroe',o.k,'ψ',o.psi,JSON.stringify(o.bad));
    tot.n+=r.length;tot.x+=r.filter(o=>o.hasX).length;tot.touch+=r.filter(o=>o.nX).length;tot.bad+=bad.length;tot.px+=px}
  console.log(`\ntotale: ${tot.n} inquadrature, Bara presente in ${tot.x}, che si copre in ${tot.touch}, con errori ${tot.bad} (${tot.px} px)`);console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
