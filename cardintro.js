/* Game Shelf — universal card-game intro (cardintro.js)
   Include right after <body> in any standard-deck game:
     <script src="cardintro.js"></script>
   Deck box opens, cards rise out, shuffle + cut, fade to black, game reveals.
   - PLAY_MODE: "always" (every open) or "daily" (first open per day, per game)
   - Tap anywhere to skip. prefers-reduced-motion skips automatically.
   - Pure CSS transforms, 16 elements, no audio, no canvas. */
(function(){
"use strict";
var PLAY_MODE="always";

/* guarded storage (only used by "daily" mode) */
var mem={};
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return mem[k]||null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){mem[k]=v;}}

if(PLAY_MODE==="daily"){
  var key="ci_seen:"+location.pathname.split("/").pop();
  var today=new Date().toDateString();
  if(lsGet(key)===today)return;
  lsSet(key,today);
}

var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(reduced)return; /* skip entirely — game just loads */

var css=
".ciov{position:fixed;inset:0;z-index:99990;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#1d4a2e 0%,#143621 75%);transition:opacity .45s}"+
".ciov.cifade{opacity:0;pointer-events:none}"+
".ciov .ciskip{position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:12px;color:rgba(243,233,210,.55);letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;animation:ciskipin 1s .8s both}"+
"@keyframes ciskipin{from{opacity:0}to{opacity:1}}"+
".cistage{position:absolute;inset:0}"+
".cibox{position:absolute;left:50%;top:50%;width:84px;height:118px;transform:translate(-50%,-50%);z-index:2;animation:ciboxdrop .7s cubic-bezier(.2,1.6,.4,1) both}"+
"@keyframes ciboxdrop{0%{transform:translate(-50%,-220%) rotate(-9deg)}100%{transform:translate(-50%,-50%) rotate(-4deg)}}"+
".ciboxbody{position:absolute;inset:0;border-radius:7px;background:linear-gradient(160deg,#12213a,#0c1626);border:2px solid #d9a441;box-shadow:0 14px 30px rgba(0,0,0,.55),inset 0 0 22px rgba(217,164,65,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}"+
".ciboxbody .ciwm{font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:12px;letter-spacing:.14em;color:#f0c869;text-align:center;line-height:1.35}"+
".ciboxbody .cisuits{font-size:15px;letter-spacing:3px}"+
".ciboxbody .cir{color:#e0596a}.ciboxbody .cib{color:#cfd8e6}"+
".ciflap{position:absolute;left:-2px;right:-2px;top:-2px;height:26px;border-radius:7px 7px 3px 3px;background:linear-gradient(180deg,#1a2c4a,#12213a);border:2px solid #d9a441;border-bottom-color:rgba(217,164,65,.4);transform-origin:top center;box-shadow:0 3px 8px rgba(0,0,0,.4)}"+
".ciov.cis1 .ciflap{animation:ciflapopen .5s .15s cubic-bezier(.3,1.4,.5,1) both}"+
"@keyframes ciflapopen{to{transform:rotateX(150deg)}}"+
".ciov.cis3 .cibox{animation:ciboxout .5s ease both}"+
"@keyframes ciboxout{to{transform:translate(-50%,220%) rotate(6deg);opacity:.6}}"+
".cicard{position:absolute;left:50%;top:50%;width:64px;height:90px;margin-left:-32px;margin-top:-45px;border-radius:7px;transform:translateY(8px);opacity:0;z-index:1;will-change:transform}"+
".cicard .ciback{position:absolute;inset:0;border-radius:7px;background:radial-gradient(circle at 50% 50%,rgba(240,200,105,.18) 0 30%,transparent 31%),repeating-linear-gradient(45deg,#152a4d 0 7px,#0f1f3a 7px 14px);border:2px solid #f3e9d2;box-shadow:0 4px 10px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}"+
".cicard .ciback::after{content:'\\2660';color:#f0c869;font-size:20px;opacity:.9}"+
".civeil{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .35s;pointer-events:none}";

var st=document.createElement("style");
st.textContent=css;
document.head.appendChild(st);

var ov=document.createElement("div");
ov.className="ciov";
ov.innerHTML=
 "<div class='cistage'>"+
  "<div class='cibox'>"+
   "<div class='ciboxbody'><div class='ciwm'>GAME<br>SHELF</div>"+
   "<div class='cisuits'><span class='cib'>\u2660</span><span class='cir'>\u2665</span><span class='cir'>\u2666</span><span class='cib'>\u2663</span></div></div>"+
   "<div class='ciflap'></div>"+
  "</div>"+
 "</div>"+
 "<div class='ciskip'>tap to skip</div>"+
 "<div class='civeil'></div>";
document.body.appendChild(ov);

var stage=ov.firstChild, veil=ov.querySelector(".civeil");
var N=16, cards=[], timers=[], done=false;
for(var i=0;i<N;i++){
  var c=document.createElement("div");
  c.className="cicard";
  c.innerHTML="<div class='ciback'></div>";
  stage.appendChild(c);cards.push(c);
}
function at(ms,fn){timers.push(setTimeout(fn,ms));}
function setT(el,t){el.style.transition=t;}

function finish(){
  if(done)return;done=true;
  timers.forEach(clearTimeout);
  veil.style.opacity=1;
  setTimeout(function(){
    ov.classList.add("cifade");
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},500);
  },380);
}
ov.addEventListener("pointerdown",finish);

/* sequence */
at(700,function(){ov.classList.add("cis1");});
at(950,function(){
  cards.forEach(function(c,i){
    c.style.opacity=1;
    setT(c,"transform .55s cubic-bezier(.3,1.15,.4,1) "+(i*16)+"ms");
    c.style.transform="translateY("+(-116-i*1.6)+"px) rotate("+(-4+((i%2?1:-1)*(i%4)))+"deg)";
  });
});
at(1750,function(){
  ov.classList.add("cis3");
  cards.forEach(function(c,i){
    setT(c,"transform .45s cubic-bezier(.35,1.1,.5,1) "+(i*8)+"ms");
    c.style.transform="translateY("+(-6-i*1.5)+"px)";
  });
});
at(2350,function(){
  cards.forEach(function(c,i){
    var half=i<N/2?-1:1,j=i%(N/2);
    setT(c,"transform .36s cubic-bezier(.4,1.2,.5,1) "+(j*10)+"ms");
    c.style.transform="translateX("+(half*74)+"px) translateY("+(-4-j*1.6)+"px) rotate("+(half*10)+"deg)";
  });
});
at(2850,function(){
  var order=[];
  for(var j=0;j<N/2;j++){order.push(j);order.push(j+N/2);}
  order.forEach(function(idx,k){
    var c=cards[idx];
    setT(c,"transform .34s cubic-bezier(.3,1.5,.45,1) "+(k*26)+"ms");
    c.style.transform="translateX(0) translateY("+(-4-k*1.5)+"px) rotate("+((k%2?1:-1)*2)+"deg)";
  });
});
at(3550,function(){
  cards.forEach(function(c,i){
    if(i>=N/2){
      setT(c,"transform .3s ease");
      c.style.transform="translateX(-60px) translateY(-44px) rotate(-8deg)";
    }
  });
  at(260,function(){
    cards.forEach(function(c,i){
      if(i>=N/2){
        setT(c,"transform .28s cubic-bezier(.3,1.3,.5,1)");
        c.style.transform="translateX(0) translateY("+(-4-(i%(N/2))*1.5-12)+"px)";
      }
    });
  });
});
at(4250,function(){
  cards.forEach(function(c,i){
    setT(c,"transform .3s ease "+(i*6)+"ms");
    c.style.transform="translateY("+(-4-i*1.2)+"px) rotate(0deg)";
  });
});
at(4800,finish);
})();
