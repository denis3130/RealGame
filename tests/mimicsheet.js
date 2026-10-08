// the new mimic in every direction and pose, plus the wake-up sequence
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.goto('file://'+__dirname+'/test_b2.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
const url=await E(`(()=>{const c=document.createElement('canvas');c.width=900;c.height=700;const x=c.getContext('2d');x.fillStyle='#4a4236';x.fillRect(0,0,900,700);const keep=ctx;ctx=x;x.scale(2.2,2.2);
  G.t=3.0;const faces=[['davanti',Math.PI/2],['3/4',Math.PI/4],['lato',0],['dietro',-Math.PI/2]],poses=[['fermo',{st:'walk',hopT:0,mouth:0}],['cammina',{st:'walk',hopT:1.2,mouth:0}],['carica',{st:'chomp',sub:'a',mouth:1}],['bocca',{st:'coins',mouth:1}]];
  poses.forEach(([pn,o],r)=>faces.forEach(([fn,a],c)=>{const e=Object.assign({type:'mimic',x:50+c*95,y:42+r*75,face:a,z:0,t:3,intro:0},o);shadow(e.x,e.y+16,26,8,.38);drawMimicDS(e)}));
  ctx=keep;return c.toDataURL()})()`);
await p.setContent(`<img src="${url}">`);await p.screenshot({path:'mimic_dirs.png'});
await p.goto('file://'+__dirname+'/test_b2.html');await p.waitForTimeout(1200);
const url2=await E(`(()=>{const c=document.createElement('canvas');c.width=900;c.height=260;const x=c.getContext('2d');x.fillStyle='#4a4236';x.fillRect(0,0,900,260);const keep=ctx;ctx=x;x.scale(2.2,2.2);
  [.2,.6,.85,1.1,1.3,1.55].forEach((it,i)=>{const e={type:'mimic',x:40+i*65,y:70,face:Math.PI/2,z:0,t:3,intro:1.6-it,iT:it,st:'walk',mouth:1};G.t=it*3;shadow(e.x,e.y+16,26,8,.38);drawMimicDS(e)});ctx=keep;return c.toDataURL()})()`);
await p.setContent(`<img src="${url2}">`);await p.screenshot({path:'mimic_wake.png',clip:{x:0,y:0,width:900,height:260}});
console.log(errs);await b.close()})();
