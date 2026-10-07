// usage: node run.js <sel> <trophies> <god 1/0> <tag> [speed]
const {chromium}=require('playwright');
const [sel,tro,god,tag,spd,hero,pet]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];
const p=await b.newPage({viewport:{width:390,height:844}});
p.on('pageerror',e=>errs.push(e.message+' @'+((e.stack||'').split('\n')[1]||'').trim().slice(-60)));
p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
const today=new Date();const ds=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);await p.screenshot({path:'fresh_a.png'});
await p.mouse.click(195,600);await p.waitForTimeout(6000);await p.screenshot({path:'fresh_b.png'});await p.waitForTimeout(22000);await p.screenshot({path:'fresh_c.png'});
console.log('afterIntro',await p.evaluate(()=>__E(`JSON.stringify({intro:INTRO.on,menu:!$('menu').hidden,save:SAVE})`)));
await p.waitForTimeout(1500);await p.screenshot({path:'fresh_d.png'});
const boot=await p.evaluate(()=>__E(`({menu:!$('menu').hidden,intro:INTRO.on,sel:SAVE.sel,open:modeOpen(SAVE.sel||'arena')})`));
console.log('boot',JSON.stringify(boot));
await p.evaluate(()=>__E(`0`));
await p.evaluate(([god,spd])=>__E(`(()=>{
 const B=window.__B={log:[],god:${god},spd:${spd||4},room:-1,ev:null,stall:0,kills:0,ultUsed:{},shots:[],done:false,t0:Date.now(),simT:0,maxEnemies:0,frameMs:0,ticks:0};
 startRun();
 B.iv=setInterval(()=>{try{
  if(!$('endScr').hidden&&!B.done){B.done=true;B.end={title:$('endTitle').textContent,text:$('endText').textContent,room:G.room,lvl:P.lvl,kills:G.kills,gold:G.gold,mode:G.mode,ch:G.chapter};return}
  if(B.done)return;
  if(RP.on){if(Math.random()<.02)rpEnd();return}
  if(!$('skScr').hidden){if(skMode==='shop'){const k=offer.findIndex((s,i)=>!G.shopSold[s.id]&&G.gold>=G.shopOffer[i].price);if(k>=0&&Math.random()<.5)pick(k);else closeSkills()}else pick(randi(0,offer.length-1));B.log.push('skill '+P.lvl);return}
  if(!$('whScr').hidden){if(!WH.spin)$('whGo').click();return}
  if(!$('revScr').hidden){B.log.push('revive screen');(Math.random()<.5&&SAVE.gems>=REV_COST?$('rvYes'):$('rvNo')).click();return}
  if(!started||paused||modal)return;
  if(B.god)P.hp=P.maxhp;
  const t0=performance.now();
  for(let k=0;k<B.spd;k++){if(!started||paused||modal)break;if(G.hitstop>0)G.hitstop=0;update(.033);B.simT+=.033}
  B.frameMs=Math.max(B.frameMs,performance.now()-t0);B.ticks++;
  const key=G.mode+':'+G.room+':'+(G.event||'');
  if(key!==B.room){B.room=key;B.stall=0;B.ult=false;B.log.push('room '+key+' enemies='+G.enemies.length+' types='+[...new Set(G.enemies.map(e=>e.type))].join(','));B.newRoom=true}
  B.maxEnemies=Math.max(B.maxEnemies,G.enemies.length);
  if(G.state==='play'&&G.enemies.length){B.stall+=.033*B.spd;
    if(!B.ult&&B.stall>2){P.ult=100;useUlt();B.ult=true;B.log.push('ult '+SAVE.hero)}
    if(B.stall>14){const e=G.enemies.find(e=>!e.dead&&!e.hidden&&e.spawn<=0);if(e){hurtE(e,e.hp+1,false);B.stall=10;B.forced=(B.forced||0)+1}}}
  if(G.cc&&!G.ccChosen&&G.state==='cleared'){const c=G.cc[randi(0,1)];if(c.st==='idle'){P.x=c.x;P.y=c.y+4}}
  if(G.prop&&!G.prop.used&&G.state==='cleared'){P.x=G.prop.x;P.y=G.prop.y+30}
  if(G.goldRun){const c=G.coins[0];if(c){P.x=c.x;P.y=c.y}}
  if(G.state==='cleared'&&G.door&&!G.goldRun&&(!G.cc||G.ccChosen)){P.x=AW/2;P.y=TOP-20}
  if(B.simT>2400){B.done=true;B.end={timeout:true,room:G.room,state:G.state,ev:G.event}}
 }catch(e){B.err=(B.err||[]);B.err.push(e.message+' '+(e.stack||'').split('\\n')[1]);if(B.err.length>20)B.done=true}},16);
})()`),[god,spd]);
let last='',n=0;const T0=Date.now();
while(Date.now()-T0<600000){await p.waitForTimeout(400);
 const s=await p.evaluate(()=>__E(`({done:__B.done,room:__B.room,st:G&&G.state,ev:G&&G.event})`));
 if(s.room!==last){last=s.room;n++;await p.waitForTimeout(300);await p.screenshot({path:`${tag}_${String(n).padStart(2,'0')}.png`})}
 if(s.done)break}
await p.waitForTimeout(1500);await p.screenshot({path:`${tag}_end.png`});
const r=await p.evaluate(()=>__E(`({end:__B.end,err:__B.err,forced:__B.forced,maxE:__B.maxEnemies,frameMs:__B.frameMs.toFixed(1),simT:__B.simT.toFixed(0),log:__B.log.filter(l=>!l.startsWith('skill')),skills:Object.keys(P.skills).length,save:{tr:SAVE.trophies,gold:SAVE.gold,gems:SAVE.gems,pass:SAVE.pass&&SAVE.pass.xp,chal:SAVE.chal}})`));
console.log(JSON.stringify(r,null,1));console.log('PAGEERRORS',JSON.stringify(errs.slice(0,30)));await b.close()})();
