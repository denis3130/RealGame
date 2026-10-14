// I suoni delle armi zombie (Denis, 14 ottobre: «poi l'audio delle medesime armi»): per ogni arma prepara il banco (sprite/armi/suoni_armi.js)
// e lo misura: tempo per prepararlo, quanti suoni, quanta memoria; poi suona lo sparo nuovo e quello di prima e misura picco, volume e
// dove sta l'energia (sotto 150 Hz le casse del telefono non suonano: conta la banda 150-600 Hz, il «pugno»). Uso: python3 tests/mk.py &&
// node tests/suoni_armi.js [armi...]
const {chromium}=require('playwright');const path=require('path');
const ALL=['pistola','revolver','mitraglietta','mitra','mitragliatrice','pompa','tattica','lanciarazzi','tamburo','lanciafiamme','vapore','risonatore'],ids=process.argv.slice(2).length?process.argv.slice(2):ALL;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,handSeen:1}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
  await E(`initAudio();AU.on.music=false;audioSettings();window.__an=AU.ctx.createAnalyser();__an.fftSize=4096;__an.smoothingTimeConstant=0;AU.master.connect(__an);$('menu').hidden=true;0`);await p.waitForTimeout(800);
  // the banks: how long each takes, how many sounds, how much memory
  const bank=JSON.parse(await E(`(async()=>{const out={};for(const id of ${JSON.stringify(ids)}){const t0=performance.now();ARMI.prepara(id);
      while(ARMI.banco[id]&&ARMI.banco[id].wait)await new Promise(r=>setTimeout(r,10));const B=ARMI.banco[id];let n=0,smp=0;for(const k in B){const v=Array.isArray(B[k])?B[k]:[B[k]];for(const x of v)if(x&&x.length){n++;smp+=x.length}}
      out[id]={ms:Math.round(performance.now()-t0),n,kb:Math.round(smp*4/1024),fail:!!B.fail,names:Object.keys(B).join(' ')}}return JSON.stringify(out)})()`));
  for(const id of ids)console.log(id.padEnd(15),'banco',String(bank[id].ms).padStart(5),'ms',String(bank[id].n).padStart(3),'suoni',String(bank[id].kb).padStart(5),'KB',bank[id].fail?'FALLITO':'',bank[id].names);
  // the shot, new and old: peak, loudness and the energy in bands (sub <150, punch 150-600, body 600-2k, crack 2k-6k, air >6k)
  const meas=async(code,ms)=>JSON.parse(await E(`(async()=>{const an=__an,fd=new Float32Array(an.frequencyBinCount),td=new Float32Array(an.fftSize),bands=[0,0,0,0,0],edges=[150,600,2000,6000,1e9];let pk=0,ss=0,n=0;
      ${code};const t0=performance.now();while(performance.now()-t0<${ms}){an.getFloatTimeDomainData(td);let s=0;for(const v of td){s+=v*v;pk=Math.max(pk,Math.abs(v))}ss+=s/td.length;n++;
        an.getFloatFrequencyData(fd);const hz=AU.ctx.sampleRate/an.fftSize;for(let i=1;i<fd.length;i++){const e=Math.pow(10,fd[i]/10),f=i*hz;let j=0;while(f>edges[j])j++;bands[j]+=e}await new Promise(r=>setTimeout(r,16))}
      const tot=bands.reduce((a,b)=>a+b,0)||1;return JSON.stringify({pk:+pk.toFixed(3),rms:+Math.sqrt(ss/Math.max(1,n)).toFixed(4),b:bands.map(v=>Math.round(v/tot*100))})})()`));
  console.log('\nsparo          picco  volume  energia %: sotto150 pugno150-600 corpo600-2k schiocco2-6k aria>6k');
  for(const id of ids){await p.waitForTimeout(300);
    const nu=await meas(`ARMI.suono('${id}','sparo',180)`,900);await p.waitForTimeout(400);const ol=await meas(`ARMI.suonoVecchio('${id}','sparo',180)`,900);
    console.log(id.padEnd(15),'nuovo',String(nu.pk).padEnd(6),String(nu.rms).padEnd(7),nu.b.join(' / '),'   prima',String(ol.pk).padEnd(6),String(ol.rms).padEnd(7),ol.b.join(' / '))}
  // the reload of the pistol, beat by beat (they must sound, and not too loud)
  const rl=await meas(`for(const w of['rl:out','rl:pouch','rl:seat','rl:rack','rl:fwd'])ARMI.suono('pistola',w,180)`,700);console.log('\nricarica pistola (tutti insieme) picco',rl.pk,'volume',rl.rms);
  const ex=await meas(`ARMI.suono('lanciarazzi','esplosione',180)`,1400);console.log('esplosione del razzo picco',ex.pk,'volume',ex.rms,'energia',ex.b.join(' / '));
  console.log('ERR',JSON.stringify(errs));await b.close()})();
