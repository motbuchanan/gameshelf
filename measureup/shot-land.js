const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url='file://'+path.join(__dirname,'index.html');
(async()=>{
  const out=path.join(__dirname,'shots-land'); fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch({executablePath:CHROME});
  // LANDSCAPE iPad viewport
  const ctx=await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:2,hasTouch:true});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(300);
  // seed a maxed-ish save so many districts are unlocked
  await p.evaluate(()=>{ const S=JSON.parse(JSON.stringify(DEF)); S.creature={body:'blob',col:'#7dff8a',eyes:'dot',extra:'none',acc:'none',name:'Garrett'};
    S.flags.introDone=true; S.flags.seenTown=true;
    Object.keys(S.flags).forEach(k=>{ if(/^seen/.test(k))S.flags[k]=true; });
    S.band=S.band||{}; ['boom','combo','luna','tock','mika','fern','bibi'].forEach(id=>S.band[id]=true);
    localStorage.setItem('bq_save_v1',JSON.stringify(S)); });
  await p.goto(url); await p.waitForTimeout(500);
  const info=await p.evaluate(()=>{ try{ return {planRows:townPlan().length, wide:townIsWide(), posTall:townGeo(townPlan(),false).pos.length, posWide:townGeo(townPlan(),true).pos.length}; }catch(e){ return {err:e.message}; } });
  console.log('TOWN:', JSON.stringify(info));
  await p.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); const bs=document.getElementById('btnStart'); if(bs)bs.click(); });
  await p.waitForTimeout(600);
  const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
  const stageLen=await p.evaluate(()=>((document.getElementById('twStage')||{}).innerHTML||'').length);
  const facCount=await p.evaluate(()=>document.querySelectorAll('#twStage .tw-fac').length);
  const errOverlay=await p.evaluate(()=>!!document.getElementById('muErr'));
  console.log('LANDSCAPE: on',JSON.stringify(on),'| stageLen',stageLen,'| facades',facCount,'| errOverlay',errOverlay);
  await p.screenshot({path:path.join(out,'landscape-top.png')});
  await p.evaluate(()=>{ var s=document.getElementById('scr-town'); if(s)s.scrollTop=s.scrollHeight/2; });
  await p.waitForTimeout(200); await p.screenshot({path:path.join(out,'landscape-mid.png')});
  console.log('PAGE ERRORS:', errs.length?errs.join(' | '):'NONE');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
