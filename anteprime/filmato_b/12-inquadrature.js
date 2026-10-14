// ------------------------------------------------------------------ 12 · the shots of the training film and its words
// the moments of the story, in seconds
const B_REL1=12.3,B_HIT1=13.45;                      // the protagonist's first arrow: let go, in the centre of the target
const B_CREL=19.2,B_PREL=19.38,B_CHIT=20.25,B_SPLIT=20.7;// the contest: the companion lets go, then you; his arrow hits, yours splits it
const B_THROW=[23.95,24.55],B_CONE=[25.1,25.75,26.5],B_DASH=[25.3,25.95,26.72];// the pine cones thrown, the ones at you, your dodges
const B_LOGO=36.75;
const talk=(lt,a,b)=>lt>a&&lt<b?.22+.3*Math.abs(Math.sin((lt-a)*15))*Math.min(1,(b-lt)*4):0;// a mouth that speaks between a and b
const ALEN=22;// the length of a flying arrow
// the first arrow: from the protagonist's bow (at the mark, aiming at the target) to the centre of the target
const B_MARK={p:[-16,0],c:[16,8]};
function arrow1(t){if(t<B_REL1||t>=B_HIT1)return null;const H={x:B_MARK.p[0],z:B_MARK.p[1],face:faceTo(B_MARK.p[0],B_MARK.p[1],CAMPO.t1.x,CAMPO.t1.z)},a0=bodyW(H,[22,-.5,17]),T=[CAMPO.t1.x,CAMPO.t1.y,CAMPO.t1.z];
  const u=(t-B_REL1)/(B_HIT1-B_REL1),hd=[flp(a0[0],T[0],u),flp(a0[1],T[1],u)-14*Math.sin(u*Math.PI)*.4,flp(a0[2],T[2],u)],d=nrm3([T[0]-a0[0],T[1]-a0[1],T[2]-a0[2]]);
  return{b:hd,a:[hd[0]-d[0]*ALEN,hd[1]-d[1]*ALEN,hd[2]-d[2]*ALEN],d}}
const T1={hits:t=>t>=B_HIT1?[[.04,-.06,2.35,.62]]:[],wob:t=>{const u=t-B_HIT1;return u>0?.09*Math.exp(-u*4.5)*Math.sin(u*24):0},
  burst:(c,t)=>{const T=CAMPO.t1;strawBurst(c,T.x,T.y,T.r,t-B_HIT1,5,16,col=>fogc(col,T.z))}};
// the hanging target in the contest: a kick when hit, the two arrows, the split
const hangA=t=>hangAng(t)+(t>B_CHIT?.1*Math.exp(-(t-B_CHIT)*2.4)*Math.sin((t-B_CHIT)*7):0)+(t>B_SPLIT?.12*Math.exp(-(t-B_SPLIT)*2.2)*Math.sin((t-B_SPLIT)*7.5):0);
function hangCentre(t){const H=CAMPO.hang,a=hangA(t);return[H.x+Math.sin(a)*H.len,H.py+Math.cos(a)*H.len,H.z]}
const HANG={hits:t=>t>=B_SPLIT?[[0,0,2.2,.66,TGT.shaft,BCOL[B_ID()]]]:t>=B_CHIT?[[0,0,1.95,.64,TGT.shaft,BCOL[B_CO()]]]:[],
  fx:(c,t)=>{const H=CAMPO.hang,F=col=>fogc(col,H.z),q=hangCentre(t);strawBurst(c,q[0],q[1],H.r,t-B_CHIT,8,10,F);strawBurst(c,q[0],q[1],H.r*1.3,t-B_SPLIT,9,22,F);
    const u=t-B_SPLIT;if(u<0||u>1.6)return;
    // the companion's arrow split in two: the halves spin away and fall
    for(const sd of[-1,1]){const x=q[0]+sd*(10*u+3)*H.r/14,y=q[1]-22*u*H.r/14+70*u*u*H.r/14,rot=sd*(.6+u*9),l=H.r*.5;c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=Math.max(0,1-u/1.6);
      c.lineCap='round';c.strokeStyle=F(INKB);c.lineWidth=2.4;c.beginPath();c.moveTo(-l/2,0);c.lineTo(l/2,0);c.stroke();c.strokeStyle=F(TGT.shaft);c.lineWidth=1.2;c.stroke();
      c.fillStyle=BCOL[B_CO()];c.beginPath();c.moveTo(l/2,0);c.lineTo(l/2-3,-2.6*sd);c.lineTo(l/2-5,0);c.closePath();c.fill();c.restore()}
    // the light of the perfect shot: a flash and a golden ring
    if(u<.5){glo(c,'255,240,190',q[0],q[1],H.r*3.2*(1+u),.9*(1-u/.5));c.strokeStyle=`rgba(255,216,74,${.9*(1-u/.5)})`;c.lineWidth=2.4*(1-u/.5)+.5;c.beginPath();c.arc(q[0],q[1],H.r*(1.05+u*2.6),0,FTAU);c.stroke()}}};
// the pine cones: thrown from a to b (world), between times t0 and t1, spinning, falling after
function coneAt(t,t0,t1,a,b,arc){if(t<t0)return null;const u=(t-t0)/(t1-t0),x=flp(a[0],b[0],u),z=flp(a[2],b[2],u),y=flp(a[1],b[1],u)-(arc||30)*Math.sin(Math.min(1,u)*Math.PI)+(u>1?180*(u-1)*(u-1):0);return[x,y,z,u]}
function coneItem(out,p,rot){if(!p)return;out.push({z:p[2],c:(c,s)=>drawCone(c,p[0],p[1],3.4,rot,col=>fogc(col,p[2]))})}
// a puff of dust at the feet (landing, stopping, the dash)
function dustItem(out,x,z,u,n,seed){if(u<0||u>.9)return;out.push({z:z+.5,c:(c,s)=>{const r=frng(seed||1);for(let i=0;i<(n||5);i++){const a=Math.PI+r()*Math.PI,d=(4+r()*10)*(.3+u),px=x+Math.cos(a)*d,py=-2-u*6*r()+Math.sin(a)*2;
  c.fillStyle=`rgba(226,200,160,${.45*(1-u/.9)})`;c.beginPath();c.arc(px,py,2+u*6,0,FTAU);c.fill()}}})}

// ---------- 1 · dawn, the run
const B11={id:'1.1',t0:0,d:1.9,set:'bAlba',fin:.9,
  // the sun rising over the sea of the treetops
  cam:(k,lt)=>({x:-10+6*k,y:flp(-770,-660,EZ.sine(k)),z:-60,hy:.58,...fogB(1000)}),heroes:()=>[]};
// the run, from the side: the camera comes closer while they run, then the companion looks back and teases
const B21={id:'2.1',t0:1.9,d:3.9,set:'bCorsa',
  cam:(k,lt)=>({x:-120+RUNV*lt+14,y:-27,z:kf([[0,-236],[1.7,-150]],lt,EZ.io),hy:.52,sh:.8,dof:2,bgZ:300,...fogB(800)}),
  heroes:(lt)=>{const xp=-120+RUNV*lt,lk=kf([[2,0],[2.3,1.25],[3.9,1.25]],lt,EZ.io);
    return[bHero(B_CO(),{x:xp+27,z:14,face:.05,anim:'walk',p:runP(lt),el:14,look:lk,tweak:A=>{runPose(A);A.mouth=talk(lt,2.1,4.4);A.squint=.25*lk}}),
      bHero(B_ID(),{x:xp,z:0,face:.05,anim:'walk',p:runP(lt,.23),el:14,tweak:A=>{runPose(A);A.squint=.15}})]}};
const B22={id:'2.2',t0:5.8,d:1.5,set:'bCorsa2',
  cam:(k,lt)=>({x:0,y:-21,z:-40-RUNV*.86*lt,hy:.47,sh:.9,...fogB(800)}),
  heroes:(lt)=>{const zc=126-RUNV*lt,zp=168-RUNV*lt,D0=.42,dk=fcl((lt-D0)/.42,0,1),dz=-70*EZ.o(dk),dx=26*EZ.io(dk);const dashing=lt>=D0&&lt<D0+.42;
    return[bHero(B_CO(),{x:10+dx,z:zc+dz-(lt>D0+.42?RUNV*.5*(lt-D0-.42):0),face:dashing?Math.PI/2-.42:Math.PI/2,anim:dashing?'dash':'walk',p:dashing?.16+dk*.84:runP(lt),el:12,fx:dashing,tweak:A=>{if(!dashing)runPose(A)}}),
      bHero(B_ID(),{x:-13,z:zp,face:Math.PI/2+.05,anim:'walk',p:runP(lt,.2),el:12,tweak:A=>{runPose(A);A.squint=.3+.3*seg01(lt,.5,1);A.mouth=.12*seg01(lt,.9,1.2)}})]}};
const B23={id:'2.3',t0:7.3,d:1.6,set:'bCorsa',
  cam:(k,lt)=>({x:560+RUNV*lt+24,y:-27,z:-150,hy:.52,sh:.9,dof:2,bgZ:300,...fogB(800)}),
  flash:(lt)=>seg01(lt,1.3,1.6)*.95,
  heroes:(lt)=>{const xc=560+RUNV*lt+26,D0=.35,dk=fcl((lt-D0)/.42,0,1),dashing=lt>=D0&&lt<D0+.42,xp=560+RUNV*lt+64*EZ.io(dk);
    return[bHero(B_CO(),{x:xc,z:14,face:.05,anim:'walk',p:runP(lt),el:14,look:dashing?-.3:0,tweak:A=>{runPose(A);if(dashing)A.mouth=.5}}),
      bHero(B_ID(),{x:xp,z:0,face:.05,anim:dashing?'dash':'walk',p:dashing?.16+dk*.84:runP(lt,.23),el:14,fx:dashing,tweak:A=>{if(!dashing){runPose(A);A.squint=.2}}})]}};

// ---------- 2 · the targets
const B31={id:'3.1',t0:8.9,d:1.7,set:'bCampo',flash:(lt)=>.9*(1-seg01(lt,0,.5)),
  cam:(k,lt)=>({x:0,y:-58,z:flp(-206,-190,EZ.sine(k)),hy:.5,...fogB(1100)}),
  heroes:(lt)=>{const go=(mark,del)=>{const u=fcl((lt-del)/.85,0,1),e=EZ.o(u);return{x:flp(-190,mark[0],e),z:mark[1],u}};const P=go(B_MARK.p,.12),Cm=go(B_MARK.c,0);
    const one=(id,q,ph)=>{const run=q.u<.82,turn=EZ.io(seg01(q.u,.7,1)),skid=q.u>.62&&q.u<1?Math.sin((q.u-.62)/.38*Math.PI):0;
      return bHero(id,{x:q.x,z:q.z,face:flp(.04,faceTo(q.x,q.z,CAMPO.t1.x,CAMPO.t1.z),turn),anim:run?'walk':'idle',p:run?runP(lt,ph):walkP(lt,2.4),el:18,tweak:A=>{if(run)runPose(A,1-seg01(q.u,.5,.82));A.lean-=.2*skid}})};
    return[one(B_CO(),Cm,0),one(B_ID(),P,.2)]},
  items:(t,out)=>{const lt=t-8.9;dustItem(out,B_MARK.c[0],B_MARK.c[1],lt-.62,6,3);dustItem(out,B_MARK.p[0],B_MARK.p[1],lt-.74,6,5)}};
// the draw, seen from the front: the bow comes up, the string goes back, the arrow leaves past us (the target is behind the camera)
const B32P={x:-230,z:60,face:Math.PI/2+.42};
const B32={id:'3.2',t0:10.6,d:2,set:'bCampo',
  cam:(k,lt)=>({x:-242,y:-33,z:flp(-30,-24,EZ.sine(k)),hy:.5,dof:2.5,bgZ:220,...fogB(1100)}),
  heroes:(lt)=>{const rel=lt>=B_REL1-10.6;
    return[bHero(B_ID(),{x:B32P.x,z:B32P.z,face:B32P.face,anim:rel?'shoot':'aim',p:rel?Math.min(1,.5+(lt-(B_REL1-10.6))):0,pull:.08+.9*EZ.io(seg01(lt,.35,1.45)),el:13,
      tweak:A=>{A.squint=Math.max(A.squint,.2+.45*seg01(lt,.4,1.4))}})]},
  items:(t,out)=>{if(t<B_REL1)return;const H={x:B32P.x,z:B32P.z,face:B32P.face},a0=bodyW(H,[22,-.5,17]),d=[Math.cos(H.face),0,-Math.sin(H.face)],u=(t-B_REL1)*420;
    const hd=[a0[0]+d[0]*u,a0[1],a0[2]+d[2]*u];out.push({z:hd[2],s:c=>arrowS(c,[hd[0]-d[0]*ALEN,hd[1],hd[2]-d[2]*ALEN],hd,{trail:30})})}};
const B33={id:'3.3',t0:12.6,d:1,set:'bCampo',campo:{t1hits:T1.hits,t1wob:T1.wob,t1burst:T1.burst},
  // the arrow's flight: the camera rides behind it into the target, and stops with it
  cam:(k,lt,t)=>{const a=arrow1(Math.min(t,B_HIT1-.001)),b=a?a.b:[CAMPO.t1.x,CAMPO.t1.y,CAMPO.t1.z],hit=t>B_HIT1?Math.exp(-(t-B_HIT1)*7):0;
    return{x:b[0]-6,y:b[1]-6,z:b[2]-60,hy:.5,hit:2.2*hit,...fogB(1100)}},
  items:(t,out)=>{const a=arrow1(t);if(a)out.push({z:(a.a[2]+a.b[2])/2,s:c=>arrowS(c,a.a,a.b,{trail:22,trailA:.6})})}};
const B34={id:'3.4',t0:13.6,d:1.9,set:'bCampo',campo:{t1hits:T1.hits,t1wob:T1.wob},
  // the companion is not impressed (or says so): a shrug, then the words
  cam:(k,lt)=>({x:flp(3,-1,EZ.sine(k)),y:-31,z:-112,hy:.5,dof:2.5,bgZ:160,...fogB(1100)}),
  heroes:(lt)=>{const sh=Math.sin(seg01(lt,.15,.55)*Math.PI);
    return[bHero(B_CO(),{x:B_MARK.c[0],z:B_MARK.c[1],face:Math.PI-.55,anim:'idle',p:walkP(lt,2.4),el:13,look:-.15,
        tweak:A=>{A.mouth=talk(lt,.25,1.95);A.grip=add3(A.grip,[0,0,3*sh]);A.hR=add3(A.hR,[0,0,4*sh]);A.hd=add3(A.hd,[0,0,-1.2*sh]);A.roll=.06*sh;A.squint=.35}}),
      bHero(B_ID(),{x:B_MARK.p[0],z:B_MARK.p[1],face:faceTo(B_MARK.p[0],B_MARK.p[1],CAMPO.t1.x,CAMPO.t1.z)+.5,anim:'idle',p:walkP(lt,2.6),el:13,look:kf([[.3,0],[.7,.9]],lt,EZ.io),tweak:A=>{A.squint=.2}})]}};

// ---------- 3 · the contest
const hangFace=(x,z)=>faceTo(x,z,CAMPO.hang.x,CAMPO.hang.z);
const B41={id:'4.1',t0:15.5,d:2.1,set:'bCampo',campo:{t1hits:T1.hits},
  cam:(k,lt)=>({x:12,y:-44,z:flp(-140,-128,EZ.sine(k)),hy:.42,...fogB(1100)}),
  heroes:(lt)=>[bHero(B_CO(),{x:B_MARK.c[0],z:B_MARK.c[1],face:hangFace(B_MARK.c[0],B_MARK.c[1]),anim:'aim',p:0,pull:.08+.8*EZ.io(seg01(lt,.6,1.9)),el:16,rim:BRIMB,tint:BBACK}),
    bHero(B_ID(),{x:B_MARK.p[0],z:B_MARK.p[1],face:hangFace(B_MARK.p[0],B_MARK.p[1]),anim:'aim',p:0,pull:.08+.84*EZ.io(seg01(lt,.5,1.8)),el:16,rim:BRIMB,tint:BBACK})]};
// the two close-ups (seen from the side: here they aim to the right and to the left)
const B42={id:'4.2',t0:17.6,d:.8,set:'bCampo',
  cam:(k,lt)=>({x:-204,y:-27,z:flp(-6,-3,k),hy:.5,dof:3,bgZ:80,...fogB(1100)}),
  heroes:(lt)=>[bHero(B_ID(),{x:-210,z:44,face:.08,anim:'aim',p:0,pull:.94+.03*Math.sin(lt*9),el:12,tweak:A=>{A.squint=.72;A.s=.012*Math.sin(lt*5)}})]};
const B43={id:'4.3',t0:18.4,d:.7,set:'bCampo',
  cam:(k,lt)=>({x:204,y:-27,z:flp(-6,-4,k),hy:.5,dof:3,bgZ:80,...fogB(1100)}),
  heroes:(lt)=>[bHero(B_CO(),{x:210,z:44,face:Math.PI-.08,anim:'aim',p:0,pull:.93+.03*Math.sin(lt*11),el:12,tweak:A=>{A.squint=.85;A.mouth=.14}})]};
// both let go, in slow motion (seen from the side)
const B44={id:'4.4',t0:19.1,d:.9,set:'bCampo',
  cam:(k,lt)=>({x:flp(-232,-212,k),y:-34,z:-108,hy:.5,dof:2.5,bgZ:200,...fogB(1100)}),
  heroes:(lt,k,t)=>{const rel=(t0)=>t>=t0?Math.min(1,.5+(t-t0)*.55):null,rc=rel(B_CREL),rp=rel(B_PREL);
    return[bHero(B_CO(),{x:-252,z:34,face:.05,anim:rc==null?'aim':'shoot',p:rc==null?0:rc,pull:.95,el:12,tweak:A=>{A.squint=.85}}),
      bHero(B_ID(),{x:-250,z:0,face:.05,anim:rp==null?'aim':'shoot',p:rp==null?0:rp,pull:.95,el:12,tweak:A=>{A.squint=.75}})]},
  items:(t,out)=>{for(const[t0,x,z,col] of[[B_CREL,-252,34,BCOL[B_CO()]],[B_PREL,-250,0,BCOL[B_ID()]]]){if(t<t0)continue;const u=(t-t0)*62,y=-17.5;
    const a=[x+20+u,y,z],b=[x+20+u+ALEN,y,z];out.push({z:z-1,s:c=>arrowS(c,a,b,{trail:26,trailA:.55,fl:col})})}}};
// the target, close: his arrow in the centre, then yours splits it (slow motion, then the flash)
const B45={id:'4.5',t0:20,d:1.1,set:'bCampo',campo:{hangAng:hangA,hangHits:HANG.hits,hangFx:HANG.fx},
  // the camera follows the swinging target a little late, like a hand would
  cam:(k,lt,t)=>{const q=hangCentre(t-.12),q0=hangCentre(t);return{x:flp(q[0],q0[0],.4)+3,y:flp(q[1],q0[1],.4)+2,z:CAMPO.hang.z-70,hy:.5,hit:(t>B_CHIT?1.2*Math.exp(-(t-B_CHIT)*8):0)+(t>B_SPLIT?3*Math.exp(-(t-B_SPLIT)*5):0),...fogB(1100)}},
  flash:(lt,k,t)=>{const u=FM.t-B_SPLIT;return u>0&&u<.18?.32*(1-u/.18):0},
  items:(t,out)=>{for(const[t1,col,sx] of[[B_CHIT,BCOL[B_CO()],-1],[B_SPLIT,BCOL[B_ID()],1]]){if(t>=t1||t<t1-.34)continue;const u=1-(t1-t)/.34,q=hangCentre(t1),
      st=[q[0]+sx*16,q[1]+24,q[2]-36],hd=[flp(st[0],q[0],u),flp(st[1],q[1],u),flp(st[2],q[2],u)],d=nrm3([q[0]-st[0],q[1]-st[1],q[2]-st[2]]);
    out.push({z:hd[2]-2,s:c=>arrowS(c,[hd[0]-d[0]*ALEN,hd[1]-d[1]*ALEN,hd[2]-d[2]*ALEN],hd,{trail:10,fl:col})})}}};
const B46={id:'4.6',t0:21.1,d:2.3,set:'bCampo',
  cam:(k,lt)=>({x:-120,y:-30,z:flp(-66,-60,EZ.sine(k)),hy:.5,dof:3,bgZ:120,...fogB(1100)}),
  heroes:(lt)=>{const j=seg01(lt,0,.18),kb=j<1?EZ.o(j):Math.exp(-(lt-.18)*5)*Math.cos((lt-.18)*13);
    return[bHero(B_CO(),{x:-120,z:6,face:Math.PI/2-.28,anim:'idle',p:walkP(lt,2.4),el:12,look:.1*Math.sin(lt*3),
      tweak:A=>{A.lean=-.18*kb-.06;A.B=add3(A.B,[-1.5*kb,0,1.2*Math.max(0,kb)]);A.mouth=Math.max(.55*(1-seg01(lt,.2,.5)),talk(lt,.15,2.25));A.squint=0;A.hp=.02}})]}};

// ---------- 4 · dodge this!
const B51={id:'5.1',t0:23.4,d:1.7,set:'bCampo',
  cam:(k,lt)=>({x:flp(104,98,EZ.sine(k)),y:-33,z:-34,hy:.5,dof:2.5,bgZ:200,...fogB(1100)}),
  heroes:(lt,k,t)=>{const throwK=t0=>{const u=t-t0;return u<-.25?0:u<0?-(u+.25)/.25:u<.12?-1+2*(u/.12):Math.max(0,1-(u-.12)/.3)};const tk=Math.max(throwK(B_THROW[0]),throwK(B_THROW[1])),wind=Math.min(throwK(B_THROW[0]),throwK(B_THROW[1]));
    const pick=Math.sin(seg01(lt,.05,.35)*Math.PI);
    return[bHero(B_CO(),{x:116,z:54,face:Math.PI/2+.62,anim:'idle',p:walkP(lt,2),el:13,look:-.2,
      tweak:A=>{A.mouth=talk(lt,.2,2);A.squint=.35;// the right hand: down to the basket, then back and over to throw
        A.hR=[flp(-.6,6,pick)+(-8*Math.max(0,-wind))+(16*Math.max(0,tk)),flp(11.4,12,pick),flp(11.4,4,pick)+12*Math.max(0,-wind)+6*Math.max(0,tk)];A.lean=.02+.12*Math.max(0,tk)-.06*Math.max(0,-wind)}})]},
  items:(t,out)=>{for(const t0 of B_THROW){const p=coneAt(t,t0,t0+.5,[124,-26,48],[60,-30,-60],24);if(p&&p[3]<1)coneItem(out,p,t*9)}}};
const B52={id:'5.2',t0:25.1,d:2.6,set:'bCampo',
  cam:(k,lt)=>({x:-64,y:-25,z:-135,hy:.52,sh:.5,dof:2,bgZ:240,...fogB(1100)}),
  heroes:(lt,k,t)=>{// three dashes: to the left, to the right, forward and to the left; facing where he goes, then back at the throws
    const L=[[-62,0],[-88,4],[-40,-2],[-70,22]];let x=L[0][0],z=L[0][1],face=Math.PI/2,anim='idle',p=walkP(lt,2),dashing=false;
    for(let i=0;i<3;i++){const a=L[i],b=L[i+1],u=(t-B_DASH[i])/.42;if(u<0)break;if(u<1){dashing=true;anim='dash';p=.16+u*.84;x=flp(a[0],b[0],EZ.io(u));z=flp(a[1],b[1],EZ.io(u));face=Math.atan2(-(b[1]-a[1]),b[0]-a[0])}
      else{x=b[0];z=b[1];face=flp(Math.atan2(-(b[1]-a[1]),b[0]-a[0]),Math.PI/2,EZ.io(fcl((u-1)/.6,0,1)))}}
    return[bHero(B_ID(),{x,z,face,anim,p,el:12,fx:dashing,tweak:A=>{A.squint=.35;if(!dashing)A.mouth=.12*seg01(lt,1.3,1.6)}})]},
  items:(t,out)=>{const L=[[-62,0],[-88,4],[-40,-2]];for(let i=0;i<3;i++){const t0=B_CONE[i],tgt=L[i],p=coneAt(t,t0,t0+.48,[-40+i*14,-34,-150],[tgt[0],-22,tgt[1]+6],10);
      if(p)coneItem(out,[p[0]+(p[3]>1?(p[3]-1)*20:0),p[1],p[2]+(p[3]>1?(p[3]-1)*160:0)],t*11+i)}
    for(let i=0;i<3;i++){const L2=[[-88,4],[-40,-2],[-70,22]][i];dustItem(out,L2[0],L2[1],t-B_DASH[i]-.36,6,11+i);dustItem(out,L[i][0],L[i][1],t-B_DASH[i],4,21+i)}}};
const B53={id:'5.3',t0:27.7,d:1.2,set:'bCampo',fout:.5,
  cam:(k,lt)=>({x:0,y:-30,z:flp(-104,-98,k),hy:.5,dof:2.5,bgZ:200,...fogB(1100)}),
  heroes:(lt)=>{const laugh=A=>{A.squint=1;A.mouth=.5+.15*Math.sin(lt*17);A.s=(A.s||0)+.04*Math.sin(lt*16);A.hp=.14;A.lean=-.06};
    return[bHero(B_CO(),{x:15,z:8,face:Math.PI/2+.32,anim:'idle',p:walkP(lt,2),el:13,tweak:laugh}),bHero(B_ID(),{x:-15,z:0,face:Math.PI/2-.3,anim:'idle',p:walkP(lt,2.2),el:13,tweak:laugh})]}};

// ---------- 5 · tomorrow, the crypt
const B61={id:'6.1',t0:28.9,d:5.7,set:'bTronco',fin:.6,
  cam:(k,lt)=>({x:4,y:-44,z:flp(-176,-150,EZ.sine(k)),hy:.56,...fogB(1600)}),
  heroes:(lt)=>{const lk=kf([[.6,0],[1,-.95],[3.1,-.95],[3.5,-.2]],lt,EZ.io),nod=lt>3.6&&lt<4.4?Math.sin((lt-3.6)/.8*Math.PI*2)*.14:0;
    return[bHero(B_CO(),{x:13,y:14,z:2,face:-Math.PI/2+.05,anim:'idle',p:walkP(lt,2.8),el:10,shadow:0,look:lk,tint:BBACK,rim:BRIMB,tweak:A=>{A.mouth=talk(lt,.7,3.2)}}),
      bHero(B_ID(),{x:-13,y:14,z:2,face:-Math.PI/2-.05,anim:'idle',p:walkP(lt,3),el:10,shadow:0,look:kf([[1.2,0],[1.6,.5],[3.4,.5],[3.8,.1]],lt,EZ.io),tint:BBACK,rim:BRIMB,tweak:A=>{A.hp+=nod}})]}};
const B62={id:'6.2',t0:34.6,d:2.15,set:'bTronco',fout:.9,
  cam:(k,lt)=>({x:4,y:kf([[0,-44],[2.15,-190]],lt,EZ.io),z:kf([[0,-150],[2.15,-260]],lt,EZ.io),hy:kf([[0,.56],[2.15,.66]],lt,EZ.io),...fogB(1600)}),
  heroes:(lt)=>[bHero(B_CO(),{x:13,y:14,z:2,face:-Math.PI/2+.05,anim:'idle',p:walkP(lt,2.8),el:18,shadow:0,tint:BBACK,rim:BRIMB}),
    bHero(B_ID(),{x:-13,y:14,z:2,face:-Math.PI/2-.05,anim:'idle',p:walkP(lt,3),el:18,shadow:0,tint:BBACK,rim:BRIMB})]};
const B71={id:'7.1',t0:36.75,d:1.85,set:'nero'};
SHOTS=[B11,B21,B22,B23,B31,B32,B33,B34,B41,B42,B43,B44,B45,B46,B51,B52,B53,B61,B62,B71];
FM.DUR=38.6;SHOT_LOGO=B_LOGO;
// the words: the companion's lines at the top with his name (Denis's lines), the protagonist's thoughts at the bottom
function bTexts(){const P=B_ID(),Co=B_CO(),n=BNAME[Co],col=BCOL[Co];
  TXT.A=[[.7,3.1,'Prima della cripta…',.15],[4,6.3,`Tutto qui? Corri, ${P==='arciere'?'dormiglione':'dormigliona'}!`,.16,n,col],[13.8,15.8,'Bel colpo… sarà fortuna!',.16,n,col],
    [21.2,23.4,'Cosa?! Mi hai spaccato la freccia!',.16,n,col],[23.6,25.6,'Schiva questa! E questa!',.16,n,col],[29.6,32.1,'Domani la cripta. Ci stai?',.16,n,col]];
  TXT.B=[[6.4,8,'Ah, sì? Ti prendo!'],[15.9,17.5,'Fortuna? Guarda bene.'],[17.7,19,'Respira… mira…'],[26.2,27.8,'Troppo facile!'],[32.4,34,'Ci sto.']]}
bTexts();
