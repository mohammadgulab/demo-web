(function(){
var d=document,root=d.documentElement,reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* kinetic letters */
d.querySelectorAll('.kinetic .w').forEach(function(w){
  var t=w.textContent;w.textContent='';
  for(var i=0;i<t.length;i++){var s=d.createElement('span');s.className='ch';s.setAttribute('aria-hidden','true');s.textContent=t[i];w.appendChild(s);}
});
d.querySelectorAll('.kinetic .ch').forEach(function(c,i){c.style.setProperty('--i',i)});

/* menu: full screen overlay, works as :target without JS */
var menu=d.getElementById('menu'),btn=d.querySelector('.menu-btn');
function setMenu(open){
  menu.classList.toggle('open',open);d.body.classList.toggle('menu-open',open);
  btn.setAttribute('aria-expanded',open?'true':'false');
  if(open){var f=menu.querySelector('a');f&&f.focus({preventScroll:true});}
}
btn.addEventListener('click',function(e){e.preventDefault();setMenu(true)});
menu.querySelector('.menu-close').addEventListener('click',function(e){e.preventDefault();setMenu(false);btn.focus()});
menu.querySelectorAll('nav a').forEach(function(a){a.addEventListener('click',function(e){
  e.preventDefault();var id=a.getAttribute('href');setMenu(false);
  var el=d.querySelector(id);if(el){el.scrollIntoView({behavior:reduce?'auto':'smooth'});history.replaceState(null,'',id);}
})});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open')){setMenu(false);btn.focus()}});
window.addEventListener('resize',function(){if(window.innerWidth>860&&menu.classList.contains('open'))setMenu(false)});
if(location.hash==='#menu'){history.replaceState(null,'',' ');setMenu(true)}

/* swing in on scroll */
var items=d.querySelectorAll('.swing');
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.12});
  items.forEach(function(el){io.observe(el)});
}else{items.forEach(function(el){el.classList.add('in')})}

/* thread line connecting the sections, drawn as you scroll */
var main=d.getElementById('main'),svg=d.getElementById('thread'),path=d.getElementById('threadPath'),knotsG=d.getElementById('knots'),len=0;
function build(){
  var mr=main.getBoundingClientRect(),W=main.clientWidth,H=main.scrollHeight;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.style.height=H+'px';
  var hero=d.querySelector('.hero'),hb=hero.getBoundingClientRect();
  var pts=[[W/2,hb.bottom-mr.top-40]];
  var ks=d.querySelectorAll('.knot');
  ks.forEach(function(k,i){var r=k.getBoundingClientRect();var x=(i%2?0.88:0.12)*W;if(W<700)x=(i%2?W-14:14);pts.push([x,r.top-mr.top])});
  var dstr='M'+pts[0][0]+' '+pts[0][1];
  for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],my=(a[1]+b[1])/2;dstr+=' C'+a[0]+' '+my+' '+b[0]+' '+my+' '+b[0]+' '+b[1];}
  path.setAttribute('d',dstr);
  knotsG.innerHTML='';
  pts.slice(1).forEach(function(p){var c=d.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',p[0]);c.setAttribute('cy',p[1]);c.setAttribute('r',7);knotsG.appendChild(c)});
  len=path.getTotalLength();path.style.strokeDasharray=len;draw();
}
function draw(){
  if(!len)return;
  if(reduce){path.style.strokeDashoffset=0;return}
  var mr=main.getBoundingClientRect(),H=main.scrollHeight;
  var p=Math.min(1,Math.max(0,(window.innerHeight*0.75-mr.top)/H));
  path.style.strokeDashoffset=len*(1-p);
  var cs=knotsG.childNodes;
  for(var i=0;i<cs.length;i++){var cy=+cs[i].getAttribute('cy');cs[i].style.opacity=(window.innerHeight*0.75-mr.top)>cy?1:0;}
}
var tick=false;
window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){draw();tick=false})}},{passive:true});
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
window.addEventListener('load',build);
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(build);
build();

/* copy email */
var cp=d.querySelector('.copy'),note=d.querySelector('.copy-note');
if(cp)cp.addEventListener('click',function(){
  var v=cp.getAttribute('data-copy');
  function ok(){note.textContent='Copied! '+v}
  if(navigator.clipboard)navigator.clipboard.writeText(v).then(ok,function(){note.textContent=v});else note.textContent=v;
});

/* avatar eyes follow the pointer, hero card leans */
var eyes=d.querySelectorAll('.avatar .eye');
if(!reduce&&window.matchMedia('(pointer:fine)').matches){
  window.addEventListener('pointermove',function(e){
    var dx=(e.clientX/window.innerWidth-.5)*5,dy=(e.clientY/window.innerHeight-.5)*4;
    eyes.forEach(function(el){el.setAttribute('transform','translate('+dx.toFixed(1)+' '+dy.toFixed(1)+')')});
  },{passive:true});

  /* cursor trail: a thread that follows the pointer */
  var cv=d.getElementById('trail'),ctx=cv.getContext('2d'),pts=[],dpr=Math.min(2,window.devicePixelRatio||1),mx=-99,my=-99,last=0;
  function size(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();window.addEventListener('resize',size);
  window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;last=performance.now()},{passive:true});
  (function loop(t){
    pts.push({x:mx,y:my});if(pts.length>22)pts.shift();
    if(t-last>600&&pts.length)pts.shift();
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(pts.length>2&&mx>-50){
      ctx.lineCap='round';ctx.lineJoin='round';
      for(var i=1;i<pts.length;i++){
        var a=pts[i-1],b=pts[i];ctx.strokeStyle='rgba(27,42,107,'+(i/pts.length*0.85)+')';ctx.lineWidth=1+i/pts.length*3;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      var h=pts[pts.length-1];ctx.fillStyle='#e8322b';ctx.strokeStyle='#111';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(h.x,h.y,5,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(var j=0;j<pts.length;j+=5){var q=pts[j];ctx.fillStyle='rgba(232,50,43,'+(j/pts.length*.6)+')';ctx.beginPath();ctx.arc(q.x,q.y,2.2,0,Math.PI*2);ctx.fill();}
    }
    requestAnimationFrame(loop);
  })(0);
}
})();
