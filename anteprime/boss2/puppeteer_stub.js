// A pretend model for the brain's tests while the new model is not there yet: the Puppeteer of today plays every move of the new one, with
// the lengths of the design (anteprime/mk_boss2.py puppeteer --stub; mk_boss2.py uses it by itself when sprite/nemici3d/puppeteer2.js is
// missing). Design (docs/boss-classici-design/puppeteer.md, «MODELLO FINTO»): slam and slam3 → slam; strings, puppets, vanish as they are;
// lasso, yank and hand → prep; snap and rage → hit; drop → enter with p counted again (the landing at .28 of the drop is the landing at .5
// of today's entrance); taunt and call → taunt; enter and die as they are. N3.puppet2 is the puppet of today with spawn → idle. It also gives
// what the brain reads from the model: N3.puppeteer2Info (the moments of the blows, the same as the design) and simple drawings of the
// pieces the new model exports: N3.puppeteer2Hand (the great hand of the Shadow falling from the dark) and N3.puppeteer2Trap (the trapdoor).
(()=>{const map={slam:'slam',slam3:'slam',strings:'strings',puppets:'puppets',vanish:'vanish',lasso:'prep',yank:'prep',hand:'prep',snap:'hit',rage:'hit',
    taunt:'taunt',call:'taunt',enter:'enter',die:'die',idle:'idle',walk:'walk',hit:'hit'};
  const og=N3.puppeteer,OM=N3.meta.puppeteer,cl=(v,a,b)=>v<a?a:v>b?b:v;
  N3.puppeteer2=(x,y,f,a,p,sc,o)=>{o=o||{};let an=map[a]||'idle',pp=p,oo=o;
    // the fall from the spotlight: today's entrance comes down and lands at .5 (its own height: the game's o.z is not added twice)
    if(a==='drop'){an='enter';pp=p<.28?.5*p/.28:.5+.5*(p-.28)/.72;oo=Object.assign({},o);delete oo.z}
    return og(x,y,f,OM.an.includes(an)?an:'idle',cl(pp,0,.999),sc,oo)};
  N3.meta.puppeteer2={n:"Il Burattinaio d'Ombra",g:'boss3',sc:1,
    an:['idle','walk','hit','slam','slam3','strings','puppets','lasso','yank','snap','vanish','drop','hand','rage','taunt','call','enter','die'],
    dur:{idle:3,walk:1.2,hit:.6,slam:1.8,slam3:2.8,strings:1.8,puppets:1.9,lasso:1.6,yank:1.5,snap:1,vanish:1.4,drop:1.9,hand:2.4,rage:3.2,taunt:1.2,call:1,enter:3.4,die:3.8},
    lab:{idle:'Fermo',walk:'Cammina',hit:'Colpito',slam:'Manate',slam3:'Manate a catena',strings:"Fili d'oro",puppets:'Burattini',lasso:'Il filo del burattino',yank:'Tira!',
      snap:'Filo spezzato',vanish:'Sipario',drop:'Dal riflettore',hand:"Mano dell'Ombra",rage:'Il vero Burattinaio',taunt:'Presa in giro',call:'Ti chiama',enter:'Entrata',die:'Sconfitta'}};
  N3.order.push('puppeteer2');
  // the little puppet: today's, with the new move 'spawn' (out of the trapdoor) played as its idle
  const opp=N3.puppet,PM=N3.meta.puppet;
  N3.puppet2=(x,y,f,a,p,sc,o)=>opp(x,y,f,a==='spawn'||!PM.an.includes(a)?'idle':a,p,sc,o);
  N3.meta.puppet2={n:"Burattino d'ombra",g:PM.g||'boss3',sc:PM.sc||1,an:['idle','walk','attack','hit','spawn'],dur:Object.assign({},PM.dur,{spawn:.8}),lab:Object.assign({},PM.lab||{},{spawn:'Esce dalla botola'})};
  N3.order.push('puppet2');
  // the moments of the blows (the brain reads them from here; the same numbers as the design)
  N3.puppeteer2Info={slam:.52,slam3:[.4,.64,.9],strings:.4,puppets:.62,lasso:.68,yank:[.12,.39,.66],yankHit:.94,vanish:.45,drop:.28,hand:.78,
    slamWarn:.04,lassoLock:.28,handLock:.36,cry:.76,dieClou:.46};
  // the great hand of the Shadow: x, y the floor point under the palm, z the height of the palm, k 0 falling (fingers half shut), .3 the
  // blow (spread, flat, a little squashed), .6 it presses, 1 it rises closing; o.a its turn on the floor; violet-dark with a magenta rim
  N3.puppeteer2Hand=(x,y,z,k,sc,o)=>{o=o||{};const s=(sc||1),yy=y-(z||0),sq=k>.25&&k<.65?1-.12*Math.sin((k-.25)/.4*Math.PI):1,open=k<.3?.55+.45*k/.3:k<.65?1:1-.6*(k-.65)/.35;
    ctx.save();ctx.translate(x,yy);ctx.rotate(o.a||0);ctx.scale(s,s*sq);
    // the smoke of the wrist rising into the dark
    if(!LOWFX&&!o.noFx){const g=ctx.createLinearGradient(0,-150,0,-10);g.addColorStop(0,'rgba(20,10,34,0)');g.addColorStop(1,'rgba(42,20,68,.8)');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(-16,-12);ctx.quadraticCurveTo(-8,-80,-3,-150);ctx.lineTo(3,-150);ctx.quadraticCurveTo(8,-80,16,-12);ctx.closePath();ctx.fill()}
    ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3;
    const fill=g=>{const gr=ctx.createLinearGradient(0,-30,0,30);gr.addColorStop(0,'#4a2a6e');gr.addColorStop(.5,'#2a1444');gr.addColorStop(1,'#120820');ctx.fillStyle=gr;ctx.fill();ctx.stroke()};
    // four long round fingers and the thumb, spread by open
    for(let i=0;i<4;i++){const a=-Math.PI/2+(i-1.5)*.34*open,l=28*(.75+.25*open),bx=(i-1.5)*9,by=-14;ctx.save();ctx.translate(bx,by);ctx.rotate(a+Math.PI/2);
      ctx.beginPath();ctx.ellipse(0,-l/2,5.2,l/2+3,0,0,Math.PI*2);fill();ctx.restore()}
    ctx.save();ctx.translate(-20,4);ctx.rotate(-.9-.5*open);ctx.beginPath();ctx.ellipse(0,-12,5.5,14,0,0,Math.PI*2);fill();ctx.restore();
    ctx.beginPath();ctx.ellipse(0,0,22,19,0,0,Math.PI*2);fill();
    if(!LOWFX&&!o.noFx){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,95,200,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,23,20,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.restore()}
    ctx.restore()};
  // the trapdoor, 26 × 26 on the floor: two wooden doors hinged at the sides with golden hinges, gold light in the cracks. k 0 shut (o.glow
  // makes the light grow), 0-.3 the doors open down, .3-.7 open (a dark hole with gold light in it), .7-1 they shut again; o.p2 magenta
  N3.puppeteer2Trap=(x,y,k,sc,o)=>{o=o||{};const s=(sc||1),w=13*s,h=7.2*s,op=k<.3?k/.3:k<.7?1:1-(k-.7)/.3,lt=o.p2?'255,120,210':'255,210,110',gl=cl((o.glow||0)+op,0,1);
    ctx.save();ctx.translate(x,y);ctx.lineJoin='round';
    ctx.fillStyle='#2d190c';ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.rect(-w,-h,w*2,h*2);ctx.fill();ctx.stroke();
    if(op>0){ctx.fillStyle='#0c0608';ctx.fillRect(-w+2,-h+2,w*2-4,h*2-4);if(!LOWFX&&!o.noFx){ctx.save();ctx.globalCompositeOperation='lighter';glow(lt,0,0,w*1.6,.6*op,h*1.4);ctx.restore()}}
    // the two doors, hinged at the sides, folding down into the hole as they open
    for(const sd of[-1,1]){const dw=w*(1-op*.85);ctx.fillStyle='#5f3b22';ctx.beginPath();ctx.rect(sd<0?-w:w-dw,-h,dw,h*2);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(30,16,8,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sd<0?-w+dw*.5:w-dw*.5,-h+1);ctx.lineTo(sd<0?-w+dw*.5:w-dw*.5,h-1);ctx.stroke();
      ctx.fillStyle='#ffcd45';ctx.strokeStyle=INK;ctx.lineWidth=1;for(const hy of[-h*.55,h*.55]){ctx.beginPath();ctx.rect(sd<0?-w-1:w-2,hy-1.5,3,3);ctx.fill();ctx.stroke()}ctx.strokeStyle=INK;ctx.lineWidth=2}
    // the light in the crack between the doors
    if(gl>0&&op<.9){ctx.strokeStyle=`rgba(${lt},${(.35+.6*gl).toFixed(3)})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-h+1);ctx.lineTo(0,h-1);ctx.stroke()}
    ctx.restore()}})();
