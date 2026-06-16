/* Bridge Builders core — path scoring per Player 1's observed rule.
   - A player's tiles form a network (4-adjacency over own tiles only).
   - A bridge path = simple path starting on any own tile in col 0.
   - Scoring a path:
     * every HORIZONTAL word (maximal horizontal run of >=2 own tiles) the path
       touches at least once counts its FULL letter value, once;
     * any traversed tile not in a horizontal word (vertical-connector letter)
       counts its own letter value, once per traversed tile.
   - Final path score = max over all such paths (best branch wins at corners). */
const N=15;
function ownCells(b,me){const out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(b[r][c]&&b[r][c].owner===me)out.push([r,c]);return out;}
function hRunOf(b,me,r,c){let c0=c;while(c0-1>=0&&b[r][c0-1]&&b[r][c0-1].owner===me)c0--;
  const cells=[];let cc=c0;
  while(cc<N&&b[r][cc]&&b[r][cc].owner===me){cells.push([r,cc]);cc++;}
  return cells;}
function buildIndex(b,me){const id=(r,c)=>r*N+c;const wordOf={},wordVal={};
  for(const[r,c]of ownCells(b,me)){if(wordOf[id(r,c)]!==undefined)continue;
    const run=hRunOf(b,me,r,c);
    if(run.length>=2){const wid="w"+id(run[0][0],run[0][1]);let v=0;
      for(const[rr,cc]of run){wordOf[id(rr,cc)]=wid;v+=b[rr][cc].pv;}
      wordVal[wid]=v;}
    else wordOf[id(r,c)]=null;}
  return{id,wordOf,wordVal};}
function maxReach(b,me){let m=-1;for(const[,c]of ownCells(b,me))if(c>m)m=c;return m;}
function pathScore(b,me,capNodes){
  const cap={n:0,max:capNodes||200000};
  const {wordOf,wordVal}=buildIndex(b,me);
  const id=(r,c)=>r*N+c;
  const mine=new Set(ownCells(b,me).map(([r,c])=>id(r,c)));
  if(!mine.size)return 0;
  const starts=[];for(const k of mine)if(k%N===0)starts.push(k);
  if(!starts.length)return 0;
  let best=0;
  const DIRS=[1,-1,N,-N];
  const pvAt=k=>b[Math.floor(k/N)][k%N].pv;
  function inb(k,d){const c=k%N;if(d===1&&c===N-1)return false;if(d===-1&&c===0)return false;
    const k2=k+d;return k2>=0&&k2<N*N;}
  function dfs(k,visited,claimed,score){
    if(cap.n++>cap.max)return;
    let s=score;const w=wordOf[k];
    if(w&&!claimed.has(w)){claimed=new Set(claimed);claimed.add(w);s+=wordVal[w];}
    if(s>best)best=s;
    for(const d of DIRS){if(!inb(k,d))continue;const k2=k+d;
      if(!mine.has(k2)||visited.has(k2))continue;
      const v2=new Set(visited);v2.add(k2);
      const gain=(wordOf[k2]===null)?pvAt(k2):0;
      dfs(k2,v2,claimed,s+gain);}}
  for(const k0 of starts){const base=(wordOf[k0]===null)?pvAt(k0):0;
    dfs(k0,new Set([k0]),new Set(),base);}
  return best;}
module.exports={N,ownCells,hRunOf,pathScore,maxReach,buildIndex};
