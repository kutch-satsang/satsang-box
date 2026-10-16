/* સત્સંગ બોક્સ ઓપનિંગ. ભાષા હબની (satsangLang: g/e/r). દિવસમાં એક વાર. ?intro=1 થી ફરી. */
(function(){
"use strict";
var T={
 g:{h1:"સત્સંગ બોક્સ",sub:"રમો અને શીખો",go:"પ્રવેશ કરો",skip:"છોડો",again:"ઓપનિંગ ફરી જુઓ",snd:"અવાજ"},
 e:{h1:"Satsang Box",sub:"Play and learn",go:"Enter",skip:"Skip",again:"Watch the opening again",snd:"Sound"},
 r:{h1:"Satsang Box",sub:"Ramo ane shikho",go:"Pravesh karo",skip:"Chhodo",again:"Opening fari juo",snd:"Awaaj"}
};
/* ક્રમ: પરોઢ મંદિર → ઘાટ → કમળ સરોવર → દિવાળી રાત → મોરપિચ્છ → ૐ (છેલ્લી, લખાણ સાથે) */
var IMG=["intro/s1.webp","intro/s4.webp","intro/s5.webp","intro/s3.webp","intro/s6.webp","intro/s2.webp"];
var ORG=["60% 55%","30% 60%","50% 45%","40% 65%","30% 55%","50% 30%"];
var STEP=3200,FIN=IMG.length-1;
var KD="satsangIntroDay",KS="satsangIntroSnd";
var L="g";try{var s0=localStorage.getItem("satsangLang");if(T[s0])L=s0}catch(e){}
var reduce=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var root=null,scenes=[],timers=[],cur=-1,raf=0,exiting=false,onResize=null;
var AC=null,master=null,droneNodes=null,soundOn=false;

function div(c){var d=document.createElement("div");d.className=c;return d}
function btn(c,txt){var b=document.createElement("button");b.type="button";b.className=c;if(txt!=null)b.textContent=txt;return b}
function today(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function seenToday(){try{return localStorage.getItem(KD)===today()}catch(e){return false}}
function markSeen(){try{localStorage.setItem(KD,today())}catch(e){}}
function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t}

/* ---------- અવાજ (Web Audio, ફક્ત સ્પર્શ પછી) ---------- */
function ensureAC(){
  if(AC)return true;
  var C=window.AudioContext||window.webkitAudioContext;if(!C)return false;
  try{AC=new C();master=AC.createGain();master.gain.value=0;master.connect(AC.destination);return true}catch(e){AC=null;return false}
}
function startDrone(){
  if(!AC||droneNodes)return;
  var o1=AC.createOscillator(),o2=AC.createOscillator(),g1=AC.createGain(),g2=AC.createGain();
  o1.type="sine";o1.frequency.value=136.1;g1.gain.value=.5;
  o2.type="triangle";o2.frequency.value=204.2;g2.gain.value=.16;
  o1.connect(g1);g1.connect(master);o2.connect(g2);g2.connect(master);
  o1.start();o2.start();droneNodes=[o1,o2];
  master.gain.cancelScheduledValues(AC.currentTime);
  master.gain.setValueAtTime(master.gain.value,AC.currentTime);
  master.gain.linearRampToValueAtTime(.16,AC.currentTime+2.5);
}
function bell(f,vol){
  if(!AC||!soundOn)return;
  var now=AC.currentTime,P=[[1,1,3.2],[2.76,.45,2.2],[5.4,.22,1.4],[8.9,.1,.8]];
  P.forEach(function(p){
    var o=AC.createOscillator(),g=AC.createGain();
    o.type="sine";o.frequency.value=f*p[0];
    g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime((vol||.14)*p[1],now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+p[2]);
    o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+p[2]+.1);
  });
}
function setSound(on){
  if(on){
    if(!ensureAC())return;
    if(AC.state==="suspended"&&AC.resume)AC.resume();
    soundOn=true;startDrone();
    if(master){master.gain.cancelScheduledValues(AC.currentTime);master.gain.setValueAtTime(master.gain.value,AC.currentTime);master.gain.linearRampToValueAtTime(.16,AC.currentTime+1.2)}
    bell(392,.12);
  }else{
    soundOn=false;
    if(AC&&master){master.gain.cancelScheduledValues(AC.currentTime);master.gain.setValueAtTime(master.gain.value,AC.currentTime);master.gain.linearRampToValueAtTime(0,AC.currentTime+.6)}
  }
  try{localStorage.setItem(KS,on?"1":"0")}catch(e){}
  var b=root&&root.querySelector(".isnd");if(b){b.textContent=on?"🔊":"🔈";b.setAttribute("aria-pressed",on?"true":"false")}
}
function stopSound(){
  if(AC&&master){try{master.gain.cancelScheduledValues(AC.currentTime);master.gain.setValueAtTime(master.gain.value,AC.currentTime);master.gain.linearRampToValueAtTime(0,AC.currentTime+.7)}catch(e){}}
  var a=AC,d=droneNodes;
  setTimeout(function(){try{if(d)d.forEach(function(o){o.stop()});if(a&&a.close)a.close()}catch(e){}},900);
  AC=null;droneNodes=null;master=null;soundOn=false;
}

/* ---------- પાંખડી અને ઝગમગતા તારા ---------- */
function startFx(cv){
  var c=cv.getContext("2d"),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
  function size(){W=root.clientWidth;H=root.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);c.setTransform(dpr,0,0,dpr,0,0)}
  size();onResize=size;window.addEventListener("resize",size);
  var cols=["#ff8fb8","#ffd27a","#ffb347","#fff0c8","#ff6fa5"],P=[],S=[],i;
  function newP(init){return{x:Math.random()*W,y:init?Math.random()*H:-20,s:5+Math.random()*7,v:24+Math.random()*40,sw:Math.random()*6.28,sp:.6+Math.random()*1.2,r:Math.random()*6.28,rv:(Math.random()-.5)*2.2,c:cols[(Math.random()*cols.length)|0],a:.55+Math.random()*.4}}
  function newS(init){return{x:Math.random()*W,y:init?Math.random()*H:H+10,s:.8+Math.random()*1.7,v:8+Math.random()*18,t:Math.random()*6.28,tv:1+Math.random()*2.5}}
  for(i=0;i<26;i++)P.push(newP(true));
  for(i=0;i<46;i++)S.push(newS(true));
  var last=0;
  function frame(t){
    raf=requestAnimationFrame(frame);
    var dt=Math.min((t-last)/1000,.05);last=t;if(!dt)return;
    c.clearRect(0,0,W,H);
    var k,p,s;
    for(k=0;k<S.length;k++){
      s=S[k];s.y-=s.v*dt;s.t+=s.tv*dt;
      if(s.y<-10){S[k]=newS(false);continue}
      var a=.25+.75*Math.abs(Math.sin(s.t));
      c.globalAlpha=a;c.fillStyle="#fff3c0";c.beginPath();c.arc(s.x,s.y,s.s,0,6.283);c.fill();
      c.globalAlpha=a*.4;c.fillRect(s.x-s.s*3,s.y-.4,s.s*6,.8);c.fillRect(s.x-.4,s.y-s.s*3,.8,s.s*6);
    }
    for(k=0;k<P.length;k++){
      p=P[k];p.y+=p.v*dt;p.sw+=p.sp*dt;p.r+=p.rv*dt;p.x+=Math.sin(p.sw)*22*dt;
      if(p.y>H+20){P[k]=newP(false);continue}
      c.save();c.translate(p.x,p.y);c.rotate(p.r);c.globalAlpha=p.a;c.fillStyle=p.c;
      c.beginPath();c.ellipse(0,0,p.s*.55,p.s,0,0,6.283);c.fill();c.restore();
    }
    c.globalAlpha=1;
  }
  raf=requestAnimationFrame(frame);
}

/* ---------- દૃશ્યો ---------- */
function show(i){
  if(i===cur)return;
  var prev=cur;cur=i;
  var s=scenes[i];
  if(i===FIN)s.classList.add("fin");
  s.classList.remove("old");s.classList.add("on");
  if(prev>=0){
    var o=scenes[prev];o.classList.remove("on");o.classList.add("old");
    later(function(){o.classList.remove("old")},1500);
  }
  if(i>0&&soundOn)bell(i===FIN?523:[0,330,294,262,349][i]||330,.1);
  if(i===FIN){root.classList.add("fin");var e=root.querySelector(".ienter");if(e)later(function(){try{e.focus({preventScroll:true})}catch(x){}},2600)}
}
function run(){
  var i;
  for(i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[];
  next(0);
}
function next(i){
  show(i);
  if(i<FIN)later(function(){next(i+1)},STEP);
}
function jumpFinal(){
  if(exiting||cur===FIN)return;
  var i;for(i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[];
  show(FIN);
}
function exit(){
  if(exiting||!root)return;
  exiting=true;markSeen();
  var i;for(i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[];
  if(soundOn)bell(659,.12);
  root.classList.add("bye");
  stopSound();
  setTimeout(function(){
    cancelAnimationFrame(raf);
    if(onResize)window.removeEventListener("resize",onResize);
    document.removeEventListener("keydown",onKey);
    if(root&&root.parentNode)root.parentNode.removeChild(root);
    root=null;scenes=[];cur=-1;
    document.documentElement.style.overflow="";document.body.style.overflow="";
  },950);
}
function onKey(e){if(e.key==="Escape")exit()}

function setText(){
  var t=T[L];if(!root)return;
  root.querySelector(".ih1").textContent=t.h1;
  root.querySelector(".isub").textContent=t.sub;
  root.querySelector(".ienter span").textContent=t.go;
  root.querySelector(".iskip").textContent=t.skip;
  root.querySelector(".isnd").setAttribute("aria-label",t.snd);
}
function setReplay(){
  var r=document.querySelector(".ireplay");if(r)r.textContent="✦ "+T[L].again;
}
function lang(l){if(!T[l])return;L=l;setText();setReplay()}

function launch(){
  if(root)return;
  exiting=false;
  root=div("");root.id="intro";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
  scenes=IMG.map(function(src,i){var s=div("isc");s.style.backgroundImage="url("+src+")";s.style.transformOrigin=ORG[i];root.appendChild(s);return s});
  root.appendChild(div("iglow"));
  var cv=document.createElement("canvas");cv.className="ifx";root.appendChild(cv);
  root.appendChild(div("ishade"));
  var tx=div("itxt"),h=document.createElement("h1");h.className="ih1";var p=document.createElement("p");p.className="isub";
  tx.appendChild(h);tx.appendChild(p);root.appendChild(tx);
  var en=btn("ienter");var sp=document.createElement("span");var ar=document.createElement("i");ar.textContent="›";ar.setAttribute("aria-hidden","true");en.appendChild(sp);en.appendChild(ar);root.appendChild(en);
  var ct=div("ictl"),sk=btn("iskip"),sn=btn("isnd","🔈");sn.setAttribute("aria-pressed","false");ct.appendChild(sk);ct.appendChild(sn);root.appendChild(ct);
  document.body.appendChild(root);
  document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden";
  setText();
  sk.addEventListener("click",function(e){e.stopPropagation();exit()});
  en.addEventListener("click",function(e){e.stopPropagation();exit()});
  sn.addEventListener("click",function(e){e.stopPropagation();setSound(!soundOn)});
  root.addEventListener("click",function(){jumpFinal()});
  document.addEventListener("keydown",onKey);
  if(reduce){show(FIN)}
  else{
    startFx(cv);
    /* પહેલી તસવીર તૈયાર થાય પછી શરૂ; બાકીની પાછળ લોડ */
    var started=false,go=function(){if(started)return;started=true;run()};
    var im=new Image();im.onload=im.onerror=go;im.src=IMG[0];
    later(go,1800);
    var k;for(k=1;k<IMG.length;k++){(function(u){var x=new Image();x.src=u})(IMG[k])}
  }
}

function addReplay(){
  var f=document.getElementById("foot");if(!f||document.querySelector(".ireplay"))return;
  var b=btn("ireplay");b.addEventListener("click",function(){launch()});
  f.parentNode.insertBefore(b,f.nextSibling);setReplay();
}

window.satsangIntro={lang:lang,play:launch};
function init(){
  addReplay();
  var force=/[?&]intro=1/.test(location.search);
  if(force||!seenToday())launch();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
