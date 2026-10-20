// Il foglio dei colpi unici (src/js/93-colpi-unici.js) visti da vicino: ogni colpo in cinque direzioni e momenti, ingrandito, sul pavimento
// del suo capitolo e su uno chiaro, accanto al colpo di oggi. Uscita tests/cu_foglio.png.
// Uso: python3 anteprime/mk_colpi.py --test && node tests/colpi_foglio.js [scala]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const SC=+(process.argv[2]||3);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'colpi_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:20000});await p.waitForTimeout(600);
  const url=await p.evaluate(sc=>__E(`(()=>{document.querySelectorAll('#cpPan').forEach(q=>q.hidden=true);modal=false;startRun();
    const ROWS=[['cuArrow','arrow','muschio','Goblin'],['cuBolt','arrow','muschio','Scheletro'],['cuScreech','orb','muschio','Pipistrello'],['cuSeed','orb','muschio','Pianta'],['cuWisp','orb','muschio','Fuoco fatuo'],
      ['cuSkull','orb','muschio','Negromante'],['cuPetal','thorn','muschio','Fiore occhio'],['cuPin','shadow','muschio',"Burattino d'ombra"],['cuFire','fire','cenere','Diavoletto'],['cuEmber','fire','cenere','(braci)'],
      ['rock','','cenere','Piromante'],['bomb','','cenere','Nano'],['cuGob','poison','palude','Rana'],['cuFlake','snow','brina','Spirito della neve'],['cuShard','ice','brina','Sentinella']];
    const CW=46,CH=40,cols=7,W=150+CW*cols,H=CH*ROWS.length+24,c=document.createElement('canvas');c.width=W*${sc};c.height=H*${sc};const keep=ctx,keepT=G.t,keepLow=LOWFX;ctx=c.getContext('2d');
    ctx.setTransform(${sc},0,0,${sc},0,0);ctx.fillStyle='#15110d';ctx.fillRect(0,0,W,H);ctx.font='700 9px system-ui';ctx.fillStyle='#e9c98a';ctx.textBaseline='middle';
    ['→','↓','←','↗','↙ t+.3','chiaro','oggi'].forEach((s,i)=>{ctx.textAlign='center';ctx.fillText(s,150+CW*i+CW/2,12)});
    const AN=[0,Math.PI/2,Math.PI,-Math.PI/4,Math.PI*.75];
    ROWS.forEach(([k,old,th,n],r)=>{const y0=24+r*CH;ctx.textAlign='left';ctx.fillStyle='#f4ecdc';ctx.font='700 10px system-ui';ctx.fillText(n,6,y0+CH/2);
      for(let i=0;i<cols;i++){const x0=150+CW*i,fl=i===5?'#9a8f7c':(ENV[th]&&ENV[th].floor?ENV[th].floor[0]:'#3a3530');ctx.fillStyle=fl;ctx.fillRect(x0+1,y0+1,CW-2,CH-2);
        const x=x0+CW/2,y=y0+CH/2+3,a=i<5?AN[i]:Math.PI/2+.3;G.t=1.3+(i===4?.3:0)+r*.11;
        const q={x,y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,a,r:6,dmg:1,kind:i===6?old:k,cuK:i===6?null:k,life:5,age:i===4?.35:.12,ph:r*1.7,z:k==='cuGob'?(i%2?8:0):0,cuHop:k==='cuGob'?{per:.34,h:15}:null,r0:6,tr:[]};
        for(let s=6;s>0;s--)q.tr.push(x-Math.cos(a)*s*3,y-Math.sin(a)*s*3);
        try{if(k==='rock'){if(i===6){ctx.fillStyle='#ffd86b';ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill()}else cuRockArt(x,y,1+i,-40,260)}
          else if(k==='bomb'){if(i===6){ink(2);ctx.beginPath();ctx.arc(x,y,6,0,TAU);fs('#2a2a30')}else cuBombArt(x,y,a,i===4?.3:1)}
          else if(i===6&&!old){}else{if(k==='cuGob'&&i<6){ctx.fillStyle='rgba(20,40,10,.32)';ctx.beginPath();ctx.ellipse(x,y+2,5,2,0,0,TAU);ctx.fill()}drawEproj(q)}}catch(err){ctx.fillStyle='red';ctx.fillText('!',x,y)}}});
    G.t=keepT;LOWFX=keepLow;ctx=keep;return c.toDataURL('image/png')})()`),SC);
  fs.writeFileSync(path.join(__dirname,'cu_foglio.png'),Buffer.from(url.split(',')[1],'base64'));console.log('tests/cu_foglio.png',errs.length?'ERRORI '+errs.join(' | '):'nessun errore');await b.close()})();
