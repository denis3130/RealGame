// every new sound is played and measured (peak and loudness), next to the old ones as a reference; the ambience of each chapter too
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`initAudio();AU.on.music=false;audioSettings();window.__an=AU.ctx.createAnalyser();__an.fftSize=2048;AU.master.connect(__an);$('menu').hidden=true;0`);await p.waitForTimeout(3500);
const meas=async(code,ms)=>{await E(`window.__pk=0;window.__ss=0;window.__n=0;window.__iv=setInterval(()=>{const d=new Float32Array(2048);__an.getFloatTimeDomainData(d);let s=0,pk=0;for(const v of d){s+=v*v;pk=Math.max(pk,Math.abs(v))}__pk=Math.max(__pk,pk);__ss+=s/2048;__n++},20);${code};0`);
  await p.waitForTimeout(ms);return JSON.parse(await E(`clearInterval(__iv);JSON.stringify({pk:+__pk.toFixed(3),rms:+Math.sqrt(__ss/Math.max(1,__n)).toFixed(4)})`))};
const R=[];
for(const k of ['boom','coin','roar','hit','splash']){R.push(['(vecchio) '+k,await meas(`sfx('${k}')`,1500)])}
for(const k of ['crumble','icicles','ignite','frost','groan','bloom','hiss','deepBubble','mimicWake','mimicStep','mimicBreath','farGrowl']){R.push([k,await meas(`try{SFX2['${k}'](AU.ctx.currentTime+.01,1)}catch(e){window.__err=(window.__err||'')+'${k}:'+e.message+' '}`,1800)])}
for(const m of ['witch','frost','forge'])R.push(['magic '+m,await meas(`SFX2.magic(AU.ctx.currentTime+.01,'${m}')`,1800)]);
console.log('errori dentro i suoni:',await E(`window.__err||'nessuno'`));
for(const [kind,ch] of [['moss',1],['lava',2],['swamp',3],['ice',4],['menu',0]]){await E(ch?`$('menu').hidden=true;started=true;paused=false;G.chapter=${ch};G.room=3;0`:`$('menu').hidden=false;0`);await p.waitForTimeout(3000);const k=await E('AMB.kind');R.push(['ambiente '+kind+' ('+k+')',await meas(`0`,4000)])}
await E(`$('menu').hidden=true;started=false;0`);
for(const [n,v] of R)console.log(n.padEnd(22),'picco',String(v.pk).padEnd(6),'volume',v.rms);
console.log(errs);await b.close()})();
