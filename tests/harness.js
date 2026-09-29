const fs=require('fs');
/* the page's script, run in Node with stand-ins for the DOM and canvas. Use: const src = require('./harness.js'); */
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
function ctxStub(){const g={addColorStop(){}};return new Proxy({},{get(t,k){if(k in t)return t[k];if(k==='canvas')return{width:600,height:400};
 return(...a)=>{if(k==='createRadialGradient'||k==='createLinearGradient')return g;if(k==='createPattern')return{};if(k==='measureText')return{width:20};};},set(t,k,v){t[k]=v;return true;}});}
const ALL=[];
function elStub(tag){
  const cls=new Set();
  const node={
    tagName:(tag||'div').toUpperCase(), dataset:{}, children:[], hidden:false, value:'', textContent:'',
    _html:'', style:{setProperty(k,v){ node.style[k]=v; }},
    classList:{add(c){cls.add(c)},remove(c){cls.delete(c)},toggle(c,on){ if(on===undefined) cls.has(c)?cls.delete(c):cls.add(c); else on?cls.add(c):cls.delete(c); return cls.has(c);},contains(c){return cls.has(c)}},
    _cls:cls, _listeners:{},
    addEventListener(k,f){ (node._listeners[k]=node._listeners[k]||[]).push(f); },
    dispatchEvent(e){ (node._listeners[e&&e.type]||[]).forEach(f=>f(e)); return true; },
    removeEventListener(){}, appendChild(c){ node.children.push(c); c.parentNode=node; return c; },
    remove(){}, setAttribute(k,v){ node['attr_'+k]=v; }, getAttribute(k){ return node['attr_'+k]!==undefined?node['attr_'+k]:null; },
    querySelectorAll(){ return []; }, querySelector(){ return elStub('input'); }, closest(){ return null; },
    getBoundingClientRect(){ return {left:0,top:0,right:900,bottom:620,width:900,height:620}; },
    setPointerCapture(){}, select(){}, setSelectionRange(){}, scrollIntoView(){},
    getContext(){ return ctxStub(); }, width:900, height:620, clientWidth:280, clientHeight:600
  };
  Object.defineProperty(node,'innerHTML',{get(){return node._html},set(v){node._html=v; node.children.length=0;}});
  ALL.push(node);
  return node;
}
const els={};
const ACC=['vault','presets','frags','lessons','build','ref'].map(k=>{
  const head=elStub('button'), body=elStub('div');
  head.dataset.acc=k; head.nextElementSibling=body; body.hidden=true;
  head._cls.add('acc-head');
  return {k,head,body};
});
global.document={
  getElementById(id){ return els[id]||(els[id]=elStub()); },
  createElement(t){ return elStub(t); },
  addEventListener(){}, removeEventListener(){}, dispatchEvent(){return true},
  querySelectorAll(sel){ if(sel==='.acc-head') return ACC.map(a=>a.head); return []; },
  querySelector(sel){ if(sel==='.panel.left') return elStub('aside'); return null; },
  documentElement:elStub('html'), body:elStub('body'),
  fonts:{ready:{then(){}}}, execCommand(){return true}
};
const STORE={};
global.localStorage={getItem:k=>(k in STORE?STORE[k]:null),setItem(k,v){STORE[k]=String(v)},removeItem(k){delete STORE[k]}};
global.window={addEventListener(){},devicePixelRatio:1,location:{hash:''},innerWidth:1600,ResizeObserver:function(){this.observe=()=>{}}};
global.ResizeObserver=global.window.ResizeObserver;
global.location={hash:'',reload(){}}; global.navigator={}; global.performance={now:()=>Date.now()};
global.requestAnimationFrame=()=>0;
global.Event=function(t){this.type=t};
global.btoa=s=>Buffer.from(s,'binary').toString('base64'); global.atob=s=>Buffer.from(s,'base64').toString('binary');
module.exports = src;
