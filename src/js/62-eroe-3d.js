// =====================================================================
// THE HERO IN 3D: the Arciere is drawn by EROE.arciere (sprite/eroe3d/disegno_eroe.js) with his weapons in 3D (sprite/eroe3d/armi3d.js):
// in battle, in the menu (home, hero tab, Armeria, portraits), in the intro, when he falls and when he walks into the crypt. The other
// heroes keep the rig of today until their 3D version is approved. drawRig is wrapped: a style of the Arciere (style.hid 'arciere', or
// HERO itself) goes to the 3D hero, with the move picked from what he is doing: dash, hit, walk, aim (the string drawn by the game's
// pull), idle. EROE.arciere's point is the feet, 8 px below drawRig's.
// =====================================================================
const H3D={on:true,st:null,prev:false};
const H3IDS=['arciere','cacciatrice','balestriere','druida','bardo','alchimista','ninja','paladino','mago','berserker','corsaro','domatore','monaco'];
function is3D(S){return H3D.on&&typeof EROE!=='undefined'&&!!S&&(H3IDS.includes(S.hid)||S===HERO)}
{const _dr=drawRig;drawRig=function(x,y,face,walk,moving,S,o){if(!is3D(S))return _dr.apply(this,arguments);o=o||{};
  const st=H3D.st||{},sc=S.sc||1,t=(G&&G.t)||0;let anim='idle',p=((t/2.4)%1+1)%1,pull=Math.min(1,Math.max(0,(o.pull||0)/5));
  if(H3D.prev)face=Math.PI/2-(typeof pvT!=='undefined'?pvT:t)*.7;
  else if(st.dash!=null){anim='dash';p=st.dash}
  else if(st.hit!=null){anim='hit';p=st.hit}
  else if(moving){anim='walk';p=(((walk||0)/TAU)%1+1)%1}
  else if(st.aim||pull>0)anim='aim';
  if(H3D.st&&!H3D.prev){const o=H3D.tf||(H3D.tf={}),tt=(G&&G.t)||0;if(o.f==null||tt-o.t>.3){o.f=face}else{let d=face-o.f;d=Math.atan2(Math.sin(d),Math.cos(d));const dt=Math.max(0,tt-o.t),mx=30*dt;o.f+=Math.max(-mx,Math.min(mx,d*(1-Math.exp(-dt*30))))}o.t=tt;face=o.f}
  // seen through (the blink after a hit): drawn whole on a small layer, then laid down see-through, so the pieces under the others
  // do not show through
  const a=ctx.globalAlpha;if(a<.99&&a>0&&!LOWFX&&heroLayer(x,y,sc,()=>EROE.arciere(x,y+8*sc,face,anim,p,sc,{style:S.hid==='druida'&&!S.eyes?{...S,eyes:S.eyeCol}:S,moss:mossOn?2:false,pull,noFx:true}),a))return;
  EROE.arciere(x,y+8*sc,face,anim,p,sc,{style:S.hid==='druida'&&!S.eyes?{...S,eyes:S.eyeCol}:S,moss:mossOn?2:false,pull,noFx:!st.fx})}}
// a small layer the size of the hero on the screen (in device pixels, with the canvas' own transform), for the see-through blink
const HLAY={cv:null};
function heroLayer(x,y,sc,draw,alpha){if(typeof document==='undefined')return false;const m=ctx.getTransform(),k=Math.hypot(m.a,m.b)||1;
  const L=x-40*sc,T=y-46*sc,R=x+40*sc,B=y+22*sc,p0=[m.a*L+m.c*T+m.e,m.b*L+m.d*T+m.f],p1=[m.a*R+m.c*B+m.e,m.b*R+m.d*B+m.f];
  const x0=Math.floor(Math.min(p0[0],p1[0])),y0=Math.floor(Math.min(p0[1],p1[1])),w=Math.ceil(Math.abs(p1[0]-p0[0]))+2,h=Math.ceil(Math.abs(p1[1]-p0[1]))+2;
  if(w<2||h<2||w>1600||h>1600||Math.abs(m.b)>1e-3)return false;
  if(!HLAY.cv)HLAY.cv=document.createElement('canvas');const c=HLAY.cv;if(c.width<w)c.width=w;if(c.height<h)c.height=h;
  const g=c.getContext('2d'),saved=ctx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.setTransform(m.a,m.b,m.c,m.d,m.e-x0,m.f-y0);
  ctx=g;try{draw()}finally{ctx=saved}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=alpha;ctx.drawImage(c,0,0,w,h,x0,y0,w,h);ctx.restore();return true}
// in battle: the dash (from the dash's own clock, then a short landing), the hit (just after losing health), the aim while the
// hero stands and shoots; the dash dust and the speed lines of the 3D hero are on in battle
{const _dh=drawHero;drawHero=function(){if(!P||!is3D(P.style||HERO))return _dh.apply(this,arguments);
  const st={fx:true,aim:!!P.aiming};
  const de=P.dashCd>0&&P.dashMax!=null?P.dashMax-P.dashCd:9;
  if(de>=0&&de<.42&&G.state!=='dead')st.dash=.16+de/.42*.84;
  else if(P.hurtT!=null&&G.t-P.hurtT>=0&&G.t-P.hurtT<.45)st.hit=(G.t-P.hurtT)/.45*.5;
  H3D.st=st;try{_dh.apply(this,arguments)}finally{H3D.st=null}}}
// the moment he loses health (a hit that the shield stops does not count)
{const _h=hurtP;hurtP=function(d){const hp=P?P.hp:0;_h.apply(this,arguments);if(P&&P.hp<hp)P.hurtT=G.t}}
// falling: eyes squeezed shut, mouth open, dizzy stars
{const _df=drawFallenHero;drawFallenHero=function(){const keep=H3D.st;H3D.st={hit:.32};try{_df.apply(this,arguments)}finally{H3D.st=keep}}}
// the hero tab and the Armeria: the 3D hero turns slowly on his pedestal instead of walking in eight directions
{const _hp=drawHeroPreview;drawHeroPreview=function(){H3D.prev=true;try{return _hp.apply(this,arguments)}finally{H3D.prev=false}}}
