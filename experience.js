'use strict';
(() => {
 const one=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let motion=!preference.matches;
 const motionButton=one('#motion-toggle');
 function setMotion(on){motion=on;document.body.classList.toggle('motion-off',!on);motionButton.setAttribute('aria-pressed',String(on));motionButton.setAttribute('aria-label',on?'Pause decorative motion':'Resume decorative motion');motionButton.querySelector('span').textContent=on?'on':'off';document.dispatchEvent(new Event('portfolio-motion'));}
 motionButton.addEventListener('click',()=>setMotion(!motion));preference.addEventListener('change',e=>setMotion(!e.matches));setMotion(motion);
 const menu=one('#mobile-nav'), menuButton=one('#menu-toggle');
 function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}
 menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));menuButton.setAttribute('aria-label',menu.hidden?'Open navigation':'Close navigation');});
 all('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
 const recruiter=one('#recruiter-dialog');
 const openRecruiter=()=>{closeMenu();if(!recruiter.open){recruiter.showModal();document.body.style.overflow='hidden';}};
 one('#recruiter-open').addEventListener('click',openRecruiter);one('#mobile-recruiter').addEventListener('click',openRecruiter);
 one('#hero-explore').addEventListener('click',()=>one('#universe').scrollIntoView({behavior:motion?'smooth':'instant'}));
 function clock(){one('#local-time').textContent=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' IST';}
 clock();setInterval(clock,60000);
 if(matchMedia('(pointer:fine)').matches){
  const aura=one('#cursor-aura');document.addEventListener('pointermove',e=>{if(!motion)return;aura.style.opacity='1';aura.style.left=e.clientX+'px';aura.style.top=e.clientY+'px';},{passive:true});
  all('.magnetic').forEach(button=>{button.addEventListener('pointermove',e=>{if(!motion)return;const r=button.getBoundingClientRect();button.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.15}px)`;});button.addEventListener('pointerleave',()=>button.style.transform='');});
 }
 // Browser-local API sandbox. Output uses textContent so arbitrary input is never interpreted as HTML.
 const examples={shorten:{url:'https://github.com/Mdraish786'},profile:{},authorize:{role:'employee',required_role:'manager',is_requester:true}};
 const hints={shorten:'Creates a sample short-link result. This does not create a live URL.',profile:'Returns a résumé-based profile. No credentials or server are involved.',authorize:'Try role: manager and is_requester: false. Then test a wrong role or self-approval.'};
 const endpoint=one('#api-endpoint'), body=one('#api-body'), send=one('#api-send');
 endpoint.addEventListener('change',()=>{body.value=JSON.stringify(examples[endpoint.value],null,2);body.disabled=endpoint.value==='profile';one('#api-example').textContent=hints[endpoint.value];});
 send.addEventListener('click',()=>{
  let response;try{response=PortfolioSandbox.respond(endpoint.value,endpoint.value==='profile'?{}:JSON.parse(body.value));}catch(_){response={status:400,body:{error:'invalid_json',detail:'Check quotation marks, commas, and braces.',simulation:true}};}
  one('#api-status').textContent=String(response.status)+' '+({200:'OK',201:'CREATED',400:'BAD REQUEST',403:'FORBIDDEN',404:'NOT FOUND',422:'INVALID INPUT'}[response.status]||'');
  one('#api-status').style.color=response.status>=400?'#ffa675':'#d3ff5f';one('#api-response').textContent=JSON.stringify(response.body,null,2);one('#api-note').textContent='SIMULATED RESPONSE · NO NETWORK CALL';
  if(motion)one('.terminal').animate([{opacity:.6,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:230,easing:'ease-out'});
 });
 // Ray-marched metallic sculpture. CSS fallback remains available without WebGL.
 function sculpture(){
  const canvas=one('#sculpture'), area=one('#hero-art');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;
  const vertex='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fragment=`precision highp float;
  uniform vec2 resolution;uniform float time;uniform vec2 pointer;
  mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
  float torus(vec3 p){return length(vec2(length(p.xz)-.88,p.y))-.195;}
  float smoothMin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
  float scene(vec3 p){p.xz=rot(time*.16+pointer.x*.45)*p.xz;p.yz=rot(.35+pointer.y*.35)*p.yz;
   vec3 a=p;a.yz=rot(.72)*a.yz;vec3 b=p;b.xy=rot(1.10)*b.xy;b.yz=rot(-.58)*b.yz;vec3 c=p;c.xy=rot(-1.12)*c.xy;c.yz=rot(-.58)*c.yz;
   return smoothMin(smoothMin(torus(a),torus(b),.10),torus(c),.10);}
  vec3 normal(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx)));}
  vec3 environment(vec3 r){float sky=smoothstep(-.4,.8,r.y);vec3 col=mix(vec3(.035,.05,.025),vec3(.65,.73,.53),sky);float strip=pow(max(0.,1.-abs(r.x*.8+r.y*.5-.1)),45.);float strip2=pow(max(0.,1.-abs(r.z*.7-r.y*.7-.2)),30.);col+=vec3(1.,1.,.9)*strip*.95+vec3(.72,.95,.25)*strip2*.65;return col;}
  void main(){vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
   vec3 ro=vec3(0.,.05,3.8),rd=normalize(vec3(uv,-1.4));vec3 bg=vec3(.0353,.0471,.0392);float t=0.;float d=0.;bool hit=false;
   for(int i=0;i<76;i++){d=scene(ro+rd*t);if(d<.0015){hit=true;break;}t+=d*.8;if(t>7.)break;}
   vec3 color=bg;
   if(hit){vec3 p=ro+rd*t,n=normal(p),r=reflect(rd,n);float fres=pow(1.-max(0.,dot(-rd,n)),3.);float diffuse=max(0.,dot(n,normalize(vec3(-.5,1.,2.))));float ao=clamp(scene(p+n*.15)/.15,.18,1.);vec3 base=vec3(.28,.34,.22);color=(base*.25+environment(r)*.7)*(diffuse*.35+.65)*ao; color+=vec3(.52,.78,.13)*fres*.6;float spec=pow(max(0.,dot(reflect(normalize(vec3(.7,-1.,-1.)),n),-rd)),60.);color+=spec*vec3(1.,1.,.9)*.5;color=mix(color,bg,smoothstep(3.,7.,t)*.5);color=pow(color,vec3(.9));}
   gl_FragColor=vec4(color,1.);
  }`;
  function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const uRes=gl.getUniformLocation(program,'resolution'),uTime=gl.getUniformLocation(program,'time'),uPointer=gl.getUniformLocation(program,'pointer');
  let px=0,py=0,cx=0,cy=0,visible=true,lost=false,last=0,elapsed=0;
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.35);canvas.width=Math.max(1,Math.floor(r.width*dpr));canvas.height=Math.max(1,Math.floor(r.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);draw();}
  function draw(){if(lost)return;gl.uniform2f(uRes,canvas.width,canvas.height);gl.uniform1f(uTime,elapsed);gl.uniform2f(uPointer,cx,cy);gl.drawArrays(gl.TRIANGLES,0,6);}
  area.addEventListener('pointermove',e=>{if(!motion)return;const r=area.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;});
  area.addEventListener('pointerleave',()=>{px=0;py=0;});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;canvas.classList.remove('ready');one('.sculpture-fallback').style.opacity='1';});
  new ResizeObserver(resize).observe(canvas);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(area);
  function frame(now){requestAnimationFrame(frame);if(!visible||document.hidden||!motion||lost){last=now;return;}if(now-last<33)return;elapsed+=Math.min((now-last)/1000,.05);last=now;cx+=(px-cx)*.045;cy+=(py-cy)*.045;draw();}
  resize();canvas.classList.add('ready');one('.sculpture-fallback').style.opacity='0';requestAnimationFrame(frame);
 }
 try{sculpture();}catch(_){/* Keep the static CSS sculpture on unsupported devices. */}
 // Perspective-projected orbital project map with direct manipulation and HTML buttons.
 function universe(){
  const stage=one('.universe-stage'),canvas=one('#universe-canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const buttons=all('[data-planet]');const projects=[
   {label:'01 / FULL-STACK WORKSPACE',title:'FlowOps',description:'A structured path from request to decision. React, FastAPI, PostgreSQL, Redis, and Celery working together.',url:'https://github.com/Mdraish786/FlowOps'},
   {label:'02 / MULTI-USER LINK MANAGEMENT',title:'Postmark',description:'Short links, personal dashboards, and per-link analytics. A compact product built around authentication and ownership.',url:'https://github.com/Mdraish786/Postmark'},
   {label:'03 / KEEP EXPLORING',title:'More experiments. More learning.',description:'Explore WeatherApp, ShopCraft, Task-Manager, and other public repositories on my GitHub profile.',url:'https://github.com/Mdraish786'}
  ];
  let w=1,h=1,angle=.3,drag=false,startX=0,previousX=0,selected=0,userPaused=false,visible=true,last=0;
  const particles=Array.from({length:65},(_,i)=>({x:((Math.sin(i*83.7)*437.3)%1+1)%1,y:((Math.sin(i*32.5)*657.1)%1+1)%1,r:i%5===0?1.3:.7}));
  function select(i){selected=i;buttons.forEach((b,n)=>{b.classList.toggle('selected',n===i);b.setAttribute('aria-pressed',String(n===i));});const p=projects[i];one('#planet-label').textContent=p.label;one('#planet-title').textContent=p.title;one('#planet-description').textContent=p.description;one('#planet-link').href=p.url;draw();}
  buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
  const pause=one('#universe-pause');function syncPause(){pause.setAttribute('aria-pressed',String(userPaused));pause.textContent=userPaused?'Resume orbit ▶':'Pause orbit Ⅱ';}
  pause.addEventListener('click',()=>{userPaused=!userPaused;syncPause();});one('#universe-reset').addEventListener('click',()=>{angle=.3;userPaused=false;syncPause();select(0);draw();});
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;startX=previousX=e.clientX;stage.classList.add('dragging');stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag)return;angle+=(e.clientX-previousX)*.008;previousX=e.clientX;draw();});
  function finish(){drag=false;stage.classList.remove('dragging');}stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
  function orbitPoint(a,ring=0){const x=Math.cos(a),z=Math.sin(a);const perspective=1+z*.13;return {x:w*.5+x*w*.32*perspective,y:h*.5+z*h*.27+(ring-1)*Math.sin(a+.8)*h*.10,z,scale:1+z*.09};}
  function draw(){ctx.clearRect(0,0,w,h);ctx.strokeStyle='#34502522';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(20,h/2);ctx.lineTo(w-20,h/2);ctx.moveTo(w/2,10);ctx.lineTo(w/2,h-10);ctx.stroke();
   for(const p of particles){ctx.fillStyle='rgba(169,205,123,'+(p.r>1?.35:.16)+')';ctx.beginPath();ctx.arc(p.x*w,p.y*h,p.r,0,Math.PI*2);ctx.fill();}
   for(let r=0;r<3;r++){ctx.beginPath();for(let i=0;i<=120;i++){const p=orbitPoint(i/120*Math.PI*2,r);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.strokeStyle=r===1?'#a1c56344':'#53753c33';ctx.lineWidth=r===1?1:.6;ctx.setLineDash(r===1?[]:[2,6]);ctx.stroke();}ctx.setLineDash([]);
   buttons.forEach((button,i)=>{const p=orbitPoint(angle+i*Math.PI*2/3);const half=innerWidth<=650?55:73;const x=Math.max(half+8,Math.min(w-half-8,p.x));const y=Math.max(50,Math.min(h-50,p.y));button.style.left=x+'px';button.style.top=y+'px';button.style.transform=`scale(${p.scale})`;button.style.zIndex=String(Math.round(p.z*10+20));
    ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(x,y);ctx.strokeStyle=i===selected?'#b9ec6455':'#64854122';ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
    if(i===selected){const q=.5+Math.sin(angle*3)*.2;ctx.beginPath();ctx.arc(w/2+(x-w/2)*q,h/2+(y-h/2)*q,2,0,Math.PI*2);ctx.fillStyle='#d3ff5f';ctx.fill();}
   });
  }
  function resize(){const r=stage.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  new ResizeObserver(resize).observe(stage);new IntersectionObserver(entries=>visible=entries[0].isIntersecting,{rootMargin:'100px'}).observe(stage);
  function frame(now){requestAnimationFrame(frame);if(now-last<33)return;const delta=Math.min((now-last)/1000,.05);last=now;if(document.hidden||!visible||drag||userPaused||!motion)return;angle+=delta*.10;draw();}resize();requestAnimationFrame(frame);
 }
 try{universe();}catch(_){/* Project buttons and descriptions remain available. */}
})();
