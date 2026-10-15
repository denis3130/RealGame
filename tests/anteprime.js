// The arena previews: the twelve unlock screens («Nuova arena sbloccata!») and the twelve thumbnails of the trophy road, in two grids.
// Run `python3 tests/mk.py` first. Usage: node tests/anteprime.js [page.html]  → tests/ap_sblocco.jpg, tests/ap_thumb.jpg (another page, e.g.
// golem2_test.html from anteprime/mk_golem2.py --test: tests/ap_<page>_sblocco.jpg, tests/ap_<page>_thumb.jpg)
const PAGE=process.argv[2]||'test.html',PRE=PAGE==='test.html'?'ap_':'ap_'+PAGE.replace(/\.html$/,'')+'_';
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:300,trBest:300,runs:4,introSeen:1,handSeen:1,login:{last:'2099-1-1',n:1}}))});
await p.goto('file://'+path.join(__dirname,PAGE));await p.waitForTimeout(1200);
// the opening movie plays at every launch: a tap skips it
await p.mouse.click(195,420);await p.waitForTimeout(1200);await p.evaluate(()=>__E(`if(typeof INTRO!=='undefined'&&INTRO.on){INTRO.on=false}if($('menu').hidden)showMenu()`));await p.waitForTimeout(400);
await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`));
const shots=[];
for(let i=0;i<12;i++){await p.evaluate(i=>__E(`showArenaUp(${i})`),i);await p.waitForTimeout(500);shots.push((await p.screenshot({clip:{x:0,y:0,width:390,height:844}})).toString('base64'));await p.evaluate(()=>__E(`$('arenaUpScr').hidden=true`))}
const grid=await p.evaluate(async(imgs)=>{const cv=document.createElement('canvas');cv.width=390*4;cv.height=844*3;const c=cv.getContext('2d');
  for(let i=0;i<imgs.length;i++){const im=new Image();im.src='data:image/png;base64,'+imgs[i];await new Promise(r=>im.onload=r);c.drawImage(im,(i%4)*390,Math.floor(i/4)*844)}return cv.toDataURL('image/jpeg',.8)},shots);
fs.writeFileSync(path.join(__dirname,PRE+'sblocco.jpg'),Buffer.from(grid.split(',')[1],'base64'));
const th=await p.evaluate(async()=>__E(`(async()=>{const cv=document.createElement('canvas');cv.width=360*4;cv.height=225*3;const c=cv.getContext('2d');
  for(let i=0;i<12;i++){const im=new Image();im.src=arenaThumb(i);await new Promise(r=>im.onload=r);c.drawImage(im,(i%4)*360,Math.floor(i/4)*225)}return cv.toDataURL('image/jpeg',.85)})()`));
fs.writeFileSync(path.join(__dirname,PRE+'thumb.jpg'),Buffer.from(th.split(',')[1],'base64'));
console.log('ok','ERRORS',JSON.stringify(errs.slice(0,6)));await b.close()})();
