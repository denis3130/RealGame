const {chromium}=require('playwright');const [sel,tro,room]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const today=new Date();const ds=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
await p.addInitScript(([sel,tro,ds])=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:500,trophies:+tro,runs:6,introSeen:1,sel,login:{last:ds,n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],best:{room:10,gold:100},inf:{best:0,top:[]},tutDone:1}))},[sel,tro,ds]);
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);
await p.evaluate((room)=>__E(`(()=>{document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();
 const idx=G.seq.findIndex(s=>s.c===${room});G.si=idx-1;for(let i=0;i<14;i++){P.lvl++;}nextStep();
 const T=window.__T={u:[],r:[],f:[]};const _u=update,_r=render,_c=rpCapture,_h=hud;T.c=[];T.h=[];rpCapture=function(n){const t=performance.now();_c(n);T.c.push(performance.now()-t)};hud=function(){const t=performance.now();_h();T.h.push(performance.now()-t)};update=function(dt){const t=performance.now();_u(dt);T.u.push(performance.now()-t)};render=function(){const t=performance.now();_r();T.r.push(performance.now()-t)};
 let lf=performance.now();(function fr(n){T.f.push(n-lf);lf=n;requestAnimationFrame(fr)})(lf);
 setInterval(()=>{try{P.hp=P.maxhp;if(!$('skScr').hidden)pick(0);if(!$('whScr').hidden&&!WH.spin)$('whGo').click();if(RP.on)rpEnd();
   if(G.state==='cleared'&&G.door){P.x=AW/2;P.y=TOP-20}if(G.prop&&!G.prop.used){P.x=G.prop.x;P.y=G.prop.y+30}if(G.cc&&!G.ccChosen){P.x=G.cc[0].x;P.y=G.cc[0].y+4}
   if(G.state==='play'&&G.enemies.length===0){}if(Math.random()<.01&&P.ult>=100)useUlt()}catch(e){}},50)})()`),+room);
await p.waitForTimeout(20000);
const r=await p.evaluate(()=>__E(`(()=>{const q=(a,k)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.floor(a.length*k)]?.toFixed(1)};const T=__T;return {room:G.room,mode:G.mode,lowfx:LOWFX,n:T.f.length,frame:{p50:q(T.f,.5),p95:q(T.f,.95),p99:q(T.f,.99),max:q(T.f,.9999)},upd:{p50:q(T.u,.5),p99:q(T.u,.99)},rend:{p50:q(T.r,.5),p99:q(T.r,.99)},cap:{p50:q(T.c,.5),p95:q(T.c,.95),p99:q(T.c,.99)},hud:{p50:q(T.h,.5),p99:q(T.h,.99)},ents:{e:G.enemies.length,fx:G.fx.length,ar:G.arrows.length}}})()`));
console.log(sel,room,JSON.stringify(r),errs);await b.close()})();
