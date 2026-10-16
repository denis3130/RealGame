// A pretend model for the brain's tests while the new model is not there yet: the Salamander of today plays every move of the new one
// (anteprime/mk_boss2.py salamander --stub). Each boss has one like this: anteprime/boss2/<type>_stub.js. The Frustate and the run are its
// fire run, the Tuffo its dive (the way in, then the way out for the burst, the leap and the entrance), the fin an orange glow under five
// dark points of the crown; the height of the dolphin leap lifts it (o.z, as the new model does).
(()=>{const og=N3.salamander,OM=N3.meta.salamander;
  const map=(a,p)=>{switch(a){case 'whip':case 'whip2':case 'run':return['circle',p];case 'burrow':return['burrow',p*.44];
    case 'breach':case 'leap':case 'enter':return['burrow',.58+.42*p];case 'crouch':case 'pant':case 'taunt':return['idle',p];
    case 'erupt':case 'rage':return['spit',p];case 'die':return['hit',p];default:return[OM.an.includes(a)?a:'idle',p]}};
  N3.salamander2=(x,y,f,a,p,sc,o)=>{o=o||{};sc=sc||1;
    if(a==='swim'){const t=(G&&G.t)||0;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,40',x,y,70*sc,.5,32*sc);ctx.restore();
      ctx.fillStyle='rgba(255,140,50,.85)';ctx.beginPath();ctx.ellipse(x,y,34*sc,14*sc,0,0,Math.PI*2);ctx.fill();
      for(let i=-2;i<=2;i++){const h=(26-Math.abs(i)*6)*sc*(1+.05*Math.sin(t*9+i)),bx=x+i*7*sc;ink(1.6);ctx.beginPath();ctx.moveTo(bx-3.5*sc,y);ctx.lineTo(bx,y-h);ctx.lineTo(bx+3.5*sc,y);ctx.closePath();fs('#43355a')}
      for(const s of[-1,1]){ctx.fillStyle='#ffc23a';ctx.beginPath();ctx.ellipse(x+s*9*sc,y+5*sc,3*sc,2*sc,0,0,Math.PI*2);ctx.fill()}return}
    const[m,q]=map(a,p);og(x,y-(o.z||0),f,m,q,sc,o)};
  N3.meta.salamander2={n:'Salamandra di Lava',g:'boss',sc:1,an:['idle','walk','hit','spit','whip','whip2','burrow','swim','breach','leap','crouch','run','pant','erupt','rage','taunt','enter','die'],
    dur:{idle:3.2,walk:1.4,hit:.6,spit:2,whip:1.7,whip2:2.8,burrow:.8,swim:.6,breach:1.7,leap:1.9,crouch:.9,run:.45,pant:1.4,erupt:2.2,rage:3,taunt:1.2,enter:3.4,die:4},lab:{}};
  N3.order.push('salamander2')})();
