// ---------- LA MAPPA della modalità zombie (pianta approvata da Denis il 12 ottobre, anteprime/zombie/pianta.py): a sud l'area di partenza
// «Camposanto e Casa» (12×12 caselle: l'anteprima di prima con due caselle in più a nord e due a est), a nord oltre il cancello a pagamento la
// «Fattoria dei Corvi» (16×12), e sopra la fattoria due caselle di granturco che continua oltre il bordo. Coordinate: X(), Y() dalla pianta (in
// caselle), AX(), AY() dall'anteprima di prima (area_prova.js). Si parte con 500 monete, ogni zombie ne dà 60; il cancello costa 750 (si tiene
// premuto il bottone), il Revolver a muro dietro la casa 500, la Pompa da caccia sul fienile 1.500, la Bara delle Sorprese 750.
// Anteprima 48 (punti 10-17 del piano di Denis): la mappa grande, 30 caselle di larghezza. A est della partenza il «Borgo dei Lumi» (zona 3:
// la strada, la Locanda del Corvo a due piani, il mercato, la Fucina con la Forgia delle Anime, l'orto del parroco, la Cappella col campanile,
// la carrozza della scuola bruciata), a est della fattoria la «Segheria del Fiume» (zona 4: il fiume con la ruota del mulino, la segheria, la
// caldaia con la valvola, le cataste, la gru, il carro dei tronchi). Le quattro zone fanno un anello, ognuna aperta da una barriera a pagamento:
// partenza → borgo (carri e assi, 1.000), borgo → segheria (cancello, 1.250), segheria → fattoria (tronchi, 1.000), fattoria → partenza
// (il cancello di ferro, 750). La pianta è in pianta_grande.py.
(()=>{const{T,P,G,prop,solid,holes,perches,bakeGround,boot,W,rr,srand,box,shade,prismY,line3,TAU}=ZM;
const X=v=>v*T,Y=v=>(v+2)*T,AX=v=>(v+2)*T,AY=v=>(v+16)*T;
// le cose che una partita cambia e che una partita nuova rimette com'erano: l'eroe alla partenza, gli zombie fermi nell'aia, il velo sulla fattoria
const HERO0=()=>({x:AX(4.4),y:AY(8.4),face:-Math.PI/2,walk:0,moving:false,aim:0,fireCd:0}),IDLE=[['zombie',6.0,8.6,2],['lanterna',9.3,5.3,2],['strisciante',8.9,8.7,2],['zombie',19.4,18.6,3],['minatore',23.4,16.7,3],['strisciante',27.2,19.0,3],['zombie',22.6,9.4,4],['hound',18.3,8.8,4],['lanterna',27.9,7.7,4]],
  veil=()=>({y:Y(12.3),k:1,wisps:Array.from({length:8},(_,i)=>({x:rr(0,16*T),y:rr(Y(1),Y(11.4)),r:rr(110,190),v:rr(5,11)}))});
// ---------- le ZONE NUOVE (anteprima 48): il Borgo dei Lumi (3) e la Segheria del Fiume (4), coi confini, le barriere a pagamento, le uscite
// degli zombie e il terreno. Coordinate in caselle della pianta (pianta_grande.py). Regole: niente corridoi tra 18 e 34 px; davanti a porte,
// finestre e barriere resta posto; le buche delle zone nuove hanno la loro zona (da una zona chiusa non esce nessuno)
const NOMI={1:'Camposanto',2:'Fattoria dei Corvi',3:'Borgo dei Lumi',4:'Segheria del Fiume'};
function buildEast(w,h){const E={};const hole=(x,y,z,k)=>holes.push([x,y,z,k||null]);
  const grave=(x,y,z)=>{P.openGrave(x,y);const hh=holes[holes.length-1];hh[2]=z};
  // ---------------------------------------------------------------- i confini
  // fattoria | segheria (x 16): staccionata e, a metà, i tronchi incatenati (1.000)
  P.fence(X(16),Y(3.55),X(16),Y(8.6),{noStart:1});P.fence(X(16),Y(10.6),X(16),Y(11.95),{endPost:1});
  E.b24=P.barriera(X(16),Y(8.6),X(16),Y(10.6),'tronchi',1000);E.b24.price=1000;
  // partenza | borgo (x 14): staccionata e, sulla strada, il carro rovesciato con le assi (1.000)
  P.fence(X(14),Y(12.3)+8,X(14),Y(17.6));P.fence(X(14),Y(19.4),X(14),Y(24)-6,{noStart:1});
  E.b13=P.barriera(X(14),Y(17.6),X(14),Y(19.4),'carri',1000);E.b13.price=1000;
  // borgo | segheria (y 12.3): la staccionata del cortile della segheria col suo cancello (1.250)
  P.fence(X(16),Y(12.3),X(24.5),Y(12.3),{noStart:1});P.fence(X(26.5),Y(12.3),X(29.3),Y(12.3));
  E.b34=P.barriera(X(24.5),Y(12.3),X(26.5),Y(12.3),'cancello',1250);E.b34.price=1250;
  // il bordo est (x 29,3): staccionata con un varco rotto per zona (gli zombie escono dal buio) e la striscia oltre, che non si attraversa
  P.fence(X(29.3),Y(2.2),X(29.3),Y(6.0));P.fence(X(29.3),Y(7.0),X(29.3),Y(12.3),{noStart:1});
  P.barricade(X(29.3),Y(6.0),X(29.3),Y(7.0),{kind:'legno',out:[1,0],n0:2,reach:40});hole(X(29.3)+30,Y(6.5),4,'fuori');
  P.fence(X(29.3),Y(12.3),X(29.3),Y(18.1),{noStart:1});P.fence(X(29.3),Y(18.9),X(29.3),Y(20.0),{noStart:1});P.fence(X(29.3),Y(20.9),X(29.3),Y(24)-6,{noStart:1});
  P.barricade(X(29.3),Y(18.1),X(29.3),Y(18.9),{kind:'legno',out:[1,0],n0:2,reach:40});hole(X(29.3)+30,Y(18.5),3,'fuori');
  solid(X(29.3)+3,Y(1.6),w-X(29.3)-3,Y(24)-Y(1.6),'edge');
  // il bordo sud del borgo (y 24): muretto con la cancellata; nell'orto del parroco un pezzo crollato con le sbarre (dal buio escono)
  P.wall(X(14),Y(24),X(22.0),Y(24),true);P.wall(X(23.0),Y(24),X(29.3)+4,Y(24),true);
  P.barricade(X(22.0),Y(24),X(23.0),Y(24),{kind:'ferro',out:[0,1],n0:2,th:12,reach:42,hop:16,zfx:28});hole(X(22.5),Y(24)+34,3,'fuori');
  // il fiume (non ci si entra) e la sua riva
  solid(X(16),0,w-X(16),Y(1.6),'water');
  // ---------------------------------------------------------------- AREA 4: la Segheria del Fiume
  P.ruotaMulino(X(18.7),Y(1.55));
  P.cataste(X(16.6),Y(1.7),X(18.4)-X(16.6),Y(3.0)-Y(1.7));P.cataste(X(27.0),Y(8.6),X(29.3)-X(27.0)-3,Y(10.0)-Y(8.6));
  const SG=P.edificio({x:X(19.5),y:Y(3.4),w:7*T,d:5*T,H:96,fl:1,wall:'sawWood',roof:'barnRoof',rh:84,name:'Segheria',
    op:[{s:'s',at:3.75*T,k:'big',id:'portone'},{s:'w',at:2.2*T,k:'door',id:'ovest'},{s:'n',at:5.1*T,k:'door',id:'fiume'},{s:'s',at:.9*T,k:'win'},{s:'e',at:2.6*T,k:'win'},{s:'n',at:1.6*T,k:'win'}]});
  P.bancoSega(SG,X(21.9),Y(5.25));
  {const px=X(24.4),py=Y(4.0);solid(px,py,70,14);SG.in([...box(px,py,0,70,14,6,'plankN',{ow:1.4}),...box(px+2,py+1,6,66,12,6,'plank',{noFoot:true,ow:1.4}),...box(px+4,py+2,12,62,10,6,'plankN',{noFoot:true,ow:1.4})],[px-2,py-2,px+72,py+16,20])}// le assi tagliate
  {const tx=X(25.6),ty=Y(6.6);solid(tx,ty,44,22);SG.in([...box(tx,ty,0,44,22,24,'wood',{ow:1.8}),...box(tx-2,ty-2,24,48,26,3,'plankD',{noFoot:true,ow:1.4}),line3([tx+6,ty+8,27],[tx+30,ty+12,27],'#8a8e98',2,{ink:true})],[tx-4,ty-4,tx+48,ty+26,32])}// il banco degli attrezzi
  P.shed(X(17.0),Y(5.4),1.8*T,2*T);
  P.shelter(X(27.2),Y(3.8),X(29.2)-X(27.2),Y(5.9)-Y(3.8));P.valvola(X(28.2),Y(4.55));
  P.gru(X(26.1),Y(10.9));P.carroTronchi(X(20.7),Y(10.0));hole(X(20.4),Y(10.4),4,'carro');
  for(const[x,y] of[[X(24.4),Y(9.7)],[X(18.0),Y(8.6)]])grave(x,y,4);
  hole(X(21.4),Y(1.85),4,'acqua');hole(X(25.6),Y(1.85),4,'acqua');
  P.lanternPole(X(19.1),Y(9.0),1);P.lanternPole(X(26.8),Y(8.9),-1);
  E.bara4=[X(20.45),Y(4.35)];E.gun4=[X(21.6),Y(8.4)+24];
  {const hostS=SG_FACE(X(21.6),Y(8.4),'s');P.wallGun(X(21.6),Y(8.4)+.6,30,'x','mitra',1250,hostS)}
  // ---------------------------------------------------------------- AREA 3: il Borgo dei Lumi
  const LC=P.locanda(X(15.2),Y(13.3),6.4*T,3.6*T);E.locanda=LC;
  // la Credenza degli Elisir dietro il bancone, contro il muro nord
  P.elisir(X(15.2)+306,Y(13.3)+22);
  hole(X(19.2),Y(12.8),3,'botola');// la botola della cantina nel cortile dietro la locanda
  for(const[x,y,c] of[[X(22.9),Y(13.6),'R'],[X(24.65),Y(13.6),'B'],[X(23.75),Y(15.25),'R']])P.bancarella(x,y,c);
  P.bacheca(X(26.6),Y(13.75));P.carrettoRovesciato(X(25.7),Y(15.4));hole(X(25.55),Y(16.75),3,'carro');
  for(const[x,y] of[[X(22.7),Y(16.6)],[X(27.4),Y(15.0)]])P.crate(x,y);P.barrel(X(26.9),Y(16.7));P.barrel(X(22.8),Y(14.9),.85);
  P.carrozzaScuola(X(25.55),Y(17.55));hole(X(25.25),Y(18.0),3,'carro');
  for(const[x,y,d] of[[X(17.4),Y(19.75),1],[X(21.2),Y(17.25),-1],[X(24.6),Y(19.75),1],[X(28.7),Y(17.25),-1]])P.lanternPole(x,y,d);
  const FU=P.fucina(X(15.0),Y(20.3),4.5*T,3.1*T);ZM.turn(X(17.0),Y(22.35),2,()=>P.forgia(X(17.0),Y(22.35)));
  E.gun3=[X(18.75),FU.wallY-24];{const hostF=FU_FACE(FU);P.wallGun(X(18.75),FU.wallY-.6,34,'x','mitraglietta',1000,hostF)}
  // l'orto del parroco: muretti con la cancellata, l'ingresso a nord, le tombe (due fosse aperte), l'albero morto
  P.wall(X(20.4),Y(20.4),X(21.8),Y(20.4),true);P.wall(X(22.8),Y(20.4),X(24.2),Y(20.4),true);P.wall(X(20.4),Y(20.4),X(20.4),Y(24),true);P.wall(X(24.2),Y(20.4),X(24.2),Y(24),true);
  P.grave(X(21.0),Y(21.4),1);P.grave(X(23.5),Y(21.5),2,{lean:.1});grave(X(21.4),Y(22.7),3);grave(X(23.3),Y(22.9),3);P.tree(X(22.4),Y(23.4),true,.85);
  // la Cappella col campanile e la sagrestia nell'angolo
  const CP=P.cappella(X(24.9),Y(20.0),3.5*T,3.9*T);P.campanile(X(28.4),Y(20.0),X(29.3)-X(28.4));
  {const sx=X(28.4),sy=Y(20.9),sw=X(29.3)-sx,sd=Y(24)-6-sy;solid(sx,sy,sw,sd);shade(sx,sy,sw,sd,60,.45);prop({bx:[sx-1,sy-1,sx+sw+1,sy+sd+1,70],parts:[...box(sx,sy,0,sw,sd,52,'chapelStone',{ow:2.2}),...prismY(sx-4,sy-4,sw+8,[[0,52],[sd+8,52],[sd+8,58],[0,64]],'slate',{m:{e:'chapelStone',w:'chapelStone'},ow:1.8})]})}
  E.bara3=[X(24.9)+3.5*T-10-36-22,Y(20.0)+3.9*T/2];
  // fuori, oltre il bordo: le rovine a sud del borgo, il bosco oltre il fiume
  for(const[x,y,ww,dd] of[[X(15.4),Y(24.6),110,70],[X(19.6),Y(24.9),90,60],[X(25.6),Y(24.7),120,70]])P.rovine(x,y,ww,dd);
  for(let i=0;i<7;i++)P.tree(X(16.8+i*1.9),Y(-1.5)+((i*37)%30),i%3===0,.9+((i*13)%5)*.06);
  // ---------------------------------------------------------------- il terreno delle zone nuove
  const inR=(x,y,a,b,c,d)=>x>X(a)&&x<X(c)&&y>Y(b)&&y<Y(d);
  E.cobbled=(x,y)=>(x>X(14)&&x<X(29.3)&&y>Y(17.5)&&y<Y(19.5))||inR(x,y,22.6,13.2,27.0,17.4)||inR(x,y,24.9,20.0,28.4,23.9);
  E.bare=(x,y)=>x>X(16)&&y<Y(2.1)||inR(x,y,19.5,3.4,26.5,8.4)||inR(x,y,15.2,13.3,21.6,16.9)||inR(x,y,15.0,20.3,19.5,23.4)||E.cobbled(x,y)||inR(x,y,24.8,8.4,26.2,12.3)||inR(x,y,16,9.1,24.8,10.3);
  E.paint=function*(W0,H0){G.soil(X(14),Y(12.3),X(29.3)-X(14),Y(24)-Y(12.3));yield;G.river(X(16),0,W0,Y(1.6));G.bank(X(16),Y(1.6),W0,Y(2.1));yield;
    G.ruts(X(14),Y(17.4),X(29.3),Y(19.6));G.soil(X(24.9),Y(8.4),X(26.1)-X(24.9),Y(12.3)-Y(8.4));G.soil(X(16),Y(9.1),X(24.9)-X(16),Y(10.3)-Y(9.1));yield;
    G.floorPlanks(X(19.5),Y(3.4),7*T,5*T);G.floorPlanks(X(15.2),Y(13.3),6.4*T,3.6*T);G.soil(X(15.0),Y(20.3),4.5*T,3.1*T);G.soil(X(20.4),Y(20.4),3.8*T,3.6*T);yield;
    G.sawdust(X(22.4),Y(5.8),70,30);G.sawdust(X(23.2),Y(9.0),90,26);G.sawdust(X(17.6),Y(3.3),60,20);G.mud(X(16.2),Y(2.0),X(19),Y(2.6));yield;
    for(const[x,y,r] of[[X(18.6),Y(18.9),12],[X(23.0),Y(18.2),10],[X(27.4),Y(19.2),13],[X(22.2),Y(11.4),12],[X(17.4),Y(8.0),10]])G.puddle(x,y,r);
    for(let i=0;i<60;i++){const x=rr(X(15.2),X(19.3)),y=rr(Y(20.5),Y(23.2));ctx.fillStyle=`rgba(10,8,10,${rr(.2,.5)})`;ctx.beginPath();ctx.ellipse(x,y,rr(2,6),rr(1,3),rr(0,3),0,TAU);ctx.fill()}// la polvere di carbone della fucina
  };
  return E}
// la faccia sud del muro della segheria dove sta il Mitra col gesso, e quella nord del muro in fondo alla fucina (per le armi a muro)
function SG_FACE(x,y,key){for(const p of ZM.props){for(const t of p.parts)if(t.k==='face'&&t.key===key&&t.part==='wS'&&Math.abs(t.c[0][1]-y)<1.5&&Math.min(t.c[0][0],t.c[1][0])<x&&Math.max(t.c[0][0],t.c[1][0])>x)return t}return null}
function FU_FACE(F){for(const p of ZM.props){if(p.name!=='fucina')continue;for(const t of p.parts)if(t.k==='face'&&t.key==='n'&&Math.abs(t.c[0][1]-F.wallY)<1.5)return t}return null}
const AREA={title:'Camposanto',zoneName:h=>h.y<Y(12.3)?(h.x<X(16)?'Fattoria dei Corvi':'Segheria del Fiume'):(h.x<X(14)?'Camposanto':'Borgo dei Lumi'),
  // una partita nuova (ZM.ctl.nuova): 500 monete, la fattoria chiusa col cancello e il velo, gli zombie dell'aia, la Bara al cimitero, l'eroe alla partenza
  reset(){W.coins=500;W.zoneOpen={1:true,2:false,3:false,4:false};W.gate.open=false;if(AREA.gate)AREA.gate.close();for(const b of AREA.bars||[])b.close();W.split=veil();for(const[k,x,y,z] of IDLE)ZM.idleZombie(k,X(x),Y(y),z);ZM.boxReset();W.hero=HERO0()},
  build(){const w=30*T,h=29*T;srand(11);W.coins=500;W.maxZ=6;W.zoneOpen={1:true,2:false,3:false,4:false};// sotto l'area di partenza tre caselle di nebbia (non ci si va)
    // ================================================================ AREA 1: Camposanto e Casa (l'anteprima di prima, spostata)
    P.wall(AX(0),AY(.35),AX(3.7)+6,AY(.35),true);P.wall(AX(0),AY(7.3),AX(3.7)+6,AY(7.3),true);P.wall(AX(3.7),AY(.35)+7.5,AX(3.7),AY(4.95)-15,true);P.wall(AX(3.7),AY(6.05)+15,AX(3.7),AY(7.3)-7.5,true);
    P.pillar(AX(3.7),AY(4.95),2);P.pillar(AX(3.7),AY(6.05),0);P.gateLeaf(AX(3.7),AY(4.95),30,-2.1);P.gateLeaf(AX(3.7),AY(6.05),30,2.2);
    P.crypt(AX(.12),AY(1),1.9*T,1.35*T);
    // (anteprima 48) la cancellata a ovest del cimitero, sul bordo della mappa: un pezzo è crollato e restano solo sbarre di ferro ribattute
    // (barriere.js); di là, dal buio oltre il bordo, escono gli zombie e le strappano
    P.wall(AX(0),AY(.35)+6,AX(0),AY(3.9)-20,true);P.wall(AX(0),AY(3.9)+20,AX(0),AY(7.3)-6,true);
    P.barricade(AX(0),AY(3.9)-20,AX(0),AY(3.9)+20,{kind:'ferro',out:[-1,0],n0:2,th:12,reach:42,hop:16,zfx:28});holes.push([AX(0)-34,AY(3.9),1,'fuori']);
    for(const[x,y,k,o] of[[2.9,1.4,1],[1,3.2,0,{wreath:1}],[1.9,3.3,2],[2.85,3.25,3],[.95,5,1,{lean:.12}],[2.9,5.1,0,{candle:1}],[1,6.5,2,{lean:-.15}],[2.85,6.55,0]])P.grave(AX(x),AY(y),k,o);
    // l'albero un po' più a ovest che nell'anteprima: tra l'albero e il muro ora passano gli zombie (prima 30 px)
    P.openGrave(AX(1.6),AY(4.95));P.tree(AX(2.8),AY(2.25),true,1.05);P.sign(AX(5.12),AY(5.38),'Cimitero','Casa');
    ZM.group([AX(5.5),AY(1),AX(9.2),AY(3.5)],()=>{P.house(AX(5.5),AY(1),3.7*T,2.5*T,{wall:'siding',roof:'shingle',boards:[1]});
      P.fence(AX(5.2),AY(4.25),AX(6.65),AY(4.25));P.fence(AX(8.05),AY(4.25),AX(9.85),AY(4.25));P.fence(AX(9.85),AY(.9),AX(9.85),AY(4.25));
      P.pumpkin(AX(6.85),AY(4.05),1,true);P.pumpkin(AX(7.85),AY(4.1),1.2,true)});P.pumpkin(AX(9.6),AY(4.42),.9,false);
    P.lamp(AX(3.95),AY(4.45));P.lamp(AX(5.35),AY(8.6));P.well(AX(8.4),AY(6.2));P.barrow(AX(6.3),AY(5.75));
    P.crate(AX(8.95),AY(4.7));P.crate(AX(9.32),AY(4.74),.8);P.barrel(AX(9.5),AY(5.25));P.rock(AX(6.3),AY(7.45),11);P.bush(AX(5.55),AY(7.95),1);P.hay(AX(6.75),AY(6.95));
    P.tree(AX(8.9),AY(8.6),false,1.05);P.tree(AX(.7),AY(9.1),false,.85);
    holes.push([AX(8.1),AY(7.9),1],[AX(2.3),AY(9.2),1]);
    perches.push({x:AX(2),y:AY(7.3),z:52,t:0},{x:AX(2.85),y:AY(3.25),z:58,t:2});
    // novità dell'area di partenza: il confine con la cancellata e il cancello della fattoria, dietro la cripta l'albero morto e una fossa nuova,
    // dietro la casa la catasta col ceppo e lo stendibiancheria e il Revolver col gesso; a est la latrina, la lanterna sul palo, una buca, la
    // quercia morta e la legna; il cespuglio spostato dalla strada nuova
    P.wall(X(2),Y(12.3),X(5.7)-15,Y(12.3),true);P.wall(X(7.2)+15,Y(12.3),X(16),Y(12.3),true);
    const gate=AREA.gate=P.farmGate(X(5.7),X(7.2),Y(12.3),750,'Fattoria dei Corvi');
    P.tree(X(2.75),Y(12.95),true,.95);P.openGrave(X(3.75),Y(13.4));
    P.woodpile(X(8.0),Y(13.05),X(9.25)-X(8.0),Y(13.55)-Y(13.05),20);P.chopBlock(X(9.6),Y(13.35));P.clothesline(X(10.05),X(11.75),Y(13.6));
    P.bush(X(7.28),Y(14.35),1);
    const oh=P.outhouse(X(12.6),Y(14.55));holes.push([X(12.6)+20,Y(14.55)+64,1,'porta',()=>oh.bang()]);
    P.lanternPole(X(12.85),Y(17.4),-1);holes.push([X(13.05),Y(20.0),1]);P.tree(X(13.1),Y(22.4),true,1.15);P.woodpile(X(12.3),Y(18.7),X(12.9)-X(12.3),Y(19.15)-Y(18.7),16);
    // il Revolver col gesso sul muro nord della casa (si vede da nord); si compra stando lì dietro
    const face=(name,tagW,key,test)=>{for(const p of ZM.props){if(p.name!==name)continue;for(const t of p.parts)if(t.part===tagW&&t.k==='face'&&t.key===key&&(!test||test(t)))return t}return null};
    const nWall=face('house','wN','n');ZM.group([AX(5.5),AY(1),AX(9.2),AY(3.5)],()=>P.wallGun(X(9.6),Y(15)-.6,22,'x','revolver',500,nWall));// si piega con la casa
    // ================================================================ AREA 2: la Fattoria dei Corvi
    // il granturco: file da nord a sud fino al margine (y 3,25), oltre il bordo della mappa; non si attraversa; si apre intorno al poggio del
    // mulino e ai pali degli spaventapasseri
    const rows=[];for(let k=0,yy=-1.82;yy<3.12;k++,yy+=.53)rows.push(yy);
    const skip=(x,y)=>Math.hypot(x-X(14.4),(y-Y(1.6))*1.2)<1.45*T||Math.hypot(x-X(4.4),y-Y(1.7))<.42*T||Math.hypot(x-X(11.3),y-Y(1.5))<.42*T;
    rows.forEach((ry,k)=>{for(let s=0;s<4;s++)P.cornRow(X(s*4)+(s?0:6),X(s*4+4)-(s===3?6:0),Y(ry),k*31+s*7+3,skip)});
    solid(0,0,X(16),Y(3.2),'corn');
    P.scarecrowPole(X(4.4),Y(1.7));P.scarecrowPole(X(11.3),Y(1.5));P.windmill(X(14.4),Y(1.6));
    // la staccionata tra il campo e l'aia, rotta dove escono gli zombie (tre varchi coi paletti a terra)
    // (anteprima 48: i tre varchi sono barriere, barriere.js: due assi vecchie inchiodate di traverso che gli zombie strappano per entrare
    // nell'aia e che l'eroe rimette; il varco di mezzo stretto come gli altri)
    for(const[a,b] of[[.15,2.25],[2.95,7.6],[8.4,12.05],[12.75,15.85]])P.fence(X(a),Y(3.55),X(b),Y(3.55));
    for(const[a,b] of[[2.25,2.95],[7.6,8.4],[12.05,12.75]])P.barricade(X(a),Y(3.55),X(b),Y(3.55),{kind:'legno',out:[0,-1],n0:2,reach:42});
    P.fallenPickets(X(2.6),Y(3.66),3);P.fallenPickets(X(8.0),Y(3.72),2);P.fallenPickets(X(12.4),Y(3.66),3);
    holes.push([X(2.6),Y(3.05),2,'mais'],[X(8.0),Y(3.0),2,'mais'],[X(12.4),Y(3.05),2,'mais']);
    // la casa colonica: la casa dell'anteprima girata di un quarto (porta e portico a est, sull'aia), di pietra col tetto di coppi e le
    // finestre inchiodate; si entra e il tetto sparisce
    {const cx=X(2.32),cy=Y(5.95),wl=X(7.6)-X(4.3),dl=X(4.0)-X(.5);ZM.turn(cx,cy,1,()=>P.house(cx-wl/2,cy-dl/2,wl,dl,{wall:'stoneW',roof:'tile',boards:[0,1,2]}))}
    P.pump(X(5.15),Y(7.5));P.trough(X(5.15)+13,Y(7.36),44,18);P.well(X(7.8),Y(6.6));
    P.hay(X(10.0)-17,Y(4.6)-11);P.hay(X(10.0)-17,Y(7.7)-11);P.barrel(X(4.95),Y(4.65));P.barrel(X(5.25),Y(4.5),.85);P.crate(X(10.05),Y(5.35));
    for(const[k,x,y,z] of IDLE)ZM.idleZombie(k,X(x),Y(y),z);
    // il fienile rosso col portone sull'aia; la Pompa da caccia col gesso sul muro ovest, a sud del portone
    const barn=P.barn(X(11.0),Y(4.12),X(15.4)-X(11.0),Y(8.32)-Y(4.12));// (36 px dalla staccionata: niente corridoi tra 18 e 34 px)
    const wWall=face('barn','wW','w',t=>Math.min(...t.c.map(q=>q[1]))>Y(6.5));ZM.group([X(11.0),Y(4.12),X(15.4),Y(8.32)],()=>P.wallGun(X(11.0)-.6,Y(7.45),22,'y','pompa',1500,wWall));
    perches.push({x:X(13.2),y:Y(5.0),z:155,t:0},{x:X(13.2),y:Y(7.5),z:155,t:1.4});
    // la rimessa con la mola, l'orto delle zucche coi sacchi del Becchino e la terra smossa, il recinto dei maiali col fango, la cuccia, il pollaio
    // (la rimessa con la mola è passata nella segheria: qui ora si va verso la barriera di tronchi)
    for(const[x,y,s,c] of[[10.8,9.3,1,1],[11.5,11.2,1.1,0],[12.6,10.4,.9,1],[12.9,11.4,1.2,0],[10.7,10.6,.8,0],[11.9,9.4,.85,0],[12.2,11.45,.7,1]])P.pumpkin(X(x),Y(y),s,!!c,!c&&s<.9);
    P.sack(X(12.7),Y(9.2),1,true);P.sack(X(13.02),Y(9.42),.9,true);holes.push([X(11.6),Y(10.45),2,'orto']);
    P.fence(X(.7),Y(8.4),X(3.7),Y(8.4));P.fence(X(.7),Y(10.6),X(3.7),Y(10.6));P.fence(X(.7),Y(8.4),X(.7),Y(10.6),{noStart:1});
    P.fence(X(3.7),Y(8.4),X(3.7),Y(9.2),{noStart:1,endPost:1});P.fence(X(3.7),Y(9.8),X(3.7),Y(10.6));
    P.trough(X(2.75),Y(8.62),34,13);holes.push([X(2.2),Y(9.6),2,'fango']);
    P.kennel(X(4.35),Y(10.15),[X(5.3),Y(9.95)]);P.coop(X(.6),Y(10.74),X(2.1)-X(.6),Y(11.68)-Y(10.74));
    // la tettoia col carretto del Becchino (accanto, uno dei posti della Bara), la lanterna sul palo lungo la strada, i confini della fattoria
    P.shelter(X(7.6),Y(10.1),X(10.0)-X(7.6),Y(11.5)-Y(10.1));P.cart(X(7.75),Y(10.42));
    P.lanternPole(X(5.5),Y(11.35),1);
    P.fence(X(0),Y(11.95),X(2),Y(11.95));P.fence(X(14),Y(11.95),X(16),Y(11.95));
    const EAST=buildEast(w,h);AREA.bars=[EAST.b13,EAST.b34,EAST.b24];
    // ================================================================ il gioco: il cancello, le armi a muro, la Bara, il velo sulla fattoria
    W.gate={x:X(6.45),y:Y(12.3),open:false,lure:4.2*T,slots:[[X(6.45)-20,Y(12.3)-21],[X(6.45)+3,Y(12.3)-19],[X(6.45)+22,Y(12.3)-22],[X(6.45)-40,Y(12.3)-30],[X(6.45)+40,Y(12.3)-29]]};
    W.split=veil();
    ZM.buyable({id:'cancello',x:X(6.45),y:Y(12.3)+28,r:74,show:()=>!gate.state.open,label:()=>'Cancello della Fattoria',price:()=>750,
      act(){if(W.coins<750)return false;W.coins-=750;gate.open();W.zoneOpen[2]=true;W.gate.open=true;if(W.split)W.split.fade=true;ZM.navRebuild();W.toast=['La Fattoria dei Corvi è aperta',2.6];return true}});
    // le barriere a pagamento tra le zone nuove (punto 16): si compra da tutte e due le parti; aprono le due zone che collegano
    for(const[b,zs,nm] of[[EAST.b13,[3],'Borgo dei Lumi'],[EAST.b34,[3,4],null],[EAST.b24,[2,4],null]])
      ZM.buyable({id:'zona'+zs.join(''),x:b.x,y:b.y,r:78,show:()=>!b.state.open,label:()=>nm||(zs.map(z=>W.zoneOpen[z]).every(Boolean)?'Passaggio':W.zoneOpen[zs[0]]?NOMI[zs[1]]:NOMI[zs[0]]),price:()=>b.price,
        act(){if(b.state.open||W.coins<b.price)return false;W.coins-=b.price;b.open();const nu=zs.filter(z=>!W.zoneOpen[z]);for(const z of zs)W.zoneOpen[z]=true;if(W.split&&(W.zoneOpen[2]||W.zoneOpen[4]))W.split.fade=true;ZM.navRebuild();
          W.toast=[nu.length?NOMI[nu[0]]+': aperta':'Il passaggio è aperto',2.6];try{if(AU.ctx&&AU.on.sfx){const t=AU.ctx.currentTime+.01;M.wood(t,1.2,VR(180,.05));fThump(t,90,40,.4,.5,.3);fNoise(t,.6,'lowpass',700,.7,.25,{brown:true})}}catch(e){}return true}});
    // (anteprima 48) la Pompa tattica è al piano di sopra della Locanda (lv 1: il bottone c'è solo di sopra)
    for(const[id,pr,hx,hy,zone,lv] of[['revolver',500,X(9.6),Y(15)-24,1],['pompa',1500,X(11.0)-26,Y(7.45),2],['mitraglietta',1000,EAST.gun3[0],EAST.gun3[1],3],['mitra',1250,EAST.gun4[0],EAST.gun4[1],4],['tattica',2000,EAST.locanda.gunUp[0],EAST.locanda.gunUp[1],3,1]])
      ZM.buyable({id:'muro_'+id,x:hx,y:hy,r:56,lv:lv||0,show:()=>W.zoneOpen[zone],label:()=>(W.gunId===id?'Colpi: ':'')+(window.ARMI?ARMI.DATI[id].n:id),price:()=>W.gunId===id?Math.round(pr/2):pr,
        act(){const p=W.gunId===id?Math.round(pr/2):pr;if(W.coins<p)return false;W.coins-=p;
          // (anteprima 48, punto 21) la stessa arma: solo i colpi, l'arma resta quella che hai (anche forgiata); un soffio di gesso e il suono dell'arma
          if(W.gunId===id){const g=ZM.gun();g.mag=g.D.mag;g.res=Math.max(g.res,g.D.res*((g.pap||0)+1));if(g.st==='ricarica'&&g.annulla)g.annulla();W.toast=['Colpi: '+(g.nome||g.D.n),1.8]}else ZM.equip(id);
          if(ZM.barriere)ZM.barriere.burst('gesso',hx,hy,26,8,[0,0],24);try{if(window.ARMI&&ARMI.suono)ARMI.suono(id,'ricarica',180);if(AU.ctx&&AU.on.sfx)coinClink(AU.ctx.currentTime+.01,.8)}catch(e){}return true}});
    // la Bara delle Sorprese e i suoi tre posti [x, y, zona, verso della testa]: nel cimitero vicino alla cripta (girata un po', il teschio verso
    // sud), sotto la tettoia accanto al carretto, dentro il fienile nell'angolo a nord-ovest (non nella stalla: lì restava un corridoio di 23 px)
    ZM.sorpresa(X(4.45),Y(16.76),[[X(4.45),Y(16.76),1,.3],[X(9.55),Y(10.85),2,0],[X(12.2),Y(5.0),2,0],[EAST.bara3[0],EAST.bara3[1],3,Math.PI/2],[EAST.bara4[0],EAST.bara4[1],4,0]]);
    // la partita a ondate (partita.js): la Lanterna delle Anime nell'area di partenza, a ovest del sentiero dove si comincia, tra il muretto
    // del cimitero e la buca
    const anime=P.soulLantern(AX(2.55),AY(8.25),1500);ZM.partita({lanterna:anime});
    // le due Macchine della Fortuna (fortuna.js): una a est della partenza, una nell'aia della fattoria appena oltre il cancello (posti larghi:
    // niente corridoi stretti intorno)
    P.fortuneMachine(X(9.2),Y(22.7),0);P.fortuneMachine(X(7.35),Y(8.3),1);
    // (anteprima 48) la Credenza degli Elisir a est della casa, tra la latrina e la lanterna
    P.elisir(X(13.0),Y(16.0));
    // i bordi del mondo e la nebbia ai lati dell'area di partenza
    solid(-200,-200,w+400,200,'edge');solid(-200,h,w+400,200,'edge');solid(-200,0,200,h,'edge');solid(w,0,200,h,'edge');
    solid(0,Y(12.3)+6,X(2),h-Y(12.3)-6,'edge');solid(X(2),Y(24),X(28),h-Y(24),'edge');
    W.hero=HERO0();
    // ================================================================ il terreno
    const onPath=(x,y)=>{if(EAST.cobbled(x,y))return true;const ax=x/T-2,ay=y/T-16;return(ax>3.85&&ax<4.95&&ay>4.2&&ay<10)||(ay>5.05&&ay<6&&ax>3.6&&ax<5)||(ay>4.2&&ay<5.15&&ax>3.85&&ax<7.75)||(ax>6.95&&ax<7.75&&ay>3.4&&ay<5)||(x>X(5.95)&&x<X(6.95)&&y>Y(12.35)&&y<Y(18.3))};
    const nz=(x,y)=>Math.sin(x*.05+y*.031)*7+Math.sin(y*.07-x*.02)*5;
    const inYard=(x,y)=>{const e=nz(x,y),a=x>X(4.7)+e&&x<X(10.8)+e&&y>Y(3.9)+e&&y<Y(9.8)+e,r=x>X(5.9)+e*.4&&x<X(7.0)+e*.4&&y>Y(9.6)&&y<Y(12.3),
      p=x>X(3.95)&&x<X(4.9)+e&&y>Y(5.4)&&y<Y(6.6);if(a||r||p)return 1;const e2=e+9;return(x>X(4.7)+e-9&&x<X(10.8)+e2&&y>Y(3.9)+e-9&&y<Y(9.8)+e2)||(x>X(5.9)-9&&x<X(7.0)+9&&y>Y(9.6)&&y<Y(12.3))?2:0};
    bakeGround(w,h,function*(){yield* G.grass$(w,h);G.cornSoil(0,0,X(16),Y(3.3),rows.map(Y));yield;yield* EAST.paint(w,h);
      G.yard(w,h,inYard,[[[X(6.45),Y(12.3),1,0],[X(6.45),Y(10.4),1,0],[X(7.1),Y(8.9),.9,.4],[X(8.6),Y(7.3),.5,.85],[X(10.6),Y(6.2),.2,1]]]);
      yield;G.furrows(X(10.4),Y(8.9),X(13.2),Y(11.7));G.mud(X(.85),Y(8.55),X(3.55),Y(10.45));yield;
      {const x0=X(11.0),y0=Y(4.12),bw=X(15.4)-x0,bd=Y(8.32)-y0;ctx.fillStyle='#3a2f22';ctx.fillRect(x0,y0,bw,bd);const Q=[new Path2D(),new Path2D()];for(let i=0;i<bw*bd/40;i++){const x=rr(x0,x0+bw),y=rr(y0,y0+bd),p=Q[rr(0,1)<.6?0:1],a=rr(0,6.3);p.moveTo(x,y);p.lineTo(x+Math.cos(a)*4,y+Math.sin(a)*4)}ctx.lineWidth=.9;ctx.strokeStyle='rgba(200,170,90,.5)';ctx.stroke(Q[0]);ctx.strokeStyle='rgba(140,110,50,.5)';ctx.stroke(Q[1])}
      yield;G.floorPlanks(X(2.32)-112,Y(5.95)-105.6,224,211.2);yield;
      G.soil(AX(0),AY(.35),3.7*T,6.95*T);yield;yield* G.cobbles$(w,h,onPath);yield;
      yield* G.tufts$(w,h,(x,y)=>EAST.bare(x,y)||y<Y(3.3)&&x<X(16)||inYard(x,y)===1||onPath(x,y)||(x>X(10.4)&&x<X(13.2)&&y>Y(8.9)&&y<Y(11.7))||(x>X(.7)&&x<X(3.7)&&y>Y(8.4)&&y<Y(10.6))||(x>X(11)&&x<X(15.4)&&y>Y(4.12)&&y<Y(8.32))||(x>X(2.32)-112&&x<X(2.32)+112&&y>Y(4.3)&&y<Y(7.6))||(x<AX(3.7)&&x>AX(0)&&y>AY(.35)&&y<AY(7.3)&&((x*7+y*13)%10)<7));
      yield;G.voidFog(0,Y(12.3)+4,X(2),h,-1);yield;G.voidFog(X(29.3),0,w,h,1);yield;G.voidFogV(0,Y(24)-10,w,h);yield;
      ZM.edgeSnap();yield;
      G.leaves(AX(8.9),AY(8.6),90,120);G.twigs(AX(2.8),AY(2.25),50,40);G.twigs(X(2.75),Y(12.95),40,30);G.twigs(X(13.1),Y(22.4),50,40);yield;
      G.floorPlanks(AX(5.5),AY(1),3.7*T,2.5*T);G.holes();yield;
      for(const[x,y,r] of[[AX(4.4),AY(7.6),14],[AX(5.6),AY(4.7),11],[AX(4.3),AY(5.5),9],[X(6.6),Y(10.9),12],[X(8.4),Y(8.2),10],[X(2.0),Y(9.9),13],[X(1.4),Y(9.1),9]])G.puddle(x,y,r);
      yield;G.feathers(X(2.5),Y(11.2),40,40);G.chips(X(9.6),Y(13.35),26,30);
      // la terra smossa dell'orto da cui escono, e quella sotto la Bara
      for(const[x,y] of[[X(11.6),Y(10.45)],[X(4.45),Y(16.76)]]){ctx.fillStyle='rgba(30,22,14,.75)';ctx.beginPath();ctx.ellipse(x,y,26,15,0,0,6.3);ctx.fill();for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#5a4630':'#3a2c1e';ctx.beginPath();ctx.ellipse(x+rr(-24,24),y+rr(-13,13),rr(2,4),rr(1.4,2.6),rr(0,3),0,6.3);ctx.fill()}}});
    ZM.props.sort((a,b)=>a.ky-b.ky)},
  update(dt){for(const f of ZM.anim||[])f(dt)}};
ZM.AREE.mappa=AREA})();// la costruisce il gioco col menu (src/js/63-zombie.js) o la pagina di prova (anteprime/zombie/mk.py area_mappa)
