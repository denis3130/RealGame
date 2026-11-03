// Mossbound · prepara un modello di Meshy per il gioco: dal personaggio con lo scheletro (rigged.glb) e dalle mosse scaricate da Meshy
// (un .glb per mossa, con lo stesso scheletro) fa un .glb solo, leggero, con tutte le mosse dentro:
//  - le mosse prese per nome d'osso, ricampionate a 30 al secondo; nelle camminate e nelle corse il bacino resta sul posto (si cammina
//    davanti alla telecamera; la velocità del passo resta scritta nella mossa, extras.passo, in unità del modello al secondo);
//  - le texture rifatte più leggere (colore JPEG, rilievo JPEG, luce degli occhi PNG); via quella metallo/ruvidità, che non usiamo.
// Uso: node sprite/meshy/prepara.js <cartella con rigged.glb e le mosse> <uscita.glb> [nome=file.glb[:fermo]] …
//   «:fermo» = la mossa non si ripete (sbucare, morire…): il bacino resta dove la mossa lo porta.
// Le texture si rifanno con il Chromium delle prove (canvas). Note in sprite/meshy/LEGGIMI.md.
const fs=require('fs'),path=require('path'),MB3=require('./mb3.js');
const [,,DIR,OUT,...ARGS]=process.argv;if(!DIR||!OUT){console.error('uso: node prepara.js <cartella> <uscita.glb> nome=file.glb[:fermo] …');process.exit(2)}
const FPS=30,TEX={base:{max:2048,type:'image/jpeg',q:.9},nrm:{max:1024,type:'image/jpeg',q:.92},em:{max:512,type:'image/png'}};
const rd=f=>{const b=fs.readFileSync(f);return MB3.readGLB(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))};
(async()=>{
const g=rd(path.join(DIR,'rigged.glb')),M=MB3.model(g);
const joints=M.skin?M.skin.joints:[],isJ=new Set(joints);
const hips=joints.find(j=>/hips|pelvis/i.test(M.nodes[j].name))??joints.find(j=>!isJ.has(M.nodes[j].parent));
console.log('modello:',M.prims.length,'pezzi,',M.prims.reduce((s,q)=>s+q.idx.length/3,0),'triangoli,',M.prims.reduce((s,q)=>s+q.pos.length/3,0),'vertici,',joints.length,'ossa; bacino:',hips!==undefined?M.nodes[hips].name:'?');
// ---- the moves ----
const clips=[];
for(const a of ARGS){const m=/^([^=]+)=([^:]+)(?::(\w+))?$/.exec(a);if(!m){console.error('mossa non capita: '+a);process.exit(2)}
  const [,name,file,flag]=m,h=rd(path.join(DIR,file)),C=MB3.model(h);if(!C.clips.length){console.error('nessuna mossa in '+file);process.exit(1)}
  const src=C.clips[0],map={};let miss=0;C.nodes.forEach(n=>{if(M.byName[n.name]!==undefined)map[n.i]=M.byName[n.name];else miss++});
  const n=Math.max(2,Math.round(src.dur*FPS)+1),ch=[];
  for(const c of src.ch){const to=map[c.node];if(to===undefined)continue;const k=c.n,v=new Float32Array(n*k),o=k===4?[0,0,0,1]:[0,0,0];
    for(let f=0;f<n;f++){MB3.sample(c,Math.min(src.dur,f/FPS),o);v.set(o,f*k)}
    if(k===4)for(let f=1;f<n;f++){let d=0;for(let e=0;e<4;e++)d+=v[(f-1)*4+e]*v[f*4+e];if(d<0)for(let e=0;e<4;e++)v[f*4+e]*=-1}
    ch.push({node:to,path:c.path,k,v})}
  // the hips stay in place in the moves that repeat (the step speed is kept)
  let passo=0;const ht=ch.find(c=>c.node===hips&&c.path==='translation');
  if(ht&&flag!=='fermo'){const v=ht.v,d=[v[(n-1)*3]-v[0],0,v[(n-1)*3+2]-v[2]];passo=Math.hypot(d[0],d[2])/((n-1)/FPS);
    for(let f=0;f<n;f++){const w=f/(n-1);v[f*3]-=d[0]*w+v[0]*0;v[f*3+2]-=d[2]*w}
    const x0=v[0],z0=v[2],r=M.nodes[hips].t;for(let f=0;f<n;f++){v[f*3]+=r[0]-x0;v[f*3+2]+=r[2]-z0}}
  clips.push({name,n,ch,loop:flag!=='fermo',passo});console.log('mossa',name,'←',file,(n/FPS).toFixed(2)+' s,',ch.length,'canali',miss?`(${miss} nodi senza nome uguale)`:'',passo?'passo '+passo.toFixed(3):'')}
// ---- the textures, lighter (with the Chromium of the tests) ----
const used={base:new Set(),nrm:new Set(),em:new Set()};M.mats.forEach(m=>{for(const k of['base','nrm','em'])if(m[k]!==undefined)used[k].add(m[k])});
const imgOut={};{const {chromium}=require('playwright');const b=await chromium.launch(),p=await b.newPage();
  for(const k of['base','nrm','em'])for(const i of used[k]){const im=M.imgs[i];if(!im)continue;const T=TEX[k];
    const d=await p.evaluate(async([b64,mime,T])=>{const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)),bm=await createImageBitmap(new Blob([bin],{type:mime}),{premultiplyAlpha:'none',colorSpaceConversion:'none'});
      const s=Math.min(1,T.max/Math.max(bm.width,bm.height)),w=Math.round(bm.width*s),h=Math.round(bm.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
      g.imageSmoothingQuality='high';g.drawImage(bm,0,0,w,h);return[c.toDataURL(T.type,T.q),bm.width,bm.height,w,h]},[Buffer.from(im.bytes).toString('base64'),im.mime,T]);
    imgOut[i]={mime:TEX[k].type,bytes:Buffer.from(d[0].split(',')[1],'base64')};console.log('texture',k,i,`${d[1]}×${d[2]} → ${d[3]}×${d[4]}`,(im.bytes.length/1024|0)+' KB →',(imgOut[i].bytes.length/1024|0)+' KB')}
  await b.close()}
// ---- writing the new .glb ----
const views=[],acc=[],parts=[];let off=0;
const view=(u8,target)=>{const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad}views.push({buffer:0,byteOffset:off,byteLength:u8.byteLength,...(target?{target}:{})});
  parts.push(Buffer.from(u8.buffer,u8.byteOffset,u8.byteLength));off+=u8.byteLength;return views.length-1};
const CTY=a=>a instanceof Float32Array?5126:a instanceof Uint32Array?5125:a instanceof Uint16Array?5123:a instanceof Uint8Array?5121:5126;
const accOf=(a,type,n,o={})=>{const bv=view(a,o.target),e={bufferView:bv,componentType:CTY(a),count:a.length/n,type,...(o.norm?{normalized:true}:{})};
  if(o.mm){const mn=new Array(n).fill(Infinity),mx=new Array(n).fill(-Infinity);for(let i=0;i<a.length;i++){const c=i%n;if(a[i]<mn[c])mn[c]=a[i];if(a[i]>mx[c])mx[c]=a[i]}e.min=mn;e.max=mx}
  acc.push(e);return acc.length-1};
const J={asset:{version:'2.0',generator:'Mossbound sprite/meshy/prepara.js'},scene:0,scenes:[{nodes:M.nodes.filter(n=>n.parent<0).map(n=>n.i)}],nodes:[],meshes:[],materials:[],textures:[],images:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],accessors:acc,bufferViews:views,buffers:[{byteLength:0}]};
const imgIx={};for(const i of Object.keys(imgOut)){J.images.push({bufferView:view(imgOut[i].bytes),mimeType:imgOut[i].mime});J.textures.push({sampler:0,source:J.images.length-1});imgIx[i]=J.textures.length-1}
J.materials=M.mats.map(m=>{const e={name:m.name,pbrMetallicRoughness:{baseColorFactor:m.baseF,metallicFactor:0,roughnessFactor:1},...(m.dbl?{doubleSided:true}:{})};
  if(m.base!==undefined&&imgIx[m.base]!==undefined)e.pbrMetallicRoughness.baseColorTexture={index:imgIx[m.base]};if(m.nrm!==undefined&&imgIx[m.nrm]!==undefined)e.normalTexture={index:imgIx[m.nrm]};
  if(m.em!==undefined&&imgIx[m.em]!==undefined){e.emissiveTexture={index:imgIx[m.em]};e.emissiveFactor=m.emF&&(m.emF[0]||m.emF[1]||m.emF[2])?m.emF:[1,1,1]}return e});
const meshOf={};for(const q of M.prims){const at={POSITION:accOf(q.pos,'VEC3',3,{mm:1,target:34962}),NORMAL:accOf(q.nrm,'VEC3',3,{target:34962})};
  if(q.uv)at.TEXCOORD_0=accOf(q.uv,'VEC2',2,{target:34962});
  if(q.jnt&&q.wgt){const jm=Math.max(...q.jnt),j=jm<256?Uint8Array.from(q.jnt):Uint16Array.from(q.jnt);at.JOINTS_0=accOf(j,'VEC4',4,{target:34962});
    const w=new Uint8Array(q.wgt.length);for(let i=0;i<q.wgt.length;i+=4){let s=q.wgt[i]+q.wgt[i+1]+q.wgt[i+2]+q.wgt[i+3]||1,r=255;const v=[0,1,2,3].map(c=>Math.round(q.wgt[i+c]/s*255));
      const t=v[0]+v[1]+v[2]+v[3],mx=v.indexOf(Math.max(...v));v[mx]+=r-t;for(let c=0;c<4;c++)w[i+c]=v[c]}at.WEIGHTS_0=accOf(w,'VEC4',4,{norm:1,target:34962})}
  const ix=q.pos.length/3<65536?Uint16Array.from(q.idx):Uint32Array.from(q.idx),pr={attributes:at,indices:accOf(ix,'SCALAR',1,{target:34963}),...(q.mat!==undefined?{material:q.mat}:{})};
  (meshOf[q.node]=meshOf[q.node]||[]).push(pr)}
for(const n of M.nodes){const e={name:n.name};if(n.m)e.matrix=Array.from(n.m);else{if(n.t.some(v=>v))e.translation=n.t;if(n.r[3]!==1||n.r[0]||n.r[1]||n.r[2])e.rotation=n.r;if(n.s.some(v=>v!==1))e.scale=n.s}
  if(n.kids.length)e.children=n.kids;if(meshOf[n.i]){J.meshes.push({primitives:meshOf[n.i]});e.mesh=J.meshes.length-1;if(M.skin)e.skin=0}J.nodes.push(e)}
if(M.skin)J.skins=[{joints:M.skin.joints,inverseBindMatrices:accOf(M.skin.ibm,'MAT4',16)}];
if(clips.length)J.animations=clips.map(c=>{const t=new Float32Array(c.n);for(let f=0;f<c.n;f++)t[f]=f/FPS;const ti=accOf(t,'SCALAR',1,{mm:1}),S=[],C=[];
  for(const h of c.ch){S.push({input:ti,output:accOf(h.v,h.k===4?'VEC4':'VEC3',h.k),interpolation:'LINEAR'});C.push({sampler:S.length-1,target:{node:h.node,path:h.path}})}
  return{name:c.name,samplers:S,channels:C,extras:{ripete:c.loop,passo:c.passo}}});
const bin=Buffer.concat(parts),pad=(4-bin.length%4)%4,BIN=Buffer.concat([bin,Buffer.alloc(pad)]);J.buffers[0].byteLength=BIN.length;
let js=Buffer.from(JSON.stringify(J),'utf8');js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]);
const H=Buffer.alloc(12);H.writeUInt32LE(0x46546C67,0);H.writeUInt32LE(2,4);H.writeUInt32LE(12+8+js.length+8+BIN.length,8);
const c0=Buffer.alloc(8);c0.writeUInt32LE(js.length,0);c0.writeUInt32LE(0x4E4F534A,4);const c1=Buffer.alloc(8);c1.writeUInt32LE(BIN.length,0);c1.writeUInt32LE(0x004E4942,4);
fs.writeFileSync(OUT,Buffer.concat([H,c0,js,c1,BIN]));console.log('scritto',OUT,(fs.statSync(OUT).size/1024|0)+' KB,',clips.length,'mosse')})().catch(e=>{console.error(e);process.exit(1)});
