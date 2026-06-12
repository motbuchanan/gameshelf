/* sfx.js — Game Shelf sound effects. Pure Web Audio synthesis: no files, no copyright.
   Usage: <script src="sfx.js"></script> after gamenight.js, then GNS.play("pop") etc.
   GNS.button(container) adds a mute toggle (persisted). All sounds tunable below. */
(function(){
  "use strict";
  var ctx=null, muted=false;
  try{muted=localStorage.getItem("gn_muted")==="1";}catch(e){}
  function ac(){if(!ctx){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();}
    if(ctx.state==="suspended")ctx.resume();return ctx;}
  function env(g,t0,a,peak,d){g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(peak,t0+a);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+a+d);}
  function osc(type,f0,f1,t0,dur,peak,bend){var c=ac();if(!c)return;
    var o=c.createOscillator(),g=c.createGain();o.type=type;
    o.frequency.setValueAtTime(f0,t0);
    if(f1!=null)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+(bend||dur));
    env(g,t0,0.005,peak,dur);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+dur+0.1);}
  function noise(t0,dur,peak,hp){var c=ac();if(!c)return;
    var n=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
    var src=c.createBufferSource();src.buffer=buf;
    var f=c.createBiquadFilter();f.type=hp?"highpass":"lowpass";f.frequency.value=hp||900;
    var g=c.createGain();env(g,t0,0.003,peak,dur);
    src.connect(f);f.connect(g);g.connect(c.destination);src.start(t0);}
  function tick(t,f,g,dur){var c=ac();if(!c)return;dur=dur||0.022;
    var n=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
    var src=c.createBufferSource();src.buffer=buf;
    var bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=f;bp.Q.value=(arguments.length>4?arguments[4]:11);
    var gn=c.createGain();gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+0.002);
    gn.gain.exponentialRampToValueAtTime(0.0001,t+dur+0.03);
    src.connect(bp);bp.connect(gn);gn.connect(c.destination);src.start(t);}
  var S={
    tap:   function(t){osc("triangle",660,520,t,0.06,0.12);},
    place: function(t){osc("sine",420,300,t,0.09,0.2);noise(t,0.04,0.08,1800);},
    pop:   function(t){ // Pop-O-Matic v3: snap with hollow body, warm loud tumble
      noise(t,0.022,0.45,1600);                       // snap crack
      tick(t+0.002,420,0.55,0.05,6);                  // hollow dome THUMP (the kick-up)
      tick(t+0.006,2300,0.22,0.016);                  // bright snap edge
      var n=5+Math.floor(Math.random()*3),tt=t+0.035; // tumble: louder, warmer, softer Q
      for(var i=0;i<n;i++){
        tick(tt,900+Math.random()*1500,0.42*(1-i/(n+1))*(0.7+Math.random()*0.6),0.024,8);
        tt+=0.02+Math.random()*0.05;}
      tick(tt+0.015,600+Math.random()*250,0.22,0.035,7); // settle tock
    },
    dice:  function(t){for(var i=0;i<4;i++)noise(t+i*0.05,0.03,0.14,1500+Math.random()*1500);},
    move:  function(t){osc("sine",300,360,t,0.08,0.15);},
    bump:  function(t){ // descending womp + thud
      osc("sawtooth",300,90,t,0.28,0.22);
      osc("sine",120,55,t+0.02,0.22,0.4);noise(t+0.02,0.06,0.15,500);},
    chime: function(t){osc("sine",660,660,t,0.18,0.18);osc("sine",880,880,t+0.09,0.22,0.18);},
    fanfare:function(t){var ns=[523,659,784,1047];for(var i=0;i<ns.length;i++){
      osc("triangle",ns[i],ns[i],t+i*0.13,0.32,0.22);}
      osc("sine",262,262,t,0.7,0.12);},
    womp:  function(t){osc("triangle",200,110,t,0.26,0.09);},
    six:   function(t,lvl){ // lvl 0,1,2... consecutive sixes build the celebration
      lvl=Math.min(lvl||0,4);
      var notes=[523,659,784,988,1175,1319,1568],n=3+lvl;
      for(var i=0;i<n;i++)osc("triangle",notes[i],notes[i],t+i*0.07,0.2,0.2);
      if(lvl>=1)noise(t+n*0.07,0.12,0.1,3000);          // sparkle
      if(lvl>=2)osc("sine",262*(1+lvl*0.1),262*(1+lvl*0.1),t,0.5,0.14); // swelling bass
    }
  };
  var GNS={
    play:function(name,delayMs,opt){if(muted)return;var c=ac();if(!c||!S[name])return;
      S[name](c.currentTime+((delayMs||0)/1000),opt);},
    muted:function(){return muted;},
    setMuted:function(m){muted=!!m;try{localStorage.setItem("gn_muted",muted?"1":"0");}catch(e){}},
    button:function(container){var b=document.createElement("button");
      b.className="act ghost";
      function paint(){b.textContent=muted?"\uD83D\uDD07 Sound":"\uD83D\uDD0A Sound";}
      b.addEventListener("click",function(){GNS.setMuted(!muted);paint();if(!muted)GNS.play("tap");});
      paint();if(container)container.appendChild(b);return b;}
  };
  window.GNS=GNS;
  // automatic UI feedback: any .act button click gives a soft tap, shelf-wide.
  // Mute is respected inside play(); the AudioContext unlocks on this same first tap.
  try{document.addEventListener("click",function(e){
    if(e.target&&e.target.closest&&e.target.closest("button.act"))GNS.play("tap");
  },true);}catch(e){}
})();
