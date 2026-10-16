// A pretend model for the brain's tests while the new model is not there yet: the Phoenix of today plays every move of the new one, with
// the lengths of the design (anteprime/mk_boss2.py phoenix --stub). It also gives what the brain reads from the model (N3.phoenixSweep,
// N3.phoenixInfo: the same numbers as the design) and simple drawings of the feather, the ember, the shard and the wing shadow.
(()=>{const map={fan:'feathers',fan2:'feathers',redive:'dive',rise:'idle',wings:'prep',wings2:'prep',judge:'prep',sweep:'vortex'};
  const og=N3.phoenix,OM=N3.meta.phoenix,cl=(v,a,b)=>v<a?a:v>b?b:v,ss=u=>{u=cl(u,0,1);return u*u*(3-2*u)};
  N3.phoenix2=(x,y,f,a,p,sc,o)=>{let an=map[a]||a,pp=p;if(a==='grounded'){if(p<.55){an='hit';pp=p/.55*.7}else{an='idle';pp=(p-.55)/.45}}
    return og(x,y,f,OM.an.includes(an)?an:'idle',cl(pp,0,.999),sc,o)};
  N3.meta.phoenix2={n:'La Fenice della Forgia',g:'boss',sc:1,
    an:['idle','walk','hit','fan','fan2','dive','redive','grounded','rise','wings','wings2','sweep','rain','judge','rebirth','taunt','enter','die'],
    dur:{idle:3,walk:1.3,hit:.6,fan:1.6,fan2:2.3,dive:2.2,redive:1.6,grounded:1.1,rise:.5,wings:1.6,wings2:2.2,sweep:2.4,rain:3,judge:2.6,rebirth:3.4,taunt:1.2,enter:3.4,die:4},lab:{}};
  N3.order.push('phoenix2');
  // the turn of the whip in the Wheel of Flames (from where it starts, 0..TAU), its reach; the moments of the model's blows
  N3.phoenixSweep=(p,p2)=>({a:Math.PI*2*ss((p-.3)/.5),r0:30,r1:p2?150:135,on:p>=.3&&p<.8});
  N3.phoenixInfo={lanes:10,laneDeg:12,fanShot:.5,fan2Shot:[.36,.72],rain:[.24,.48,.72],rain2:[.22,.38,.54,.70],judge:[.25,.42,.59]};
  const C=p2=>p2?['#2448a8','#3a8ae8','#9fe0ff','120,200,255']:['#a8201a','#ff5a1f','#ffc23c','255,140,40'];
  // a fire feather flying along a (stuck: planted crooked in a wall or in the floor, burning down to ash)
  N3.phoenixFeather=(x,y,z,a,sc,o)=>{o=o||{};const c=C(o.p2),s=(sc||1)*11,k=o.stuck||0,yy=y-(z||0);ctx.save();ctx.translate(x,yy);ctx.rotate(a);ctx.globalAlpha*=1-cl((k-.7)/.3,0,1);
    if(!LOWFX&&k<.8)glow(c[3],0,0,s*1.6,.4*(1-k));ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(s,0);ctx.quadraticCurveTo(0,-s*.45,-s,-s*.12);ctx.lineTo(-s*.8,0);ctx.lineTo(-s,s*.12);ctx.quadraticCurveTo(0,s*.45,s,0);ctx.closePath();
    const g=ctx.createLinearGradient(-s,0,s,0);g.addColorStop(0,c[0]);g.addColorStop(.55,c[1]);g.addColorStop(1,c[2]);ctx.fillStyle=g;ctx.fill();if(k>0){ctx.fillStyle=`rgba(166,156,146,${k})`;ctx.fill()}ctx.stroke();ctx.restore()};
  // an ember feather falling in the Rain (a its turn; near the floor, k 0..1, it curls into a coal)
  N3.phoenixEmber=(x,y,z,a,sc,o)=>{o=o||{};const c=C(o.p2),k=o.k||0,s=(sc||1)*(o.big?13:9)*(1-.45*k),yy=y-(z||0);ctx.save();ctx.translate(x,yy);ctx.rotate(a);
    if(!LOWFX)glow(c[3],0,0,s*2.2,.55);ctx.lineWidth=1.5;ctx.strokeStyle=INK;ctx.beginPath();ctx.ellipse(0,0,s,s*(.35+.4*k),0,0,Math.PI*2);ctx.fillStyle=c[1];ctx.fill();ctx.stroke();
    ctx.fillStyle=c[2];ctx.beginPath();ctx.ellipse(s*.2,0,s*.45,s*.18,0,0,Math.PI*2);ctx.fill();ctx.restore()};
  // a shard of the egg of ash, its edge glowing, tumbling in the air
  N3.phoenixShard=(x,y,z,a,sc,o)=>{o=o||{};const s=(sc||1)*7,yy=y-(z||0);ctx.save();ctx.translate(x,yy);ctx.rotate(a);if(!LOWFX)glow(o.p2?'120,200,255':'255,180,80',0,0,s*2.2,.4);
    ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(s*1.2,0);ctx.lineTo(-s*.3,-s*.9);ctx.lineTo(-s,-s*.1);ctx.lineTo(-s*.2,s*.8);ctx.closePath();ctx.fillStyle='#3a3230';ctx.fill();ctx.stroke();
    ctx.strokeStyle=o.p2?'#9fe0ff':'#ffc83c';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-s*.3,-s*.9);ctx.lineTo(s*1.2,0);ctx.stroke();ctx.restore()};
  // the great shadow of the spread wings seen from below (the entrance): a its flight, k how dark
  N3.phoenixShadow=(x,y,a,k,sc)=>{if(k<=0)return;const s=sc||1;ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);ctx.scale(s,s);ctx.fillStyle=`rgba(0,0,0,${.4*k})`;
    ctx.beginPath();ctx.ellipse(0,0,16,34,0,0,Math.PI*2);ctx.fill();for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(d*60,-34,d*112,6);ctx.quadraticCurveTo(d*54,8,0,16);ctx.closePath();ctx.fill()}
    ctx.beginPath();ctx.moveTo(-8,26);ctx.lineTo(0,70);ctx.lineTo(8,26);ctx.closePath();ctx.fill();ctx.restore()}})();
