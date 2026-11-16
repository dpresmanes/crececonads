/* Página /agentes: oficina isométrica con los agentes de CreceConAds según sus horarios reales (hora de Buenos Aires). */
(()=>{
const DIAS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const LV=[1,2,3,4,5], TODOS=[0,1,2,3,4,5,6];
const DEP={
  1:{n:"Marketing propio",c:"--d1"},2:{n:"Ventas",c:"--d2"},3:{n:"Pauta de clientes",c:"--d3"},
  4:{n:"Agentes de WhatsApp",c:"--d4"},5:{n:"Operaciones",c:"--d5"},0:{n:"Dirección",c:"--d0"}
};
const OF=document.querySelector(".oficina"),_cache={};
const css=v=>_cache[v]||(_cache[v]=getComputedStyle(OF).getPropertyValue(v).trim());
const t=(d,h,dur,txt)=>({d,ini:h2m(h),dur,txt});
function h2m(h){const[a,b]=h.split(":").map(Number);return a*60+b}

// Agentes y horarios (hora de Buenos Aires)
const AG=[
 {id:"ceo",n:"CEO",dep:0,rol:"Reparte el trabajo, controla las entregas y le responde a Damián en un solo parte.",
  s:[t(LV,"9:00",60,"Leyendo el tablero y repartiendo el día"),t(LV,"13:00",30,"Controlando lo que entregó el equipo"),t(LV,"18:30",45,"Armando el parte del día para Damián")]},
 {id:"inv",n:"Investigador",dep:1,rol:"Encuentra los temas que preocupan a los dueños de pymes.",s:[t([0],"10:00",60,"Buscando los temas de la semana"),t([3],"11:00",40,"Mirando qué funciona en la competencia")]},
 {id:"car",n:"Carruseles",dep:1,rol:"Diseña los carruseles y las historias del día.",s:[t(TODOS,"11:30",50,"Armando el carrusel corto"),t(TODOS,"15:00",50,"Armando el carrusel imán"),t(TODOS,"18:10",70,"Armando el carrusel principal")]},
 {id:"vid",n:"Animador",dep:1,rol:"Anima los videos de gancho y cierre con la marioneta de Damián.",s:[t(TODOS,"14:00",55,"Animando el video de gancho")]},
 {id:"ree",n:"Editor de reels",dep:1,rol:"Edita los videos de Damián: cortes, animaciones y ritmo.",s:[t([1,3,5],"16:45",50,"Editando el reel de la semana")]},
 {id:"rec",n:"Recursos",dep:1,rol:"Arma el recurso gratis que recibe quien comenta la palabra clave.",s:[t(TODOS,"15:50",25,"Preparando el recurso gratis del post")]},
 {id:"pro",n:"Programador",dep:1,rol:"Deja programadas las publicaciones y controla que salgan.",s:[t(TODOS,"12:25",10,"Controlando que salga el corto"),t(TODOS,"16:20",8,"Controlando que salga el imán"),t(TODOS,"19:40",25,"Controlando el principal y las historias"),t([0],"20:30",30,"Programando la semana que viene")]},
 {id:"pub",n:"Publicador",dep:1,rol:"Publica en @crececonads y lee las métricas oficiales.",pub:true,s:[t(TODOS,"12:30",6,"Publicando el carrusel corto"),t(TODOS,"16:00",6,"Publicando el carrusel imán"),t(TODOS,"19:30",6,"Publicando el carrusel principal"),t(TODOS,"20:00",8,"Publicando las historias")]},
 {id:"met",n:"Métricas",dep:1,rol:"Mide cada publicación a las 48 horas y compara formatos.",s:[t(TODOS,"21:00",20,"Leyendo las métricas de hace 48 horas")]},
 {id:"seo",n:"Web y SEO",dep:1,rol:"Escribe las guías de crececonads.site y cuida el posicionamiento.",s:[t([1],"9:42",40,"Revisando Search Console y Bing"),t([2,4],"9:12",30,"Escribiendo la guía corta"),t([2],"10:40",60,"Escribiendo la guía semanal")]},
 {id:"vme",n:"Vigía de Meta",dep:1,rol:"Lee las novedades de Meta Ads y actualiza las reglas vigentes.",s:[t(TODOS,"8:23",20,"Leyendo las novedades de Meta Ads"),t([1],"8:47",15,"Repaso semanal de cambios de Meta")]},
 {id:"via",n:"Vigía de IA",dep:1,rol:"Sigue las novedades de IA y propone entradas para la web.",s:[t(TODOS,"10:12",20,"Buscando novedades de IA")]},
 {id:"fue",n:"Fuentes",dep:2,rol:"Descubre y prueba fuentes nuevas de marcas para contactar.",s:[t([3],"11:00",60,"Probando una fuente nueva de marcas")]},
 {id:"ext",n:"Extractor",dep:2,rol:"Verifica marcas de moda en la Biblioteca de Anuncios.",s:[t(LV,"10:00",60,"Verificando marcas en la Biblioteca de Anuncios")]},
 {id:"clo",n:"Closer",dep:2,rol:"Prepara llamadas, propuestas y respuestas.",s:[t(LV,"16:30",45,"Preparando propuestas y respuestas")]},
 {id:"big",n:"Bot de Instagram",dep:2,rol:"Responde por DM a quien comenta la palabra clave.",siempre:"Respondiendo comentarios con palabra clave",s:[]},
 {id:"bwa",n:"Bot de WhatsApp",dep:2,rol:"Atiende las consultas que llegan desde la web.",siempre:"Atendiendo consultas de la web",s:[t([1],"9:00",15,"Revisión semanal de las conversaciones")]},
 {id:"mb",n:"Media buyer",dep:3,rol:"Arma y ajusta las campañas de los clientes. Nada sale sin el OK de Damián.",s:[t(LV,"10:30",120,"Armando y ajustando campañas"),t(LV,"15:00",90,"Revisando creativos y copys")]},
 {id:"ctl",n:"Control diario",dep:3,rol:"Revisa gasto, resultados y alertas de todas las cuentas cada mañana.",s:[t(TODOS,"8:44",15,"Revisando gasto y alertas de todas las cuentas")]},
 {id:"rep",n:"Reporte semanal",dep:3,rol:"Arma el informe semanal de cada cuenta.",s:[t([1],"9:12",30,"Armando el reporte semanal de cada cuenta")]},
 {id:"wat",n:"Técnico de WhatsApp",dep:4,rol:"Mantiene la plataforma de agentes de WhatsApp y su panel.",s:[t(LV,"14:00",90,"Mejorando el panel de los agentes")]},
 {id:"ope",n:"Operaciones",dep:5,rol:"Cuida accesos, conectores y el orden del equipo.",s:[t(LV,"9:30",30,"Revisando accesos y conectores")]},
 {id:"par",n:"Parte semanal",dep:5,rol:"Junta lo de toda la semana en un parte para Damián.",s:[t([5],"17:37",25,"Armando el parte semanal de la agencia")]},
];

// Plano: zonas, puestos y muebles (en baldosas)
const W=22,H=16;
const ZONAS=[
 {dep:1,x:0,y:0,w:12,h:6},{dep:2,x:12,y:0,w:10,h:6},
 {dep:3,x:0,y:8,w:8,h:8},{dep:0,x:8,y:8,w:6,h:8},{dep:4,x:14,y:8,w:8,h:4},{dep:5,x:14,y:12,w:8,h:4}
];
const PUESTOS={
 1:[[0.5,0.9],[2.4,0.9],[4.3,0.9],[6.2,0.9],[8.1,0.9],[10.0,0.9],[0.5,3.6],[2.4,3.6],[4.3,3.6],[6.2,3.6],[8.1,3.6]],
 2:[[13.4,0.9],[16.0,0.9],[18.6,0.9],[14.2,3.6],[17.4,3.6]],
 3:[[2.0,9.0],[4.6,9.0],[2.0,12.2]],
 0:[[9.2,9.0]],
 4:[[15.2,8.9]],
 5:[[15.2,12.7],[17.9,12.7]]
};
const usados={1:0,2:0,3:0,4:0,5:0,0:0};
AG.forEach(a=>{const p=PUESTOS[a.dep][usados[a.dep]++];a.x=p[0];a.y=p[1];a.fase=Math.random()*6;a.robot=!!a.siempre});
const VIDRIOS=[["x",12,0,4.4],["y",8,0,2.8],["y",8,4.6,7.6],["x",8,8.6,12.6],["x",14,8,10.4],["x",14,12.6,16],["y",12,16.6,22]];
const PLANTAS=[[11.4,6.2],[13.4,15.2],[7.3,15.2],[21.3,7.1],[0.3,7.3],[21.3,0.4]];

// Estado temporal
const lienzo=document.getElementById("lienzo"),ctx=lienzo.getContext("2d");
const $=id=>document.getElementById(id);
let modo="vivo",simMin=600,simDia=1,play=false,sel=null,foco=0,ultFoco=0,T_ACT={dia:1,min:600};
function ahoraBA(){
  const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Argentina/Buenos_Aires",hour12:false,hour:"2-digit",minute:"2-digit",weekday:"short"}).formatToParts(new Date());
  const g=k=>p.find(x=>x.type===k).value;
  const wd=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"));
  return {dia:wd,min:(Number(g("hour"))%24)*60+Number(g("minute"))};
}
function tiempo(){return modo==="vivo"?ahoraBA():{dia:simDia,min:Math.floor(simMin)}}
function estado(a,T){
  for(const s of a.s){if(s.d.includes(T.dia)&&T.min>=s.ini&&T.min<s.ini+s.dur)return{on:true,txt:s.txt}}
  if(a.siempre)return{on:true,txt:a.siempre};
  return{on:false,txt:proximo(a,T)};
}
function proximo(a,T){
  for(let k=0;k<8;k++){const d=(T.dia+k)%7;
    const c=a.s.filter(s=>s.d.includes(d)&&(k>0||s.ini>T.min)).sort((p,q)=>p.ini-q.ini)[0];
    if(c){const hh=String(Math.floor(c.ini/60)).padStart(2,"0")+":"+String(c.ini%60).padStart(2,"0");
      return "Próxima tarea: "+(k===0?"hoy":k===1?"mañana":DIAS[d].toLowerCase())+" "+hh+" · "+c.txt.charAt(0).toLowerCase()+c.txt.slice(1)}}
  return "Sin tareas programadas";
}
const fmt=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");

// Proyección isométrica
let TW=56,TH=28,OX=0,OY=0,WALL=100;
function ajustar(){
  const ancho=lienzo.clientWidth||1100,dpr=Math.min(window.devicePixelRatio||1,2);
  TW=ancho/((W+H)/2+1.2);TH=TW/2;WALL=TW*1.9;
  const alto=(W+H)*TH/2+WALL+TH*1.4;
  lienzo.width=Math.round(ancho*dpr);lienzo.height=Math.round(alto*dpr);
  lienzo.style.height=alto+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  OX=H*TW/2+TW*.6;OY=WALL+TH*.7;
}
const iso=(x,y,z=0)=>[OX+(x-y)*TW/2,OY+(x+y)*TH/2-z];
function poli(pts,fill,stroke,lw){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||1;ctx.stroke()}}
function caja(x,y,w,d,h,top,izq,der,z0=0){
  poli([iso(x,y+d,z0),iso(x+w,y+d,z0),iso(x+w,y+d,z0+h),iso(x,y+d,z0+h)],izq);
  poli([iso(x+w,y,z0),iso(x+w,y+d,z0),iso(x+w,y+d,z0+h),iso(x+w,y,z0+h)],der);
  poli([iso(x,y,z0+h),iso(x+w,y,z0+h),iso(x+w,y+d,z0+h),iso(x,y+d,z0+h)],top);
}
// Dibujo plano sobre una cara vertical: X = cara paralela al eje x (pared del fondo), Y = paralela al eje y (pared izquierda, se recorre hacia y menor)
function planoX(x0,y0,zTop,fn){const p=iso(x0,y0,zTop);ctx.save();ctx.transform(1,.5,0,1,p[0],p[1]);fn(TW/2);ctx.restore()}
function planoY(x0,y0,zTop,fn){const p=iso(x0,y0,zTop);ctx.save();ctx.transform(1,-.5,0,1,p[0],p[1]);fn(TW/2);ctx.restore()}
function hex(h){if(h.startsWith("rgb"))return h.match(/\d+/g).slice(0,3).map(Number);h=h.replace("#","");return[0,2,4].map(i=>parseInt(h.substr(i,2),16))}
function mezcla(a,b,k){const pa=hex(a),pb=hex(b);return `rgb(${pa.map((v,i)=>Math.round(v+(pb[i]-v)*k)).join(",")})`}
function alfa(c,a){const p=hex(c);return `rgba(${p[0]},${p[1]},${p[2]},${a})`}
function luzDia(min){const h=min/60;if(h<6||h>=21.5)return 0;if(h<8)return(h-6)/2;if(h>19.5)return 1-(h-19.5)/2;return 1}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
const F=(peso,px,fam)=>`${peso} ${px}px ${fam==="m"?'"IBM Plex Mono", monospace':fam==="d"?'"Bricolage Grotesque", system-ui, sans-serif':'"DM Sans", system-ui, sans-serif'}`;

// Paredes y lo que cuelga de ellas
function ventana(T,luz,seg,ancho,semilla){
  const w=ancho*T,h=WALL*.36;
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,mezcla("#050816","#3D6BFF",luz));g.addColorStop(1,mezcla("#141B3D","#9DB6FF",luz));
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  if(luz<.4){ctx.fillStyle="rgba(238,241,250,.8)";for(let i=0;i<6;i++){const sx=((semilla*97+i*53)%100)/100*w,sy=((semilla*31+i*71)%60)/100*h;ctx.fillRect(sx,sy,1.2,1.2)}}
  let x=0,i=0;while(x<w){const bw=(10+((semilla*13+i*29)%14))*T/29,bh=h*(.25+((semilla*7+i*17)%50)/100);
    ctx.fillStyle=mezcla("#070B19","#2A3768",luz);ctx.fillRect(x,h-bh,bw-1,bh);
    if(luz<.6){for(let r=0;r<bh/6-1;r++)for(let c=0;c<bw/5-1;c++){if((semilla+i*3+r*7+c*5)%4===0){ctx.fillStyle=(r+c+i)%3?"rgba(255,214,140,.55)":"rgba(109,139,255,.6)";ctx.fillRect(x+2+c*5,h-bh+3+r*6,2,2.5)}}}
    x+=bw;i++}
  ctx.strokeStyle="#3A4A86";ctx.lineWidth=3;ctx.strokeRect(0,0,w,h);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
  ctx.fillStyle="#24315A";ctx.fillRect(-3,h,w+6,4);
}
function cartel(txt,color,T,anchoTiles,tam){
  ctx.font=F(800,tam,"d");const tw=ctx.measureText(txt).width,pad=tam*.7,w=tw+pad*2,h=tam*1.7,x=(anchoTiles*T-w)/2;
  ctx.shadowColor=color;ctx.shadowBlur=12;ctx.fillStyle="#0A0F1F";rr(x,-h/2,w,h,h*.3);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+pad*.55,0,tam*.14,0,7);ctx.fill();
  ctx.textAlign="left";ctx.textBaseline="middle";ctx.shadowColor=color;ctx.shadowBlur=8;ctx.fillStyle="#EEF1FA";ctx.fillText(txt,x+pad,1);ctx.shadowBlur=0;ctx.textBaseline="alphabetic";
}
function reloj(T,min){
  const r=T*.27;ctx.fillStyle="#EEF1FA";ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.strokeStyle="#24315A";ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle="#0A0F1F";ctx.lineCap="round";const h=(min/60)%12,m=min%60;
  ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(h/12*6.283)*r*.5,-Math.cos(h/12*6.283)*r*.5);ctx.stroke();
  ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(m/60*6.283)*r*.78,-Math.cos(m/60*6.283)*r*.78);ctx.stroke();
  ctx.fillStyle="#2F5BFF";ctx.beginPath();ctx.arc(0,0,2,0,7);ctx.fill();
}
function calendario(T){
  const w=1.35*T,h=WALL*.22;ctx.fillStyle="#EEF1FA";rr(0,0,w,h,2);ctx.fill();
  ctx.fillStyle="#0A0F1F";ctx.font=F(500,Math.max(5,T*.11),"m");ctx.textAlign="left";ctx.fillText("CONTENIDO",4,T*.15);
  const cw=(w-8)/7,ch=(h-T*.22)/4;
  for(let r=0;r<4;r++)for(let c=0;c<7;c++){ctx.fillStyle=(r*7+c)%3===0?"#6D8BFF":(r*7+c)%5===0?"#2FD08F":"#D7DCEB";ctx.fillRect(4+c*cw,T*.2+r*ch,cw-1.5,ch-1.5)}
}
function kanban(T,seg){
  const w=1.5*T,h=WALL*.22;ctx.fillStyle="#EEF1FA";rr(0,0,w,h,2);ctx.fill();
  ctx.fillStyle="#0A0F1F";ctx.font=F(500,Math.max(5,T*.11),"m");ctx.textAlign="left";ctx.fillText("PIPELINE",4,T*.15);
  const cols=["#6D8BFF","#FFB547","#2FD08F"],cw=(w-8)/3;
  cols.forEach((c,i)=>{for(let k=0;k<4-i;k++){ctx.fillStyle=c;ctx.fillRect(4+i*cw+1.5,T*.22+k*(h*.17),cw-4,h*.12)}});
}
const LOGO_C=new Path2D("M42 22.5a13 13 0 1 0 0 19");
function logoCartel(T){
  // isotipo en neón, sin texto: la C con el punto verde se lee bien en la pared inclinada
  const lado=WALL*.4,k=lado/64;
  ctx.save();ctx.scale(k,k);
  ctx.lineCap="round";ctx.shadowColor="#6D8BFF";ctx.shadowBlur=18/k;ctx.strokeStyle="#6D8BFF";ctx.lineWidth=6;ctx.stroke(LOGO_C);
  ctx.shadowBlur=6/k;ctx.strokeStyle="#C9D4FF";ctx.lineWidth=2;ctx.stroke(LOGO_C);
  ctx.shadowColor="#2FD08F";ctx.shadowBlur=16/k;ctx.fillStyle="#2FD08F";ctx.beginPath();ctx.arc(45,32,4.5,0,7);ctx.fill();
  ctx.restore();ctx.shadowBlur=0;
}
function tablero(T,seg,luz){
  const w=2.8*T,h=WALL*.3;ctx.shadowColor="#2F5BFF";ctx.shadowBlur=16;ctx.fillStyle="#070B17";rr(-5,-5,w+10,h+10,6);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle="#0E1530";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#A3ACC8";ctx.font=F(500,Math.max(5,T*.11),"m");ctx.textAlign="left";ctx.fillText("RESULTADOS",6,T*.17);
  const base=h-8,n=14,bw=(w*.55)/n;
  for(let i=0;i<n;i++){const v=.3+.55*Math.abs(Math.sin(i*.9+1.3))+.05*Math.sin(seg*1.5+i);ctx.fillStyle=i===n-1?"#2FD08F":"#2F5BFF";ctx.fillRect(8+i*bw,base-v*(h*.6),bw-2,v*(h*.6))}
  ctx.strokeStyle="#2FD08F";ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<10;i++){const x=w*.62+i*(w*.34/9),y=base-h*(.2+.4*(i/9)+.06*Math.sin(i*1.7));i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
}
function pizarra(T){
  const w=1.6*T,h=TH*2.1;ctx.fillStyle="#EEF1FA";rr(0,0,w,h,2);ctx.fill();ctx.strokeStyle="#A3ACC8";ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle="#2F5BFF";ctx.lineWidth=1.6;[[.15,.25,.7],[.15,.42,.5],[.15,.59,.62]].forEach(([x,y,l])=>{ctx.beginPath();ctx.moveTo(w*x,h*y);ctx.lineTo(w*(x+l),h*y);ctx.stroke()});
  ctx.fillStyle="#FFB547";ctx.fillRect(w*.62,h*.68,w*.2,h*.2);ctx.fillStyle="#2FD08F";ctx.fillRect(w*.38,h*.7,w*.2,h*.18);
}

// Muebles
function escritorio(a,T,seg,luz){
  const e=estado(a,T),x=a.x,y=a.y+.2,ancho=a.dep===0?1.8:1.3,top=TH*.78;
  if(a.robot){
    caja(x,y+.35,ancho,.5,top,"#2A3768","#18213F","#202B55");
    poli([iso(x,y+.85,top*.2),iso(x+ancho,y+.85,top*.2),iso(x+ancho,y+.85,top*.85),iso(x,y+.85,top*.85)],null,alfa("#2FD08F",.35+.25*Math.sin(seg*2+a.fase)),2);
    return;
  }
  caja(x,y,ancho,.5,top,"#33427A","#18213F","#222D5A");
  caja(x+.06,y+.44,ancho-.12,.06,top*.08,"#3A4A86","#24315A","#2A3768",top*.92);
  const monitores=a.dep===0?[x+.12,x+.86]:[x+.18];
  monitores.forEach((mx,i)=>monitor(a,e,mx,y+.06,top,seg,i));
  caja(x+.25,y+.32,.5,.12,TH*.03,"#A3ACC8","#6E7899","#808AAD",top);
  const m=iso(x+ancho-.2,y+.28,top);ctx.fillStyle="#EEF1FA";ctx.fillRect(m[0]-TW*.04,m[1]-TW*.09,TW*.08,TW*.09);ctx.fillStyle="#2F5BFF";ctx.fillRect(m[0]-TW*.04,m[1]-TW*.06,TW*.08,TW*.025);
  if(a.dep===0)caja(x+1.55,y+.12,.12,.12,TH*.55,"#2FD08F","#1E8F61","#25A874",top);
}
function monitor(a,e,x,y,top,seg,idx){
  const w=.62,alto=TH*.78,base=top+TH*.12;
  caja(x+w/2-.04,y+.02,.08,.06,TH*.12,"#24315A","#141C3A","#1B2549",top);
  caja(x,y,w,.05,alto,"#3A4A86","#2A3768","#24315A",base);
  planoX(x,y+.05,base+alto,T=>{
    const W2=w*T,b=Math.max(2,T*.05),sw=W2-b*2,sh=alto-b*2;ctx.translate(b,b);
    ctx.fillStyle=e.on?"#0E1530":"#131B3A";ctx.fillRect(0,0,sw,sh);
    if(!e.on){const k=Math.min(sw,sh)*.7/64;ctx.save();ctx.translate(sw/2-32*k,sh/2-32*k);ctx.scale(k,k);ctx.globalAlpha=.55;ctx.strokeStyle="#6D8BFF";ctx.lineWidth=7;ctx.lineCap="round";ctx.stroke(LOGO_C);ctx.fillStyle="#2FD08F";ctx.beginPath();ctx.arc(45,32,4,0,7);ctx.fill();ctx.restore();return}
    ctx.save();ctx.beginPath();ctx.rect(0,0,sw,sh);ctx.clip();
    const col=css(DEP[a.dep].c),t=seg+a.fase+idx;
    ctx.fillStyle=col;ctx.fillRect(0,0,sw,Math.max(2,sh*.12));
    const d=a.dep===0&&idx===1?3:a.dep;
    if(d===1){for(let i=0;i<3;i++){const ox=((i*sw*.38-t*6)%(sw*1.14)+sw*1.14)%(sw*1.14)-sw*.14;ctx.fillStyle=i%2?"#6D8BFF":"#EEF1FA";ctx.fillRect(ox,sh*.25,sw*.3,sh*.55)}}
    else if(d===2){for(let i=0;i<3;i++){const der=i%2===1;ctx.fillStyle=der?"#2FD08F":"#24315A";const bw=sw*(.35+.1*((i+Math.floor(t))%3)),by=sh*.2+i*sh*.25;ctx.fillRect(der?sw-bw-2:2,by,bw,sh*.16)}}
    else if(d===3){const n=6;for(let i=0;i<n;i++){const v=.3+.6*Math.abs(Math.sin(i*1.1+t*.6));ctx.fillStyle=i===n-1?"#2FD08F":"#2F5BFF";ctx.fillRect(2+i*(sw-4)/n,sh-2-v*sh*.7,(sw-4)/n-1.5,v*sh*.7)}}
    else{const off=(t*8)%(sh*.2);for(let i=0;i<7;i++){const yy=sh*.18+i*sh*.16-off;ctx.fillStyle=i%3===0?"#2FD08F":i%3===1?"#6D8BFF":"#A3ACC8";ctx.fillRect(2+(i%2)*5,yy,sw*(.3+.4*((i*7)%5)/5),Math.max(1.5,sh*.06))}}
    ctx.restore();
  });
  if(e.on){const g0=iso(x+w/2,y+.4,base+alto*.5);const g=ctx.createRadialGradient(g0[0],g0[1],1,g0[0],g0[1],TW*.7);g.addColorStop(0,"rgba(109,139,255,.22)");g.addColorStop(1,"rgba(109,139,255,0)");ctx.fillStyle=g;ctx.fillRect(g0[0]-TW*.7,g0[1]-TW*.7,TW*1.4,TW*1.4)}
}
function silla(a){const x=a.x+(a.dep===0?.95:.7),y=a.y+.85;caja(x,y,.42,.36,TH*.4,"#24315A","#141C3A","#1B2549");const p=iso(x+.21,y+.18);ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(p[0],p[1],TW*.2,TH*.14,0,0,7);ctx.fill()}
function persona(a,T,seg,luz){
  const e=estado(a,T),col=css(DEP[a.dep].c),s=TW/56;
  if(a.robot){const p=iso(a.x+.65,a.y+.32,TH*.42);return robot(a,e,p,s,seg,col)}
  const p=iso(a.x+(a.dep===0?1.16:.91),a.y+1.03,TH*.4);
  const dormido=!e.on&&luz<.15;
  const bob=e.on?Math.sin(seg*2.2+a.fase)*.6*s:Math.sin(seg*.8+a.fase)*.4*s;
  const hombro=p[1]-24*s+bob,cabY=hombro-8*s+(dormido?4*s:0),cabX=p[0]-1.5*s;
  // brazos hacia el teclado
  ctx.strokeStyle=mezcla(col,"#000000",.2);ctx.lineWidth=4.5*s;ctx.lineCap="round";
  const tec=e.on?Math.sin(seg*16+a.fase)*1.6*s:0;
  ctx.beginPath();ctx.moveTo(p[0]-7*s,hombro+5*s);ctx.lineTo(p[0]-13*s,hombro+3*s+tec);ctx.moveTo(p[0]+6*s,hombro+5*s);ctx.lineTo(p[0]-2*s,hombro+1*s-tec);ctx.stroke();
  // cuerpo de espaldas
  ctx.fillStyle=col;rr(p[0]-9*s,hombro,18*s,24*s,6*s);ctx.fill();
  ctx.fillStyle=mezcla(col,"#000000",.15);ctx.fillRect(p[0]-.6*s,hombro+4*s,1.2*s,18*s);
  // cabeza de espaldas, girada apenas hacia la pantalla
  ctx.fillStyle="#F1C9A5";ctx.beginPath();ctx.arc(cabX-6.8*s,cabY+1*s,2*s,0,7);ctx.arc(cabX+6.8*s,cabY+1*s,2*s,0,7);ctx.fill();
  ctx.fillStyle="#F1C9A5";ctx.fillRect(cabX-3*s,cabY+5*s,6*s,4*s);
  ctx.fillStyle=pelo(a);ctx.beginPath();ctx.arc(cabX,cabY,7.6*s,0,7);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.12)";ctx.beginPath();ctx.arc(cabX-2.5*s,cabY-3*s,3*s,0,7);ctx.fill();
  if(e.on){ctx.fillStyle="rgba(109,139,255,.35)";ctx.beginPath();ctx.arc(cabX,cabY-1*s,7.8*s,Math.PI*1.1,Math.PI*1.6);ctx.lineTo(cabX,cabY);ctx.fill()}
  if(!e.on&&!dormido){const mx=p[0]+10*s,my=hombro+3*s+Math.sin(seg*.7+a.fase)*1.5*s;ctx.fillStyle="#F1C9A5";ctx.beginPath();ctx.arc(mx-1*s,my+6*s,2.4*s,0,7);ctx.fill();ctx.fillStyle="#EEF1FA";ctx.fillRect(mx,my,5*s,6*s);ctx.fillStyle="rgba(238,241,250,.5)";ctx.fillRect(mx+1.5*s,my-4*s-((seg*6)%4)*s,1*s,2*s)}
  indicador(a,e,cabX,cabY-16*s,seg,s);
  a._head=[cabX,cabY];
}
function robot(a,e,p,s,seg,col){
  const bob=Math.sin(seg*1.8+a.fase)*1.2*s,y0=p[1]-18*s+bob;
  ctx.fillStyle="#A3ACC8";rr(p[0]-9*s,y0,18*s,22*s,5*s);ctx.fill();
  ctx.fillStyle=col;ctx.fillRect(p[0]-5*s,y0+6*s,10*s,3*s);
  ctx.fillStyle="#C9D0E4";rr(p[0]-10*s,y0-17*s,20*s,15*s,5*s);ctx.fill();
  ctx.fillStyle="#0A0F1F";rr(p[0]-7.5*s,y0-14.5*s,15*s,10*s,3*s);ctx.fill();
  const parpadeo=(seg+a.fase)%3.5<.15;ctx.fillStyle="#2FD08F";
  if(parpadeo){ctx.fillRect(p[0]-5*s,y0-9.5*s,3*s,1*s);ctx.fillRect(p[0]+2*s,y0-9.5*s,3*s,1*s)}else{ctx.fillRect(p[0]-5*s,y0-11.5*s,3*s,3.5*s);ctx.fillRect(p[0]+2*s,y0-11.5*s,3*s,3.5*s)}
  ctx.strokeStyle="#A3ACC8";ctx.lineWidth=1.5*s;ctx.beginPath();ctx.moveTo(p[0],y0-17*s);ctx.lineTo(p[0],y0-22*s);ctx.stroke();
  ctx.fillStyle=Math.floor(seg*2+a.fase)%2?"#2FD08F":"#FFB547";ctx.beginPath();ctx.arc(p[0],y0-23*s,2*s,0,7);ctx.fill();
  if(e.on){for(let i=0;i<3;i++){const k=((seg*.45+i/3+a.fase)%1),bx=p[0]+(i%2?12:-22)*s,by=y0-14*s-k*26*s;ctx.globalAlpha=1-k;ctx.fillStyle=i%2?"#2F5BFF":"#18213F";ctx.strokeStyle="#6D8BFF";ctx.lineWidth=1;rr(bx,by,10*s,7*s,2.5*s);ctx.fill();ctx.stroke();ctx.fillStyle="#EEF1FA";for(let d=0;d<3;d++)ctx.fillRect(bx+2*s+d*2.4*s,by+3*s,1.2*s,1.2*s)}ctx.globalAlpha=1}
  indicador(a,e,p[0],y0-30*s,seg,s);
  a._head=[p[0],y0-10*s];
}
function indicador(a,e,x,y,seg,s){
  const iy=y+Math.sin(seg*2.2+a.fase)*2*s;
  ctx.fillStyle=e.on?"#2FD08F":"rgba(163,172,200,.35)";
  ctx.beginPath();ctx.moveTo(x,iy-6*s);ctx.lineTo(x+4*s,iy);ctx.lineTo(x,iy+6*s);ctx.lineTo(x-4*s,iy);ctx.closePath();ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.35)";ctx.beginPath();ctx.moveTo(x,iy-6*s);ctx.lineTo(x+4*s,iy);ctx.lineTo(x,iy);ctx.closePath();ctx.fill();
  if(a===sel){ctx.strokeStyle="#2FD08F";ctx.lineWidth=2;const f=a.robot?iso(a.x+.65,a.y+.32):iso(a.x+(a.dep===0?1.16:.91),a.y+1.03);ctx.beginPath();ctx.ellipse(f[0],f[1],TW*.4,TH*.36,0,0,7);ctx.stroke()}
  a._top=iy-8*s;
}
const PELOS=["#2B2118","#5A3A22","#8A5A2B","#1C1C24","#B07A3E","#6B4B3A"];
function pelo(a){let h=0;for(const c of a.id)h=(h*31+c.charCodeAt(0))%997;return PELOS[h%PELOS.length]}
function planta(x,y){caja(x,y,.42,.42,TH*.5,"#2A3768","#18213F","#202B55");const p=iso(x+.21,y+.21,TH*.5),k=TW/56;
  [[0,-16,8,"#1E9E6A"],[-8,-9,7,"#2FD08F"],[8,-9,7,"#25B57C"],[0,-25,6,"#2FD08F"],[-4,-20,5,"#1E9E6A"]].forEach(([dx,dy,r,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(p[0]+dx*k,p[1]+dy*k,r*k,0,7);ctx.fill()})}
function sillon(){caja(1,6.4,2.4,.8,TH*.35,"#2F5BFF","#1E3FBF","#2649D9");caja(1,6.4,2.4,.22,TH*.95,"#3A64FF","#1E3FBF","#2649D9");caja(1,6.4,.22,.8,TH*.65,"#3A64FF","#1E3FBF","#2649D9");caja(3.18,6.4,.22,.8,TH*.65,"#3A64FF","#1E3FBF","#2649D9");
  const p=iso(2.2,6.8,TH*.5);ctx.fillStyle="#2FD08F";rr(p[0]-TW*.14,p[1]-TW*.12,TW*.28,TW*.16,4);ctx.fill();
  caja(1.4,7.35,1.4,.45,TH*.32,"#33427A","#18213F","#222D5A")}
function barra(seg){caja(17.4,6.2,2.6,.6,TH*.95,"#3A4A86","#202B55","#2A3768");
  caja(17.7,6.25,.5,.4,TH*.8,"#0A0F1F","#070B17","#0A0F1F",TH*.95);
  const p=iso(17.95,6.45,TH*1.75);ctx.fillStyle="rgba(238,241,250,.7)";for(let i=0;i<3;i++){const k=((seg*.5+i/3)%1);ctx.globalAlpha=1-k;ctx.beginPath();ctx.arc(p[0]+Math.sin(seg*2+i)*3,p[1]-k*22,2.4,0,7);ctx.fill()}ctx.globalAlpha=1;
  [[18.6,6.4],[18.95,6.45],[19.3,6.4]].forEach(([x,y])=>{const m=iso(x,y,TH*.95);ctx.fillStyle="#EEF1FA";ctx.fillRect(m[0]-TW*.04,m[1]-TW*.09,TW*.08,TW*.09)});
  caja(20.7,6.3,.45,.45,TH*.9,"#C3CADF","#8A93B3","#A3ACC8");const b=iso(20.92,6.52,TH*.9);ctx.fillStyle="rgba(109,139,255,.75)";rr(b[0]-TW*.09,b[1]-TW*.32,TW*.18,TW*.32,6);ctx.fill()}
function mesaReunion(){[[9.5,12.0],[10.7,12.0],[9.5,13.75],[10.7,13.75]].forEach(([x,y])=>caja(x,y,.45,.4,TH*.42,"#24315A","#141C3A","#1B2549"));
  caja(9.2,12.5,2.3,1.1,TH*.75,"#33427A","#18213F","#222D5A");const p=iso(10.35,13.05,TH*.75);ctx.fillStyle="rgba(109,139,255,.35)";ctx.beginPath();ctx.ellipse(p[0],p[1],TW*.5,TH*.32,0,0,7);ctx.fill()}
function servidores(seg){[19.4,20.4].forEach((x,j)=>{const alto=TH*2.2,y=8.9;caja(x,8.3,.8,.6,alto,"#24315A","#101731","#18213F");
  for(let r=0;r<6;r++){const z1=alto-TH*.12-r*TH*.34,z0=z1-TH*.22;
    poli([iso(x+.07,y,z0),iso(x+.73,y,z0),iso(x+.73,y,z1),iso(x+.07,y,z1)],"#0A0F1F");
    for(let l=0;l<3;l++){const on=Math.sin(seg*(2.5+l*.7+r*.3)+j*2+r*1.3)>.1;const c=iso(x+.14+l*.09,y,(z0+z1)/2);
      ctx.fillStyle=on?(l===2?"#FFB547":"#2FD08F"):"#24315A";ctx.beginPath();ctx.arc(c[0],c[1],Math.max(1.2,TW*.022),0,7);ctx.fill()}
    const a=iso(x+.45,y,(z0+z1)/2),b=iso(x+.68,y,(z0+z1)/2);ctx.strokeStyle="#24315A";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
})}
function archivos(){[[20.4,12.6],[21.05,12.6]].forEach(([x,y])=>{caja(x,y,.55,.5,TH*1.1,"#3A4A86","#202B55","#2A3768");for(let i=1;i<3;i++){const a=iso(x+.12,y+.5,TH*1.1*i/3),b=iso(x+.43,y+.5,TH*1.1*i/3);ctx.strokeStyle="#6D8BFF";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}})}
function pizarraPie(){caja(12.3,8.75,.06,.06,TH*1.2,"#A3ACC8","#8A93B3","#8A93B3");caja(13.6,8.75,.06,.06,TH*1.2,"#A3ACC8","#8A93B3","#8A93B3");planoX(12.2,8.8,TH*3.3,pizarra)}
function vidrio(t,c,a,b){
  const out=[];for(let u=a;u<b;u+=1){const l=Math.min(1,b-u);
    if(t==="x")out.push({k:c+u+l/2,f:()=>caja(c-.03,u,.06,l,TH*1.25,"rgba(109,139,255,.45)","rgba(109,139,255,.10)","rgba(109,139,255,.14)")});
    else out.push({k:u+l/2+c,f:()=>caja(u,c-.03,l,.06,TH*1.25,"rgba(109,139,255,.45)","rgba(109,139,255,.12)","rgba(109,139,255,.10)")});}
  return out;
}

function dibujar(ts){
  const T=tiempo(),luz=luzDia(T.min),seg=ts/1000;T_ACT=T;
  const ancho=lienzo.clientWidth,alto=parseFloat(lienzo.style.height);
  ctx.clearRect(0,0,ancho,alto);
  // paredes
  poli([iso(0,0,0),iso(W,0,0),iso(W,0,WALL),iso(0,0,WALL)],mezcla("#0E1530","#1A2550",luz));
  poli([iso(0,0,0),iso(0,H,0),iso(0,H,WALL),iso(0,0,WALL)],mezcla("#121A36","#202C5A",luz));
  poli([iso(0,0,WALL),iso(W,0,WALL),iso(W,0,WALL+5),iso(0,0,WALL+5)],"#24315A");
  poli([iso(0,0,WALL),iso(0,H,WALL),iso(0,H,WALL+5),iso(0,0,WALL+5)],"#2A3768");
  poli([iso(0,0,0),iso(W,0,0),iso(W,0,6),iso(0,0,6)],"#070B17");poli([iso(0,0,0),iso(0,H,0),iso(0,H,6),iso(0,0,6)],"#0A0F1F");
  [[.7,2.2],[3.4,2.2],[8.6,2.2],[13.0,2.2],[18.4,2.2]].forEach(([x,w],i)=>planoX(x,0,WALL*.72,Tt=>ventana(Tt,luz,seg,w,i+3)));
  [[3.9,2.2],[15.8,1.6]].forEach(([y,w],i)=>planoY(0,y,WALL*.72,Tt=>ventana(Tt,luz,seg,w,i+9)));
  planoX(6.3,0,WALL*.6,calendario);
  planoX(11.9,0,WALL*.4,Tt=>{ctx.translate(0,0);reloj(Tt,T.min)});
  planoX(16.0,0,WALL*.6,Tt=>kanban(Tt,seg));
  planoX(11.15,0,WALL*.99,logoCartel);
  planoY(0,8.1,WALL*.75,logoCartel);
  planoY(0,13.2,WALL*.62,Tt=>tablero(Tt,seg,luz));
  planoX(0,0,WALL*.86,Tt=>cartel("MARKETING PROPIO",css("--d1"),Tt,12,Math.max(9,TW*.19)));
  planoX(12,0,WALL*.86,Tt=>cartel("VENTAS",css("--d2"),Tt,10,Math.max(9,TW*.19)));
  planoY(0,16,WALL*.86,Tt=>cartel("PAUTA DE CLIENTES",css("--d3"),Tt,8,Math.max(9,TW*.19)));
  // piso
  const baseP=mezcla("#0B1128","#18224A",luz);
  for(let x=0;x<W;x++)for(let y=0;y<H;y++){
    const z=ZONAS.find(z=>x>=z.x&&x<z.x+z.w&&y>=z.y&&y<z.y+z.h);
    let col=z?mezcla(baseP,css(DEP[z.dep].c),.07):mezcla(baseP,"#000000",.2);
    if((x+y)%2)col=mezcla(col,"#FFFFFF",.025);
    poli([iso(x,y),iso(x+1,y),iso(x+1,y+1),iso(x,y+1)],col,"rgba(109,139,255,.07)");
  }
  ZONAS.forEach(z=>{const m=.35;poli([iso(z.x+m,z.y+m),iso(z.x+z.w-m,z.y+m),iso(z.x+z.w-m,z.y+z.h-m),iso(z.x+m,z.y+z.h-m)],alfa(css(DEP[z.dep].c),.05),alfa(css(DEP[z.dep].c),.28),1)});
  for(let x=.5;x<W;x+=1.4){const a=iso(x,6.5),b=iso(x+.9,6.5);ctx.strokeStyle="rgba(109,139,255,.12)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  if(luz<.7)AG.forEach(a=>{const p=iso(a.x+.75,a.y+.8);const g=ctx.createRadialGradient(p[0],p[1],2,p[0],p[1],TW*1.1);const k=(.7-luz)*.28;g.addColorStop(0,`rgba(109,139,255,${k})`);g.addColorStop(1,"rgba(109,139,255,0)");ctx.fillStyle=g;ctx.fillRect(p[0]-TW*1.2,p[1]-TW*1.2,TW*2.4,TW*2.4)});
  // objetos ordenados por profundidad
  const obj=[];
  AG.forEach(a=>{const sum=a.x+a.y;if(a.robot){obj.push({k:sum+.97,f:()=>persona(a,T,seg,luz)});obj.push({k:sum+1.6,f:()=>escritorio(a,T,seg,luz)})}else{obj.push({k:sum+(a.dep===0?1.1:.85),f:()=>escritorio(a,T,seg,luz)});obj.push({k:sum+1.6,f:()=>silla(a)});obj.push({k:sum+1.75,f:()=>persona(a,T,seg,luz)})}});
  PLANTAS.forEach(([x,y])=>obj.push({k:x+y+.42,f:()=>planta(x,y)}));
  obj.push({k:9.8,f:sillon},{k:24.5,f:()=>barra(seg)},{k:23.5,f:mesaReunion},{k:28.9,f:()=>servidores(seg)},{k:33.6,f:archivos},{k:21.6,f:pizarraPie});
  VIDRIOS.forEach(v=>obj.push(...vidrio(...v)));
  obj.sort((p,q)=>p.k-q.k).forEach(o=>o.f());
  // carteles de piso para las zonas sin pared
  ZONAS.filter(z=>[0,4,5].includes(z.dep)).forEach(z=>{const p=z.dep===4?iso(20.3,8.6,TH*2.6):iso(z.x+z.w/2,z.y+z.h-.75);const txt=DEP[z.dep].n.toUpperCase();
    ctx.font=F(500,Math.max(8,TW*.14),"m");const w=ctx.measureText(txt).width+8;
    const col=css(DEP[z.dep].c);ctx.shadowColor=col;ctx.shadowBlur=10;ctx.fillStyle="#0A0F1F";rr(p[0]-w/2-5,p[1]-8,w+10,16,5);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(p[0]-w/2+1,p[1],2,0,7);ctx.fill();ctx.fillStyle="#EEF1FA";ctx.textAlign="center";ctx.fillText(txt,p[0]+3,p[1]+3)});
  // globos
  const trab=AG.filter(a=>estado(a,T).on);
  if(seg-ultFoco>3.2){foco++;ultFoco=seg}
  const enFoco=trab.length?trab[foco%trab.length]:null;
  AG.forEach(a=>{const e=estado(a,T);
    if(a===sel||a===enFoco)globo(a,e.txt,a===sel);
    else if(e.on&&!a.robot)puntitos(a,seg);
    else if(!e.on&&luz<.15)zzz(a,seg);
  });
  $("hora").textContent=fmt(T.min);
  $("dia").textContent=DIAS[T.dia]+" · Buenos Aires"+(modo==="vivo"?" · en vivo":" · simulación");
  $("nTrab").textContent=trab.length+" de "+AG.length;
  let hechas=0,publi=0;AG.forEach(a=>a.s.forEach(s=>{if(s.d.includes(T.dia)&&T.min>=s.ini+s.dur){hechas++;if(a.pub)publi++}}));
  $("nHechas").textContent=hechas;$("nPubli").textContent=publi+" de 4";
  return T;
}
function globo(a,txt,destacado){
  if(!a._head)return;const s=Math.min(1,Math.max(.8,TW/56));
  ctx.font=F(400,Math.max(10,11*s));
  const maxW=Math.min(160,lienzo.clientWidth*.5),lineas=partir(txt,maxW);
  ctx.font=F(800,Math.max(10,11.5*s),"d");const wn=ctx.measureText(a.n).width;ctx.font=F(400,Math.max(10,11*s));
  const lh=14*s,w=Math.max(...lineas.map(l=>ctx.measureText(l).width),wn)+14*s,h=(lineas.length+1)*lh+8*s;
  let x=a._head[0]-w/2,y=a._top-h-8*s;x=Math.max(4,Math.min(lienzo.clientWidth-w-4,x));y=Math.max(4,y);
  ctx.fillStyle=destacado?"#2F5BFF":"#18213F";ctx.strokeStyle=destacado?"#6D8BFF":"#24315A";ctx.lineWidth=1;
  rr(x,y,w,h,8*s);ctx.fill();ctx.stroke();
  ctx.beginPath();const cx=Math.max(x+10,Math.min(x+w-10,a._head[0]));ctx.moveTo(cx-5*s,y+h);ctx.lineTo(cx,y+h+6*s);ctx.lineTo(cx+5*s,y+h);ctx.fill();
  ctx.textAlign="left";ctx.fillStyle=destacado?"#FFFFFF":css(DEP[a.dep].c);ctx.font=F(800,Math.max(10,11.5*s),"d");ctx.fillText(a.n,x+7*s,y+lh);
  ctx.fillStyle="#EEF1FA";ctx.font=F(400,Math.max(10,11*s));lineas.forEach((l,i)=>ctx.fillText(l,x+7*s,y+lh*(i+2)));
}
function partir(txt,maxW){const out=[];let l="";for(const p of txt.split(" ")){const c=l?l+" "+p:p;if(ctx.measureText(c).width>maxW&&l){out.push(l);l=p}else l=c}if(l)out.push(l);return out}
function puntitos(a,seg){if(!a._head)return;const s=TW/56,x=a._head[0]+11*s,y=a._top+4*s;ctx.fillStyle="#18213F";ctx.strokeStyle="#24315A";ctx.lineWidth=1;rr(x,y-8*s,22*s,12*s,6*s);ctx.fill();ctx.stroke();for(let i=0;i<3;i++){ctx.fillStyle=Math.floor(seg*3)%3===i?"#2FD08F":"#4A5788";ctx.beginPath();ctx.arc(x+5*s+i*6*s,y-2*s,1.7*s,0,7);ctx.fill()}}
function zzz(a,seg){if(!a._head)return;const s=TW/56;ctx.fillStyle="rgba(238,241,250,.85)";ctx.font=F(500,11*s,"m");ctx.textAlign="left";for(let i=0;i<2;i++){const k=(seg*.6+i*.5+a.fase)%1;ctx.globalAlpha=1-k;ctx.fillText("z",a._head[0]+8*s+k*8*s,a._head[1]-6*s-k*16*s)}ctx.globalAlpha=1}

// Lista por departamento
function armarLista(){
  const cont=$("deptos");cont.innerHTML="";
  [0,1,2,3,4,5].forEach(d=>{
    const box=document.createElement("section");box.className="of-depto";
    box.innerHTML=`<h2><i style="background:var(${DEP[d].c})"></i>${DEP[d].n}</h2><ul></ul>`;
    AG.filter(a=>a.dep===d).forEach(a=>{const li=document.createElement("li");
      li.innerHTML=`<button type="button" data-id="${a.id}"><span class="of-estado"></span><span class="of-nom">${a.n}</span><span class="of-que"></span></button>`;
      li.querySelector("button").addEventListener("click",()=>elegir(a,true));box.querySelector("ul").appendChild(li)});
    cont.appendChild(box)});
}
function refrescarLista(T){
  document.querySelectorAll(".of-depto button").forEach(b=>{const a=AG.find(x=>x.id===b.dataset.id),e=estado(a,T);
    b.querySelector(".of-estado").classList.toggle("on",e.on);
    const q=b.querySelector(".of-que");const txt=e.on?e.txt:e.txt;if(q.textContent!==txt)q.textContent=txt;
    b.setAttribute("aria-current",a===sel?"true":"false")});
  if(sel){const e=estado(sel,T);$("ficha").innerHTML=`<b>${sel.n}</b><span class="of-dep">${DEP[sel.dep].n} · ${e.on?"trabajando":"en pausa"}</span><p>${e.txt}</p><p class="of-dep">${sel.rol}</p>`}
}
function elegir(a,scroll){sel=sel===a?null:a;setTimeout(()=>{if(!corriendo)cuadro(performance.now())},0);$("ficha").hidden=!sel;if(sel&&scroll)document.querySelector(".of-escena").scrollIntoView({behavior:"smooth",block:"nearest"})}

lienzo.addEventListener("click",ev=>{const r=lienzo.getBoundingClientRect(),mx=ev.clientX-r.left,my=ev.clientY-r.top;
  let mejor=null,dist=1e9;AG.forEach(a=>{if(!a._head)return;const d=Math.hypot(mx-a._head[0],my-(a._head[1]+8));if(d<dist){dist=d;mejor=a}});
  if(mejor&&dist<TW*.6)elegir(mejor);else{sel=null;$("ficha").hidden=true}});

// Controles
function setModo(m){modo=m;$("enVivo").setAttribute("aria-pressed",m==="vivo");if(m==="vivo"){play=false;$("play").setAttribute("aria-pressed","false")}}
$("enVivo").addEventListener("click",()=>setModo("vivo"));
$("play").addEventListener("click",()=>{play=!play;$("play").setAttribute("aria-pressed",String(play));if(play){if(modo==="vivo"){const n=ahoraBA();simDia=n.dia;$("dia-sel").value=n.dia}setModo("sim");play=true;$("play").setAttribute("aria-pressed","true");simMin=360}});
$("slider").addEventListener("input",e=>{setModo("sim");simMin=Number(e.target.value)});
$("dia-sel").addEventListener("change",e=>{setModo("sim");simDia=Number(e.target.value)});

armarLista();ajustar();
{const n=ahoraBA();$("dia-sel").value=n.dia;$("slider").value=n.min}
let visible=false,corriendo=false,prev=0,ultLista=0,idEstatico=0;
const reducir=matchMedia("(prefers-reduced-motion: reduce)").matches;
function cuadro(ts){
  const dt=prev?(ts-prev)/1000:0;prev=ts;
  if(play){simMin+=dt*18;if(simMin>=1440){simMin=1439;play=false;$("play").setAttribute("aria-pressed","false")}$("slider").value=Math.floor(simMin)}
  else if(modo==="vivo"&&ts-ultLista>5000){$("slider").value=ahoraBA().min}
  const T=dibujar(reducir?0:ts);
  if(ts-ultLista>400||reducir){refrescarLista(T);ultLista=ts}
}
function loop(ts){if(!corriendo)return;cuadro(ts);requestAnimationFrame(loop)}
function actualizar(){
  const debe=visible&&!document.hidden;
  if(reducir){clearInterval(idEstatico);if(debe){cuadro(performance.now());idEstatico=setInterval(()=>cuadro(performance.now()),30000)}return}
  if(debe&&!corriendo){corriendo=true;prev=0;requestAnimationFrame(loop)}
  else if(!debe)corriendo=false;
}
// con movimiento reducido, los controles redibujan al tocarlos
if(reducir)["enVivo","play","slider","dia-sel"].forEach(id=>$(id).addEventListener(id==="slider"?"input":"click",()=>setTimeout(()=>cuadro(performance.now()),0)));
new IntersectionObserver(es=>{visible=es[0].isIntersecting;actualizar()},{rootMargin:"100px"}).observe(lienzo);
document.addEventListener("visibilitychange",actualizar);
window.addEventListener("resize",()=>{ajustar();if(!corriendo)cuadro(performance.now())});
})();
