const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @'+((e.stack||'').split('\n')[1]||'').trim().slice(-50)));
const today=new Date();const ds=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
await p.addInitScript(([ds])=>{if(localStorage.getItem('qa_once'))return;localStorage.setItem('qa_once',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:30000,gems:3000,trophies:1300,trBest:1300,runs:12,introSeen:1,login:{last:'',n:3},items:{arco_frassino:{lvl:3,cards:40},giubba:{lvl:3,cards:40},balestra:{lvl:1,cards:5}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[{type:'legno',state:'ready'},{type:'argento',state:'ready'},{type:'oro',state:'locked'},null],best:{room:10,gold:100},best2:{room:10,gold:100},inf:{best:12,top:[{room:12,hero:'arciere',kills:80,d:Date.now()}]},tutDone:1,road:{}}))},[ds]);
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);
const ov=()=>p.evaluate(()=>__E(`[...document.querySelectorAll('#sheetScr,#itemScr,#chestScr,#arenaUpScr,#endScr,#whScr')].filter(e=>!e.hidden).map(e=>e.id).join(',')`));
const reset=async(st)=>p.evaluate((st)=>__E(`(()=>{$('chestScr').hidden=true;CHbusy=false;document.querySelectorAll('#sheetScr,#itemScr,#arenaUpScr,#whScr').forEach(e=>e.hidden=true);SHEET=null;$('menu').hidden=false;
  setTab('${st.tab}');${st.ps?`profSeg='${st.ps}';renderProfile();`:''}})()`),st);
const states=[{tab:'tabPlay'},{tab:'tabHero'},{tab:'tabGear'},{tab:'tabPets'},{tab:'tabShop'},{tab:'tabRoad'},{tab:'tabProfile',ps:'ach'},{tab:'tabProfile',ps:'lb'},{tab:'tabProfile',ps:'look'}];
let n=0;const log=[];
for(const st of states){await reset(st);await p.waitForTimeout(400);const name=st.tab+(st.ps||'');await p.screenshot({path:`s_${name}.png`});
 const cnt=await p.evaluate((tab)=>__E(`(()=>{let i=0;const sec=$('${tab}');const pool=[...sec.querySelectorAll('*'),...document.querySelectorAll('#topbar *')];
  for(const el of pool){const isC=el.tagName==='BUTTON'||Object.keys(el.dataset).some(k=>k!=='qa')||el.classList.contains('icard')||el.classList.contains('tbuy')||el.classList.contains('plus');
   if(!isC)continue;const r=el.getBoundingClientRect();if(r.width<4||r.height<4||el.closest('[hidden]'))continue;if(el.id==='playBtn')continue;el.setAttribute('data-qa','q'+i++)}return i})()`),st.tab);
 log.push(`${name}: ${cnt}`);
 for(let k=0;k<cnt;k++){await reset(st);await p.waitForTimeout(80);
  const info=await p.evaluate(([k,tab])=>{const sec=document.getElementById(tab);const pool=[...sec.querySelectorAll('*'),...document.querySelectorAll('#topbar *')].filter(el=>{const isC=el.tagName==='BUTTON'||Object.keys(el.dataset).some(x=>x!=='qa')||el.classList.contains('icard')||el.classList.contains('tbuy')||el.classList.contains('plus');if(!isC)return false;const r=el.getBoundingClientRect();return r.width>=4&&r.height>=4&&!el.closest('[hidden]')&&el.id!=='playBtn'});const el=pool[k];if(!el)return null;const t=(el.id||el.className||'')+' '+(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,30);el.click();return t},[k,st.tab]);
  if(!info)continue;const b0=errs.length;await p.waitForTimeout(350);const o=await ov();
  if(o||errs.length>b0){n++;const f=`s_${name}_${String(n).padStart(3,'0')}.png`;await p.screenshot({path:f});log.push(`  [${n}] ${info} -> ${o} ${errs.length>b0?'ERR '+errs.slice(b0).join('|'):''}`);
   if(o.includes('chestScr')){for(let t=0;t<25&&!(await p.evaluate(()=>document.getElementById('chestScr').hidden));t++){await p.mouse.click(195,600);await p.waitForTimeout(300);if(t===3)await p.screenshot({path:f.replace('.png','c.png')})}}
  }}}
console.log(log.join('\n'));console.log('ERRORS',JSON.stringify(errs,null,1));
console.log(await p.evaluate(()=>__E(`JSON.stringify({gold:SAVE.gold,gems:SAVE.gems,hero:SAVE.hero,heroes:SAVE.heroes,pets:SAVE.pets,tal:SAVE.tal,items:SAVE.items,eq:SAVE.eq,title:SAVE.title,frame:SAVE.frame,road:SAVE.road})`)));
await b.close()})();
