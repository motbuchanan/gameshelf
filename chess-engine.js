/* Shared chess engine for the Game Shelf. Loaded by chess.html and knightschool.html.
   Single source of truth: edit here, never inline. 0x88 board; squares like e2=100, not 0-63. */
const CH=(function(){
const N_OFF=[-33,-31,-18,-14,14,18,31,33];
const K_OFF=[-17,-16,-15,-1,1,15,16,17];
const B_OFF=[-17,-15,15,17];
const R_OFF=[-16,-1,1,16];
function sq(r,f){return r*16+f;}
function on(s){return !(s&0x88);}
function rankOf(s){return s>>4;}
function fileOf(s){return s&15;}
function isW(p){return p&&p===p.toUpperCase();}
function colorOf(p){return isW(p)?"w":"b";}
function fresh(){return load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");}
function load(fen){
  const st={b:new Array(128).fill(null),turn:"w",castle:{K:false,Q:false,k:false,q:false},
    ep:-1,half:0,full:1,hist:[],reps:{}};
  const parts=fen.split(" ");
  let r=0,f=0;
  for(const ch of parts[0]){
    if(ch==="/"){r++;f=0;}
    else if(/\d/.test(ch))f+=+ch;
    else{st.b[sq(r,f)]=ch;f++;}}
  st.turn=parts[1];
  if(parts[2]!=="-")for(const c of parts[2])st.castle[c]=true;
  st.ep=parts[3]&&parts[3]!=="-"?sq(8-+parts[3][1],parts[3].charCodeAt(0)-97):-1;
  st.half=parts[4]?+parts[4]:0;st.full=parts[5]?+parts[5]:1;
  st.reps[posKey(st)]=1;
  return st;}
function posKey(st){let k="";
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){const p=st.b[sq(r,f)];k+=p||".";}
  return k+st.turn+(st.castle.K?"K":"")+(st.castle.Q?"Q":"")+(st.castle.k?"k":"")+(st.castle.q?"q":"")+st.ep;}
function kingSq(st,c){const k=c==="w"?"K":"k";
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){const s=sq(r,f);if(st.b[s]===k)return s;}
  return -1;}
function attacked(st,s,by){ // is square s attacked by color `by`
  const b=st.b;
  // pawns: white attacks "upward" (toward rank 0): from s, a white pawn sits at s+15/s+17
  if(by==="w"){if(on(s+15)&&b[s+15]==="P")return true;if(on(s+17)&&b[s+17]==="P")return true;}
  else{if(on(s-15)&&b[s-15]==="p")return true;if(on(s-17)&&b[s-17]==="p")return true;}
  for(const o of N_OFF){const t=s+o;if(on(t)&&b[t]&&colorOf(b[t])===by&&b[t].toLowerCase()==="n")return true;}
  for(const o of K_OFF){const t=s+o;if(on(t)&&b[t]&&colorOf(b[t])===by&&b[t].toLowerCase()==="k")return true;}
  for(const o of B_OFF){let t=s+o;while(on(t)){const p=b[t];
    if(p){if(colorOf(p)===by&&(p.toLowerCase()==="b"||p.toLowerCase()==="q"))return true;break;}t+=o;}}
  for(const o of R_OFF){let t=s+o;while(on(t)){const p=b[t];
    if(p){if(colorOf(p)===by&&(p.toLowerCase()==="r"||p.toLowerCase()==="q"))return true;break;}t+=o;}}
  return false;}
function inCheck(st,c){return attacked(st,kingSq(st,c),c==="w"?"b":"w");}
function pseudo(st){
  const out=[],b=st.b,c=st.turn,fw=c==="w"?-16:16,home=c==="w"?6:1,promo=c==="w"?0:7;
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){const s=sq(r,f),p=b[s];
    if(!p||colorOf(p)!==c)continue;
    const lo=p.toLowerCase();
    if(lo==="p"){
      const one=s+fw;
      if(on(one)&&!b[one]){
        if(rankOf(one)===promo)for(const pr of["q","r","b","n"])out.push({from:s,to:one,promo:pr});
        else{out.push({from:s,to:one});
          const two=s+2*fw;
          if(rankOf(s)===home&&!b[two])out.push({from:s,to:two,double:true});}}
      for(const d of[fw-1,fw+1]){const t=s+d;if(!on(t))continue;
        if(b[t]&&colorOf(b[t])!==c){
          if(rankOf(t)===promo)for(const pr of["q","r","b","n"])out.push({from:s,to:t,promo:pr});
          else out.push({from:s,to:t});}
        else if(t===st.ep)out.push({from:s,to:t,ep:true});}}
    else if(lo==="n"){for(const o of N_OFF){const t=s+o;
      if(on(t)&&(!b[t]||colorOf(b[t])!==c))out.push({from:s,to:t});}}
    else if(lo==="k"){for(const o of K_OFF){const t=s+o;
      if(on(t)&&(!b[t]||colorOf(b[t])!==c))out.push({from:s,to:t});}
      // castling: rights + empty path + not through check
      const opp=c==="w"?"b":"w";
      if(c==="w"&&s===sq(7,4)){
        if(st.castle.K&&!b[sq(7,5)]&&!b[sq(7,6)]&&b[sq(7,7)]==="R"&&
          !attacked(st,s,opp)&&!attacked(st,sq(7,5),opp)&&!attacked(st,sq(7,6),opp))
          out.push({from:s,to:sq(7,6),castle:"K"});
        if(st.castle.Q&&!b[sq(7,3)]&&!b[sq(7,2)]&&!b[sq(7,1)]&&b[sq(7,0)]==="R"&&
          !attacked(st,s,opp)&&!attacked(st,sq(7,3),opp)&&!attacked(st,sq(7,2),opp))
          out.push({from:s,to:sq(7,2),castle:"Q"});}
      if(c==="b"&&s===sq(0,4)){
        if(st.castle.k&&!b[sq(0,5)]&&!b[sq(0,6)]&&b[sq(0,7)]==="r"&&
          !attacked(st,s,opp)&&!attacked(st,sq(0,5),opp)&&!attacked(st,sq(0,6),opp))
          out.push({from:s,to:sq(0,6),castle:"k"});
        if(st.castle.q&&!b[sq(0,3)]&&!b[sq(0,2)]&&!b[sq(0,1)]&&b[sq(0,0)]==="r"&&
          !attacked(st,s,opp)&&!attacked(st,sq(0,3),opp)&&!attacked(st,sq(0,2),opp))
          out.push({from:s,to:sq(0,2),castle:"q"});}}
    else{const offs=lo==="b"?B_OFF:lo==="r"?R_OFF:K_OFF; // q uses K_OFF rays
      for(const o of offs){let t=s+o;
        while(on(t)){if(!b[t])out.push({from:s,to:t});
          else{if(colorOf(b[t])!==c)out.push({from:s,to:t});break;}
          t+=o;}}}}
  return out;}
function make(st,m){
  const b=st.b,p=b[m.from],c=st.turn;
  const u={m,p,capt:b[m.to],captSq:m.to,ep:st.ep,castle:{...st.castle},half:st.half,key:null};
  if(m.ep){u.captSq=m.to+(c==="w"?16:-16);u.capt=b[u.captSq];b[u.captSq]=null;}
  b[m.to]=m.promo?(c==="w"?m.promo.toUpperCase():m.promo):p;
  b[m.from]=null;
  if(m.castle){const r=c==="w"?7:0;
    if(m.castle.toLowerCase()==="k"){b[sq(r,5)]=b[sq(r,7)];b[sq(r,7)]=null;}
    else{b[sq(r,3)]=b[sq(r,0)];b[sq(r,0)]=null;}}
  // rights
  if(p==="K"){st.castle.K=st.castle.Q=false;}
  if(p==="k"){st.castle.k=st.castle.q=false;}
  if(m.from===sq(7,7)||m.to===sq(7,7))st.castle.K=false;
  if(m.from===sq(7,0)||m.to===sq(7,0))st.castle.Q=false;
  if(m.from===sq(0,7)||m.to===sq(0,7))st.castle.k=false;
  if(m.from===sq(0,0)||m.to===sq(0,0))st.castle.q=false;
  st.ep=m.double?(m.from+(c==="w"?-16:16)):-1;
  st.half=(p.toLowerCase()==="p"||u.capt)?0:st.half+1;
  if(c==="b")st.full++;
  st.turn=c==="w"?"b":"w";
  st.hist.push(u);
  const k=posKey(st);u.key=k;st.reps[k]=(st.reps[k]||0)+1;
  return u;}
function unmake(st){
  const u=st.hist.pop();if(!u)return;
  st.reps[u.key]--;
  const m=u.m,b=st.b;
  st.turn=st.turn==="w"?"b":"w";
  const c=st.turn;
  if(c==="b")st.full--;
  b[m.from]=u.p;b[m.to]=null;
  if(u.capt)b[u.captSq]=u.capt;
  if(m.castle){const r=c==="w"?7:0;
    if(m.castle.toLowerCase()==="k"){b[sq(r,7)]=b[sq(r,5)];b[sq(r,5)]=null;}
    else{b[sq(r,0)]=b[sq(r,3)];b[sq(r,3)]=null;}}
  st.castle=u.castle;st.ep=u.ep;st.half=u.half;}
function legal(st){
  const out=[],c=st.turn;
  for(const m of pseudo(st)){make(st,m);
    if(!inCheck(st,c))out.push(m);
    unmake(st);}
  return out;}
function status(st){ // "play" | "mate" | "stale" | "fifty" | "rep" | "material"
  if(st.half>=100)return "fifty";
  if(st.reps[posKey(st)]>=3)return "rep";
  // insufficient material: K vs K, K+minor vs K, K+B vs K+B same color bishops
  const pcs=[];for(let r=0;r<8;r++)for(let f=0;f<8;f++){const p=st.b[sq(r,f)];
    if(p&&p.toLowerCase()!=="k")pcs.push({p:p.toLowerCase(),s:sq(r,f)});}
  if(pcs.length===0)return "material";
  if(pcs.length===1&&(pcs[0].p==="n"||pcs[0].p==="b"))return "material";
  if(pcs.length===2&&pcs[0].p==="b"&&pcs[1].p==="b"&&
     ((rankOf(pcs[0].s)+fileOf(pcs[0].s))%2)===((rankOf(pcs[1].s)+fileOf(pcs[1].s))%2)&&
     colorOf(st.b[pcs[0].s])!==colorOf(st.b[pcs[1].s]))return "material";
  if(legal(st).length)return "play";
  return inCheck(st,st.turn)?"mate":"stale";}
function alg(s){return String.fromCharCode(97+fileOf(s))+(8-rankOf(s));}
function perft(st,d){if(d===0)return 1;
  let n=0;for(const m of legal(st)){make(st,m);n+=perft(st,d-1);unmake(st);}
  return n;}
return{fresh,load,legal,make,unmake,status,inCheck,attacked,kingSq,alg,sq,on,rankOf,fileOf,isW,colorOf,perft,pseudo,posKey};
})();
