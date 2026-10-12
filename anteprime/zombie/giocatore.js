// Un giocatore automatico per la partita a ondate (partita.js): fa partite vere sulla mappa intera e dice a che round arriva. Gioca come un
// giocatore discreto: quando uno zombie è vicino (o un cerchio di avviso del boss gli sta sotto i piedi) scappa nella direzione più libera,
// altrimenti sta fermo e l'eroe spara da solo; compra il Revolver, apre il cancello, compra la Pompa e le anime quando ha le monete (senza
// camminare fino al bottone: misura la difficoltà dei round, non la strada). Uso: python3 anteprime/zombie/mk.py area_mappa &&
// node anteprime/zombie/giocatore.js [partite] [minuti]   (ogni partita al massimo [minuti] di gioco simulato)
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(path.join(__dirname,'..','zombie.html')),N=+(process.argv[2]||3),MIN=+(process.argv[3]||25);
(async()=>{const b=await chromium.launch();const res=[];
  for(let k=0;k<N;k++){const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground&&__MZ.W.director,null,{timeout:60000});await p.waitForTimeout(300);
    const r=await p.evaluate(([MIN,seed])=>{const M=__MZ,W=M.W,D=W.director,h=W.hero,T=64;W.dbg.freeze=true;M.hud(false);
      let s=seed*7919+13;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};// ogni partita il suo seme
      const dirs=[];for(let i=0;i<16;i++)dirs.push([Math.cos(i*Math.PI/8),Math.sin(i*Math.PI/8)]);
      const free=(x,y,dx,dy)=>{let f=0;for(const L of[5,10,16,23,30,46,64,84,106,130]){if(M.hit(x+dx*L,y+dy*L,11))break;f=L}return f};
      // il centro della zona dove sta (l'area di partenza o la fattoria): scappando si tiene verso il largo, non negli angoli
      const centro=()=>h.y<14.3*T?[8*T,8*T]:[8*T,20*T];let pd=[0,0],cmT=0;
      const log=[],buys=[],hits=[],stuckLog=[];let t=0,lastR=0,hpLost=0,hp0=D.hp,stuck=0;const dt=1/30;
      const buy=id=>{const o=M.buys.find(q=>q.id===id);if(o&&(!o.show||o.show())&&W.coins>=o.price()&&o.act()){buys.push(id+'@R'+D.R);return true}return false};
      while(t<MIN*60&&D.st!=='fine'){
        // le compere tra un round e l'altro (o quando conviene)
        if(D.st==='pausa'||D.R>=1){if(W.gunId==='pistola'&&W.coins>=700)buy('muro_revolver');else if(!W.gate.open&&W.coins>=900)buy('cancello');else if(D.anime===0&&D.comprate<3&&W.coins>=1600)buy('anima');else if(W.gate.open&&W.gunId!=='pompa'&&W.coins>=1700)buy('muro_pompa')}
        // chi minaccia: gli zombie vicini e i cerchi di avviso sotto i piedi
        let fx=0,fy=0,th=0;for(const z of W.Z){if(z.die||z.rise<1||z.idle)continue;const dx=h.x-z.x,dy=h.y-z.y,d=Math.hypot(dx,dy)||1,R=z.boss?135:z.dashT>0?130:100;if(d<R){th++;fx+=dx/d*(R-d);fy+=dy/d*(R-d)}}
        for(const w of D.warn){if(w.sum)continue;const x=w.follow?w.follow.x:w.x,y=w.follow?w.follow.y:w.y,dx=h.x-x,dy=h.y-y,d=Math.hypot(dx,dy)||1;if(d<w.r+16){th++;fx+=dx/d*200;fy+=dy/d*200}}
        let ix=0,iy=0;cmT-=dt;if(th&&!h.dead&&cmT>0&&(pd[0]||pd[1])&&free(h.x,h.y,pd[0],pd[1])>=23){ix=pd[0];iy=pd[1]}// una direzione scelta si tiene per un attimo (niente avanti e indietro)
        else if(th&&!h.dead){cmT=.45;const L=Math.hypot(fx,fy)||1;fx/=L;fy/=L;const c=centro(),cx=c[0]-h.x,cy=c[1]-h.y,cl=Math.hypot(cx,cy)||1;let best=null,bs=-1e9;
          for(const[dx,dy] of dirs){const f=free(h.x,h.y,dx,dy);if(f<30)continue;const ex=h.x+dx*Math.min(f,46),ey=h.y+dy*Math.min(f,46);let op=0;for(let j=0;j<16;j+=2){const q=dirs[j];if(!M.hit(ex+q[0]*44,ey+q[1]*44,11))op++}// quanto è aperto dove arriva (niente angoli né case)
            const ins=W.houses?W.houses.some(hs=>ex>hs.x&&ex<hs.x+hs.w&&ey>hs.y&&ey<hs.y+hs.d):false;const sc=(dx*fx+dy*fy)*2+1.6*f/130+.6*(dx*cx+dy*cy)/cl+.4*(dx*pd[0]+dy*pd[1])+.25*op-(ins?1.5:0);if(sc>bs){bs=sc;best=[dx,dy]}}
          if(best){ix=best[0];iy=best[1];pd=best}else stuck++}else pd=[0,0]
        const px=h.x,py=h.y;if(ix||iy)M.walk(ix,iy,1,dt);else M.sim(1,dt);t+=dt;
        if((ix||iy)&&Math.hypot(h.x-px,h.y-py)<.5&&!h.dead){stuck++;if(stuckLog.length<3&&stuck%15===1)stuckLog.push(`fermo @${(h.x/T).toFixed(2)},${(h.y/T-2).toFixed(2)} dir ${ix.toFixed(2)},${iy.toFixed(2)} free ${free(px,py,ix,iy)} hit ${JSON.stringify(M.hit(h.x,h.y,10))} st ${D.st} dead ${!!h.dead} fall ${h.fall}`)}
        if(D.hp<hp0){hpLost+=hp0-D.hp;const near=W.Z.filter(z=>!z.die&&z.rise>=1&&Math.hypot(z.x-h.x,z.y-h.y)<45).map(z=>z.kind+(z.boss?'*':'')+':'+Math.round(Math.hypot(z.x-h.x,z.y-h.y)));hits.push(`${(t).toFixed(1)}s R${D.R} -${Math.round(hp0-D.hp)} vita ${Math.round(D.hp)} @${(h.x/T).toFixed(1)},${(h.y/T-2).toFixed(1)} [${near.join(' ')}] ${ix||iy?'scappa':'fermo'}`)}hp0=D.hp;
        if(D.R!==lastR){if(lastR)log.push({R:lastR,t:+(t/60).toFixed(2),kills:W.kills,coins:W.coins,hpLost:Math.round(hpLost),gun:W.gunId});lastR=D.R;hpLost=0}}
      return{R:D.R,st:D.st,min:+(t/60).toFixed(1),kills:W.kills,gun:W.gunId,buys,log,stuck,stuckLog,hits:hits.slice(-8)}},[MIN,k+1]);
    res.push(r);console.log(`partita ${k+1}: ${r.st==='fine'?'caduto al':'arrivato al'} round ${r.R} in ${r.min} min, ${r.kills} zombie, arma ${r.gun}; compere ${r.buys.join(' ')}; bloccato ${r.stuck}`);
    console.log('   '+r.log.map(o=>`R${o.R}: ${o.t}′ vita persa ${o.hpLost}`).join(' · '));if(process.env.COLPI){console.log('   colpi: '+r.hits.join('\n          '));console.log('   '+r.stuckLog.join('\n   '))}if(errs.length)console.log('   ERR',JSON.stringify(errs.slice(0,3)));await p.close()}
  const Rs=res.map(r=>r.R);console.log(`\nround raggiunti: ${Rs.join(', ')} (media ${(Rs.reduce((a,b)=>a+b,0)/Rs.length).toFixed(1)})`);await b.close()})();
