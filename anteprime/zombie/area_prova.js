// ---------- AREA DI PROVA per rivedere i prop: un angolo con cimitero, cripta, casa, pozzo, sentiero (10×10 caselle, coordinate dello schermo)
(()=>{const{T,P,G,prop,solid,holes,perches,bakeGround,boot,W,rr,srand}=ZM;
const AREA={title:'Angolo zombie · revisione',
  build(){const w=10*T,h=10*T;srand(11);
    // cimitero a sinistra: muretto con la cancellata, cripta, lapidi, albero morto, fossa aperta
    P.wall(0,.35*T,3.7*T,.35*T,true);P.wall(0,7.3*T,3.7*T,7.3*T,true);P.wall(3.7*T,.35*T,3.7*T,4.85*T,true);P.wall(3.7*T,6.15*T,3.7*T,7.3*T,true);
    P.pillar(3.7*T,4.95*T,2);P.pillar(3.7*T,6.05*T,0);P.gateLeaf(3.7*T,4.95*T,30,-2.1);P.gateLeaf(3.7*T,6.05*T,30,2.2);
    P.crypt(.12*T,1*T,1.9*T,1.35*T);// contro il bordo a ovest (chiuso), dietro un corridoio largo che gli zombie possono fare
    for(const[x,y,k,o] of[[2.9*T,1.4*T,1],[1*T,3.2*T,0,{wreath:1}],[1.9*T,3.3*T,2],[2.85*T,3.25*T,3],[.95*T,5*T,1,{lean:.12}],[2.9*T,5.1*T,0,{candle:1}],[1*T,6.5*T,2,{lean:-.15}],[2.85*T,6.55*T,0]])P.grave(x,y,k,o);
    P.openGrave(1.6*T,4.95*T);P.tree(3*T,2.25*T,true,1.05);P.sign(5.12*T,5.38*T,'Cimitero','Casa');// sull'angolo d'erba dell'incrocio dei sentieri (foto di Denis)
    // la casa con il recinto davanti, le zucche, i lampioni, il pozzo, la carriola, le casse
    // casa, recinto e zucche del cancelletto si piegano tutti insieme (col riquadro della casa: ai suoi bordi la piega è quella vera, così le
    // pareti si piegano sempre via dall'eroe): niente si muove per conto suo (Denis, 12 ottobre)
    ZM.group([5.5*T,1*T,9.2*T,3.5*T],()=>{P.house(5.5*T,1*T,3.7*T,2.5*T,{wall:'siding',roof:'shingle',boards:[1]});
      P.fence(5.2*T,4.25*T,6.65*T,4.25*T);P.fence(8.05*T,4.25*T,9.85*T,4.25*T);P.fence(9.85*T,.9*T,9.85*T,4.25*T);
      P.pumpkin(6.85*T,4.05*T,1,true);P.pumpkin(7.85*T,4.1*T,1.2,true)});P.pumpkin(9.25*T,4.7*T,.9,false);
    P.lamp(4.2*T,4.3*T);P.lamp(5.35*T,8.6*T);P.well(8.4*T,6.2*T);P.barrow(6.3*T,5.75*T);
    P.crate(8.95*T,4.7*T);P.crate(9.32*T,4.74*T,.8);P.barrel(9.5*T,5.25*T);P.rock(6.3*T,7.45*T,11);P.bush(5.55*T,7.95*T,1);P.hay(6.75*T,6.95*T);P.bush(4.9*T,2.2*T,1);
    P.tree(8.9*T,8.6*T,false,1.05);P.tree(.7*T,9.1*T,false,.85);
    holes.push([8.1*T,7.9*T],[2.3*T,9.2*T]);
    perches.push({x:2*T,y:7.3*T,z:52,t:0},{x:2.85*T,y:3.2*T,z:58,t:2});
    // i bordi del mondo
    solid(-200,-200,w+400,200,'edge');solid(-200,h,w+400,200,'edge');solid(-200,0,200,h,'edge');solid(w,0,200,h,'edge');
    W.hero={x:4.4*T,y:8.4*T,face:-Math.PI/2,walk:0,moving:false,aim:0,fireCd:0};
    const onPath=(x,y)=>(x>3.85*T&&x<4.95*T&&y>4.2*T)||(y>5.05*T&&y<6*T&&x>3.6*T&&x<5*T)||(y>4.2*T&&y<5.15*T&&x>3.85*T&&x<7.75*T)||(x>6.95*T&&x<7.75*T&&y>3.4*T&&y<5*T);
    bakeGround(w,h,()=>{G.grass(w,h);G.soil(0,.35*T,3.7*T,6.95*T);G.cobbles(w,h,onPath);G.tufts(w,h,(x,y)=>onPath(x,y)||(x<3.7*T&&y>.35*T&&y<7.3*T&&((x*7+y*13)%10)<7));
      G.leaves(8.9*T,8.6*T,90,120);G.twigs(3*T,2.25*T,50,40);G.floorPlanks(5.5*T,1*T,3.7*T,2.5*T);G.holes();for(const[x,y,r] of[[4.4*T,7.6*T,14],[5.6*T,4.7*T,11],[4.3*T,5.5*T,9]])G.puddle(x,y,r)});
    props.sort((a,b)=>a.ky-b.ky)}};
const props=ZM.props;
if(document.readyState==='complete')setTimeout(()=>boot(AREA),300);else window.addEventListener('load',()=>setTimeout(()=>boot(AREA),300))})();
