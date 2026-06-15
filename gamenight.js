/* Game Night shared runtime — players, coin flip, global ledger, stats overlay.
   Storage is seam-isolated for the Firebase swap. */
(function(){
const GN={};window.GN=GN;

/* ---------- players ---------- */
const PALETTE=[
  {color:"#d8312b",light:"#f06a60",dark:"#8d1d19"},
  {color:"#2f6fd0",light:"#6fa0ec",dark:"#194182"},
  {color:"#46b06a",light:"#7ed29a",dark:"#2a6e42"},
  {color:"#e88030",light:"#f3a86c",dark:"#9a4f14"},
  {color:"#b06ad0",light:"#cf9ce6",dark:"#6e3a8a"},
  {color:"#3fb6b2",light:"#7fd6d2",dark:"#1f6f6c"},
  {color:"#f4c542",light:"#f9dd8a",dark:"#9a7414"},
  {color:"#e25c8e",light:"#f09ab9",dark:"#8e2f55"},
  {color:"#5b5bd6",light:"#8f8fe8",dark:"#3636a0"},
  {color:"#8bbf3c",light:"#b0d976",dark:"#5e8420"},
  {color:"#d63aa8",light:"#e87cc7",dark:"#8e2270"},
  {color:"#36a3e0",light:"#79c4ec",dark:"#1c6ea0"},
  {color:"#f2674a",light:"#f79a85",dark:"#b03a22"},
  {color:"#2e9e6b",light:"#66c79b",dark:"#1a6244"},
  {color:"#c79a2e",light:"#e0c071",dark:"#856219"},
  {color:"#5d7290",light:"#93a4bd",dark:"#3a4a62"},
  {color:"#9a6440",light:"#c0906e",dark:"#62381f"},
  {color:"#7a4fb0",light:"#a883d6",dark:"#4d2e75"},
  {color:"#4cc79a",light:"#86dcbd",dark:"#2a8466"},
  {color:"#a63a4e",light:"#c87183",dark:"#6c2030"},
  {color:"#34508f",light:"#6f86bd",dark:"#1d2f5e"},
  {color:"#9a8cf0",light:"#c0b6f7",dark:"#6354b0"},
  {color:"#7e8338",light:"#aab06a",dark:"#51541f"},
  {color:"#6f86e8",light:"#9fb0f2",dark:"#44539e"}];
GN.palette=function(){return PALETTE.slice();};
// ---- shared 3D cube die ----
const CUBE_RING={1:[2,3],2:[1,4],3:[1,2],4:[1,5],5:[1,3],6:[2,4]};
const CUBE_PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
let _cubeCSS=false;
function cubeCSSOnce(){if(_cubeCSS)return;_cubeCSS=true;
  const st=document.createElement("style");
  st.textContent=
   ".gnCubeWrap{position:relative;perspective:520px;will-change:transform;display:inline-block;}"+
   ".gnCube{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform;transform:rotateX(-9deg) rotateY(11deg);}"+
   ".gnCf{position:absolute;inset:0;border-radius:11%;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:11%;backface-visibility:hidden;box-shadow:inset 0 0 0 1px rgba(120,100,60,.25);}"+
   ".gnCfF{background:linear-gradient(150deg,#fbf8ef 0%,#efe9da 65%,#ded6c2 100%);transform:translateZ(var(--dh));}"+
   ".gnCfT{background:linear-gradient(150deg,#ffffff 0%,#f8f4ea 70%,#ece5d4 100%);transform:rotateX(90deg) translateZ(var(--dh));}"+
   ".gnCfR{background:linear-gradient(150deg,#e2dac6 0%,#d2c8b0 70%,#bfb499 100%);transform:rotateY(90deg) translateZ(var(--dh));}"+
   ".gnCf i{border-radius:50%;background:radial-gradient(circle at 38% 32%,#3a4458,#10151f 70%);visibility:hidden;box-shadow:inset 0 1.5px 2px rgba(0,0,0,.55),0 .5px 0 rgba(255,255,255,.35);}"+
   ".gnCubeBust .gnCfF{background:linear-gradient(150deg,#f3b3ac 0%,#e2887e 65%,#cb6a60 100%);}"+
   ".gnCubeBust .gnCfT{background:linear-gradient(150deg,#f8c5bf 0%,#eda49b 70%,#dd9088 100%);}"+
   ".gnCubeBust .gnCf i{background:radial-gradient(circle at 38% 32%,#fff,#f3e0dd 70%);}"+
   ".gnCubeShadow{position:absolute;left:8%;right:8%;bottom:-12%;height:18%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.4),rgba(0,0,0,0) 70%);}";
  document.head.appendChild(st);}
GN.cubeDie=function(size){cubeCSSOnce();
  const wrap=document.createElement("div");wrap.className="gnCubeWrap";
  wrap.style.width=size+"px";wrap.style.height=size+"px";
  wrap.style.setProperty("--dh",(size/2)+"px");
  const shadow=document.createElement("div");shadow.className="gnCubeShadow";wrap.appendChild(shadow);
  const cube=document.createElement("div");cube.className="gnCube";wrap.appendChild(cube);
  const faces={};
  for(const[cls,key]of[["gnCfF","F"],["gnCfT","T"],["gnCfR","R"]]){
    const f=document.createElement("div");f.className="gnCf "+cls;
    for(let i=0;i<9;i++)f.appendChild(document.createElement("i"));
    cube.appendChild(f);faces[key]=f;}
  function faceSet(f,v){const on=CUBE_PIPS[v]||[];
    [...f.children].forEach((p,i)=>{p.style.visibility=on.includes(i)?"visible":"hidden";});}
  function show(v){faceSet(faces.F,v);faceSet(faces.T,CUBE_RING[v][0]);faceSet(faces.R,CUBE_RING[v][1]);}
  let busyT=false;
  function tumble(finalV,opts,done){if(typeof opts==="function"){done=opts;opts={};}opts=opts||{};
    if(busyT)return;busyT=true;
    const dur=opts.duration||640,hop=opts.hop!==undefined?opts.hop:size*0.55;
    const sgn=()=>Math.random()<0.5?-1:1;
    const RX=sgn()*(360+Math.floor(Math.random()*2)*360),RY=sgn()*(360+Math.floor(Math.random()*2)*360);
    const drift=(Math.random()*2-1)*size*0.2;
    if(wrap.animate)wrap.animate([
      {transform:"translate(0,0) scale(1,1)"},
      {transform:"translate(0,"+(size*0.12)+"px) scale(1.1,0.74)",offset:0.12},
      {transform:"translate("+drift+"px,"+(-hop)+"px) scale(0.97,1.03)",offset:0.44,easing:"cubic-bezier(.2,.9,.4,1)"},
      {transform:"translate("+(drift*0.35)+"px,0) scale(1.08,0.88)",offset:0.7,easing:"cubic-bezier(.5,0,.8,.4)"},
      {transform:"translate(0,"+(-hop*0.15)+"px) scale(1,1)",offset:0.85},
      {transform:"translate(0,0) scale(1,1)"}],{duration:dur,easing:"linear"});
    if(cube.animate)cube.animate([
      {transform:"rotateX(-9deg) rotateY(11deg)"},
      {transform:"rotateX("+(-9+RX*0.55)+"deg) rotateY("+(11+RY*0.55)+"deg)",offset:0.45,easing:"cubic-bezier(.25,.8,.5,1)"},
      {transform:"rotateX("+(-9+RX)+"deg) rotateY("+(11+RY)+"deg)",offset:0.86,easing:"cubic-bezier(.3,.7,.4,1)"},
      {transform:"rotateX("+(-9+RX)+"deg) rotateY("+(11+RY)+"deg)"}],{duration:dur,easing:"linear"});
    let n=0;const steps=Math.max(6,Math.floor(dur/64));
    const iv=setInterval(()=>{show(1+Math.floor(Math.random()*6));
      if(++n>=steps){clearInterval(iv);show(finalV);busyT=false;if(done)done();}},Math.floor(dur/(steps+1)));}
  show(1);
  return{el:wrap,show,tumble,setBust:function(b){wrap.classList.toggle("gnCubeBust",!!b);}};};
const PKEY="gn_players",PAIRKEY="gn_lastpair";
function defaultPlayers(){return[
  {name:"Mot",...PALETTE[0]},
  {name:"Kathy",...PALETTE[1]},
  {name:"Garrett",...PALETTE[2]}];}
function pload(){try{const l=JSON.parse(localStorage.getItem(PKEY));return(l&&l.length)?l:defaultPlayers();}catch(e){return defaultPlayers();}}
function psave(l){try{localStorage.setItem(PKEY,JSON.stringify(l));}catch(e){}}
/* ---------- PLAYER PROFILES (foundation — see PROFILES_SPEC.md) ---------- */
const PROFKEY="gn_profiles",OWNERKEY="gn_owner";
function newId(){return "p_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function profSave(l){try{localStorage.setItem(PROFKEY,JSON.stringify(l));}catch(e){}
  try{psave(l.map(p=>({name:p.name,color:p.color,light:p.light,dark:p.dark})));}catch(e){} } // mirror name/color into legacy roster (sync continuity until Phase 5)
function profLoad(){
  try{const l=JSON.parse(localStorage.getItem(PROFKEY));if(l&&l.length)return l;}catch(e){}
  const seed=pload().map(p=>({id:newId(),name:p.name,color:p.color,light:p.light,dark:p.dark,avatar:{kind:"color"},prefs:{},stats:{}}));
  profSave(seed);return seed;
}
function mirrorProfiles(l){mirror(()=>_db.doc("households/"+_hh+"/state/profiles").set({list:l}));}
function applyOwnerPrefs(){/* Phase 3 wires Easy View / sound / TV to the owner's prefs */}
GN.profiles={
  list:function(){return profLoad();},
  get:function(id){return profLoad().find(p=>p.id===id)||null;},
  byName:function(n){n=(n||"").toLowerCase();return profLoad().find(p=>p.name.toLowerCase()===n)||null;},
  add:function(name,pal){name=(name||"").trim();if(!name)return null;const l=profLoad();
    const ex=l.find(p=>p.name.toLowerCase()===name.toLowerCase());if(ex)return ex;
    const used=new Set(l.map(p=>p.color));const c=pal||PALETTE.find(x=>!used.has(x.color))||PALETTE[l.length%PALETTE.length];
    const p={id:newId(),name:name,color:c.color,light:c.light,dark:c.dark,avatar:{kind:"color"},prefs:{},stats:{}};
    l.push(p);profSave(l);mirrorProfiles(l);return p;},
  rename:function(id,name){name=(name||"").trim();if(!name)return null;const l=profLoad();const p=l.find(x=>x.id===id);if(!p)return null;p.name=name;profSave(l);mirrorProfiles(l);return p;},
  recolor:function(id,pal){const l=profLoad();const p=l.find(x=>x.id===id);if(!p||!pal)return null;p.color=pal.color;p.light=pal.light;p.dark=pal.dark;profSave(l);mirrorProfiles(l);return p;},
  setAvatar:function(id,av){const l=profLoad();const p=l.find(x=>x.id===id);if(!p)return null;p.avatar=av||{kind:"color"};profSave(l);mirrorProfiles(l);return p;},
  remove:function(id){let l=profLoad();if(l.length<=1)return false;l=l.filter(p=>p.id!==id);profSave(l);mirrorProfiles(l);
    try{if(localStorage.getItem(OWNERKEY)===id)localStorage.removeItem(OWNERKEY);}catch(e){}return true;},
  owner:function(){try{const id=localStorage.getItem(OWNERKEY);if(id){const p=this.get(id);if(p)return p;}}catch(e){}return null;},
  needsOwner:function(){return !this.owner();},
  setOwner:function(id){try{localStorage.setItem(OWNERKEY,id);}catch(e){}applyOwnerPrefs();return this.owner();},
  pref:function(k,d){const o=this.owner();return(o&&o.prefs&&(k in o.prefs))?o.prefs[k]:d;},
  setPref:function(k,v){const o=this.owner();if(!o)return;const l=profLoad();const p=l.find(x=>x.id===o.id);if(!p)return;p.prefs=p.prefs||{};p.prefs[k]=v;profSave(l);mirrorProfiles(l);applyOwnerPrefs();},
  bump:function(idOrName,gameKey,delta){const l=profLoad();const p=l.find(x=>x.id===idOrName)||l.find(x=>x.name.toLowerCase()===(idOrName||"").toLowerCase());if(!p)return;
    delta=delta||{};const s=p.stats[gameKey]||(p.stats[gameKey]={plays:0,wins:0});
    s.plays+=(delta.plays!=null?delta.plays:1);
    if(delta.win)s.wins=(s.wins||0)+1;
    if(delta.loss)s.losses=(s.losses||0)+1;
    if(delta.draw)s.draws=(s.draws||0)+1;
    if(delta.score!=null)s.best=Math.max(s.best||0,delta.score);
    profSave(l);mirrorProfiles(l);},
  recordResult:function(gameKey,results){(results||[]).forEach(r=>this.bump(r.id||r.name,gameKey,r));}
};
/* roster now sourced from profiles; shape preserved so all games keep working */
GN.players=function(){return profLoad().map(p=>({name:p.name,color:p.color,light:p.light,dark:p.dark,avatar:p.avatar||{kind:"color"}}));};
GN.addPlayer=function(name,chosenPal){return GN.profiles.add(name,chosenPal);};
GN.recolorPlayer=function(name,pal){const p=GN.profiles.byName(name);if(!p)return null;return GN.profiles.recolor(p.id,pal);};
/* ---------- avatars: game-themed icon catalog + shared token renderer ---------- */
/* each icon = white-forward inner SVG (with translucent-black detail) on a 0 0 100 100 canvas,
   drawn over the profile's color gradient so it reads on any color. */
GN.AVATARS=[
 /* ----- Games ----- */
 {id:"die",set:"Games",svg:'<rect x="24" y="24" width="52" height="52" rx="11" fill="#fff"/><g fill="rgba(0,0,0,.32)"><circle cx="36" cy="36" r="4.5"/><circle cx="64" cy="36" r="4.5"/><circle cx="50" cy="50" r="4.5"/><circle cx="36" cy="64" r="4.5"/><circle cx="64" cy="64" r="4.5"/></g>'},
 {id:"cards",set:"Games",svg:'<g stroke="rgba(0,0,0,.22)" stroke-width="1.5"><rect x="28" y="36" width="26" height="38" rx="4" fill="#fff" transform="rotate(-16 41 55)"/><rect x="37" y="32" width="26" height="38" rx="4" fill="#fff"/><rect x="46" y="36" width="26" height="38" rx="4" fill="#fff" transform="rotate(16 59 55)"/></g>'},
 {id:"king",set:"Games",svg:'<path d="M28 62 l-5-26 16 13 11-21 11 21 16-13 -5 26 z" fill="#fff"/><rect x="28" y="62" width="44" height="9" rx="2" fill="#fff"/><rect x="47" y="14" width="6" height="14" fill="#fff"/><rect x="42" y="18" width="16" height="6" fill="#fff"/>'},
 {id:"pawn",set:"Games",svg:'<circle cx="50" cy="33" r="11" fill="#fff"/><path d="M40 47 h20 l6 30 h-32 z" fill="#fff"/>'},
 {id:"checker",set:"Games",svg:'<circle cx="50" cy="50" r="26" fill="#fff"/><circle cx="50" cy="50" r="19" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><circle cx="50" cy="50" r="12" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/>'},
 {id:"marble",set:"Games",svg:'<circle cx="50" cy="50" r="26" fill="rgba(255,255,255,.85)"/><circle cx="43" cy="41" r="8" fill="#fff"/>'},
 {id:"domino",set:"Games",svg:'<rect x="34" y="22" width="32" height="56" rx="6" fill="#fff"/><rect x="36" y="48.5" width="28" height="3" fill="rgba(0,0,0,.3)"/><g fill="rgba(0,0,0,.3)"><circle cx="50" cy="36" r="4"/><circle cx="43" cy="63" r="3.5"/><circle cx="57" cy="63" r="3.5"/></g>'},
 {id:"ladder",set:"Games",svg:'<g stroke="#fff" stroke-width="5" stroke-linecap="round"><line x1="38" y1="22" x2="38" y2="78"/><line x1="62" y1="22" x2="62" y2="78"/><line x1="38" y1="34" x2="62" y2="34"/><line x1="38" y1="50" x2="62" y2="50"/><line x1="38" y1="66" x2="62" y2="66"/></g>'},
 {id:"snake",set:"Games",svg:'<path d="M34 28 c22 0 22 20 0 22 c-22 2 -22 24 0 24" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="34" cy="28" r="7" fill="#fff"/><circle cx="32" cy="27" r="1.8" fill="rgba(0,0,0,.55)"/>'},
 /* ----- Fun ----- */
 {id:"star",set:"Fun",svg:'<path d="M50 18 l9 20 22 2 -16 15 5 22 -20-11 -20 11 5-22 -16-15 22-2 z" fill="#fff"/>'},
 {id:"heart",set:"Fun",svg:'<path d="M50 74 L29 51 a13 13 0 0 1 21-15 a13 13 0 0 1 21 15 z" fill="#fff"/>'},
 {id:"crown",set:"Fun",svg:'<path d="M27 64 l-5-28 16 14 12-22 12 22 16-14 -5 28 z" fill="#fff"/><rect x="27" y="64" width="46" height="9" rx="2" fill="#fff"/>'},
 {id:"smiley",set:"Fun",svg:'<circle cx="50" cy="50" r="28" fill="#fff"/><g fill="rgba(0,0,0,.5)"><circle cx="40" cy="45" r="4"/><circle cx="60" cy="45" r="4"/></g><path d="M37 59 q13 13 26 0" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="4" stroke-linecap="round"/>'},
 {id:"bolt",set:"Fun",svg:'<path d="M56 16 L30 56 h16 l-6 28 26-44 h-16 z" fill="#fff"/>'},
 {id:"paw",set:"Fun",svg:'<g fill="#fff"><ellipse cx="50" cy="63" rx="16" ry="13"/><circle cx="33" cy="45" r="7"/><circle cx="45" cy="36" r="7"/><circle cx="55" cy="36" r="7"/><circle cx="67" cy="45" r="7"/></g>'},
 /* ----- Animals ----- */
 {id:"cat",set:"Animals",svg:'<polygon points="34,30 30,14 46,26" fill="#fff"/><polygon points="66,30 70,14 54,26" fill="#fff"/><circle cx="50" cy="50" r="24" fill="#fff"/><g fill="rgba(0,0,0,.45)"><circle cx="41" cy="46" r="3"/><circle cx="59" cy="46" r="3"/></g><path d="M44 56 Q50 62 56 56" stroke="rgba(0,0,0,.4)" stroke-width="2.5" fill="none" stroke-linecap="round"/>'},
 {id:"dog",set:"Animals",svg:'<ellipse cx="28" cy="46" rx="9" ry="18" fill="#fff"/><ellipse cx="72" cy="46" rx="9" ry="18" fill="#fff"/><circle cx="50" cy="48" r="24" fill="#fff"/><g fill="rgba(0,0,0,.45)"><circle cx="42" cy="44" r="3"/><circle cx="58" cy="44" r="3"/><circle cx="50" cy="56" r="4"/></g>'},
 {id:"fish",set:"Animals",svg:'<ellipse cx="46" cy="50" rx="26" ry="17" fill="#fff"/><polygon points="68,50 86,36 86,64" fill="#fff"/><circle cx="34" cy="46" r="3" fill="rgba(0,0,0,.5)"/>'},
 {id:"bird",set:"Animals",svg:'<circle cx="50" cy="52" r="22" fill="#fff"/><circle cx="50" cy="34" r="13" fill="#fff"/><polygon points="62,34 74,38 62,42" fill="rgba(0,0,0,.35)"/><circle cx="55" cy="32" r="2.5" fill="rgba(0,0,0,.5)"/>'},
 {id:"bunny",set:"Animals",svg:'<ellipse cx="40" cy="22" rx="6" ry="18" fill="#fff"/><ellipse cx="60" cy="22" rx="6" ry="18" fill="#fff"/><circle cx="50" cy="56" r="22" fill="#fff"/><g fill="rgba(0,0,0,.45)"><circle cx="42" cy="52" r="3"/><circle cx="58" cy="52" r="3"/></g><circle cx="50" cy="62" r="3" fill="rgba(0,0,0,.35)"/>'},
 {id:"bear",set:"Animals",svg:'<circle cx="32" cy="32" r="10" fill="#fff"/><circle cx="68" cy="32" r="10" fill="#fff"/><circle cx="50" cy="52" r="24" fill="#fff"/><g fill="rgba(0,0,0,.45)"><circle cx="42" cy="48" r="3"/><circle cx="58" cy="48" r="3"/></g><circle cx="50" cy="58" r="5" fill="rgba(0,0,0,.3)"/>'},
 {id:"butterfly",set:"Animals",svg:'<ellipse cx="50" cy="50" rx="3" ry="20" fill="rgba(0,0,0,.4)"/><circle cx="36" cy="38" r="14" fill="#fff"/><circle cx="64" cy="38" r="14" fill="#fff"/><circle cx="36" cy="62" r="11" fill="#fff"/><circle cx="64" cy="62" r="11" fill="#fff"/>'},
 {id:"turtle",set:"Animals",svg:'<circle cx="50" cy="30" r="8" fill="#fff"/><g fill="#fff"><circle cx="26" cy="64" r="6"/><circle cx="74" cy="64" r="6"/><circle cx="32" cy="44" r="5"/><circle cx="68" cy="44" r="5"/></g><ellipse cx="50" cy="54" rx="26" ry="20" fill="#fff"/><path d="M40 54 H60 M50 44 V64" stroke="rgba(0,0,0,.22)" stroke-width="3"/>'},
 /* ----- Nature ----- */
 {id:"tree",set:"Nature",svg:'<rect x="45" y="52" width="10" height="26" rx="2" fill="rgba(0,0,0,.3)"/><circle cx="50" cy="40" r="24" fill="#fff"/>'},
 {id:"flower",set:"Nature",svg:'<g fill="#fff"><circle cx="50" cy="30" r="11"/><circle cx="69" cy="44" r="11"/><circle cx="62" cy="66" r="11"/><circle cx="38" cy="66" r="11"/><circle cx="31" cy="44" r="11"/></g><circle cx="50" cy="50" r="10" fill="rgba(0,0,0,.3)"/>'},
 {id:"sun",set:"Nature",svg:'<circle cx="50" cy="50" r="18" fill="#fff"/><g stroke="#fff" stroke-width="5" stroke-linecap="round"><line x1="50" y1="14" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="86"/><line x1="14" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="86" y2="50"/><line x1="25" y1="25" x2="32" y2="32"/><line x1="75" y1="75" x2="68" y2="68"/><line x1="75" y1="25" x2="68" y2="32"/><line x1="25" y1="75" x2="32" y2="68"/></g>'},
 {id:"moon",set:"Nature",svg:'<path d="M62 22 A30 30 0 1 0 62 78 A24 24 0 1 1 62 22 Z" fill="#fff"/>'},
 {id:"cloud",set:"Nature",svg:'<g fill="#fff"><circle cx="38" cy="54" r="14"/><circle cx="56" cy="48" r="18"/><circle cx="68" cy="56" r="13"/><rect x="36" y="54" width="34" height="16" rx="8"/></g>'},
 {id:"leaf",set:"Nature",svg:'<path d="M30 70 Q30 28 70 30 Q72 70 30 70 Z" fill="#fff"/><path d="M34 66 Q50 50 66 34" stroke="rgba(0,0,0,.25)" stroke-width="3" fill="none"/>'},
 {id:"snowflake",set:"Nature",svg:'<g stroke="#fff" stroke-width="4" stroke-linecap="round"><line x1="50" y1="18" x2="50" y2="82"/><line x1="22" y1="34" x2="78" y2="66"/><line x1="78" y1="34" x2="22" y2="66"/></g>'},
 /* ----- Space ----- */
 {id:"rocket",set:"Space",svg:'<path d="M50 16 Q64 32 64 56 L36 56 Q36 32 50 16 Z" fill="#fff"/><circle cx="50" cy="38" r="6" fill="rgba(0,0,0,.4)"/><polygon points="36,52 26,68 36,62" fill="#fff"/><polygon points="64,52 74,68 64,62" fill="#fff"/><polygon points="44,56 56,56 50,76" fill="rgba(0,0,0,.3)"/>'},
 {id:"planet",set:"Space",svg:'<circle cx="50" cy="50" r="20" fill="#fff"/><ellipse cx="50" cy="50" rx="34" ry="11" fill="none" stroke="#fff" stroke-width="5" transform="rotate(-20 50 50)"/>'},
 {id:"alien",set:"Space",svg:'<path d="M30 44 Q30 20 50 20 Q70 20 70 44 Q70 70 50 78 Q30 70 30 44 Z" fill="#fff"/><g fill="rgba(0,0,0,.5)"><ellipse cx="41" cy="46" rx="5" ry="8"/><ellipse cx="59" cy="46" rx="5" ry="8"/></g>'},
 /* ----- Food ----- */
 {id:"icecream",set:"Food",svg:'<polygon points="40,48 60,48 50,82" fill="rgba(0,0,0,.3)"/><circle cx="50" cy="38" r="16" fill="#fff"/><circle cx="42" cy="44" r="11" fill="#fff"/><circle cx="58" cy="44" r="11" fill="#fff"/>'},
 {id:"cupcake",set:"Food",svg:'<path d="M30 50 Q30 30 50 30 Q70 30 70 50 Z" fill="#fff"/><circle cx="50" cy="26" r="4" fill="rgba(0,0,0,.3)"/><path d="M32 50 L38 78 L62 78 L68 50 Z" fill="#fff"/><g stroke="rgba(0,0,0,.22)" stroke-width="2"><line x1="44" y1="54" x2="42" y2="76"/><line x1="50" y1="54" x2="50" y2="76"/><line x1="56" y1="54" x2="58" y2="76"/></g>'},
 {id:"apple",set:"Food",svg:'<circle cx="40" cy="52" r="18" fill="#fff"/><circle cx="60" cy="52" r="18" fill="#fff"/><rect x="48" y="26" width="4" height="14" rx="2" fill="rgba(0,0,0,.4)"/><ellipse cx="60" cy="30" rx="9" ry="5" fill="rgba(0,0,0,.25)" transform="rotate(-25 60 30)"/>'},
 {id:"donut",set:"Food",svg:'<circle cx="50" cy="50" r="26" fill="#fff"/><circle cx="50" cy="50" r="9" fill="rgba(0,0,0,.4)"/><g stroke="rgba(0,0,0,.3)" stroke-width="3" stroke-linecap="round"><line x1="40" y1="36" x2="44" y2="40"/><line x1="62" y1="42" x2="58" y2="46"/><line x1="38" y1="60" x2="42" y2="62"/><line x1="60" y1="62" x2="64" y2="58"/><line x1="50" y1="30" x2="50" y2="34"/></g>'},
 /* ----- Things ----- */
 {id:"robot",set:"Things",svg:'<line x1="50" y1="32" x2="50" y2="20" stroke="#fff" stroke-width="4"/><circle cx="50" cy="18" r="4" fill="#fff"/><rect x="30" y="32" width="40" height="36" rx="8" fill="#fff"/><g fill="rgba(0,0,0,.5)"><circle cx="41" cy="48" r="5"/><circle cx="59" cy="48" r="5"/></g><rect x="40" y="60" width="20" height="4" rx="2" fill="rgba(0,0,0,.4)"/>'},
 {id:"car",set:"Things",svg:'<path d="M22 56 L30 42 L70 42 L78 56 Z" fill="#fff"/><rect x="22" y="54" width="56" height="12" rx="4" fill="#fff"/><g fill="rgba(0,0,0,.4)"><circle cx="34" cy="68" r="7"/><circle cx="66" cy="68" r="7"/></g><polygon points="38,44 46,52 34,52" fill="rgba(0,0,0,.22)"/><polygon points="62,44 54,52 66,52" fill="rgba(0,0,0,.22)"/>'},
 {id:"boat",set:"Things",svg:'<polygon points="50,20 50,56 74,56" fill="#fff"/><rect x="48" y="20" width="3" height="40" fill="rgba(0,0,0,.3)"/><path d="M24 60 L76 60 L68 74 L32 74 Z" fill="#fff"/>'},
 {id:"gift",set:"Things",svg:'<circle cx="42" cy="36" r="8" fill="none" stroke="#fff" stroke-width="5"/><circle cx="58" cy="36" r="8" fill="none" stroke="#fff" stroke-width="5"/><rect x="28" y="44" width="44" height="32" rx="3" fill="#fff"/><rect x="46" y="44" width="8" height="32" fill="rgba(0,0,0,.3)"/><rect x="28" y="44" width="44" height="9" fill="rgba(0,0,0,.16)"/>'},
 {id:"music",set:"Things",svg:'<rect x="46" y="24" width="5" height="44" fill="#fff"/><path d="M51 24 Q66 28 64 44 Q60 34 51 36 Z" fill="#fff"/><ellipse cx="38" cy="68" rx="11" ry="8" fill="#fff" transform="rotate(-20 38 68)"/>'},
 {id:"gem",set:"Things",svg:'<polygon points="50,22 72,40 50,80 28,40" fill="#fff"/><g stroke="rgba(0,0,0,.22)" stroke-width="2" fill="none"><line x1="28" y1="40" x2="72" y2="40"/><line x1="40" y1="40" x2="50" y2="80"/><line x1="60" y1="40" x2="50" y2="80"/><line x1="40" y1="40" x2="50" y2="22"/><line x1="60" y1="40" x2="50" y2="22"/></g>'}
];
/* ordered groups of icons by theme (Games, Fun, Animals, ...) for the picker */
GN.avatarSets=function(){const order=[],map={};GN.AVATARS.forEach(a=>{if(!map[a.set]){map[a.set]=[];order.push(a.set);}map[a.set].push(a);});return order.map(s=>({set:s,icons:map[s]}));};
GN.avatarInner=function(p,size){const av=(p&&p.avatar)||{kind:"color"};
  if(av.kind==="photo"&&av.photo)return '<img src="'+av.photo+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">';
  if(av.kind==="icon"&&av.icon){const ic=GN.AVATARS.find(a=>a.id===av.icon);if(ic)return '<svg viewBox="0 0 100 100" style="width:80%;height:80%;display:block;">'+ic.svg+'</svg>';}
  return (p&&p.name?p.name:"?").trim().charAt(0).toUpperCase();
};
GN.tokenHTML=function(p,size){size=size||40;
  return '<span class="gnTok" style="flex:none;width:'+size+'px;height:'+size+'px;border-radius:50%;display:inline-flex;'
    +'align-items:center;justify-content:center;overflow:hidden;color:#fff;font-weight:800;font-size:'+Math.round(size*0.42)+'px;'
    +'box-shadow:0 1px 3px rgba(0,0,0,.35) inset;background:radial-gradient(circle at 35% 30%,'+p.light+','+p.color+' 62%,'+p.dark+');">'
    +GN.avatarInner(p,size)+'</span>';};
GN.lastPair=function(){try{const pr=JSON.parse(localStorage.getItem(PAIRKEY));
    if(pr&&pr.length===2){const l=pload();
      const a=l.find(p=>p.name===pr[0]),b=l.find(p=>p.name===pr[1]);
      if(a&&b)return[a,b];}}catch(e){}
  const l=pload();return[l[0],l[1]];};
function savePair(a,b){try{localStorage.setItem(PAIRKEY,JSON.stringify([a.name,b.name]));}catch(e){}}

/* ---------- global ledger (dynamic player names; seam for Firebase) ---------- */
const GKEY="gn_global";let _gmem=null;
function blank(){return{flips:{n:0,won:{},streak:{who:null,len:0}},
  dice:{rolled:0,sixes:0,doubles:0},sentHome:0,wins:{},games:0,timeMs:0};}
function gload(){try{const g=JSON.parse(localStorage.getItem(GKEY));if(!g)return blank();
    if(!g.flips.won)g.flips.won={Mot:g.flips.Mot||0,Kathy:g.flips.Kathy||0}; // migrate v1
    return g;}catch(e){return _gmem||blank();}}
function gsave(g){try{localStorage.setItem(GKEY,JSON.stringify(g));}catch(e){_gmem=g;}}
GN.g={
  addFlip(winnerName){const g=gload();g.flips.n++;
    g.flips.won[winnerName]=(g.flips.won[winnerName]||0)+1;
    if(g.flips.streak.who===winnerName)g.flips.streak.len++;else g.flips.streak={who:winnerName,len:1};
    gsave(g);
    mirror(()=>_db.doc("households/"+_hh+"/state/global").update({"flips.n":FV().increment(1),
      ["flips.won."+winnerName]:FV().increment(1),"flips.streak":g.flips.streak}));},
  addDice(vals){const g=gload();g.dice.rolled+=vals.length;
    let sx=0;for(const v of vals)if(v===6){g.dice.sixes++;sx++;}
    const db=(vals.length===2&&vals[0]===vals[1])?1:0;if(db)g.dice.doubles++;
    gsave(g);
    mirror(()=>_db.doc("households/"+_hh+"/state/global").update({"dice.rolled":FV().increment(vals.length),
      "dice.sixes":FV().increment(sx),"dice.doubles":FV().increment(db)}));},
  addSentHome(n){const g=gload();g.sentHome+=(n||1);gsave(g);
    mirror(()=>_db.doc("households/"+_hh+"/state/global").update({sentHome:FV().increment(n||1)}));},
  addResult(winner,loser,durMs){const g=gload();
    if(winner)g.wins[winner]=(g.wins[winner]||0)+1;
    g.games++;g.timeMs+=(durMs||0);gsave(g);
    mirror(()=>{const u={games:FV().increment(1),timeMs:FV().increment(durMs||0)};
      if(winner)u["wins."+winner]=FV().increment(1);
      _db.doc("households/"+_hh+"/state/global").update(u);});},
  read(){return gload();}};

GN.friendly=false;
GN.recordGame=function(key,rec){
  GN._inPlay=false;
  if(GN.friendly)return; // friendly games leave no trace

  let l=[];try{l=JSON.parse(localStorage.getItem(key))||[];}catch(e){}
  l.push(rec);
  try{localStorage.setItem(key,JSON.stringify(l));}catch(e){}
  mirror(()=>_db.doc("households/"+_hh+"/records/"+key).set({list:FV().arrayUnion(rec)},{merge:true}));
  GN.g.addResult(rec.winner,rec.loser,rec.durationMs);
  try{GN._award(key,rec);}catch(e){}};

/* feed the per-player achievements engine + show a ceremony for new badges */
var _BADW={tie:1,"(draw)":1,Computer:1,You:1};
GN._award=function(key,rec){
  var A=GN.achievements||(typeof window!=="undefined"&&window.Achievements);if(!A)return;
  var players=(rec.players&&rec.players.length)?rec.players.slice()
    :(GN._participants&&GN._participants.length)?GN._participants.slice():[];
  if(!players.length){if(rec.winner&&typeof rec.winner==="string"&&!_BADW[rec.winner])players.push(rec.winner);
    if(rec.loser&&!_BADW[rec.loser])players.push(rec.loser);}
  var winner=(rec.winner&&!_BADW[rec.winner]&&players.indexOf(rec.winner)>=0)?rec.winner:null;
  var metric=A.metricFromRec?A.metricFromRec(key,rec):null;
  var fired=A.applyResult({gameKey:key,players:players,winner:winner,metric:metric,metricPlayer:players[0]});
  if(fired&&fired.length)GN._ceremony(fired);
};
GN._ceremony=function(list){
  if(!list||!list.length||typeof document==="undefined")return;
  setTimeout(function(){try{
    var ov=document.getElementById("gnAch");if(ov)ov.remove();
    ov=document.createElement("div");ov.id="gnAch";
    ov.style.cssText="position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;padding:24px;background:rgba(10,14,20,.88);text-align:center;font-family:system-ui,sans-serif;";
    var t=document.createElement("div");t.style.cssText="color:#fff;font-weight:900;font-size:22px;";
    t.textContent=list.length>1?"Badges unlocked!":(list[0].leveledUp?"Level up!":"Badge unlocked!");
    ov.appendChild(t);
    var COL=["#b9c6d0","#a4642f","#8ea0ac","#cf9a1e","#1f8e7e","#6a3fc0"];
    list.slice(0,6).forEach(function(b){
      var row=document.createElement("div");
      row.style.cssText="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:10px 16px;max-width:340px;width:100%;";
      var m=document.createElement("div");
      m.style.cssText="width:46px;height:46px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:16px;border:2px solid rgba(255,255,255,.55);box-shadow:inset 0 -3px 6px rgba(0,0,0,.3);background:"+(COL[Math.min(b.tier,5)]||"#888")+";";
      m.textContent=(b.tier===b.tiers)?"\u2605":b.tier;
      var tx=document.createElement("div");tx.style.cssText="text-align:left;color:#fff;";
      tx.innerHTML='<div style="font-weight:800;font-size:15px;">'+b.name+'</div><div style="font-size:12.5px;color:#cfe0ec;">'+(b.leveledUp?"Leveled up to ":"")+b.tierName+'</div>';
      row.appendChild(m);row.appendChild(tx);ov.appendChild(row);
    });
    var btn=document.createElement("button");btn.textContent="Nice!";
    btn.style.cssText="margin-top:6px;font-family:inherit;font-weight:800;font-size:16px;color:#10202e;background:#f4c542;border:none;border-radius:10px;padding:11px 28px;box-shadow:0 4px 0 #a8852a;cursor:pointer;";
    btn.onclick=function(){ov.remove();};
    ov.appendChild(btn);
    ov.addEventListener("click",function(e){if(e.target===ov)ov.remove();});
    document.body.appendChild(ov);
    if(typeof window!=="undefined"&&window.GNS)GNS.play("fanfare");
  }catch(e){}},500);
};
/* GN.soloStart(done,opts) -> "who's playing?" for solo games.
   Sets GN._participants + GN.friendly, then done(name,{friendly}). */
GN.soloStart=function(done,opts){
  try{injectCSS();}catch(e){}opts=opts||{};GN._inPlay=false;
  var players=GN.players(),sel=null;
  try{var last=localStorage.getItem("gn_solo_player");if(last)sel=players.filter(function(p){return p.name===last;})[0];}catch(e){}
  if(!sel&&GN.profiles&&GN.profiles.owner){var o=GN.profiles.owner();if(o)sel=players.filter(function(p){return p.name===o.name;})[0];}
  if(!sel)sel=players[0];
  var friendly=false;
  var ov=document.createElement("div");ov.className="gnOv";
  var t=document.createElement("div");t.className="gnTitle";t.textContent=opts.title||"Who\u2019s playing?";ov.appendChild(t);
  var seats=document.createElement("div");seats.className="gnSeats";
  seats.style.flexWrap="wrap";seats.style.justifyContent="center";seats.style.maxWidth="430px";ov.appendChild(seats);
  function drawSeats(){seats.innerHTML="";players.forEach(function(p){
    var b=document.createElement("button");b.className="gnSeat";b.style.minWidth="0";
    b.style.display="inline-flex";b.style.alignItems="center";b.style.gap="8px";
    b.style.outline=(sel&&p.name===sel.name)?"3px solid #f4c542":"none";
    b.innerHTML=(GN.tokenHTML?GN.tokenHTML(p,24):"")+"<span>"+p.name+"</span>";
    b.onclick=function(){sel=p;drawSeats();};seats.appendChild(b);});}
  drawSeats();
  if(opts.allowFriendly!==false){
    var fr=document.createElement("button");fr.className="gnAdd";fr.style.color="#cfe6d8";
    fr.textContent="\u2713 Counts for the record";
    fr.onclick=function(){friendly=!friendly;
      fr.textContent=friendly?"\u26a0 Just for fun \u2014 won\u2019t be saved":"\u2713 Counts for the record";
      fr.style.color=friendly?"#f4c542":"#cfe6d8";};
    ov.appendChild(fr);
  }
  var go=document.createElement("button");go.className="gnBtn";go.textContent=opts.go||"Start";
  go.onclick=function(){if(!sel)return;try{localStorage.setItem("gn_solo_player",sel.name);}catch(e){}
    GN._participants=[sel.name];GN.friendly=!!friendly;GN._inPlay=true;ov.remove();
    if(done)done(sel.name,{friendly:!!friendly});};
  ov.appendChild(go);
  document.body.appendChild(ov);
};
/* small "Player: X" badge that re-opens the picker when tapped */
GN.whoBadge=function(el,name,onChange){
  if(!el)return;var p=GN.players().filter(function(x){return x.name===name;})[0]||{name:name||"Player",color:"#888"};
  el.innerHTML=(GN.tokenHTML?GN.tokenHTML(p,20):"")+"<span style=\"margin-left:6px\">"+p.name+"</span>";
  el.style.display="inline-flex";el.style.alignItems="center";el.onclick=onChange||null;el.style.cursor=onChange?"pointer":"default";
};
GN.readGames=function(key){try{return JSON.parse(localStorage.getItem(key))||[];}catch(e){return[];}};

/* ---------- shared CSS ---------- */
const css=`
.gnOv{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  padding:26px;text-align:center;background:rgba(7,12,9,.92);font-family:system-ui,sans-serif;color:#e8f0e4;}
.gnTitle{font-size:23px;font-weight:800;}
.gnBtn{font-family:inherit;font-size:16px;font-weight:bold;padding:10px 20px;border-radius:10px;border:none;
  color:#1c2b16;background:#b0d235;cursor:pointer;box-shadow:0 4px 0 #7e9a1f,0 5px 10px rgba(0,0,0,.4);}
.gnBtn.ghost{background:#15241b;color:#cfe6d8;box-shadow:0 4px 0 #0b160f;border:1px solid #3a5a47;}
.gnSeats{display:flex;align-items:center;gap:14px;}
.gnSeat{min-width:118px;padding:12px 14px;border-radius:14px;border:2px solid rgba(255,255,255,.25);
  font-weight:800;font-size:17px;color:#fff;cursor:pointer;background:none;font-family:inherit;
  box-shadow:0 6px 14px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.25);}
.gnSeat small{display:block;font-weight:400;font-size:11px;opacity:.85;margin-top:2px;}
.gnVs{color:#7d9a88;font-weight:700;}
.gnAdd{background:none;border:none;color:#9fbdac;font-size:13px;text-decoration:underline;cursor:pointer;font-family:inherit;}
.gnScene{perspective:700px;width:140px;height:140px;}
.gnCoin{position:relative;width:120px;height:120px;margin:10px;transform-style:preserve-3d;}
.gnFace{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;
  font-size:22px;font-weight:800;color:#fff;
  box-shadow:inset 0 0 0 5px #c9a23c,inset 0 0 0 8px rgba(0,0,0,.18),inset 0 6px 14px rgba(255,255,255,.45);}
.gnEdge{position:absolute;inset:0;border-radius:50%;background:repeating-linear-gradient(90deg,#cda53e 0 3px,#9c7a28 3px 6px);}
.gnShadow{width:90px;height:18px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.5),transparent);margin-top:-6px;}
.gnStats{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;gap:10px;
  padding:22px 16px;overflow:auto;background:radial-gradient(110% 80% at 50% 30%,#1f3327 0%,#0c1410 80%);
  font-family:system-ui,sans-serif;color:#e8f0e4;}
.gnStats h1{font-size:25px;}
.gnH2H{display:flex;align-items:center;gap:18px;font-weight:700;}
.gnH2H .big{font-size:38px;line-height:1;}
.gnRow{display:grid;grid-template-columns:130px 1fr 70px;align-items:center;gap:8px;width:100%;max-width:420px;}
.gnRow .l{font-size:13px;color:#cfe6d8;text-align:right;}
.gnRow .bar{height:13px;border-radius:7px;overflow:hidden;display:flex;background:#0e1813;}
.gnRow .bar span{display:block;height:100%;}
.gnRow .v{font-size:12px;color:#bcd6c7;font-variant-numeric:tabular-nums;}
.gnIll{margin:8px auto 4px;max-width:280px;}.gnIll svg{width:100%;height:auto;display:block;}.gnEx{margin:8px 0 2px;padding:8px 12px;border-left:3px solid #f4c542;background:rgba(244,197,66,.08);border-radius:0 8px 8px 0;font-size:13.5px;line-height:1.5;color:#e8e0c8;text-align:left;}.gnSec{margin-top:8px;color:#9fbdac;font-size:12px;letter-spacing:.6px;text-transform:uppercase;}
.gnMeta{color:#9fbdac;font-size:13px;text-align:center;max-width:440px;}
/* Easy View: per-device large text & tap targets (toggled on the shelf). Shared chrome only. */
html.gn-easy .gnTitle{font-size:30px;}
html.gn-easy .gnBtn{font-size:21px !important;padding:15px 28px !important;}
html.gn-easy .gnSeat{min-width:150px;padding:17px 18px;font-size:22px;}
html.gn-easy .gnSeat small{font-size:14px;}
html.gn-easy .gnAdd{font-size:17px;}
html.gn-easy .gnStats h1{font-size:31px;}
html.gn-easy .gnMeta{font-size:17px !important;}
html.gn-easy .gnEx{font-size:17px;}
html.gn-easy .gnSec{font-size:15px;}
`;
function injectCSS(){if(document.getElementById("gnCSS"))return;
  const s=document.createElement("style");s.id="gnCSS";s.textContent=css;document.head.appendChild(s);}

/* ---------- match start: who's playing? + coin flip ---------- */
/* GN.matchStart(done) -> done({a,b,first}) where a,b,first are player objects */
GN.matchStart=function(done,opts){injectCSS();GN._inPlay=false;opts=opts||{};
  let[a,b]=GN.lastPair();
  const ov=document.createElement("div");ov.className="gnOv";
  const back=document.createElement("a");back.href="index.html";back.textContent="\u2329 Shelf";
  back.style.cssText="position:absolute;top:14px;left:14px;color:#cfe6d8;border:1px solid #3a5a47;"+
    "border-radius:999px;padding:7px 14px;text-decoration:none;font-size:14px;z-index:2;";
  ov.appendChild(back);
  ov.innerHTML+='<div class="gnTitle" id="gnT">Who\u2019s playing?</div>'+
    '<div class="gnSeats"><button class="gnSeat" id="gnA"></button><span class="gnVs">vs</span><button class="gnSeat" id="gnB"></button></div>'+
    '<button class="gnAdd" id="gnNew">+ add a player</button>'+
    '<button class="gnAdd" id="gnRecolor">\ud83c\udfa8 change a color</button>'+
    '<button class="gnAdd" id="gnFr" style="color:#cfe6d8;">\u2713 Counts for the record</button>'+
    '<div class="gnScene" style="display:none" id="gnSc"><div class="gnCoin" id="gnC"></div><div class="gnShadow"></div></div>'+
    '<button class="gnBtn" id="gnGo">Flip for first</button>';
  document.body.appendChild(ov);
  const eA=ov.querySelector("#gnA"),eB=ov.querySelector("#gnB"),go=ov.querySelector("#gnGo"),
        title=ov.querySelector("#gnT"),scene=ov.querySelector("#gnSc"),coin=ov.querySelector("#gnC");
  function seat(el,p){el.innerHTML="";
    el.style.background="linear-gradient(160deg,"+p.light+","+p.color+" 60%,"+p.dark+")";
    let av=p.avatar||{kind:"color"};if(!p.avatar&&GN.profiles){const pr=GN.profiles.byName(p.name);if(pr&&pr.avatar)av=pr.avatar;}
    const row=document.createElement("span");row.style.cssText="display:inline-flex;align-items:center;gap:7px;justify-content:center;";
    row.innerHTML=GN.tokenHTML({name:p.name,color:p.color,light:p.light,dark:p.dark,avatar:av},28);
    const nm=document.createElement("span");nm.textContent=p.name;row.appendChild(nm);el.appendChild(row);
    const s=document.createElement("small");s.textContent="tap to change";el.appendChild(s);}
  function refresh(){seat(eA,a);seat(eB,b);}
  let mode="2p",botLevel=null;              // "1p" | "2p" | "cpu"; botLevel null until chosen
  const CPU={name:"Computer",color:"#6b7280",light:"#9aa3af",dark:"#3f454d"};
  const origB=b;
  if(opts.solo||opts.bot){
    const modeRow=document.createElement("div");
    modeRow.style.cssText="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:2px 0 4px;";
    const btns={};
    function mk(label,key){const btn=document.createElement("button");btn.textContent=label;
      btn.style.cssText="font-family:inherit;cursor:pointer;border-radius:999px;padding:9px 16px;font-size:15px;font-weight:700;border:1px solid #3a5a47;color:#cfe6d8;";
      btn.onclick=function(){mode=key;applyMode();};btns[key]=btn;modeRow.appendChild(btn);}
    if(opts.solo)mk("1 player","1p");
    mk("2 players","2p");
    if(opts.bot)mk("vs Computer","cpu");
    const wantDiff=opts.bot&&!opts.botSimple;
    const diffRow=document.createElement("div");
    diffRow.style.cssText="display:none;gap:8px;justify-content:center;margin:0 0 6px;";
    const diffBtns={};
    [["Easy","easy"],["Medium","medium"],["Hard","hard"]].forEach(function(pair){
      const d=document.createElement("button");d.textContent=pair[0];
      d.style.cssText="font-family:inherit;cursor:pointer;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:700;border:1px solid #4a5a6a;color:#cfe0ee;";
      d.onclick=function(){botLevel=pair[1];applyDiff();};diffBtns[pair[1]]=d;diffRow.appendChild(d);});
    function updateGo(){const isCpu=mode==="cpu",isSolo=mode==="1p";
      const needDiff=isCpu&&wantDiff&&!botLevel;
      go.disabled=needDiff;go.style.opacity=needDiff?".5":"";
      go.textContent=isSolo?"Start":(needDiff?"Pick a difficulty":"Flip for first");}
    function applyDiff(){for(const k in diffBtns)diffBtns[k].style.background=(botLevel===k)?"#2f6fd0":"#15202b";updateGo();}
    function applyMode(){
      for(const k in btns)btns[k].style.background=(mode===k)?"#2f7d4f":"#15241b";
      const isCpu=mode==="cpu",isSolo=mode==="1p";
      diffRow.style.display=(isCpu&&wantDiff)?"flex":"none";
      eB.style.display=isSolo?"none":"";
      const vs=ov.querySelector(".gnVs");if(vs)vs.style.display=isSolo?"none":"";
      const frB=ov.querySelector("#gnFr");if(frB)frB.style.display=isCpu?"none":"";
      if(isCpu){b=CPU;}else if(b===CPU){b=origB;}
      refresh();
      title.textContent=isSolo?"Playing solo":(isCpu?"You vs the Computer":"Who\u2019s playing?");
      updateGo();}
    const seatsEl=ov.querySelector(".gnSeats");
    seatsEl.parentNode.insertBefore(modeRow,seatsEl);
    if(wantDiff)seatsEl.parentNode.insertBefore(diffRow,seatsEl);
    applyDiff();applyMode();
  }
  function cycle(cur,other){const l=GN.players();let i=l.findIndex(p=>p.name===cur.name);
    for(let k=1;k<=l.length;k++){const c=l[(i+k)%l.length];if(c.name!==other.name)return c;}return cur;}
  eA.onclick=()=>{a=cycle(a,b);refresh();};
  eB.onclick=()=>{if(mode==="cpu")return;b=cycle(b,a);refresh();};
  function gnHideChrome(){[ov.querySelector(".gnSeats"),ov.querySelector("#gnNew"),ov.querySelector("#gnFr"),ov.querySelector("#gnRecolor"),go].forEach(e=>{if(e)e.style.display="none";});}
  function applyChrome(){const isCpu=mode==="cpu",isSolo=mode==="1p";
    if(eB)eB.style.display=isSolo?"none":"";
    const vs=ov.querySelector(".gnVs");if(vs)vs.style.display=isSolo?"none":"";
    const frB=ov.querySelector("#gnFr");if(frB)frB.style.display=isCpu?"none":"";}
  function gnShowChrome(){[[".gnSeats",""],["#gnNew",""],["#gnRecolor",""]].forEach(m=>{const e=ov.querySelector(m[0]);if(e)e.style.display=m[1];});go.style.display="";const fr=ov.querySelector("#gnFr");if(fr)fr.style.display="";applyChrome();}
  function openColorGrid(labelName,ownerName,onPick){
    gnHideChrome();
    const oldTitle=title.textContent;title.textContent="Pick "+labelName+"'s color";
    const pick=document.createElement("div");
    pick.style.cssText="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:6px 4px 2px;justify-items:center;";
    const taken={};for(const p of GN.players())if(!ownerName||p.name.toLowerCase()!==ownerName.toLowerCase())taken[p.color]=p.name;
    function close(){pick.remove();title.textContent=oldTitle;gnShowChrome();}
    GN.palette().forEach(pal=>{
      const w=document.createElement("button");const owner=taken[pal.color];
      w.style.cssText="width:52px;height:52px;border-radius:50%;border:2px solid rgba(255,255,255,"+(owner?".12":".45")+");cursor:"+(owner?"default":"pointer")+";position:relative;font-family:inherit;"+
        "background:radial-gradient(circle at 35% 30%,"+pal.light+","+pal.color+" 65%,"+pal.dark+");"+
        "box-shadow:inset 0 -5px 8px rgba(0,0,0,.35),inset 0 3px 4px rgba(255,255,255,.4),0 4px 9px rgba(0,0,0,.45);"+
        (owner?"opacity:.35;filter:saturate(.6);":"");
      if(owner){const t=document.createElement("div");t.textContent=owner;
        t.style.cssText="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:9px;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);max-width:48px;overflow:hidden;text-overflow:ellipsis;";
        w.appendChild(t);}
      else w.onclick=()=>{close();onPick(pal);};
      pick.appendChild(w);});
    const cancel=document.createElement("button");cancel.textContent="cancel";
    cancel.style.cssText="grid-column:1/-1;margin-top:4px;background:none;border:none;color:#9fbdac;font-size:12px;text-decoration:underline;cursor:pointer;font-family:inherit;";
    cancel.onclick=close;pick.appendChild(cancel);
    go.parentNode.insertBefore(pick,go);}
  ov.querySelector("#gnNew").onclick=()=>{const n=(prompt("Player name?")||"").trim();
    if(!n)return;
    const existing=GN.players().find(p=>p.name.toLowerCase()===n.toLowerCase());
    if(existing){if(existing.name!==a.name){b=existing;refresh();}return;}
    openColorGrid(n,null,pal=>{const p=GN.addPlayer(n,pal);if(p&&p.name!==a.name){b=p;refresh();}});};
  (function(){const rc=ov.querySelector("#gnRecolor");if(!rc)return;
    rc.onclick=()=>{gnHideChrome();
      const oldTitle=title.textContent;title.textContent="Whose color?";
      const list=document.createElement("div");list.style.cssText="display:flex;flex-direction:column;gap:8px;padding:4px 0;align-items:center;";
      function closeList(){list.remove();title.textContent=oldTitle;gnShowChrome();}
      GN.players().forEach(p=>{const btn=document.createElement("button");btn.textContent=p.name;
        btn.style.cssText="font-family:inherit;cursor:pointer;border-radius:999px;padding:10px 18px;font-size:15px;font-weight:700;border:1px solid rgba(255,255,255,.25);color:#fff;min-width:150px;background:linear-gradient(160deg,"+p.light+","+p.color+" 60%,"+p.dark+");";
        btn.onclick=()=>{list.remove();title.textContent=oldTitle;
          openColorGrid(p.name,p.name,pal=>{GN.recolorPlayer(p.name,pal);
            const l=GN.players();const na=l.find(x=>x.name===a.name);if(na)a=na;
            if(b&&b.name){const nb=l.find(x=>x.name===b.name);if(nb)b=nb;}refresh();});};
        list.appendChild(btn);});
      const cancel=document.createElement("button");cancel.textContent="cancel";
      cancel.style.cssText="margin-top:2px;background:none;border:none;color:#9fbdac;font-size:12px;text-decoration:underline;cursor:pointer;font-family:inherit;";
      cancel.onclick=closeList;list.appendChild(cancel);
      go.parentNode.insertBefore(list,go);};})();
  let friendly=false;const fr=ov.querySelector("#gnFr");
  fr.onclick=()=>{friendly=!friendly;
    fr.textContent=friendly?"\u26a0 Friendly game \u2014 not recorded":"\u2713 Counts for the record";
    fr.style.color=friendly?"#f4c542":"#cfe6d8";};
  refresh();
  go.onclick=function(){
    if(go.disabled)return;
    if(mode==="1p"){GN.friendly=friendly;ov.remove();GN._inPlay=true;GN._participants=[a.name];done({a,b:null,first:a,solo:true,friendly});return;}
    if(mode!=="cpu")savePair(a,b);
    eA.disabled=true;eB.disabled=true;ov.querySelector("#gnNew").style.display="none";
    ov.querySelector(".gnSeats").style.display="none";scene.style.display="";
    title.textContent="Who goes first?";go.style.visibility="hidden";
    coin.innerHTML="";
    for(let i=0;i<9;i++){const e=document.createElement("div");e.className="gnEdge";
      e.style.transform="translateZ("+(-6+i*1.5)+"px)";coin.appendChild(e);}
    const fH=document.createElement("div");fH.className="gnFace";fH.textContent=a.name.toUpperCase();
    fH.style.background="radial-gradient(circle at 38% 32%,"+a.light+","+a.color+" 70%,"+a.dark+")";
    fH.style.transform="translateZ(6px)";coin.appendChild(fH);
    const fT=document.createElement("div");fT.className="gnFace";fT.textContent=b.name.toUpperCase();
    fT.style.background="radial-gradient(circle at 38% 32%,"+b.light+","+b.color+" 70%,"+b.dark+")";
    fT.style.transform="rotateX(180deg) translateZ(6px)";coin.appendChild(fT);
    const heads=Math.random()<0.5,finalDeg=heads?0:180,turns=5+Math.floor(Math.random()*3);
    const H=200,dur=1300;let t0=null;
    function toss(ts){if(t0===null)t0=ts;const el=ts-t0;
      if(el<dur){const p=el/dur,arc=Math.sin(p*Math.PI);
        const ty=90*(1-p)-arc*H,sc=0.8+0.2*p+0.35*arc,deg=(turns*360+finalDeg)*(1-Math.pow(1-p,2.2));
        coin.style.transform="translateY("+ty+"px) scale("+sc+") rotateX("+deg+"deg)";
        requestAnimationFrame(toss);return;}
      land(ts);}
    let l0=null;const ldur=1050,dir=Math.random()<0.5?1:-1;
    function land(ts){if(l0===null)l0=ts;const p=Math.min(1,(ts-l0)/ldur);
      const decay=Math.pow(1-p,2),amp=24*decay;
      const phi=dir*2*Math.PI*3*Math.pow(p,1.45);
      coin.style.transform="translateY(0) rotateX("+(finalDeg+amp*Math.cos(phi))+"deg) rotateY("+(amp*Math.sin(phi))+"deg)";
      if(p<1){requestAnimationFrame(land);return;}
      coin.style.transform="rotateX("+finalDeg+"deg)";
      const first=heads?a:b;
      const fr2=(mode==="cpu")?true:friendly;
      GN.friendly=fr2;
      if(!fr2)GN.g.addFlip(first.name);
      title.textContent=first.name+" goes first!";title.style.color=first.color;
      go.textContent="Begin";go.style.visibility="visible";
      go.onclick=function(){ov.remove();GN._inPlay=true;
        GN._participants=(mode==="cpu")?[a.name]:[a.name,b.name];
        done(mode==="cpu"?{a,b,first,bot:botLevel,vsComputer:true,friendly:true}:{a,b,first,friendly});};}
    requestAnimationFrame(toss);};};

/* ---------- party start: 2-4 seats, humans + computers ---------- */
/* GN.partyStart(done,{min,max,start}) -> done({seats:[{name,color,light,dark,bot}],first,friendly:true})
   bot is a level string ("easy"/"medium"/"hard") for a computer seat, or null for a human. */
GN.partyStart=function(done,opts){injectCSS();GN._inPlay=false;opts=opts||{};
  const MIN=opts.min||2,MAX=Math.min(opts.max||4,8);
  const NEUTRAL={color:"#6b7280",light:"#9aa3af",dark:"#3f454d"};
  const LEVELS=[["Easy","easy"],["Medium","medium"],["Hard","hard"]];
  function pcLoad(){try{return +localStorage.getItem("gn_party_n")||0;}catch(e){return 0;}}
  function pcSave(n){try{localStorage.setItem("gn_party_n",n);}catch(e){}}
  let count=Math.min(MAX,Math.max(MIN,pcLoad()||opts.start||MIN));
  let seats=[];
  function freshSeats(n){const r=GN.players(),s=[];
    for(let i=0;i<n;i++){
      if(i<r.length){const h=r[i];s.push({kind:"human",name:h.name,color:h.color,light:h.light,dark:h.dark,avatar:h.avatar||{kind:"color"},bot:null});}
      else s.push({kind:"cpu",bot:"medium"});}
    return s;}
  function normalize(){ // distinct colors for computers + numbering
    const used=new Set(seats.filter(s=>s.kind==="human").map(s=>s.color));
    const pool=PALETTE.filter(c=>!used.has(c.color));let pi=0,cn=0;
    seats.forEach(s=>{if(s.kind==="cpu"){cn++;const col=pool[pi++]||NEUTRAL;
      s.color=col.color;s.light=col.light;s.dark=col.dark;s.name=cn>1?("Computer "+cn):"Computer";}});}
  seats=freshSeats(count);normalize();

  const ov=document.createElement("div");ov.className="gnOv";
  const back=document.createElement("a");back.href="index.html";back.textContent="\u2329 Shelf";
  back.style.cssText="position:absolute;top:14px;left:14px;color:#cfe6d8;border:1px solid #3a5a47;border-radius:999px;padding:7px 14px;text-decoration:none;font-size:14px;z-index:2;";
  ov.appendChild(back);
  ov.innerHTML+='<div class="gnTitle" id="pT">Who\u2019s playing?</div>';
  document.body.appendChild(ov);
  const title=ov.querySelector("#pT");

  const cRow=document.createElement("div");
  cRow.style.cssText="display:flex;gap:8px;justify-content:center;margin:2px 0 2px;";
  const cBtns={};
  for(let n=MIN;n<=MAX;n++){const b=document.createElement("button");b.textContent=n;
    b.style.cssText="font-family:inherit;font-weight:800;font-size:16px;cursor:pointer;border-radius:10px;padding:9px 15px;border:1px solid #3a5a47;background:#15241b;color:#cfe6d8;";
    b.onclick=()=>setCount(n);cBtns[n]=b;cRow.appendChild(b);}
  ov.appendChild(cRow);
  const cLbl=document.createElement("div");cLbl.textContent="players";
  cLbl.style.cssText="color:#7d9a88;font-size:11px;text-align:center;margin:2px 0 10px;letter-spacing:1.5px;text-transform:uppercase;";
  ov.appendChild(cLbl);

  const slist=document.createElement("div");
  slist.style.cssText="display:flex;flex-direction:column;gap:8px;align-items:center;width:min(320px,86vw);";
  ov.appendChild(slist);

  const hint=document.createElement("div");
  hint.style.cssText="color:#7d9a88;font-size:12.5px;text-align:center;margin:12px 0 4px;";
  hint.textContent="First player is chosen at random.";
  ov.appendChild(hint);

  const togVals={};
  if(opts.toggles&&opts.toggles.length){
    const tWrap=document.createElement("div");
    tWrap.style.cssText="display:flex;flex-direction:column;gap:7px;align-items:stretch;width:min(320px,86vw);margin:4px 0 2px;";
    opts.toggles.forEach(tg=>{
      let on;try{const v=localStorage.getItem("gn_party_tog_"+tg.key);on=(v===null)?!!tg.default:(v==="1");}catch(e){on=!!tg.default;}
      togVals[tg.key]=on;
      const row=document.createElement("button");
      row.style.cssText="display:flex;align-items:center;gap:10px;text-align:left;font-family:inherit;cursor:pointer;border-radius:12px;padding:9px 12px;border:1px solid #3a5a47;background:#15241b;color:#cfe6d8;width:100%;";
      const txt=document.createElement("div");txt.style.cssText="flex:1;min-width:0;";
      txt.innerHTML='<div style="font-weight:800;font-size:14.5px;">'+tg.label+'</div>'+(tg.sub?'<div style="font-size:11.5px;color:#7d9a88;">'+tg.sub+'</div>':'');
      const pill=document.createElement("div");pill.style.cssText="flex:none;width:46px;height:26px;border-radius:999px;position:relative;transition:background .15s;";
      const knob=document.createElement("div");knob.style.cssText="position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s;";
      pill.appendChild(knob);
      function paint(){pill.style.background=togVals[tg.key]?"#2f7d4f":"#3a4750";knob.style.left=togVals[tg.key]?"23px":"3px";}
      paint();
      row.onclick=()=>{togVals[tg.key]=!togVals[tg.key];try{localStorage.setItem("gn_party_tog_"+tg.key,togVals[tg.key]?"1":"0");}catch(e){}paint();};
      row.appendChild(txt);row.appendChild(pill);tWrap.appendChild(row);
    });
    ov.appendChild(tWrap);
  }

  const go=document.createElement("button");go.className="gnBtn";go.textContent="Start";
  ov.appendChild(go);

  function setCount(n){count=n;
    if(seats.length<n)seats=seats.concat(freshSeats(n).slice(seats.length));
    else seats=seats.slice(0,n);
    normalize();render();}
  function seatLabel(s){return s.kind==="cpu"?("\ud83e\udd16 "+s.name+" \u00b7 "+s.bot):s.name;}
  function mkRow(label,c,l,d){const b=document.createElement("button");b.className="gnSeat";
    b.style.width="min(300px,82vw)";b.style.minWidth="0";b.style.fontSize="16px";
    b.style.background="linear-gradient(160deg,"+l+","+c+" 60%,"+d+")";b.textContent=label;return b;}
  function openChooser(i){
    const used=new Set(seats.filter((s,j)=>j!==i&&s.kind==="human").map(s=>s.name));
    const avail=GN.players().filter(h=>!used.has(h.name));
    const sheet=document.createElement("div");
    sheet.style.cssText="position:fixed;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(10,16,12,.85);padding:20px;overflow:auto;";
    const t=document.createElement("div");t.className="gnTitle";t.style.fontSize="20px";t.textContent="Seat "+(i+1)+" \u2014 who?";sheet.appendChild(t);
    avail.forEach(h=>{const b=mkRow(h.name,h.color,h.light,h.dark);
      b.onclick=()=>{seats[i]={kind:"human",name:h.name,color:h.color,light:h.light,dark:h.dark,bot:null};normalize();sheet.remove();render();};
      sheet.appendChild(b);});
    LEVELS.forEach(L=>{const b=mkRow("\ud83e\udd16 Computer \u00b7 "+L[0],NEUTRAL.color,NEUTRAL.light,NEUTRAL.dark);
      b.onclick=()=>{seats[i]={kind:"cpu",bot:L[1]};normalize();sheet.remove();render();};
      sheet.appendChild(b);});
    const cx=document.createElement("button");cx.className="gnAdd";cx.textContent="cancel";cx.onclick=()=>sheet.remove();sheet.appendChild(cx);
    ov.appendChild(sheet);
  }
  function render(){
    for(const n in cBtns)cBtns[n].style.background=(+n===count)?"#2f7d4f":"#15241b";
    slist.innerHTML="";
    seats.forEach((s,i)=>{const btn=document.createElement("button");btn.className="gnSeat";
      btn.style.width="100%";btn.style.minWidth="0";
      btn.style.background="linear-gradient(160deg,"+s.light+","+s.color+" 60%,"+s.dark+")";
      const row=document.createElement("span");row.style.cssText="display:inline-flex;align-items:center;gap:8px;justify-content:center;";
      row.innerHTML=GN.tokenHTML({name:s.name||"?",color:s.color,light:s.light,dark:s.dark,avatar:s.kind==="cpu"?{kind:"color"}:(s.avatar||{kind:"color"})},28);
      const lab=document.createElement("span");lab.textContent=seatLabel(s);row.appendChild(lab);btn.appendChild(row);
      const sm=document.createElement("small");sm.textContent=s.kind==="cpu"?"computer \u2014 tap to change":"tap to change";btn.appendChild(sm);
      btn.onclick=()=>openChooser(i);slist.appendChild(btn);});
    const humans=seats.filter(s=>s.kind==="human").length;
    go.disabled=humans<1;go.style.opacity=humans<1?".5":"";go.textContent=humans<1?"Add a person":"Start";
  }
  go.onclick=function(){
    if(go.disabled)return;
    pcSave(count);
    const out=seats.map(s=>({name:s.name,color:s.color,light:s.light,dark:s.dark,avatar:s.kind==="cpu"?{kind:"color"}:(s.avatar||{kind:"color"}),bot:s.kind==="cpu"?s.bot:null}));
    const items=[...slist.children];
    const first=Math.floor(Math.random()*count);
    go.disabled=true;go.textContent="Choosing\u2026";cRow.style.pointerEvents="none";slist.style.pointerEvents="none";
    title.textContent="Who goes first?";
    function hi(k){items.forEach((el,j)=>el.style.outline=(j===k)?"3px solid #f4c542":"none");}
    let cur=0,t=0;const minT=count*2+Math.floor(Math.random()*count);
    const iv=setInterval(()=>{
      hi(cur);
      if(t>=minT&&cur===first){clearInterval(iv);
        const f=out[first];title.textContent=f.name+" goes first!";title.style.color=f.color;
        GN.friendly=true;
        setTimeout(()=>{ov.remove();GN._inPlay=true;GN._participants=out.filter(s=>!s.bot).map(s=>s.name);done({seats:out,first:first,friendly:true,rules:Object.assign({},togVals)});},700);
        return;}
      cur=(cur+1)%count;t++;
    },110);
  };
  render();
};

/* ---------- stats overlay ---------- */
/* GN.openStats({title,key,specials:[{label,of:(recs,name)=>num}]}) — h2h is the last pairing */
GN.openStats=function(cfg){injectCSS();
  const old=document.getElementById("gnStats");if(old)old.remove();
  const recs=GN.readGames(cfg.key);
  const[pa,pb]=GN.lastPair();
  const pairRecs=recs.filter(r=>(r.winner===pa.name||r.winner===pb.name||r.loser===pa.name||r.loser===pb.name));
  let m=0,k=0,dur=0;for(const r of recs){if(r.winner===pa.name)m++;else if(r.winner===pb.name)k++;dur+=r.durationMs||0;}
  let streak=0,who=null;
  for(let i=recs.length-1;i>=0;i--){const w=recs[i].winner;if(!w)break;if(who===null){who=w;streak=1;}else if(w===who)streak++;else break;}
  const fmt=ms=>{if(!ms)return"\u2014";const s=Math.round(ms/1000),mn=Math.floor(s/60);return mn?(mn+"m "+(s%60)+"s"):(s+"s");};
  function row(label,va,vb){const tot=(va+vb)||1,p=Math.round(va/tot*100);
    return '<div class="gnRow"><div class="l">'+label+'</div><div class="bar"><span style="width:'+p+'%;background:'+pa.color+'"></span><span style="width:'+(100-p)+'%;background:'+pb.color+'"></span></div><div class="v">'+va+" / "+vb+'</div></div>';}
  const wrap=document.createElement("div");wrap.className="gnStats";wrap.id="gnStats";
  let h='<h1>'+cfg.title+' \u2014 Stats</h1>';
  h+='<div class="gnH2H"><span style="color:'+pa.color+'"><span class="big">'+m+'</span> '+pa.name+'</span><span style="color:#7d9a88">vs</span><span style="color:'+pb.color+'">'+pb.name+' <span class="big">'+k+'</span></span></div>';
  h+='<div class="gnMeta">'+recs.length+' game'+(recs.length===1?"":"s")+' recorded \u00b7 avg '+fmt(recs.length?dur/recs.length:0)+(who?' \u00b7 '+who+' on a '+streak+'-game streak':'')+'</div>';
  if(cfg.specials&&recs.length){h+='<div class="gnSec">This game</div>';
    for(const s of cfg.specials)h+=row(s.label,s.of(recs,pa.name),s.of(recs,pb.name));}
  const g=GN.g.read();
  h+='<div class="gnSec">Across the whole shelf</div>';
  h+=row("All-game wins",g.wins[pa.name]||0,g.wins[pb.name]||0);
  h+=row("Coin flips won",g.flips.won[pa.name]||0,g.flips.won[pb.name]||0);
  const others=Object.keys(g.wins).filter(n=>n!==pa.name&&n!==pb.name&&g.wins[n]>0);
  if(others.length)h+='<div class="gnMeta">Other players: '+others.map(n=>n+" "+g.wins[n]).join(" \u00b7 ")+'</div>';
  h+='<div class="gnMeta">'+g.games+' games \u00b7 '+g.flips.n+' coin flips'+(g.flips.streak.who?' \u00b7 '+g.flips.streak.who+' has won '+g.flips.streak.len+' flip'+(g.flips.streak.len>1?'s':'')+' running':'')+'</div>';
  h+='<div class="gnMeta">'+g.dice.rolled+' dice rolled \u00b7 '+g.dice.sixes+' sixes \u00b7 '+g.dice.doubles+' doubles \u00b7 '+g.sentHome+' pieces sent home</div>';
  h+='<button class="gnBtn" id="gnX" style="margin-top:10px;">Close</button>';
  wrap.innerHTML=h;document.body.appendChild(wrap);
  wrap.querySelector("#gnX").onclick=()=>wrap.remove();};

GN.statsButton=function(container,cfg){injectCSS();
  const b=document.createElement("button");b.className="gnBtn ghost";b.textContent="Stats";
  b.style.fontSize="15px";b.style.padding="9px 16px";
  b.onclick=()=>GN.openStats(cfg);container.appendChild(b);return b;};

/* ---------- household cloud sync (Firebase, opt-in per device) ---------- */
const FB_CONFIG={apiKey:"AIzaSyBcQedEEuBlsxaPke8y49QZXU42SVP1kiE",
  authDomain:"buchanan-gameshelf.firebaseapp.com",projectId:"buchanan-gameshelf",
  storageBucket:"buchanan-gameshelf.firebasestorage.app",
  messagingSenderId:"391867096201",appId:"1:391867096201:web:3ceafef2bb7d6cbfe97a58"};
const FB_CDN="https://www.gstatic.com/firebasejs/10.12.2/";
let _db=null,_hh=null,_fbReady=false;
function hhId(code){let h=5381;for(let i=0;i<code.length;i++)h=((h<<5)+h+code.charCodeAt(i))>>>0;return"hh_"+h.toString(36);}
function loadScript(u){return new Promise((res,rej)=>{const s=document.createElement("script");
  s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
// PWA: register the service worker (network-first; see sw.js).
if("serviceWorker" in navigator){try{navigator.serviceWorker.register("sw.js");}catch(e){}}
const GAME_KEYS=["chess_games","ur_games","sorry_games","checkers_games","c4_games","trouble_games","mancala_games",
  "dom_games","yahtzee_games","bs_games","cc_games","bg_games",
  "war_games","sb_games","sl_games","uttt_games",
  "gomoku_games","dots_games","hex_games","cb_games","scrabble_games",
  "farkle_games","gofish_games","reversi_games","morris_games",
  "bridge_games","guesswho_games"];
GN.GAME_KEYS=GAME_KEYS;
/* ---- pinch zoom + pan for dense boards ----
   GN.pinchZoom(boardEl): wraps the board; pinch to zoom (1x-3x), drag to pan when
   zoomed, double-tap toggles 1x <-> 2.2x at the tap point. CSS transforms keep the
   browser hit-testing cells, so taps land exactly where they look like they land.
   Pure math on GN._pz for harnesses. */
GN._pz={
  clamp:function(sc,tx,ty,w,h){sc=Math.min(3,Math.max(1,sc));
    const minX=w-w*sc,minY=h-h*sc; // content scaled from origin 0,0
    tx=Math.min(0,Math.max(minX,tx));ty=Math.min(0,Math.max(minY,ty));
    if(sc===1){tx=0;ty=0;}
    return{sc,tx,ty};},
  pinch:function(st,m0,d0,m1,d1,w,h){const r=d1/Math.max(1,d0);
    let sc=st.sc*r;
    // keep the pinch midpoint anchored: content point under m0 stays under m1
    let tx=m1.x-((m0.x-st.tx)/st.sc)*sc;
    let ty=m1.y-((m0.y-st.ty)/st.sc)*sc;
    return this.clamp(sc,tx,ty,w,h);},
  pan:function(st,dx,dy,w,h){return this.clamp(st.sc,st.tx+dx,st.ty+dy,w,h);},
  dblTarget:function(st,p,w,h){if(st.sc>1.05)return{sc:1,tx:0,ty:0};
    const sc=2.2;
    return this.clamp(sc,p.x-((p.x-st.tx)/st.sc)*sc,p.y-((p.y-st.ty)/st.sc)*sc,w,h);}};
GN.pinchZoom=function(board){
  if(!board||board._gnZoomed)return;board._gnZoomed=true;
  const vp=document.createElement("div");
  vp.style.cssText="overflow:hidden;touch-action:none;border-radius:10px;width:100%;position:relative;";
  board.parentNode.insertBefore(vp,board);vp.appendChild(board);
  board.style.transformOrigin="0 0";board.style.willChange="transform";
  let st={sc:1,tx:0,ty:0};
  const apply=()=>{board.style.transform="translate("+st.tx+"px,"+st.ty+"px) scale("+st.sc+")";};
  const dims=()=>({w:vp.clientWidth,h:vp.clientHeight});
  const pts=new Map();let moved=false,start=null,lastMid=null,lastDist=0,lastTap=0,downAt=0;
  const mid=()=>{const a=[...pts.values()];return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};};
  const dist=()=>{const a=[...pts.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};
  const loc=e=>{const r=vp.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  vp.addEventListener("pointerdown",e=>{pts.set(e.pointerId,loc(e));
    if(pts.size===1){moved=false;start=loc(e);downAt=Date.now();}
    if(pts.size===2){lastMid=mid();lastDist=dist();moved=true;}});
  vp.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;
    pts.set(e.pointerId,loc(e));
    const{w,h}=dims();
    if(pts.size===2){const m=mid(),d=dist();
      st=GN._pz.pinch(st,lastMid,lastDist,m,d,w,h);lastMid=m;lastDist=d;apply();}
    else if(pts.size===1&&st.sc>1){const p=loc(e);
      if(!moved&&Math.hypot(p.x-start.x,p.y-start.y)<8)return;
      moved=true;st=GN._pz.pan(st,p.x-start.x,p.y-start.y,w,h);start=p;apply();}});
  const up=e=>{const was=pts.size;pts.delete(e.pointerId);
    if(was===1&&!moved&&Date.now()-downAt<400){
      const now=Date.now();
      if(now-lastTap<320){const{w,h}=dims();st=GN._pz.dblTarget(st,loc(e),w,h);apply();lastTap=0;}
      else lastTap=now;}};
  vp.addEventListener("pointerup",up);vp.addEventListener("pointercancel",up);
  // a pan/pinch must not fall through as a cell tap
  vp.addEventListener("click",e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false;}},true);
};
/* ---- fat-finger guard ----
   While a game is in progress, tapping New game or the shelf link asks first.
   In play: matchStart completes -> true. Over: recordGame fires (or a new picker opens) -> false. */
GN._inPlay=false;GN._bypass=false;
GN.confirmEnd=function(msg,onEnd){injectCSS();
  const old=document.getElementById("gnConf");if(old)old.remove();
  const w=document.createElement("div");w.className="gnOv";w.id="gnConf";
  w.innerHTML='<div class="gnTitle">Hold on \u270B</div>'+
    '<div class="gnMeta" style="font-size:15px;max-width:300px;">'+msg+'</div>'+
    '<button class="gnBtn" id="gnKeep">Keep playing</button>'+
    '<button class="gnBtn ghost" id="gnEnd" style="font-size:14px;">Yes, end this game</button>';
  document.body.appendChild(w);
  w.querySelector("#gnKeep").onclick=()=>w.remove();
  w.querySelector("#gnEnd").onclick=()=>{w.remove();onEnd();};};
document.addEventListener("click",function(e){
  if(!GN._inPlay||GN._bypass)return;
  const t=e.target&&e.target.closest&&(e.target.closest("#newBtn,#mainBtn")||e.target.closest('a[href="index.html"]'));
  if(!t)return;
  if(t.closest&&(t.closest(".gnOv")||t.closest("#overlay")))return; // picker back-out + play-again are safe contexts
  e.preventDefault();e.stopPropagation();
  const isLink=t.tagName==="A";
  GN.confirmEnd(isLink?"Leave for the shelf? The game in progress won't be saved.":"Start over? The game in progress will be lost.",
    function(){if(isLink)location.href=t.getAttribute("href");
      else{GN._bypass=true;try{t.click();}finally{GN._bypass=false;}}});
},true);
/* GN.sync is callable (so the vestigial per-page `GN.sync()` calls never throw) AND carries methods. Sync itself auto-boots below. */
function gnSync(){return gnSync.status();}
gnSync.status=function(){try{return localStorage.getItem("gn_sync_hh")?"on":"off";}catch(e){return"off";}};
gnSync.enable=function(code){if(!code||!code.trim())return false;
  try{localStorage.setItem("gn_sync_hh",hhId(code.trim()));}catch(e){return false;}
  bootSync();return true;};
gnSync.disable=function(){try{localStorage.removeItem("gn_sync_hh");}catch(e){}_db=null;_hh=null;_fbReady=false;};
gnSync.resetCloud=function(){if(!_fbReady)return;
  _db.doc("households/"+_hh+"/state/global").set(blank());
  for(const k of GAME_KEYS)_db.doc("households/"+_hh+"/records/"+k).set({list:[]});};
GN.sync=gnSync;
async function bootSync(){
  let hh=null;try{hh=localStorage.getItem("gn_sync_hh");}catch(e){}
  if(!hh||typeof window==="undefined")return;
  try{
    if(!window.firebase){await loadScript(FB_CDN+"firebase-app-compat.js");
      await loadScript(FB_CDN+"firebase-auth-compat.js");
      await loadScript(FB_CDN+"firebase-firestore-compat.js");}
    if(!firebase.apps.length)firebase.initializeApp(FB_CONFIG);
    await firebase.auth().signInAnonymously();
    _db=firebase.firestore();_hh=hh;
    try{await _db.enablePersistence({synchronizeTabs:true});}catch(e){}
    // first contact: device with history seeds the cloud; empty devices adopt it
    const gref=_db.doc("households/"+_hh+"/state/global");
    const snap=await gref.get();
    if(!snap.exists){await gref.set(gload());
      for(const k of GAME_KEYS){const l=GN.readGames(k);
        if(l.length)await _db.doc("households/"+_hh+"/records/"+k).set({list:l});}
      const pl=pload();await _db.doc("households/"+_hh+"/state/players").set({list:pl});}
    _fbReady=true;
    // live adoption: cloud is the household truth once synced
    gref.onSnapshot(s=>{if(s.exists)gsave(s.data());});
    _db.collection("households/"+_hh+"/records").onSnapshot(q=>{
      q.forEach(d=>{try{localStorage.setItem(d.id,JSON.stringify(d.data().list||[]));}catch(e){}});});
    _db.doc("households/"+_hh+"/state/players").onSnapshot(s=>{
      if(s.exists&&s.data().list&&s.data().list.length)psave(s.data().list);});
  }catch(e){/* offline or blocked: localStorage carries on */}
}
function mirror(fn){if(_fbReady){try{fn();}catch(e){}}}
function FV(){return firebase.firestore.FieldValue;}
if(typeof window!=="undefined")setTimeout(bootSync,0);

/* ---------- rules overlay ---------- */
/* GN.openRules({title,sections:[{h,p}]}) */
GN.openRules=function(cfg){injectCSS();
  const old=document.getElementById("gnRules");if(old)old.remove();
  const wrap=document.createElement("div");wrap.className="gnStats";wrap.id="gnRules";
  let h='<h1>'+cfg.title+' \u2014 How to play</h1>';
  for(const s of cfg.sections){
    h+='<div class="gnSec">'+s.h+'</div>';
    if(s.svg)h+='<div class="gnIll">'+s.svg+'</div>';
    h+='<div class="gnMeta" style="text-align:left;line-height:1.55;font-size:14px;color:#d8e8dd;">'+(s.t||s.p||"")+'</div>';
    if(s.ex)h+='<div class="gnEx"><b>Example:</b> '+s.ex+'</div>';}
  h+='<button class="gnBtn" id="gnRX" style="margin-top:12px;">Close</button>';
  wrap.innerHTML=h;document.body.appendChild(wrap);
  wrap.querySelector("#gnRX").onclick=()=>wrap.remove();};
GN.rulesButton=function(container,cfg){injectCSS();
  const b=document.createElement("button");b.className="gnBtn ghost";b.textContent="Rules";
  b.style.fontSize="15px";b.style.padding="9px 16px";
  b.onclick=()=>GN.openRules(cfg);container.appendChild(b);return b;};
/* ---------- Easy View: large text & tap targets, per device ---------- */
GN.easyView={
  on:function(){try{return localStorage.getItem("gn_easy")==="on";}catch(e){return false;}},
  apply:function(){try{document.documentElement.classList.toggle("gn-easy",this.on());}catch(e){}},
  set:function(v){try{localStorage.setItem("gn_easy",v?"on":"off");}catch(e){}this.apply();},
  toggle:function(){this.set(!this.on());return this.on();}
};
GN.easyView.apply();
/* ---------- Bluetooth / gamepad controller support ----------
   Pairing happens in the device's system Bluetooth settings; this reads the
   controller via the standard Gamepad API and drives a focus cursor over the
   page's links/buttons. Activates only once a controller connects. */
GN.pad=(function(){
  let enabled=false,raf=null,ring=null,focusEl=null,backFn=null;
  let sel='a[href]:not([data-pad-skip]),button:not([disabled]):not([data-pad-skip]),[data-pad]';
  const prev={},onConn=[],onDisc=[];
  let dirHeld=null,dirNext=0;
  function visible(el){
    if(el.disabled)return false;
    const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;
    if(r.bottom<0||r.top>(window.innerHeight||9999)||r.right<0||r.left>(window.innerWidth||9999))return false;
    let cs;try{cs=getComputedStyle(el);}catch(e){return true;}
    if(cs.display==="none"||cs.visibility==="hidden"||cs.opacity==="0")return false;
    return true;
  }
  function focusables(){return Array.prototype.slice.call(document.querySelectorAll(sel)).filter(visible);}
  function ensureRing(){if(ring)return;ring=document.createElement("div");ring.id="gnPadRing";
    ring.style.cssText="position:fixed;pointer-events:none;z-index:99998;border:3px solid #f4c542;border-radius:12px;"+
      "box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 16px rgba(244,197,66,.7);transition:left .08s,top .08s,width .08s,height .08s;display:none;";
    document.body.appendChild(ring);}
  function paint(){if(!ring)return;
    if(!focusEl||!document.body.contains(focusEl)||!visible(focusEl)){ring.style.display="none";return;}
    const r=focusEl.getBoundingClientRect();ring.style.display="block";
    ring.style.left=(r.left-4)+"px";ring.style.top=(r.top-4)+"px";ring.style.width=(r.width+2)+"px";ring.style.height=(r.height+2)+"px";}
  function setFocus(el){focusEl=el||null;if(el){ensureRing();try{el.scrollIntoView({block:"nearest",inline:"nearest"});}catch(e){}paint();}else paint();}
  function center(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
  function move(dir){const items=focusables();if(!items.length)return;
    if(!focusEl||items.indexOf(focusEl)<0){setFocus(items[0]);return;}
    const c=center(focusEl);let best=null,bestScore=Infinity;
    for(const el of items){if(el===focusEl)continue;const e=center(el),dx=e.x-c.x,dy=e.y-c.y;let primary,cross;
      if(dir==="up"){if(dy>-2)continue;primary=-dy;cross=Math.abs(dx);}
      else if(dir==="down"){if(dy<2)continue;primary=dy;cross=Math.abs(dx);}
      else if(dir==="left"){if(dx>-2)continue;primary=-dx;cross=Math.abs(dy);}
      else{if(dx<2)continue;primary=dx;cross=Math.abs(dy);}
      const score=primary+cross*2;if(score<bestScore){bestScore=score;best=el;}}
    if(best)setFocus(best);}
  function activate(){if(focusEl){try{focusEl.focus({preventScroll:true});}catch(e){}focusEl.click();}}
  function back(){if(backFn){backFn();return;}
    let b=document.querySelector('[data-pad-back]');
    if(!b)b=Array.prototype.slice.call(document.querySelectorAll('button,a')).filter(visible).find(x=>/\b(back|cancel|close|shelf)\b/i.test(x.textContent||""));
    if(b){b.click();return;}
    try{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",keyCode:27,which:27,bubbles:true}));}catch(e){}}
  function toast(txt){try{const t=document.createElement("div");t.textContent=txt;
    t.style.cssText="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99999;background:#15241b;color:#cfe6d8;"+
      "border:1px solid #3a5a47;border-radius:999px;padding:10px 18px;font:600 15px system-ui;box-shadow:0 6px 20px rgba(0,0,0,.5);opacity:0;transition:opacity .25s;";
    document.body.appendChild(t);requestAnimationFrame(()=>t.style.opacity="1");
    setTimeout(()=>{t.style.opacity="0";setTimeout(()=>t.remove(),300);},2200);}catch(e){}}
  const DZ=0.55;
  function poll(){
    const gps=(navigator.getGamepads?navigator.getGamepads():[])||[];let gp=null;
    for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){gp=gps[i];break;}}
    if(gp){const ax=gp.axes||[],bt=gp.buttons||[];const pr=i=>bt[i]&&bt[i].pressed;
      const up=pr(12)||ax[1]<-DZ,down=pr(13)||ax[1]>DZ,left=pr(14)||ax[0]<-DZ,right=pr(15)||ax[0]>DZ;
      const dir=up?"up":down?"down":left?"left":right?"right":null;const now=(performance&&performance.now)?performance.now():Date.now();
      if(dir){if(dir!==dirHeld){dirHeld=dir;dirNext=now+340;move(dir);}else if(now>=dirNext){dirNext=now+140;move(dir);}}else{dirHeld=null;}
      const edge=i=>{const p=!!pr(i),was=prev[i];prev[i]=p;return p&&!was;};
      if(edge(0))activate();if(edge(1))back();
      paint();}
    raf=requestAnimationFrame(poll);}
  function start(){if(enabled)return;enabled=true;ensureRing();const items=focusables();if(items.length&&!focusEl)setFocus(items[0]);
    raf=requestAnimationFrame(poll);window.addEventListener("resize",paint);window.addEventListener("scroll",paint,true);}
  function stop(){enabled=false;if(raf)cancelAnimationFrame(raf);raf=null;if(ring)ring.style.display="none";}
  if(typeof window!=="undefined"){
    window.addEventListener("gamepadconnected",e=>{start();toast("\ud83c\udfae Controller connected");onConn.forEach(f=>{try{f(e.gamepad);}catch(_){}});});
    window.addEventListener("gamepaddisconnected",e=>{const list=navigator.getGamepads?navigator.getGamepads():[];let any=false;for(let i=0;i<list.length;i++){if(list[i]&&list[i].connected)any=true;}if(!any)stop();onDisc.forEach(f=>{try{f(e.gamepad);}catch(_){}});});}
  return{start,stop,
    connected:()=>!!(navigator.getGamepads&&Array.prototype.some.call(navigator.getGamepads(),g=>g&&g.connected)),
    setSelector:s=>{if(s)sel=s;},focusables:focusables,focus:setFocus,current:()=>focusEl,
    refresh:()=>{if(focusEl&&focusables().indexOf(focusEl)<0)setFocus(focusables()[0]||null);paint();},
    onConnect:cb=>onConn.push(cb),onDisconnect:cb=>onDisc.push(cb),setBack:fn=>{backFn=fn;},
    _move:move,_activate:activate,_back:back,_visible:visible};
})();
try{injectCSS();}catch(e){}
})();

/* auto-load the achievements engine on every page that uses the runtime */
try{if(typeof document!=="undefined"&&typeof window!=="undefined"&&!window.Achievements){var _gnA=document.createElement("script");_gnA.src="achievements.js";_gnA.async=true;document.head.appendChild(_gnA);}}catch(e){}
