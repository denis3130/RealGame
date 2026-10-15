// Vetrina delle mosse dei 4 boss del terzo giro (src/js/82-85): per ogni boss, ogni mossa fatta partire dal suo cervello (con la sua
// preparazione e i suoi avvisi), fotografata in tre momenti: l'avviso, il colpo, subito dopo. Una tavola per boss: tests/b3m_<boss>.png
// (righe = mosse, colonne = momenti). Uso: python3 tests/mk.py && node tests/boss3mosse.js [boss]
const {chromium}=require('playwright');const path=require('path');
const only=process.argv[2];
const B={puppeteer:{ai:8,seq:['slam','strings','puppets','vanish'],t:{slam:[.45,1.3,1.8],strings:[.4,1.4,2.1],puppets:[.6,1.9,2.6],vanish:[.5,1.1,1.5]}},
  phoenix:{ai:9,seq:['feathers','dive','vortex','rain'],t:{feathers:[.4,1.2,1.6],dive:[.6,1.5,2.3],vortex:[.5,1.2,1.9],rain:[.6,1.5,2.4]}},
  octopus:{ai:10,seq:['slam','ink','whirl','dive'],t:{slam:[.5,1.3,1.9],ink:[.4,1.4,2.4],whirl:[.6,1.3,2.1],dive:[.9,1.6,2]}},
  stag:{ai:11,seq:['charge','crystals','aurora','stomp'],t:{charge:[.6,1.3,1.8],crystals:[.5,.95,1.4],aurora:[.8,1.6,2.1],stomp:[.4,.75,1.2]}}};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:5200,runs:9,introSeen:1,tutDone:1,handSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
  const box=JSON.parse(await E(`(()=>{const r=cv.getBoundingClientRect();return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height})})()`));
  for(const[bt,D] of Object.entries(B)){if(only&&only!==bt)continue;const shots=[];
    for(const mv of D.seq){
      await E(`document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(e=>e.hidden=true);modal=false;AU.on.music=false;SAVE.trophies=ARENAS[${D.ai}].t;startRun();0`);await p.waitForTimeout(400);
      await E(`G.arena=${D.ai};G.chapter=ARENAS[${D.ai}].ch;G.diff=ARENAS[${D.ai}].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom();const e=G.enemies.find(q=>isBoss(q.type));e.intro=0;e.iT=9;e.em=null;
        P.inv=999;P.hp=P.maxhp=1e7;P.x=e.x+30;P.y=e.y+230;window.__fz=setInterval(()=>{P.x=e.x+30;P.y=Math.min(BOT-30,e.y+230);P.inv=999;if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},50);
        const seq=${JSON.stringify(D.seq)};b3go(e,'walk',0);e.si=0;e.p2=false;
        // the AI picks the next move from its own list: put the wanted one first
        const _r=EUPD['${bt}'];window.__seqFix=()=>{};e.si=(${JSON.stringify(D.seq)}).indexOf('${mv}');
        const base=e.type==='puppeteer'?['slam','strings','puppets','slam','vanish','strings']:e.type==='phoenix'?['feathers','dive','vortex','feathers','rain','dive']:e.type==='octopus'?['slam','ink','whirl','slam','dive','ink']:['charge','crystals','stomp','aurora','charge','crystals'];
        e.si=base.indexOf('${mv}');0`);
      const T=D.t[mv];let last=0;for(const t of T){await p.waitForTimeout(Math.round((t-last)*1000));last=t;shots.push(await p.screenshot({clip:{x:box.x,y:box.y,width:box.w,height:box.h}}))}
      await E(`clearInterval(__fz);0`)}
    // the sheet: rows = moves, columns = moments
    const url=await p.evaluate(async([imgs,rows])=>{const L=await Promise.all(imgs.map(s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s})));
      const w=L[0].width*.5,h=L[0].height*.5,cv=document.createElement('canvas');cv.width=w*3;cv.height=h*rows;const c=cv.getContext('2d');L.forEach((im,i)=>c.drawImage(im,(i%3)*w,Math.floor(i/3)*h,w,h));return cv.toDataURL('image/png')},[shots.map(s=>s.toString('base64')),D.seq.length]);
    require('fs').writeFileSync(path.join(__dirname,`b3m_${bt}.png`),Buffer.from(url.split(',')[1],'base64'));console.log('tavola',bt)}
  console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();
