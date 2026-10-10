// Rebuilds what the weapons' test page (sprite/armi/poligono/armi.html) needs besides its own code. Run `python3 tests/mk.py` first.
// Usage: node tests/poligono.js
// - shim.js: the game's drawing and sound primitives copied from index.html (the weapons code uses them)
// - eroe_a.webp / eroe_b.webp: the game's hero (no quiver) in 8 directions x 9 frames (standing + 8 steps of the walk), cut where the game
//   draws what it holds: a is everything before the gun, b everything after (the head, and the body when it looks away). The page draws
//   a, the gun (ARMI.inMano), b. Cell 36 x 48 game px at scale 3, the hero's x,y (drawRig's) at 18, 34.
// - mostri/*.webp: the zombie sheets the page uses, from sprite/mostri/*.png at 2/3 of their size (2 px for each game px)
// Open the page from a local server or straight from the folder (file://).
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'sprite','armi','poligono');
// ---- shim.js: whole functions copied by name, so it follows index.html when they change
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').split('\n');
function grab(start,name){const i=src.findIndex(l=>l.startsWith(start));if(i<0)throw new Error('non trovo '+name);let j=i,d=0,seen=false;
  for(;j<src.length;j++){for(const ch of src[j].replace(/'[^']*'|`[^`]*`|"[^"]*"/g,'')){if(ch==='{'){d++;seen=true}else if(ch==='}')d--}if(seen&&d<=0)break;if(!seen&&/;\s*$/.test(src[j]))break}
  return src.slice(i,j+1).join('\n')}
const parts=["// copied from Mossbound's index.html by tests/poligono.js: the drawing and sound primitives the weapons code uses",
  "const INK='#1b1612',TAU=Math.PI*2;let LOWFX=false;let ctx=null;const G={t:0};","const AU={ctx:null,on:{music:false,sfx:true},last:{},pan:0};"];
for(const[s,n] of[['const mtof=','mtof'],['function mkNoise(','mkNoise'],['function mkImpulse(','mkImpulse'],['function route(','route'],['function adsr(','adsr'],['function osc(','osc'],
  ['function noiseSrc(','noiseSrc'],['function filt(','filt'],['function vChoir(','vChoir'],['function vBell(','vBell'],['const VR=','VR'],['function fNoise(','fNoise'],['function fThump(','fThump'],
  ['function fModal(','fModal'],['const M={','M'],['function whoosh(','whoosh'],['function coinClink(','coinClink'],['function circ(','circ'],['function ell(','ell'],['function ink(','ink'],
  ['function fs(','fs'],['const Q8=','Q8'],['const VIEWS=','VIEWS'],['function basis(','basis'],['function glowSprite(','glowSprite'],['function glow(','glow']])parts.push(grab(s,n));
parts.splice(parts.length-2,0,'const GLOW={};');
parts.push(`function initAudio(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
  try{const c=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=c;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=14;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;comp.connect(c.destination);
    AU.master=c.createGain();AU.master.gain.value=.9;AU.master.connect(comp);
    AU.sfxBus=c.createGain();AU.sfxBus.gain.value=.8;AU.sfxBus.connect(AU.master);
    AU.rev=c.createConvolver();AU.rev.buffer=mkImpulse(c,3,2.4);const rv=c.createGain();rv.gain.value=.6;AU.rev.connect(rv);rv.connect(AU.master);
    AU.sRev=c.createGain();AU.sRev.gain.value=1;AU.sRev.connect(AU.rev);AU.mRev=AU.sRev;
    AU.white=mkNoise(c,2,'white');AU.brown=mkNoise(c,2,'brown')}catch(e){AU.ctx=null}}
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume()});`);
const shim=parts.join('\n');new Function(shim);fs.writeFileSync(path.join(OUT,'shim.js'),shim);console.log('shim.js',shim.length,'caratteri');
// ---- the hero's layers and the zombie sheets, drawn in the game
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:50,introSeen:1,runs:3,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1000);
const r=await p.evaluate(()=>__E(`(()=>{const K=3,CW=36,CH=48,OX=18,OY=34,DIRS=[Math.PI/2,Math.PI/4,0,-Math.PI/4,-Math.PI/2,-3*Math.PI/4,Math.PI,3*Math.PI/4];
 const mk=()=>{const c=document.createElement('canvas');c.width=CW*K*9;c.height=CH*K*8;return c},A=mk(),Bc=mk(),ga=A.getContext('2d'),gb=Bc.getContext('2d');
 const _h=held,saved=ctx,sty=Object.assign({},HERO,{held:'arma_split',quiver:false});
 held=function(S,o,B){if(S.held!=='arma_split')return _h(S,o,B);gb.setTransform(ctx.getTransform());for(const k of['lineWidth','strokeStyle','fillStyle','lineJoin','lineCap','globalAlpha'])gb[k]=ctx[k];ctx=gb};
 G.t=.3;try{for(let d=0;d<8;d++)for(let f=0;f<9;f++){ctx=ga;ga.setTransform(K,0,0,K,0,0);gb.setTransform(K,0,0,K,0,0);ga.globalAlpha=gb.globalAlpha=1;
   const mv=f>0;drawRig(f*CW+OX,d*CH+OY,DIRS[d],mv?(f-1)/8*Math.PI*2:0,mv,sty,{});ga.restore()}}finally{held=_h;ctx=saved}
 return[A.toDataURL('image/webp',.92),Bc.toDataURL('image/webp',.92)]})()`));
fs.writeFileSync(path.join(OUT,'eroe_a.webp'),Buffer.from(r[0].split(',')[1],'base64'));fs.writeFileSync(path.join(OUT,'eroe_b.webp'),Buffer.from(r[1].split(',')[1],'base64'));
fs.mkdirSync(path.join(OUT,'mostri'),{recursive:true});
for(const n of['zombie_walk','zombie_attack','strisciante_walk','hound_walk']){const png='data:image/png;base64,'+fs.readFileSync(path.join(ROOT,'sprite','mostri',n+'.png')).toString('base64');
  const w=await p.evaluate(async png=>{const im=new Image();im.src=png;await im.decode();const c=document.createElement('canvas');c.width=Math.round(im.width*2/3);c.height=Math.round(im.height*2/3);
    const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/webp',.9)},png);
  fs.writeFileSync(path.join(OUT,'mostri',n+'.webp'),Buffer.from(w.split(',')[1],'base64'))}
console.log('eroe_a.webp, eroe_b.webp, mostri/*.webp fatti',errs.slice(0,5));await b.close()})();
