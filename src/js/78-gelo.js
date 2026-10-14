// =====================================================================
// LA SCIA DELL'ANELLO DEL GELO ETERNO (dal ramo nuovi-oggetti, rimasta a metà): chi porta l'anello lascia camminando piccole lastre di
// ghiaccio a terra, un passo a destra e uno a sinistra; si crepano, poi si sciolgono in acqua e spariscono. Solo estetica (le frecce
// che rallentano restano l'effetto dell'anello). Con LOWFX meno lastre e niente crepe. Insieme all'Arco del tuono (07, 19, armi3d.js,
// 73), che ha preso il posto dell'Arco delle spine (i salvataggi vecchi passano carte e livello: migrateItems).
// =====================================================================
function frostTick(dt){const F=G.frost||(G.frost=[]);for(let i=F.length-1;i>=0;i--){F[i].t-=dt;if(F[i].t<=0)F.splice(i,1)}
  if(!P||!P.style||P.style.ring!=='anello_gelo'||!P.moving||G.state==='dead')return;G.frostT=(G.frostT||0)-dt;
  if(G.frostT<=0){G.frostT=LOWFX?.16:.09;const st=(G.frostS=(G.frostS||0)+1)%2?1:-1;F.push({x:P.x+Math.sin(P.face)*st*4+rand(-1.5,1.5),y:P.y+7+Math.cos(P.face)*st*-2,r:rand(4.5,6.5),t:1.7,max:1.7,rot:rand(0,TAU)});if(F.length>40)F.shift()}}
function drawFrostTrail(){const F=G.frost;if(!F||!F.length)return;ctx.save();for(const f of F){const k=f.t/f.max,melt=k<.45?k/.45:1,r=f.r*(.55+.45*melt);
  ctx.fillStyle=k<.45?`rgba(150,200,235,${.32*melt})`:`rgba(205,238,255,${.42*Math.min(1,(1-k)*8)})`;ell(f.x,f.y,r,r*.5,0);ctx.fill();
  if(k>=.45&&!LOWFX){ctx.strokeStyle=`rgba(255,255,255,${.55*k})`;ctx.lineWidth=.8;ctx.beginPath();for(let i=0;i<3;i++){const a=f.rot+i*2.1;ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(a)*r*.8,f.y+Math.sin(a)*r*.4)}ctx.stroke();ctx.fillStyle=`rgba(255,255,255,${.6*k})`;circ(f.x-r*.35,f.y-r*.12,.9);ctx.fill()}}
  ctx.restore()}
{const _uf=update;update=function(dt){_uf(dt);if(G&&started&&!INTRO.on)frostTick(dt)}}
// on the floor, under the shadows and everybody (just before the back wall is drawn)
{const _wb=drawWallBack;drawWallBack=function(){try{drawFrostTrail()}catch(e){}return _wb.apply(this,arguments)}}
{const _b=buildRoom;buildRoom=function(){if(G)G.frost=[];return _b.apply(this,arguments)}}
