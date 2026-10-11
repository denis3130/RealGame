// Vetrina dei prop: per ogni prop quattro viste (eroe a sinistra, destra, sopra, sotto) ingrandite, in un foglio. node vetrina.js
const {chromium}=require('/home/user/RealGame/node_modules/playwright');const fs=require('fs');
const T=64,PROPS={cripta:[1.1,1.7,1.5],albero_morto:[3,2.25,1.5],lapidi:[1.9,3.3,1.8],fossa:[2,4.95,1.8],muro_cancello:[3.7,5.5,1.5],casa:[7.35,2.3,1.0],finestre_porta:[7.3,3.5,1.6],portico:[7.35,3.9,1.7],lampione:[4.2,4.3,1.6],pozzo:[8.4,6.2,1.6],carriola:[6.3,5.75,1.8],casse_botte:[9.2,4.9,1.8],zucche_recinto:[7.3,4.15,1.8],albero_vivo:[8.9,8.6,1.3],sasso_cespuglio_fieno:[6.15,7.45,1.6],cartello:[5.12,5.38,1.9]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
await p.goto('file:///home/user/RealGame/anteprime/zombie.html');await p.waitForTimeout(2500);await p.evaluate(()=>{__MZ.zombies(false);__MZ.low(false);for(const sel of['.top','.bar','.hint'])document.querySelector('#mz '+sel).style.display='none'});
const out=require('path').join(__dirname,'vetrina')+'/';fs.mkdirSync(out,{recursive:true});
for(const[name,[cx,cy,z]] of Object.entries(PROPS)){const shots=[];
  for(const[dx,dy] of[[-1.6,0],[1.6,0],[0,-1.7],[0,1.7]]){// l'eroe spostato: il prop finisce dall'altra parte dello schermo e si piega
    await p.evaluate(([cx,cy,dx,dy,z])=>{__MZ.zoom(z);const hx=cx*64+dx*64,hy=cy*64+dy*64;__MZ.tp(hx,hy);__MZ.cam(hx,hy);__MZ.CAM.x=hx;__MZ.CAM.y=hy;__MZ.CAM.z=z},[cx,cy,dx,dy,z]);await p.waitForTimeout(350);
    // ritaglio intorno al prop: posizione sullo schermo = centro + (prop - cam)*z
    const W=390,H=844,px=W/2+(-dx*64)*z,py=H/2+(-dy*64)*z,r=150,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
    const x0=cl(px-r,0,W-40),x1=cl(px+r,x0+40,W),y0=cl(py-r*1.2,0,H-40),y1=cl(py+r*1.1,y0+40,H);
    shots.push(await p.screenshot({clip:{x:x0,y:y0,width:x1-x0,height:y1-y0}}))}
  for(let i=0;i<4;i++)fs.writeFileSync(out+name+'_'+i+'.png',shots[i]);console.log(name)}
console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
