// A pretend model for the brain's tests while the new model is not there yet: the Ice Queen of today plays every move of the new one,
// with the lengths of the design (anteprime/mk_boss2.py icequeen --stub). Each boss has one like this: anteprime/boss2/<type>_stub.js.
// o.ghost draws today's reflection (pale, no shadow); the real queen gets a plain shadow and, with o.crown, a little light on the crown,
// so the tells of the Hall of Mirrors show in the photos. Simple drawings of the pieces the brain asks the model for (lance, pillar,
// spike, mirror, ice cube, shard, flake) with the signatures of the design, so those calls are tried too.
(()=>{const map={lances:'attack',crown:'nova',nova:'nova',mirror:'attack',emerge:'idle',cast:'attack',stunned:'hit',gaze:'idle',waltz:'walk',rage:'hit',taunt:'idle',enter:'idle',die:'hit'};
  const og=N3.icequeen,OM=N3.meta.icequeen,oq=N3.qmirror,OQ=N3.meta.qmirror,cl=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
  // how much of her is there in the moves where she comes out of the glass or melts away
  const vis=(a,p)=>a==='mirror'?(p<.55?1:p<.85?1-(p-.55)/.3:0):a==='emerge'?cl(p/.45,0,1):a==='enter'?(p<.32?0:cl((p-.32)/.26,0,1)):a==='die'?(p<.575?1:p<.62?1-(p-.575)/.045:0):1;
  N3.icequeen2=(x,y,f,a,p,sc,o)=>{o=o||{};const an=map[a]||a,k=vis(a,p);if(k<=0)return;const ga=ctx.globalAlpha;ctx.globalAlpha=ga*k;
    try{if(o.ghost){oq(x,y,f,OQ.an.includes(an)?an:'idle',cl(p,0,.999),sc,{p2:o.p2,noFx:o.noFx})}
      else{ctx.fillStyle='rgba(10,14,40,.4)';ctx.beginPath();ctx.ellipse(x,y,26*(sc||1),9*(sc||1),0,0,TAU);ctx.fill();
        og(x,y,f,OM.an.includes(an)?an:'idle',cl(p,0,.999),sc,{p2:o.p2,noFx:o.noFx});
        if(o.crown&&!LOWFX)glow(o.p2?'210,180,255':'170,235,255',x,y-74*(sc||1),16*(sc||1),.75)}}finally{ctx.globalAlpha=ga}};
  N3.meta.icequeen2={n:'Regina dei Ghiacci',g:'boss',sc:1,p2:true,
    an:['idle','walk','hit','lances','crown','nova','mirror','emerge','cast','stunned','gaze','waltz','rage','taunt','enter','die'],
    dur:{idle:3,walk:1.4,hit:.6,lances:2,crown:2.6,nova:2.6,mirror:1.6,emerge:.9,cast:1.4,stunned:1.5,gaze:3.4,waltz:3.6,rage:2.6,taunt:1.2,enter:3.4,die:4},
    lab:{lances:'Lance di Cristallo',crown:'Incoronazione',nova:'Fiocco Reale',mirror:'Sala degli Specchi',emerge:'Esce dallo specchio',cast:'Tiro dallo specchio',
      stunned:'Corona incrinata',gaze:"Sguardo d'Inverno",waltz:'Valzer della Tormenta',rage:'Notte Polare',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}};
  N3.order.push('icequeen2');
  const P2=o=>o&&o.p2,ice=o=>P2(o)?['#f6f2ff','#c9b8ff','#6a4fd6']:['#ffffff','#9adaff','#3f7fd0'];
  // a crystal lance in flight: a points where it flies
  N3.icequeen2Lance=(x,y,z,a,sc,o)=>{o=o||{};const s=(sc||1)*(o.small?.75:1),c=ice(o),L0=13*s;ctx.save();ctx.translate(x,y-(z||0));ctx.rotate(a);ctx.globalAlpha*=o.ghost?.6:1;
    if(!LOWFX)glow(P2(o)?'200,170,255':'150,235,255',0,0,L0*1.2,.45);ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(L0,0);ctx.lineTo(-L0*.2,-3.2*s);ctx.lineTo(-L0,0);ctx.lineTo(-L0*.2,3.2*s);ctx.closePath();
    ctx.fillStyle=c[1];ctx.fill();ctx.stroke();ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(L0*.9,0);ctx.lineTo(-L0*.2,-1.4*s);ctx.lineTo(-L0*.6,0);ctx.closePath();ctx.fill();ctx.restore()};
  // the stalactite-pillar: z the height while it falls (o.spin turns it), k its life on the floor (0 lands, .85 stands, 1 melted)
  N3.icequeen2Pillar=(x,y,z,k,sc,o)=>{o=o||{};const s=sc||1,c=ice(o),h=34*s*(k>.85?1-(k-.85)/.15:1),w=10*s;if(h<=.5)return;ctx.save();ctx.translate(x,y-(z||0));if(z>0)ctx.rotate(Math.sin(o.spin||0)*.5);
    ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w*.5,-h*.7);ctx.lineTo(0,-h);ctx.lineTo(w*.45,-h*.65);ctx.lineTo(w,0);ctx.closePath();
    const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,c[2]);g.addColorStop(.45,c[1]);g.addColorStop(1,c[2]);ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(-w*.35,-h*.1);ctx.lineTo(0,-h*.92);ctx.lineTo(-w*.05,-h*.1);ctx.closePath();ctx.fill();ctx.restore()};
  // a spike of the Royal Snowflake or of the Waltz's trail: k 0..1 its life (rises, stands, crumbles)
  N3.icequeen2Spike=(x,y,h,k,sc,o)=>{o=o||{};const s=sc||1,c=ice(o),q=k<.15?k/.15:k<.8?1:1-(k-.8)/.2;if(q<=0)return;const H=h*s*q,w=6*s;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(o.seed||0)*.25);
    ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(0,-H);ctx.lineTo(w,0);ctx.closePath();ctx.fillStyle=c[1];ctx.fill();ctx.stroke();
    ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(-w*.3,0);ctx.lineTo(0,-H*.9);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore()};
  // the mirror of the Hall: an arch of ice turned to the camera (k 0..1: it rises in the first quarter)
  N3.icequeen2Mirror=(x,y,k,sc,o)=>{o=o||{};const s=sc||1,up=cl(k/.25,0,1),H=46*s*up,W=15*s;if(H<1)return;ctx.save();ctx.translate(x,y);ctx.globalAlpha*=1-(o.shatter||0);
    ctx.lineWidth=2.4;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(-W,0);ctx.lineTo(-W,-H+W);ctx.arc(0,-H+W,W,Math.PI,0);ctx.lineTo(W,0);ctx.closePath();ctx.fillStyle=P2(o)?'#b9a8f0':'#c3cde8';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-W+3,-2);ctx.lineTo(-W+3,-H+W);ctx.arc(0,-H+W,W-3,Math.PI,0);ctx.lineTo(W-3,-2);ctx.closePath();ctx.fillStyle='#16224c';ctx.fill();
    if(o.inside){ctx.fillStyle=`rgba(10,14,40,${.7*o.inside})`;ctx.beginPath();ctx.ellipse(0,-H*.45,W*.5,H*.35,0,0,TAU);ctx.fill()}
    if(o.eyes){ctx.fillStyle=`rgba(160,240,255,${o.eyes})`;for(const d of[-3,3]){ctx.beginPath();ctx.arc(d*s+Math.cos(o.look||0)*1.5,-H*.62,1.4*s,0,TAU);ctx.fill()}}
    if(o.ripple){ctx.strokeStyle=`rgba(200,235,255,${.6*o.ripple})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,-H*.5,W*.6*o.ripple,H*.3*o.ripple,0,0,TAU);ctx.stroke()}
    for(let i=0;i<(o.crack|0);i++){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-W*.6+i*4,-H*.85);ctx.lineTo(i*2,-H*.5);ctx.lineTo(W*.4-i*3,-H*.2);ctx.stroke()}ctx.restore()};
  // the cube of ice round the frozen hero (k 0..1: forms, holds, cracks)
  N3.icequeen2Ice=(x,y,k,sc,o)=>{const s=sc||1,q=k<.15?k/.15:k<.8?1:1-(k-.8)/.2;if(q<=0)return;ctx.save();ctx.translate(x,y);ctx.globalAlpha*=.8;ctx.lineWidth=2;ctx.strokeStyle='#2a3a6a';
    ctx.fillStyle='rgba(190,235,255,.55)';ctx.beginPath();ctx.rect(-15*s,-34*s*q,30*s,34*s*q);ctx.fill();ctx.stroke();ctx.restore()};
  N3.icequeen2Shard=(x,y,z,a,sc,o)=>{const s=sc||1,c=ice(o);ctx.save();ctx.translate(x,y-(z||0));ctx.rotate(a);ctx.lineWidth=1.4;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(5*s,0);ctx.lineTo(-3*s,-2.2*s);ctx.lineTo(-5*s,0);ctx.lineTo(-3*s,2.2*s);ctx.closePath();
    ctx.fillStyle=c[1];ctx.fill();ctx.stroke();ctx.restore()};
  N3.icequeen2Flake=(x,y,z,a,sc,o)=>{const s=sc||1;ctx.save();ctx.translate(x,y-(z||0));ctx.rotate(a);if(!LOWFX)glow('190,235,255',0,0,10*s,.4);ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.lineCap='round';
    ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3;ctx.moveTo(0,0);ctx.lineTo(Math.cos(q)*7*s,Math.sin(q)*7*s)}ctx.stroke();ctx.fillStyle='#8fe8ff';ctx.beginPath();ctx.arc(0,0,1.8*s,0,TAU);ctx.fill();ctx.restore()}})();
