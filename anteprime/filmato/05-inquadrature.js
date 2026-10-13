// ------------------------------------------------------------------ 05 · the shots
// Every shot: id, t0 (start), d (length), set, cam(k, lt, t) -> camera, hero(lt, k, t) -> the hero (or null), and the extras
// (grade: a colour over everything in soft light; fin/fout: fade from/to black; flash; over: something drawn on top).
// k goes from 0 to 1 along the shot, lt is the time since its start in seconds.

// the hero's look: the Arciere with the leather jacket; at first without the bow, then with the ash bow and the quiver
const HST={...HERO,armor:'giubba',ring:null,amu:null,held:'bow',quiver:true,bowCol:'#a4703d',bowKind:null};
const HST0={...HST,held:null,quiver:false};
// walking: the feet move 13.6 units per step cycle, so the body goes as fast as the feet
const WALK=13.6;
const walkP=(lt,cyc)=>((lt/cyc)%1+1)%1;
// the tilt of the hero's own camera from where our camera is (12° = eye level ... 50° = from above)
function elFrom(hx,hz,hy){const d=Math.max(1,hz-C.z),up=-(C.y)-(hy==null?26:hy);return fcl(Math.atan2(up,d)*180/Math.PI+14,10,52)}
// where his head is on the screen (for the lights that fall on his face)
function headPt(H,dy){const q=pr(H.x,-(dy==null?27:dy),H.z);return q}
const NIGHT_TINT='#62729c',MOON_RIM=['#d2e2ff',.6,1,-1,1.2];
const mossWash=(H,a)=>{const q=headPt(H,24);return['#9dff6a',a==null?.32:a,q[0],q[1],q[2]*15]};

const S11={id:'1.1',t0:0,d:3,set:'bosco1',fin:.9,
  cam:(k,lt)=>({x:-10+8*k,y:kf([[0,-760],[3,-46]],lt,EZ.io),z:-60,hy:kf([[0,.56],[3,.43]],lt,EZ.io),fog:NT.fog,fogD:820}),
  hero:(lt)=>{const H={x:-74+WALK/.7*lt,z:520,face:.05,anim:'walk',p:walkP(lt,.7),st:HST0,moss:true,tint:'#4f5f88',rim:MOON_RIM};H.el=elFrom(H.x,H.z);return H}};
const S12={id:'1.2',t0:3,d:2,set:'bosco2',
  cam:(k,lt)=>{const hx=-30+WALK/.7*lt;return{x:hx-2,y:-25,z:-52,hy:.46,sh:.5,dof:2.5,bgZ:140,fog:NT.fog,fogD:700}},
  hero:(lt)=>{const H={x:-30+WALK/.7*lt,z:0,face:.14,anim:'walk',p:walkP(lt,.7),st:HST0,moss:true,el:13,tint:NIGHT_TINT,rim:MOON_RIM,look:.1*Math.sin(lt*2)};H.wash=mossWash(H);return H}};
const S13={id:'1.3',t0:5,d:2,set:'bosco3',
  cam:(k,lt)=>({x:0,y:-27,z:kf([[0,-9],[1.05,-20],[2,-24]],lt,EZ.o2),hy:.44,dof:3,bgZ:110,fog:NT.fog,fogD:650}),
  hero:(lt)=>{const walking=lt<1.05,z=walking?46-12*EZ.o2(lt/1.05):34;
    const H={x:0,z,face:Math.PI/2,anim:walking?'walk':'idle',p:walking?walkP(lt,.85):walkP(lt-1.05,2.4),st:HST0,moss:true,el:12,tint:NIGHT_TINT,
      rim:[['#c4d8ff',.7,0,-1,1.4],['#c4d8ff',.35,1,0,1.1]],look:kf([[1.05,0],[1.3,.8],[1.55,.8],[1.78,-.85],[2,-.85]],lt,EZ.io)};H.wash=mossWash(H,.32);return H}};
const S21={id:'2.1',t0:7,d:1.5,set:'cripta1',
  cam:(k,lt)=>({x:9,y:-36,z:-55+7*EZ.sine(k),hy:.46,dof:0,fog:NT.fog,fogD:900}),
  hero:(lt)=>({x:0,z:0,face:-Math.PI/2+.18,anim:'idle',p:walkP(lt,2.4),st:HST0,moss:true,el:20,tint:'#4f5f88',rim:[['#d2e2ff',.6,1,-1,1.2],['#9dff6a',.45,0,-1,1]]})};
const S22={id:'2.2',t0:8.5,d:1.5,set:'bosco3',
  cam:(k,lt)=>({x:0,y:-28,z:-31+3*k,hy:.5,dof:4,bgZ:60,fog:NT.fog,fogD:600}),
  hero:(lt,k,t)=>{const gl=cryptGlow(t),H={x:0,z:0,face:Math.PI/2-.12,anim:'idle',p:walkP(lt,2.4),st:HST0,moss:true,el:13,tint:'#66769d',
      tweak:A=>{A.roll=.16*EZ.io(seg01(lt,.35,.9));A.hy+=.1*EZ.io(seg01(lt,.35,.9));A.blink=lt>1.1&&lt<1.2?.1:1},rim:[['#c4d8ff',.5,0,-1,1.2]]};
    const q=headPt(H,22);H.wash=[['#7dff5a',.3*gl,q[0]-q[2]*10,q[1]+q[2]*14,q[2]*24],mossWash(H,.25)];return H}};
const S23={id:'2.3',t0:10,d:2,set:'cripta2',fout:.35,
  cam:(k,lt)=>({x:0,y:-7,z:kf([[0,-150],[1.25,-10],[2,124]],lt,EZ.i2),hy:.68,fog:NT.fog,fogD:900}),
  hero:(lt,k,t)=>{const z=Math.min(152,100+30*lt),gl=cryptGlow(t),into=seg01(z,140,152);
    return{x:0,z,face:-Math.PI/2,anim:'walk',p:walkP(lt,.55),st:HST0,moss:true,el:11,tint:mc('#4a5a80','#0a120c',into),rim:[['#9dff6a',.7*gl*(1-into),0,-1,1.3],['#d2e2ff',.45*(1-into),1,-1,1]]}}};

// ---------- inside the crypt
const CRYPT_TINT='#77768a',BEAM_RIM=['#e4eeff',.55,0,-1,1.2];
const fireWash=(x,z,a)=>{const q=pr(x,-40,z);return['#ffa860',(a==null?.3:a)*.6,q[0],q[1],q[2]*120]};
// a point of the hero's own body on the screen (feet at 0, x forward, y right, z up), for things he holds
function rigPt(H,q){camEl(H.el==null?24:H.el);const v=CR._rig.V(H.face).P(q[0],q[1],q[2]);camEl(45);const b=heroPt(H),s=b[2]*(H.sc||1);return[b[0]+v[0]*s,b[1]+v[1]*s,s]}
const S31={id:'3.1',t0:12,d:1.5,set:'altare',fin:.45,
  cam:(k,lt)=>{const x=flp(-34,30,EZ.sine(k)),z=72,s=600/(195-z);return{x,y:-64,z,hx:.5+s*x/FM.W,hy:.26,fog:'#04060a',fogD:420}},hero:null};
const S32={id:'3.2',t0:13.5,d:1.5,set:'altare',alt:ALTS,
  cam:(k,lt)=>({x:-14,y:-42,z:kf([[0,100],[1.5,108]],lt,EZ.sine),hy:.4,dof:2,bgZ:300,fog:'#04060a',fogD:420}),
  hero:(lt,k,t)=>{const r=EZ.io(seg01(lt,.3,1.32));
    const H={x:-31,z:188,face:0,anim:'idle',p:walkP(lt,2.4),st:HST0,moss:true,el:13,tint:CRYPT_TINT,rim:BEAM_RIM,
      tweak:A=>{A.hR=[flp(-.6,20,r),flp(11.4,1.5,r),flp(11.4,22,r)];A.lean=.02+.14*r;A.hp=.06+.1*r;A.hy=0}};H.wash=[fireWash(-62,200,.32),mossWash(H,.25)];return H}};
const S33={id:'3.3',t0:15,d:1.5,set:'altare',
  cam:(k,lt)=>({x:-8,y:-26,z:kf([[0,96],[1.5,100]],lt,EZ.sine),hy:.47,dof:3,bgZ:200,fog:'#04060a',fogD:420}),
  hero:(lt,k,t)=>{const up=EZ.io(seg01(lt,.55,.95)),mo=EZ.io(seg01(lt,1.05,1.3));
    const H={x:-10,z:150,face:Math.PI/2-.42,anim:'idle',p:walkP(lt,2.4),st:HST,moss:true,el:13,tint:CRYPT_TINT,rim:BEAM_RIM,
      look:flp(-.15,.5,up),tweak:A=>{// he holds the bow up in front of him and looks at it, then up into the dark; his mouth falls open
        A.grip=[11,-1.5,flp(13,15,up)];A.aim=nrm3([.42,0,.9]);A.up=[0,1,0];A.hR=[8,6.5,flp(12,13.5,up)];A.hp=flp(.2,-.06,up);A.mouth=mo*.55;A.squint=(1-up)*.2}};
    H.wash=[fireWash(-62,200,.3),mossWash(H,.25)];return H}};
const S34={id:'3.4',t0:16.5,d:1.5,set:'pavimento',
  cam:(k,lt)=>({x:3,y:-14,z:kf([[0,-16],[1.5,-12]],lt,EZ.sine),hy:.3,dof:3.5,bgZ:60,fog:'#04060a',fogD:320}),hero:null,
  items:(t,out)=>{const lt=t-16.5,sl=.42;// slow motion: the time inside the shot runs at 42%
    const u=lt*sl;let y,rot,x=2+u*6;const g=520;const t1=Math.sqrt(2*34/g);// falls 34 units
    if(u<t1){y=-34+.5*g*u*u;rot=.4+u*7}else{const v0=g*t1*.32,u2=u-t1,hb=v0*u2-.5*g*u2*u2;if(hb>0){y=-hb;rot=.4+t1*7+u2*5}else{y=0;rot=.4+t1*7+(2*v0/g)*5}}
    const lit=u<t1?1:Math.max(.55,1-(u-t1)*1.2);out.push({z:12,c:(c,s)=>{mossStickW(c,s,x,y,rot,lit,t);
      // green sparks where it hits the stone
      const hitT=u-t1;if(hitT>0&&hitT<.3)for(let i=0;i<9;i++){const a=-Math.PI*(.15+.7*i/8),d=hitT*90*(.6+.4*Math.sin(i*5)),sx=x+3+Math.cos(a)*d,sy=Math.sin(a)*d*.8+hitT*hitT*300;c.fillStyle=`rgba(200,255,140,${1-hitT/.3})`;c.beginPath();c.arc(sx,sy,.5,0,FTAU);c.fill()}
      if(hitT>0)for(let k=0;k<3;k++){const q=((hitT*.8+k/3)%1);c.fillStyle=`rgba(185,238,150,${(1-q)*.3})`;c.beginPath();c.arc(x+3+q*3+Math.sin(t*2+k)*1.4,y-1-q*10,.4+q*1.8,0,FTAU);c.fill()}}})}};
const S41={id:'4.1',t0:18,d:1,set:'altare',
  cam:(k,lt)=>({x:0,y:-58,z:-62,hy:.4,fog:'#04060a',fogD:460}),
  hero:(lt)=>({x:-42,z:120,face:Math.PI/2+.55,anim:'idle',p:.2,st:HST,moss:false,el:22,tint:CRYPT_TINT,rim:BEAM_RIM,wash:fireWash(-62,200,.35),tweak:A=>{A.hp=.18}})};
const S42={id:'4.2',t0:19,d:1.5,set:'altare',
  cam:(k,lt,t)=>({x:0,y:-30,z:6,hy:.5,sh:.4,hit:3.2*shakeAt(t),fog:'#04060a',fogD:460}),
  hero:(lt,k,t)=>{const j=seg01(lt,.12,.3),turn=EZ.io(seg01(lt,.3,.75)),kb=j<1?EZ.o(j):Math.exp(-(lt-.3)*5)*Math.cos((lt-.3)*14);
    return{x:0,z:110,face:Math.PI/2-.1+turn*.35,anim:'idle',p:walkP(lt,2.4),st:HST,moss:false,el:14,tint:CRYPT_TINT,rim:BEAM_RIM,wash:[fireWash(-62,200,.3),fireWash(62,200,.3)],look:turn*.9,
      tweak:A=>{A.B=add3(A.B,[-2*kb,0,2.4*Math.max(0,kb)]);A.lean=-.2*kb;A.s=-.06*kb;A.blink=1;A.mouth=Math.max(0,kb)*.7+turn*.3}}}};
const S43={id:'4.3',t0:20.5,d:1.5,set:'altare',
  // the dolly zoom: the camera comes closer while the lens opens, so his face stays the same and the room behind stretches away
  cam:(k,lt,t)=>{const z=flp(40,84,EZ.io(k)),hz=104;return{x:0,y:-27,z,f:13.5*(hz-z),hy:.49,sh:.3,fog:'#04060a',fogD:460}},
  hero:(lt,k)=>({x:0,z:104,face:Math.PI/2-.08,anim:'idle',p:walkP(lt,1.2),st:HST,moss:false,el:12,tint:CRYPT_TINT,rim:BEAM_RIM,wash:[fireWash(-62,200,.32),fireWash(62,200,.3)],
    tweak:A=>{A.lean=-.1;A.blink=1;A.mouth=.6;A.s=.03*Math.sin(lt*14);A.hy=.06*Math.sin(lt*9)}})};
// ---------- the way out
const S51={id:'5.1',t0:22,d:1.5,set:'uscita',
  cam:(k,lt)=>{const hz=40+80*lt;return{x:4,y:-34,z:hz-74,hy:.48,sh:1.6,fog:'#04060a',fogD:520}},
  hero:(lt)=>({x:0,z:40+80*lt,face:-Math.PI/2,anim:'walk',p:walkP(lt,.26),st:HST,moss:false,el:16,tint:CRYPT_TINT,rim:[['#a8c8ff',.55,0,-1,1.3],['#a8c8ff',.3,1,0,1]],tweak:A=>{A.lean=.26}})};
const S52={id:'5.2',t0:23.5,d:1,set:'uscita',
  cam:(k,lt,t)=>({x:-70,y:-46,z:60,hx:.42,hy:.47,sh:.6,hit:t>SLAB_HIT?4*Math.exp(-(t-SLAB_HIT)*5):0,fog:'#04060a',fogD:560}),
  hero:(lt,k,t)=>{const run=Math.min(1,lt/.45),stop=t>SLAB_HIT-.04,kb=stop?Math.exp(-(t-SLAB_HIT)*4)*Math.cos((t-SLAB_HIT)*12):0;
    return{x:flp(-82,-34,EZ.o2(run)),z:flp(236,292,EZ.o2(run)),face:-Math.PI/2+.75,anim:stop?'idle':'walk',p:walkP(lt,.26),st:HST,moss:false,el:22,tint:CRYPT_TINT,
      rim:[['#a8c8ff',.55*(1-seg01(t,SLAB_DROP,SLAB_HIT)),1,-1,1.3]],tweak:A=>{if(!stop)A.lean=.24;else{A.lean=-.25*kb;A.B=add3(A.B,[-2.5*kb,0,0]);A.blink=1;A.mouth=.6}}}}};
const S53={id:'5.3',t0:24.5,d:2.5,set:'lastra',
  cam:(k,lt,t)=>{const p1=Math.exp(-Math.max(0,lt-1.05)*14)*(lt>1.05?1:0),p2=Math.exp(-Math.max(0,lt-1.45)*14)*(lt>1.45?1:0);return{x:9,y:-25,z:-58,hy:.5,sh:1.1,hit:2.2*(p1+p2),dof:2,bgZ:150,fog:'#04060a',fogD:400}},
  hero:(lt)=>{// pushes, scrabbles, two blows with the free hand, then leans on the stone panting
    const push=lt<1,pant=lt>1.75,punch=k0=>{const u=lt-k0;return u<0?0:u<.08?u/.08:Math.max(0,1-(u-.08)/.25)};const pu=Math.max(punch(.98),punch(1.38));
    return{x:0,z:0,face:0,anim:push?'walk':'idle',p:push?walkP(lt,.3):walkP(lt,.45),st:HST,moss:false,el:12,tint:CRYPT_TINT,rim:[['#a8c8ff',.45,1,-1,1.2]],wash:fireWash(-120,300,.28),
      tweak:A=>{if(push){A.lean=.3;A.hR=[12,3,17];A.B=add3(A.B,[1.2,0,0])}else if(!pant){A.lean=.12+.15*pu;A.hR=[flp(6,13.5,pu),3,flp(14,19,pu)];A.squint=.6}
        else{const br=Math.sin(lt*13);A.lean=.16;A.s=.05*br;A.hd=add3(A.hd,[0,0,.6*br]);A.mouth=.55+.2*br;A.squint=.4;A.hR=[9,5,13]}}}}};
// ---------- courage
const S61={id:'6.1',t0:27,d:1.5,set:'lastra2',
  cam:(k,lt)=>({x:0,y:-26,z:kf([[0,-31],[1.5,-27]],lt,EZ.sine),hy:.5,fog:'#04060a',fogD:400}),
  hero:(lt)=>({x:0,z:0,face:Math.PI/2,anim:'idle',p:walkP(lt,1.5),st:HST,moss:false,el:12,tint:'#5a5e76',rim:[['#aacdff',.6,0,-1,1.4],['#aacdff',.35,1,0,1.2],['#aacdff',.35,-1,0,1.2]],
    wash:fireWash(-160,-40,.2),tweak:A=>{const br=Math.sin(lt*4.2);A.blink=.06;A.s=.04*br;A.hd=add3(A.hd,[0,0,.5*br]);A.hp=-.04;A.lean=-.06}})};
const S62={id:'6.2',t0:28.5,d:1,set:'lastra2',
  cam:(k,lt)=>({x:5,y:-27,z:-26,hy:.5,fog:'#04060a',fogD:400}),
  hero:(lt)=>{const up=EZ.io(seg01(lt,.05,.42)),lit=lt>.42,fl=lit?Math.exp(-(lt-.42)*4):0;
    const H={x:0,z:0,face:Math.PI/2-.35,anim:'idle',p:walkP(lt,1.6),st:HST,moss:lit,el:12,tint:'#5e627a',rim:[['#aacdff',.55,0,-1,1.4],['#aacdff',.3,1,0,1.2]],
      inhale:fl,tweak:A=>{A.hR=lit?[9,5,flp(24,14,seg01(lt,.42,.8))]:[flp(4,9,up),flp(9,4,up),flp(4,24,up)];A.squint=.38;A.hp=flp(.2,0,up)}};
    H.wash=[mossWash(H,lit?.22+.25*fl:.04),fireWash(-160,-40,.18)];return H},
  over:(lt,k,t)=>{const up=EZ.io(seg01(lt,.05,.42));if(lt>.42)return;const H=FM.shot.heroNow;if(!H)return;// the stick in his hand on its way to his mouth
    const q=rigPt(H,[flp(4,9,up)+1.5,flp(9,4,up),flp(4,24,up)+.8]);X.save();X.translate(q[0],q[1]);X.scale(q[2],q[2]);mossStickW(X,q[2],0,0,-.5,.7,t);X.restore()}};
const S63={id:'6.3',t0:29.5,d:1.5,set:'lastra2',
  // he nocks an arrow and draws the string, his eyes narrowing (the drums start)
  cam:(k,lt)=>({x:5,y:-22,z:kf([[0,-60],[1.5,-52]],lt,EZ.sine),hy:.5,dof:3,bgZ:10,fog:'#04060a',fogD:400}),
  hero:(lt)=>{const H={x:0,z:0,face:.62,anim:'aim',pull:.05+.9*EZ.io(seg01(lt,.25,1.2)),p:0,st:HST,moss:true,el:13,tint:'#5e627a',rim:[['#aacdff',.55,0,-1,1.3]],tweak:A=>{A.squint=.2+.35*seg01(lt,.3,1.2)}};
    H.wash=[fireWash(-160,-40,.3),mossWash(H,.3)];return H}};
const S64={id:'6.4',t0:31,d:1,set:'uscita',
  cam:(k,lt)=>({x:0,y:-4,z:kf([[0,96],[1,100]],lt,EZ.sine),hy:.84,fog:'#04060a',fogD:520}),
  hero:(lt)=>{const H={x:0,z:150-12*lt,face:Math.PI/2,anim:'walk',p:walkP(lt,1.15),st:HST,moss:true,el:10,tint:CRYPT_TINT,rim:[['#aacdff',.5,0,-1,1.3]],tweak:A=>{A.squint=.35;A.lean=.04}};
    const q=headPt(H,20);H.wash=[['#ffae66',.42,q[0],q[1]+q[2]*16,q[2]*40],mossWash(H,.3)];return H}};
const S65={id:'6.5',t0:32,d:1,set:'corridoio',
  cam:(k,lt)=>({x:16,y:-33,z:-2+14*k,hy:.48,fog:'#04060a',fogD:560}),
  hero:(lt)=>({x:0,z:60+15*lt,face:-Math.PI/2,anim:'walk',p:walkP(lt,.9),st:HST,moss:true,el:16,tint:'#2a2a31',rim:[['#ffb070',.8,0,-1,1.4],['#ffb070',.5,1,0,1.2],['#ffb070',.5,-1,0,1.2]]})};
// ---------- the arena
const S71={id:'7.1',t0:33,d:1.5,set:'arenaPorta',
  cam:(k,lt,t)=>({x:0,y:-46,z:flp(52,76,EZ.sine(k)),hy:.46,sh:.3,hit:t>GATE_UP&&t<GATE_UP+1.3?.8:0,fog:'#070405',fogD:600}),
  hero:(lt)=>({x:0,z:276,face:Math.PI/2,anim:'idle',p:walkP(lt,2),st:HST,moss:true,el:16,tint:'#1f2a22',rim:[['#8fe070',.7,0,-1,1.4],['#8fe070',.45,1,0,1.2],['#8fe070',.45,-1,0,1.2]]})};
const S72={id:'7.2',t0:34.5,d:1.5,set:'arena',
  cam:(k,lt)=>({x:14,y:-38,z:flp(-14,-8,k),hy:.5,fog:'#070405',fogD:520}),
  hero:(lt)=>{const w=lt<1;return{x:0,z:w?40+12*lt:52,face:-Math.PI/2+.12,anim:w?'walk':'idle',p:w?walkP(lt,.9):walkP(lt,2),st:HST,moss:true,el:18,tint:'#4a4040',rim:[['#ffb070',.55,1,-1,1.3],['#ffb070',.4,-1,0,1.1]]}}};
const S73={id:'7.3',t0:36,d:1.5,set:'arena',
  cam:(k,lt)=>({x:0,y:-70,z:flp(40,330,EZ.io(k)),hy:.88,sh:.25,fog:'#070405',fogD:540}),hero:null,
  boss:t=>({eyes:EZ.o(seg01(t,EYES_ON,EYES_ON+.25)),rim:.9*EZ.io(seg01(t,REVEAL,REVEAL+.65)),breath:seg01(t,REVEAL,REVEAL+.4)})};
const S74={id:'7.4',t0:37.5,d:1,set:'arenaPorta',
  cam:(k,lt,t)=>({x:0,y:-28,z:flp(110,114,k),hy:.5,sh:.6,hit:t>SCREAM2?3.4*Math.exp(-(t-SCREAM2)*1.6):0,dof:3,bgZ:200,fog:'#070405',fogD:600}),
  hero:(lt,k,t)=>{const H={x:0,z:150,face:Math.PI/2-.2,anim:'aim',pull:.25+.35*EZ.o(seg01(lt,.05,.4)),p:0,st:HST,moss:true,el:12,tint:'#7a6868',rim:[['#8fe070',.4,0,-1,1.2]],tweak:A=>{A.squint=.55;A.mouth=0}};
    const q=headPt(H,20),gl=.75+.25*Math.sin(t*9);H.wash=[['#ff4a32',.38*gl,q[0]+q[2]*8,q[1]+q[2]*10,q[2]*40],mossWash(H,.3)];return H},
  items:(t,out)=>{if(t<SCREAM2)return;const u=t-SCREAM2;// the wind of the scream: dust and leaves blown past him
    for(let i=0;i<26;i++){const z=120+((i*37)%60),x=-90+((u*260+i*47)%200),y=-10-((i*29)%60);out.push({z,c:(c,s)=>{c.fillStyle=`rgba(170,150,130,${.35*(1-fz(z))})`;c.beginPath();c.ellipse(x,y,2.4,.6,0,0,FTAU);c.fill()}})}}};
const S75={id:'7.5',t0:38.5,d:1.5,set:'nero'};
SHOTS=[S11,S12,S13,S21,S22,S23,S31,S32,S33,S34,S41,S42,S43,S51,S52,S53,S61,S62,S63,S64,S65,S71,S72,S73,S74,S75];
TXT.A=[[4.5,7.2,'Ti sei perso…',.17],[13.6,17.6,'Qualcosa ti aspettava.',.17],[24.6,27.4,'Non c\'è ritorno.',.17]];
TXT.B=[[5.15,7.4,'Dove diavolo sono finito…?'],[8.75,10.3,'E questa…?'],[15.1,17.9,'Un arco… perché è qui?'],[20.6,22.4,'Cos\'era quel verso?!'],[24.7,27.2,'No… è chiuso!'],[31.1,33,'Va bene. Avanti.']];
