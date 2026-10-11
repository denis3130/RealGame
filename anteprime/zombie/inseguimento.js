// Una partita con l'eroe che scappa: segue un giro (intorno al pozzo, dentro e fuori dalla casa, al cancello del cimitero, dietro la cripta,
// negli angoli) a 150 px/s con le collisioni vere, mentre gli zombie escono dalle buche come nel gioco (al massimo 5, non spara). Misura gli
// zombie fermi per più di 3 s lontani dall'eroe, quelli dentro un solido o fuori dal mondo, quelli che oscillano, e quanto ci mettono ad
// arrivare. Scrive vetrina/inseguimento.json e le foto dei casi cattivi vetrina/ins_<n>.png. Uso: node anteprime/zombie/inseguimento.js [minuti]
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const MIN=+(process.argv[2]||4);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+path.resolve(__dirname,'..','zombie.html'));await p.waitForTimeout(2500);
  const out=path.join(__dirname,'vetrina');fs.mkdirSync(out,{recursive:true});const T=64;
  const WP=[[7.6,6.2],[8.4,5.35],[9.2,6.2],[8.4,7.0],[7.35,4.0],[7.35,3.1],[6.3,2.6],[8.5,1.6],[7.35,3.1],[7.35,4.0],[4.45,5.5],[3.2,5.5],[1.6,6.0],[.9,3.9],[2.6,.55],[.6,.55],[2.6,.55],[3.2,2.6],[3.2,5.5],[4.45,5.5],[4.45,8.6],[.6,9.5],[6.6,9.4],[9.5,9.5],[9.5,5.0]].map(([x,y])=>[x*T,y*T]);
  const res=await p.evaluate(([WP,MIN])=>{const M=__MZ,W=M.W,h=W.hero;W.dbg.freeze=true;W.dbg.noShoot=true;M.zombies(true);W.Z.length=0;
    // il percorso dell'eroe tra due punti: BFS su una griglia di 4 px con il raggio dell'eroe
    const G=4,cw=Math.ceil(W.w/G),ch=Math.ceil(W.h/G),free=new Uint8Array(cw*ch);for(let j=0;j<ch;j++)for(let i=0;i<cw;i++)free[j*cw+i]=M.hit((i+.5)*G,(j+.5)*G,10.5)?0:1;
    const near=(x,y)=>{let bi=-1,bd=1e9;const i0=Math.floor(x/G),j0=Math.floor(y/G);for(let j=j0-8;j<=j0+8;j++)for(let i=i0-8;i<=i0+8;i++){if(i<0||j<0||i>=cw||j>=ch||!free[j*cw+i])continue;const d=(i-i0)**2+(j-j0)**2;if(d<bd){bd=d;bi=j*cw+i}}return bi};
    const route=(a,b2)=>{const s=near(a[0],a[1]),t=near(b2[0],b2[1]);const prev=new Int32Array(cw*ch).fill(-2);prev[s]=-1;const q=[s];let k=0;while(k<q.length){const u=q[k++];if(u===t)break;const i=u%cw,j=(u-i)/cw;for(const[di,dj] of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const v=nj*cw+ni;if(prev[v]!==-2||!free[v])continue;if(di&&dj&&(!free[j*cw+ni]||!free[nj*cw+i]))continue;prev[v]=u;q.push(v)}}
      const pts=[];for(let u=t;u>=0;u=prev[u]){const i=u%cw;pts.push([(i+.5)*G,((u-i)/cw+.5)*G])}return pts.reverse()};
    let pts=[],wi=0;h.x=WP[0][0];h.y=WP[0][1];const dt=1/30,N=Math.round(MIN*60/dt);const st=new Map();const bad=[];let spawned=0,arrive=[],osc=0,inside=0,outside=0;let t=0;
    for(let n=0;n<N;n++){t+=dt;if(!pts.length){const a=[h.x,h.y],b2=WP[(wi+1)%WP.length];wi=(wi+1)%WP.length;pts=route(a,b2);if(!pts.length)pts=[b2]}
      // passo dell'eroe (si ferma mezzo secondo ogni tanto, come chi gioca)
      const pause=(Math.floor(t/7)%3===2)&&(t%7<.6);if(!pause&&pts.length){const q=pts[0],dx=q[0]-h.x,dy=q[1]-h.y,l=Math.hypot(dx,dy),sp=150*dt;if(l<=sp){if(!M.hit(q[0],q[1],10)){h.x=q[0];h.y=q[1]}pts.shift()}else{const nx=h.x+dx/l*sp,ny=h.y+dy/l*sp;if(!M.hit(nx,ny,10)){h.x=nx;h.y=ny}else pts.shift()}h.moving=true}else h.moving=false;
      const before=W.Z.length;M.sim(1,dt);
      for(const z of W.Z){if(!st.has(z)){st.set(z,{born:t,lastProg:t,best:1e9,lastPos:[z.x,z.y],dirFlips:0,lastDir:null,arrived:false,stuckRep:false,hist:[]});spawned++}const s=st.get(z);if(z.rise<1||z.die)continue;
        if(n%6===0){s.hist.push([+t.toFixed(1),Math.round(z.x),Math.round(z.y),z.tg?Math.round(z.tg[0])+','+Math.round(z.tg[1]):'-',z.det>0?1:0,Math.round(h.x)+','+Math.round(h.y),W.Z.filter(o=>o!==z&&Math.hypot(o.x-z.x,o.y-z.y)<26).length]);if(s.hist.length>16)s.hist.shift()}
        const d=Math.hypot(z.x-h.x,z.y-h.y);if(d<40){s.lastProg=t;if(!s.arrived){s.arrived=true;s.at=t;arrive.push(t-s.born)}}if(s.arrived&&t-s.at>2.5){z.die=.001;continue}// arrivato: muore, così ne escono altri
        const moved=Math.hypot(z.x-s.lastPos[0],z.y-s.lastPos[1]);if(moved>12){s.lastProg=t;s.lastPos=[z.x,z.y]}
        if(t-s.lastProg>3&&!s.stuckRep){s.stuckRep=true;bad.push({k:'fermo',t:+t.toFixed(1),z:[Math.round(z.x),Math.round(z.y)],hero:[Math.round(h.x),Math.round(h.y)],kind:z.kind,hist:s.hist.slice()})}
        if(M.hit(z.x,z.y,9)&&t-s.born>3&&!M.holes.some(([hx,hy])=>Math.hypot(z.x-hx,z.y-hy)<45)){inside++;if(bad.filter(b=>b.k==='dentro').length<6)bad.push({k:'dentro',t:+t.toFixed(1),z:[Math.round(z.x),Math.round(z.y)],kind:z.kind})}
        if(z.x<0||z.y<0||z.x>W.w||z.y>W.h)outside++;
        if(z.vx!=null){const dir=Math.sign(z.vx)*2+Math.sign(z.vy);if(s.lastDir!=null&&Math.sign(z.vx)!==Math.sign(s.lastDirVx)&&Math.abs(z.vx)>.6){s.dirFlips++}s.lastDirVx=z.vx;s.lastDir=dir}}
      for(const[z,s] of st)if(!W.Z.includes(z))st.delete(z)}
    // gli zombie che restano vivi vengono uccisi dalla regola del gioco solo quando muoiono: qui li togliamo ogni 40 s perché ne escano di nuovi
    return{minuti:MIN,spawned,arrivati:arrive.length,tempoMedio:+(arrive.reduce((a,b)=>a+b,0)/Math.max(1,arrive.length)).toFixed(1),bad,inside,outside}},[WP,MIN]);
  fs.writeFileSync(path.join(out,'inseguimento.json'),JSON.stringify(res,null,1));
  let i=0;for(const c of res.bad.slice(0,8)){await p.evaluate(([x,y])=>{const M=__MZ;M.W.dbg.freeze=false;M.zombies(false);M.W.Z.length=0;M.tp(x,y);M.cam(x,y-24);M.CAM.x=x;M.CAM.y=y-24},c.z);await p.waitForTimeout(500);await p.screenshot({path:path.join(out,'ins_'+(i++)+'.png')})}
  console.log(JSON.stringify({...res,bad:res.bad.length}),'\n',JSON.stringify(res.bad.slice(0,12)));console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
