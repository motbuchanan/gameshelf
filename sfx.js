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
  var S={
    tap:   function(t){osc("triangle",660,520,t,0.06,0.12);},
    place: function(t){osc("sine",420,300,t,0.09,0.2);noise(t,0.04,0.08,1800);},
    pop:   function(t){ // Pop-O-Matic: dome click + low thunk + rattle
      noise(t,0.03,0.3,2500);
      osc("sine",170,70,t,0.16,0.5);
      noise(t+0.05,0.1,0.12,1200);},
    dice:  function(t){for(var i=0;i<4;i++)noise(t+i*0.05,0.03,0.14,1500+Math.random()*1500);},
    move:  function(t){osc("sine",300,360,t,0.08,0.15);},
    bump:  function(t){ // descending womp + thud
      osc("sawtooth",300,90,t,0.28,0.22);
      osc("sine",120,55,t+0.02,0.22,0.4);noise(t+0.02,0.06,0.15,500);},
    chime: function(t){osc("sine",660,660,t,0.18,0.18);osc("sine",880,880,t+0.09,0.22,0.18);},
    fanfare:function(t){var ns=[523,659,784,1047];for(var i=0;i<ns.length;i++){
      osc("triangle",ns[i],ns[i],t+i*0.13,0.32,0.22);}
      osc("sine",262,262,t,0.7,0.12);},
    womp:  function(t){osc("sawtooth",220,80,t,0.5,0.2);}
  };
  var GNS={
    play:function(name,delayMs){if(muted)return;var c=ac();if(!c||!S[name])return;
      S[name](c.currentTime+((delayMs||0)/1000));},
    muted:function(){return muted;},
    setMuted:function(m){muted=!!m;try{localStorage.setItem("gn_muted",muted?"1":"0");}catch(e){}},
    button:function(container){var b=document.createElement("button");
      b.className="act ghost";
      function paint(){b.textContent=muted?"\uD83D\uDD07 Sound":"\uD83D\uDD0A Sound";}
      b.addEventListener("click",function(){GNS.setMuted(!muted);paint();if(!muted)GNS.play("tap");});
      paint();if(container)container.appendChild(b);return b;}
  };
  window.GNS=GNS;
})();
