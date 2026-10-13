// I nemici e i boss che nel gioco usano il rig dell'eroe (drawRig con GOBLIN, SKEL, NECRO, BONELET, PYRO, DWARF, WITCH, SMITH, QUEEN),
// rifatti in 3D sullo stesso corpo dell'Arciere 3D (EROE.arciere, sprite/eroe3d/disegno_eroe.js) con i loro colori e i loro pezzi:
// goblin (orecchie a punta, occhi rossi, arco), scheletro (teschio con le luci rosse, costole, balestra e scudo), scheletrino (piccolo, occhi
// verdi, esce da terra), negromante (veste lunga, punta del cappuccio, bastone con la sfera verde, evoca), piromante (sfera di fuoco),
// nano bombarolo (elmo, barba rossa, lancia la bomba), la Strega delle Radici (sospesa, corna di rami coi boccioli), il Fabbro Infernale
// (faccia di lava, crepe, martello) e la Regina dei Ghiacci (sospesa, corona di ghiaccio, ali nella seconda fase, schegge che le girano
// intorno), più il suo riflesso. Le mosse sono quelle dell'eroe (fermo, cammina, colpito, scatto) con i loro attacchi: tira con l'arco o
// la balestra, lancia la sfera, evoca, lancia la bomba, martellata, fucina. o.p2: la seconda fase dei boss.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,V,ball,reg,shine,floor}=C;
// the 3D styles: the game's colours (src/js/15-rig-umanoide.js and the files of each enemy) with the options of the 3D body
const B0={armor:'none',quiver:false,strap:false,blush:false};
const ST={
  goblin:{...B0,sc:.95,body:'#a8443a',hood:'#7e2f28',skin:'#7bbf4a',foot:'#3d2a1d',foot2:'#2e1f15',ears:true,held:'bow',bowCol:'#6b4a2a',eyes:'#e5484d',belt:'#4a3626'},
  skeleton:{...B0,sc:1,body:'#d9d2c0',skull:true,skin:'#e8e2d0',foot:'#cfc7b2',foot2:'#b3ab96',ribs:true,held:'xbow',bowCol:'#6b4a2a',shield:true,eyes:'#e5484d',belt:null},
  bonelet:{...B0,sc:.72,body:'#d9d2c0',skull:true,skin:'#e8e2d0',foot:'#cfc7b2',foot2:'#b3ab96',ribs:true,held:null,eyes:'#9fff7a',belt:null},
  necro:{...B0,sc:1,body:'#2a2434',hood:'#1e1a26',skin:'#a8c8a0',foot:'#1b1612',held:'scettro',eyeCol:'#9fff7a',eyes:'#9fff7a',glowEyes:true,hoodTip:true,robe:true,belt:'#4a3a5a'},
  pyro:{...B0,sc:1,body:'#5a1f1f',hood:'#2a1414',skin:'#d9a07a',foot:'#2a1a14',foot2:'#1e120d',held:'scettro',eyeCol:'#ffb020',eyes:'#ffb020',glowEyes:true,hoodTip:true,belt:'#8a5a20'},
  bomber:{...B0,sc:.92,body:'#7a4a2a',hood:'#5a5f68',skin:'#e8b890',foot:'#3a2a1d',foot2:'#2a1e14',held:'bomba',helm:true,beard:'#c8642a',belt:'#3a2a1d',eyes:'#1b1612'},
  witch:{...B0,sc:1.35,body:'#3d2f4f',hood:'#2c3a24',skin:'#b7d9a8',float:true,robe:true,crown:true,held:'scettro',eyeCol:'#7bf0c0',eyes:'#7bf0c0',glowEyes:true,belt:null},
  smith:{...B0,sc:1.9,body:'#3a3a42',hood:'#24242a',skin:'#ff7a2e',foot:'#1b1b20',foot2:'#121216',held:'martello',eyes:'#ffd86b',glowEyes:true,belt:'#6b4a2a',cracks:true},
  icequeen:{...B0,sc:1.6,body:'#8fbfe8',hood:'#e8f4ff',skin:'#e0eeff',float:true,robe:true,tiara:true,held:'scettro',eyeCol:'#5fd0ff',eyes:'#5fd0ff',glowEyes:true,belt:'#c8a0ff'}};
ST.qmirror={...ST.icequeen,body:'#b8d8f8'};
// one enemy: its style, how its moves map onto the body's moves ({a: the body's move, staff / hammer: the variant of the weapon's move}),
// and what it has round it (an aura, wings, shards) behind and in front of the body
function rig(id,map,extra){const S=ST[id];return(x,y,face,anim,p,sc,o)=>{o=o||{};const m=map[anim]||{a:anim},st={...S,...(o.p2?{p2:true}:{}),...(o.style||{})},k=(sc||1)*S.sc;
  const go=(yy,an,pp)=>EROE.arciere(x,yy==null?y:yy,face,an||m.a,pp==null?p:pp,k,{style:st,noFx:o.noFx,staffMove:m.staff,hammerMove:m.hammer,hot:st.p2?.8:0});
  if(extra&&extra.draw)return extra.draw(x,y,face,anim,p,k,o,st,go,m);
  if(extra&&extra.back)extra.back(x,y,face,anim,p,k,o,st);go();if(extra&&extra.front)extra.front(x,y,face,anim,p,k,o,st)}}
const D4={idle:2.4,walk:.56,hit:.6};

// ------------------------------------------------------------------ chapter 1
reg('goblin',{n:'Goblin',g:1,an:['idle','walk','attack','hit'],dur:{...D4,attack:1.15},lab:{attack:'Tira'}},rig('goblin',{attack:{a:'shoot'}}));
reg('skeleton',{n:'Scheletro',g:1,an:['idle','walk','attack','dash','hit'],dur:{...D4,attack:1.8,dash:.75},lab:{attack:'Balestra',dash:'Scatto'}},rig('skeleton',{attack:{a:'shoot'}}));
reg('necro',{n:'Negromante',g:1,an:['idle','walk','attack','summon','hit'],dur:{...D4,attack:1.5,summon:1.9},lab:{attack:'Sfera',summon:'Evoca'}},
  rig('necro',{attack:{a:'shoot'},summon:{a:'shoot',staff:'summon'}},{back:(x,y,face,anim,p,k,o)=>{if(anim!=='summon'||LOWFX)return;
    // a ring of green light on the floor while he calls the dead
    const s=p>.15&&p<.85?Math.sin((p-.15)/.7*Math.PI):0;if(s<=0)return;ctx.save();ctx.strokeStyle=`rgba(159,255,122,${(.55*s).toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=-G.t*20;
    ctx.beginPath();ctx.ellipse(x,y,26*k*s,26*k*s*.45*C.KR(),0,0,TAU);ctx.stroke();ctx.setLineDash([]);shine('140,255,120',x,y,30*k*s,.25*s,12*k*s);ctx.restore()}}));
// the little skeleton the necromancer raises: it climbs out of the ground (rise), runs at the hero (walk) and lunges (attack)
reg('bonelet',{n:'Scheletrino',g:1,an:['idle','walk','attack','rise','hit'],dur:{...D4,walk:.42,attack:.7,rise:1.4},lab:{attack:'Assalto',rise:'Esce da terra'}},
  rig('bonelet',{attack:{a:'dash'}},{draw:(x,y,face,anim,p,k,o,st,go)=>{if(anim!=='rise')return go();
    const u=ez(cl(p/.72,0,1)),dy=(1-u)*28*k,hw=13*k*Math.min(1,p*4)*(p>.86?1-(p-.86)/.14:1);
    // the hole of dirt it climbs out of, and a few clods thrown up
    if(hw>.3){ctx.save();ink(1.6);ctx.fillStyle='#3a2a1d';ctx.beginPath();ctx.ellipse(x,y+1,hw,hw*.36*C.KR(),0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#21170f';ctx.beginPath();ctx.ellipse(x,y+1.4,hw*.7,hw*.22*C.KR(),0,0,TAU);ctx.fill();ctx.restore()}
    ctx.save();ctx.beginPath();ctx.rect(x-80*k,y-120*k,160*k,120*k+1.5);ctx.clip();go(y+dy,'idle',(p*1.3)%1);ctx.restore();
    if(!o.noFx&&!LOWFX&&p<.75)for(let i=0;i<5;i++){const q=((p*2.2+i*.2)%1),a=i*1.3;ctx.fillStyle=`rgba(90,64,40,${(1-q).toFixed(3)})`;ball([x+Math.cos(a)*(5+q*12)*k,y-q*(16-q*10)*k],1.6*k);ctx.fill()}}}));

// ------------------------------------------------------------------ chapter 2
reg('pyro',{n:'Piromante',g:2,an:['idle','walk','attack','hit'],dur:{...D4,attack:1.5},lab:{attack:'Fuoco'}},rig('pyro',{attack:{a:'shoot'}}));
reg('bomber',{n:'Nano bombarolo',g:2,an:['idle','walk','attack','hit'],dur:{...D4,attack:1.3},lab:{attack:'Lancia la bomba'}},rig('bomber',{attack:{a:'shoot'}}));

// ------------------------------------------------------------------ the bosses
// a soft aura round a floating mage (the game paints it under them)
const aura=(rgb,r)=>(x,y,face,anim,p,k,o,st)=>{if(LOWFX)return;const cy=y-22*k,R0=r*k,g=ctx.createRadialGradient(x,cy,4,x,cy,R0);g.addColorStop(0,`rgba(${typeof rgb==='function'?rgb(st):rgb},.3)`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,cy,R0,0,TAU);ctx.fill()};
reg('witch',{n:'Strega delle Radici',g:'boss',p2:true,an:['idle','walk','attack','summon','hit'],dur:{...D4,walk:1.2,attack:1.5,summon:2},lab:{attack:'Incantesimo',summon:'Radici'}},
  rig('witch',{attack:{a:'shoot'},summon:{a:'shoot',staff:'summon'}},{back:aura(st=>st.p2?'255,138,60':'123,240,192',36)}));
reg('smith',{n:'Il Fabbro Infernale',g:'boss',p2:true,an:['idle','walk','slam','forge','hit'],dur:{...D4,walk:.75,slam:1.6,forge:1.9},lab:{slam:'Martellata',forge:'Fucina'}},
  rig('smith',{slam:{a:'shoot',hammer:'slam'},forge:{a:'shoot',hammer:'forge'}},{back:(x,y,face,anim,p,k,o,st)=>{if(st.p2&&!LOWFX)shine('255,110,40',x,y-16*k,38*k,.3+.08*Math.sin(p*TAU*3))}}));
// the Ice Queen: her aura, the wings of her second phase (behind her), four ice shards circling her (the far ones behind, the near ones in front)
function qWings(x,y,face,k,p,st){if(!st.p2)return;const V0=V(face),fl=Math.sin(p*TAU*2)*.1;ctx.save();ctx.globalAlpha*=.8;
  // the wings of the game (queenWings) as two thin panels of ice behind her shoulders, opening sideways and a little back
  for(const sd of[-1,1]){const out=C.nrm([-.38+fl,sd,0]),pts=[[4,0],[34,-26],[28,-6],[40,-2],[26,8],[30,20],[6,8]].map(([u,w])=>V0.P(add([-5,sd*3,21],add(C.mul(out,u*.62),[0,0,-w*.62])))),
    q=pts.map(v=>[x+v[0]*k,y+v[1]*k]);ctx.beginPath();for(const v of q)ctx.lineTo(v[0],v[1]);ctx.closePath();
    const g=ctx.createLinearGradient(q[0][0],q[0][1],q[3][0],q[3][1]);g.addColorStop(0,'rgba(200,235,255,.92)');g.addColorStop(1,'rgba(150,120,255,.55)');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(30,40,80,.85)';ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[6][0],q[6][1]);ctx.lineTo(q[1][0],q[1][1]);ctx.moveTo(q[6][0],q[6][1]);ctx.lineTo(q[3][0],q[3][1]);ctx.stroke()}ctx.restore()}
function qShards(x,y,face,k,p,front,a){const V0=V(face);for(let i=0;i<4;i++){const an=p*TAU+i*TAU/4,c=[Math.cos(an)*19,Math.sin(an)*19,15+Math.sin(an*2)*1.5],d=V0.D(c);if((d>=0)!==front)continue;
  const q=V0.P(c),X0=x+q[0]*k,Y0=y+q[1]*k,s=k*.62;ctx.save();ctx.globalAlpha*=a;ctx.translate(X0,Y0);ctx.rotate(an*2);ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(0,-5*s);ctx.lineTo(3*s,0);ctx.lineTo(0,5*s);ctx.lineTo(-3*s,0);ctx.closePath();ctx.fillStyle='#e8f6ff';ctx.fill();ctx.stroke();ctx.fillStyle='rgba(127,200,240,.7)';ctx.beginPath();ctx.moveTo(0,-5*s);ctx.lineTo(3*s,0);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore()}}
const queen=(x,y,face,anim,p,k,o,st,go)=>{const sp=anim==='idle'?p:(p*1.5)%1,back=V(face).D([-5,0,21])<0;
  aura(st.p2?'190,160,255':'170,220,255',40)(x,y,face,anim,p,k,o,st);if(back)qWings(x,y,face,k,p,st);qShards(x,y,face,k,sp,false,1);go();if(!back)qWings(x,y,face,k,p,st);qShards(x,y,face,k,sp,true,1);
  if(anim==='nova'&&!LOWFX){const s=p>.2&&p<.8?Math.sin((p-.2)/.6*Math.PI):0;if(s>0)shine('190,230,255',x,y-30*k,(16+26*s)*k*.6,.45*s)}};
reg('icequeen',{n:'Regina dei Ghiacci',g:'boss',p2:true,an:['idle','walk','attack','nova','hit'],dur:{...D4,walk:1.2,attack:1.5,nova:1.8},lab:{attack:'Schegge',nova:'Nova'}},
  rig('icequeen',{attack:{a:'shoot'},nova:{a:'shoot',staff:'summon'}},{draw:queen}));
// her reflection (the mirror she summons): the same queen, paler and see-through, with a cold glow
let MC=null;
reg('qmirror',{n:'Riflesso della Regina',g:'boss',p2:true,an:['idle','walk','attack','hit'],dur:{...D4,walk:1.2,attack:1.5},lab:{attack:'Schegge'}},
  rig('qmirror',{attack:{a:'shoot'}},{draw:(x,y,face,anim,p,k,o,st,go)=>{const W=Math.ceil(120*k),H=Math.ceil(130*k);if(!MC)MC=document.createElement('canvas');if(MC.width<W||MC.height<H){MC.width=W;MC.height=H}
    const c=MC.getContext('2d'),saved=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,MC.width,MC.height);ctx=c;try{qShards(W/2,H*.86,face,k,p,false,1);EROE.arciere(W/2,H*.86,face,anim==='attack'?'shoot':anim,p,k,{style:st,noFx:o.noFx});qShards(W/2,H*.86,face,k,p,true,1)}finally{ctx=saved}
    ctx.save();ctx.globalAlpha*=.68;ctx.drawImage(MC,0,0,W,H,x-W/2,y-H*.86,W,H);ctx.restore();shine('200,230,255',x,y-26*k*.8,30*k*.6,.4)}}));
})();
