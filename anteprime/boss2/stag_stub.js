// A pretend model for the brain's tests while the new model is not there yet: the Stag of today plays every move of the new one, with the
// lengths of the design (anteprime/mk_boss2.py stag --stub; docs/boss-classici-design/stag.md, «MODELLO FINTO»). The new moves are made with
// the old ones: the second aim, the antlers stuck and the skid are its prep, the rebound its knock back, the sweep its crystals, the call and
// the Northern Crown its aurora, the rage its stomp. It also gives simple drawings of the pieces the brain asks the model for (the crystal
// shard, the ice spike of the wave, the spirit of the herd, the crown left on the mound of moss), with the signatures of the design, so those
// calls are tried too.
(()=>{const map={prep2:'prep',stuck:'prep',skid:'prep',recoil:'hit',sweep:'crystals',call:'aurora',crown:'aurora',rage:'stomp'};
  const og=N3.stag,OM=N3.meta.stag,cl=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
  N3.stag2=(x,y,f,a,p,sc,o)=>{o=o||{};const an=map[a]||a,ga=ctx.globalAlpha;
    // the see-through crown when the hero walks behind it (o.see): the whole stub a little lighter
    if(o.see>0)ctx.globalAlpha=ga*(1-.35*cl(o.see,0,1));
    try{og(x,y,f,OM.an.includes(an)?an:'idle',cl(p,0,.999),sc,{p2:o.p2,noFx:o.noFx})}finally{ctx.globalAlpha=ga}};
  N3.meta.stag2={n:"Il Cervo d'Aurora",g:'boss',sc:1,
    an:['idle','walk','hit','prep','charge','stuck','recoil','prep2','skid','sweep','aurora','stomp','call','crown','rage','taunt','enter','die'],
    dur:{idle:3,walk:1.1,hit:.6,prep:1.4,charge:.6,stuck:1.6,recoil:.5,prep2:.95,skid:.6,sweep:1.8,aurora:3.4,stomp:2,call:2.2,crown:4,rage:3,taunt:1.2,enter:3.4,die:4.2},
    lab:{idle:'Fermo',walk:'Cammina',hit:'Colpito',prep:'Prepara la carica',charge:'Carica',stuck:'Corna incastrate',recoil:'Rimbalzo',prep2:'Seconda carica',skid:'Frenata',
      sweep:'Spazzata della Corona',aurora:"Tende d'Aurora",stomp:'Zoccolata del Re',call:'Richiamo della Mandria',crown:'Corona Boreale',rage:"L'aurora si accende",taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}};
  N3.order.push('stag2');
  const CR=p2=>p2?['#fbf4ff','#cdb8ff','#7a64c8','190,150,255']:['#f0ffff','#a2eaf6','#4fa8c8','110,255,196'];
  // the crystal shard of the crown (the Sweep, the Charge's impact): a diamond 18 long and 7 wide, a its flight; also (x, y, r, a)
  N3.stagShard=(x,y,z,a,sc,o)=>{if(o===undefined&&sc===undefined){const r=z;z=0;sc=(r||7)/7;o={}}o=o||{};const c=CR(o.p2),s=sc||1,yy=y-(z||0),L0=9*s,W=3.5*s;
    ctx.save();ctx.translate(x,yy);ctx.rotate(a);if(!LOWFX)glow(c[3],0,0,L0*1.6,.4);ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(L0,0);ctx.lineTo(0,-W);ctx.lineTo(-L0,0);ctx.lineTo(0,W);ctx.closePath();
    const g=ctx.createLinearGradient(-L0,0,L0,0);g.addColorStop(0,c[2]);g.addColorStop(.55,c[1]);g.addColorStop(1,c[0]);ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L0*.8,0);ctx.lineTo(-L0*.3,-W*.4);ctx.stroke();ctx.restore()};
  // an ice spike of the Stomp's wave: rises (k .00-.15), stands, breaks into frost (.75-1); o.a where it leans
  N3.stagSpike=(x,y,h,k,sc,o)=>{o=o||{};const c=CR(o.p2),s=sc||1,up=cl(k/.15,0,1),br=cl((k-.75)/.25,0,1),H=(h||18)*s*up*(1-br*.6),W=5*s,lean=(o.a!=null?Math.cos(o.a):0)*.25;
    if(H<=.5)return;ctx.save();ctx.globalAlpha*=1-br;ctx.translate(x,y);ctx.rotate(lean);ctx.lineWidth=1.4;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(-W,0);ctx.lineTo(0,-H);ctx.lineTo(W,0);ctx.closePath();
    ctx.fillStyle=c[1];ctx.fill();ctx.stroke();ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(-W*.2,0);ctx.lineTo(0,-H*.9);ctx.lineTo(W*.5,-H*.2);ctx.closePath();ctx.fill();ctx.restore();
    if(br>0&&br<1&&!LOWFX)for(let i=0;i<4;i++){const q=i*1.7+x*.1;ctx.fillStyle=`rgba(235,248,255,${1-br})`;ctx.beginPath();ctx.arc(x+Math.cos(q)*br*10*s,y-H*.5-br*6*s+Math.sin(q)*3,1.4*s,0,TAU);ctx.fill()}};
  // a spirit of the herd: today's stag galloping (its charge at p), small (sc .62), see-through and tinted with the aurora; o.k how much of it
  N3.stagSpirit=(x,y,face,p,sc,o)=>{o=o||{};const k=cl(o.k==null?1:o.k,0,1);if(k<=0)return;const s=sc||.62,ga=ctx.globalAlpha;
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(o.p2?'190,150,255':'120,255,210',x,y-40*s,70*s,.45*k);ctx.restore()}
    ctx.globalAlpha=ga*.55*k;try{og(x,y,face,'charge',cl(p,0,.999),s,{noFx:true})}finally{ctx.globalAlpha=ga}};
  // the crown left standing on the mound of moss with its flowers and the edelweiss (the end of the defeat); o.k its light
  N3.stagCrown=(x,y,sc,o)=>{o=o||{};const s=sc||1,c=CR(o.p2),k=o.k==null?.4:o.k;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,4,30,9,0,0,TAU);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=INK;
    ctx.beginPath();ctx.ellipse(0,0,26,11,0,Math.PI,0);ctx.closePath();ctx.fillStyle='#4f8e3e';ctx.fill();ctx.stroke();
    for(let i=0;i<6;i++){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(-18+i*7,-4-(i%2)*4,1.8,0,TAU);ctx.fill()}
    ctx.strokeStyle=INK;ctx.lineWidth=4.2;ctx.lineCap='round';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*4,-6);ctx.lineTo(d*14,-34);ctx.lineTo(d*30,-50);ctx.stroke()}
    ctx.strokeStyle=c[1];ctx.lineWidth=2.4;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*4,-6);ctx.lineTo(d*14,-34);ctx.lineTo(d*30,-50);ctx.moveTo(d*14,-34);ctx.lineTo(d*8,-48);ctx.stroke()}
    ctx.fillStyle='#d9a93e';ctx.beginPath();ctx.arc(0,-6,4,0,TAU);ctx.fill();if(!LOWFX&&k>0){ctx.globalCompositeOperation='lighter';glow(c[3],0,-30,40,.3*k)}ctx.restore()}})();
