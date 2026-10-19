// node fluido.js [scene,...]  (phase 9, «più fluido sul telefono»)
// A phone like Denis's (390x844 points, 3 pixels a point): the battle canvas is exactly 2 pixels a point (720 wide) and the camera sits on
// whole pixels; the same frame drawn with the shortcuts of phase 9 and without them (the big soft lights, the vignette, the light map, the
// obstacle shadows and the shafts of light copied one to one) must look the same: tests/fl_<scene>.png puts the two side by side with the
// difference (x16). Then the quality «auto» that halves the pixels when the frames are slow, and «alta» that puts them back; the black
// held three frames after a new room; the time of a frame with and without the shortcuts (on this computer, only to compare). First the
// menu's home scene (the crypt and the campfire), the same way (tests/fl_menu_<mode>.png).
// Scenes: room:<arena>:<room> or boss:<arena>; default one room per chapter and two bosses.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SC=(process.argv[2]||'room:0:3,room:5:6,room:2:7,room:11:7,boss:0,boss:7').split(',');
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const ctxB=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:false,hasTouch:true});const p=await ctxB.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|net::/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:500,trophies:900,runs:12,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},
    items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},set:{q:'auto',mv:.5,sv:.5}}))});
  await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1800);const E=s=>p.evaluate(s=>__E(s),s);
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);AU.on.music=false;AU.on.sfx=false;0`);
  const sz=JSON.parse(await E(`resize();JSON.stringify({w:cv.width,h:cv.height,cw:cv.clientWidth,ch:cv.clientHeight,RESMODE,RESCUT})`));
  ok(sz.RESMODE&&sz.w===720&&Math.abs(sz.h/sz.w-sz.ch/sz.cw)<.01,`tela ${sz.w}x${sz.h} per uno schermo di ${sz.cw}x${sz.ch} punti: 2 pixel a punto`);
  // the menu: the home scene (the Classic's crypt and the Zombie's campfire) at 2 pixels a point, the same with and without the shortcuts
  const sheetOf=async(urls,fn)=>{await E(`window.__pics=${JSON.stringify(urls)};0`);
    const sh=await E(`new Promise(res=>{const ims=__pics.map(u=>{const i=new Image();i.src=u;return i});let n=0;for(const i of ims)i.onload=()=>{if(++n<ims.length)return;const W=ims[0].width/2,H=ims[0].height/2,c=document.createElement('canvas');c.width=W*ims.length+10*(ims.length-1);c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,H);ims.forEach((im,k)=>x.drawImage(im,k*(W+10),0,W,H));res(c.toDataURL('image/png'))}})`);
    fs.writeFileSync(fn,Buffer.from(sh.split(',')[1],'base64'))};
  for(const modo of ['classica','zombie']){
    const r=JSON.parse(await E(`(()=>{SAVE.modo='${modo}';if(typeof MM!=='undefined')MM.tr=null;const seed=()=>{let x=777;Math.random=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648}};
      const frame=()=>{seed();CAMP.t=10;CAMP.embers.length=0;CAMP.amb.length=0;drawCamp(0)},pix=()=>campX.getImageData(0,0,campCv.width,campCv.height).data;for(let i=0;i<5;i++)frame();
      frame();const A=pix().slice(),urlA=campCv.toDataURL();const sv={campLightBlit,campVigDraw,glowFast};
      campLightBlit=function(){ctx.drawImage(campL,0,-LO,SW,LH)};campVigDraw=function(k1){const v=ctx.createRadialGradient(SW/2,SH*.6,SH*.4,SW/2,SH*.6,SH*(k1||1.3));v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(-400,-LO,SW+800,LH)};glowFast=function(){return false};
      frame();const B=pix(),urlB=campCv.toDataURL();campLightBlit=sv.campLightBlit;campVigDraw=sv.campVigDraw;glowFast=sv.glowFast;
      let mx=0,n8=0;for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]));if(d>mx)mx=d;if(d>8)n8++}
      const fl=()=>campX.getImageData(0,0,1,1),T=[];for(let i=0;i<9;i++){const t0=performance.now();drawCamp(.016);fl();T.push(performance.now()-t0)}T.sort((a,b)=>a-b);
      return JSON.stringify({W:campCv.width,H:campCv.height,cw:campCv.clientWidth,max:mx,over8:n8/(A.length/4)*100,a:urlA,b:urlB,t:T[4]})})()`));
    const fn=path.join(__dirname,'fl_menu_'+modo+'.png');await sheetOf([r.a,r.b],fn);
    ok(r.W===720&&r.max<=24&&r.over8<.05,`menu ${modo}: scena ${r.W}x${r.H} (2 pixel a punto per ${r.cw} punti), stessa immagine con e senza le scorciatoie (differenza massima ${r.max}) → ${path.basename(fn)}`);
    console.log(`     la scena del menu: ${r.t.toFixed(1)} ms a fotogramma (su questo computer)`)}
  await E(`SAVE.modo='classica';0`);
  for(const scene of SC){const [kind,a1,a2]=scene.split(':');
    await E(`(()=>{if(window.__R0){render=__R0;delete window.__R0}paused=false;startRun('arena');G.arena=${+a1||0};G.chapter=ARENAS[G.arena].ch;G.diff=ARENAS[G.arena].diff;G.bossLvl=null;G.room=${kind==='boss'?'ROOMS':(+a2||5)};G.event=null;buildRoom();
      for(let i=0;i<10;i++)P.lvl++;P.hp=P.maxhp=1e7;window.__keep=setInterval(()=>{try{P.hp=P.maxhp;if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}
        for(const e of G.enemies)if(!isBoss(e.type)&&e.hp<e.max*.3)e.hp=e.max;const bo=G.enemies.find(e=>isBoss(e.type));if(bo&&bo.hp<bo.max*.6)bo.hp=bo.max*.9;
        const t=performance.now()/1000;P.x=AW/2+Math.cos(t*.7)*90;P.y=BOT-120+Math.sin(t*.9)*40}catch(e){}},100);0})()`);
    await p.waitForTimeout(3200);
    const r=JSON.parse(await E(`(()=>{clearInterval(__keep);paused=true;G.shake=0;window.__R0=render;const R0=render;render=function(){};
      const seed=()=>{let x=777;Math.random=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648}};const fl=()=>ctx.getImageData(0,0,1,1);
      for(let i=0;i<4;i++){seed();R0()}seed();R0();const A=ctx.getImageData(0,0,cv.width,cv.height).data.slice();const urlA=cv.toDataURL();
      const sv={glowFast,drawVig,lwFill,shadowSprite,stripFast};const off=()=>{glowFast=function(){return false};drawVig=function(x,y,w,h){ctx.drawImage(VIG,x,y,w,h)};lwFill=function(){lwOk=false};shadowSprite=function(){return false};stripFast=function(){return false}};
      const on=()=>{glowFast=sv.glowFast;drawVig=sv.drawVig;lwFill=sv.lwFill;shadowSprite=sv.shadowSprite;stripFast=sv.stripFast};
      off();seed();R0();const B=ctx.getImageData(0,0,cv.width,cv.height).data;const urlB=cv.toDataURL();on();
      let mx=0,n8=0;const W=cv.width,H=cv.height,dc=document.createElement('canvas');dc.width=W;dc.height=H;const dx=dc.getContext('2d'),di=dx.createImageData(W,H);
      for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]));if(d>mx)mx=d;if(d>8)n8++;const v=Math.min(255,d*16);di.data[i]=di.data[i+1]=di.data[i+2]=v;di.data[i+3]=255}
      dx.putImageData(di,0,0);
      // time of a frame (render + drawing), with and without the shortcuts, interleaved
      const one=()=>{seed();const t0=performance.now();R0();fl();return performance.now()-t0},TA=[],TB=[];for(let k=0;k<8;k++){on();TA.push(one(),one());off();TB.push(one(),one())}on();
      const md=a=>{a.sort((x,y)=>x-y);return a[a.length>>1]};
      return JSON.stringify({W,H,max:mx,over8:n8/(W*H)*100,a:urlA,b:urlB,d:dc.toDataURL(),tA:md(TA),tB:md(TB),n:G.enemies.length})})()`));
    // the two pictures and the difference, side by side, at half size
    await E(`window.__pics=${JSON.stringify([r.a,r.b,r.d])};0`);
    const sheet=await E(`new Promise(res=>{const ims=__pics.map(u=>{const i=new Image();i.src=u;return i});let n=0;for(const i of ims)i.onload=()=>{if(++n<3)return;const W=ims[0].width/2,H=ims[0].height/2,c=document.createElement('canvas');c.width=W*3+20;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,H);ims.forEach((im,k)=>x.drawImage(im,k*(W+10),0,W,H));res(c.toDataURL('image/png'))}})`);
    const fn=path.join(__dirname,'fl_'+scene.replace(/:/g,'_')+'.png');fs.writeFileSync(fn,Buffer.from(sheet.split(',')[1],'base64'));
    ok(r.max<=64&&r.over8<.2,`${scene} (${r.n} nemici): stessa immagine con e senza le scorciatoie (differenza massima ${r.max}, pixel oltre 8: ${r.over8.toFixed(3)}%) → ${path.basename(fn)}`);
    console.log(`     un fotogramma: ${r.tA.toFixed(1)} ms con le scorciatoie, ${r.tB.toFixed(1)} ms senza (su questo computer)`)}
  await E(`if(window.__R0){render=__R0;delete window.__R0}paused=false;0`);
  // the quality «auto»: slow frames for more than 2 s → 1,5 pixels a point; «alta» puts the 2 back; a new room: three black frames
  const q=JSON.parse(await E(`(()=>{const r={};SAVE.set.q='auto';RESCUT=false;resize();frameEma=.016;slowR=0;started=true;
    const raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;try{for(let i=0;i<80;i++){last-=40;loop(performance.now())}}finally{window.requestAnimationFrame=raf}r.cut=[cv.width,cv.height,RESCUT];
    SAVE.set.q='alta';applySettings();r.alta=[cv.width,cv.height,RESCUT];SAVE.set.q='auto';applySettings();
    paused=false;G.state='cleared';G.door=true;G.state='trans';G.fadeDir=1;G.fade=.99;update(.033);const f=[G.fade,G.fadeHold];update(.016);update(.016);update(.016);f.push(G.fade);update(.016);f.push(G.fade);r.fade=f;
    return JSON.stringify(r)})()`));
  ok(q.cut[0]===540&&q.cut[2]===true,`qualità «auto» con i fotogrammi lenti: tela ${q.cut[0]}x${q.cut[1]} (1,5 pixel a punto)`);
  ok(q.alta[0]===720&&q.alta[2]===false,`qualità «alta»: di nuovo ${q.alta[0]}x${q.alta[1]}`);
  ok(q.fade[0]===1&&q.fade[1]===3&&q.fade[2]===1&&q.fade[3]<1,`stanza nuova: nero per tre fotogrammi, poi la dissolvenza (${q.fade.map(x=>+(+x).toFixed(2)).join(' → ')})`);
  ok(!errs.length,'nessun errore'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(fails?`${fails} FAIL`:'tutto OK');await b.close();process.exit(fails?1:0)})();
