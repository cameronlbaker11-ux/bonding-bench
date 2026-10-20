/* The molecule library: at least ten thousand entries, each one parses, none repeats a
   structure, and every hand-written entry builds to the molecular formula it
   should. Typed names find their entries whatever the case or hyphens.
   Run: node tests/library.js */
const src = require('./harness.js');
const api = new Function(src+';return {libEntries, LIB_EXPECT, L3_LIB, l3SmilesGraph, benchFormula, smilesKey, libLookup, LIB_SIZE};')();
const fails = [];
const all = api.libEntries();
if(all.length < 20000) fails.push('library has only '+all.length+' entries');
/* every entry's real fingerprint, including the generated ones the library itself skips */
const keys = new Set();
all.forEach(e=>{ const k = e.sm ? api.smilesKey(e.sm) : e.key; if(keys.has(k)) fails.push('duplicate structure: '+e.n); keys.add(k);
  if(e.sm){ try{ const g = api.l3SmilesGraph(e.sm); if(!g.syms.length || g.syms.length > 800) fails.push(e.n+': '+g.syms.length+' atoms'); }catch(err){ fails.push(e.n+': '+err.message); } } });
Object.keys(api.LIB_EXPECT).forEach(n=>{ const g = api.l3SmilesGraph(api.L3_LIB[n]), c = {}; g.syms.forEach(s=>{ c[s] = (c[s]||0) + 1; }); const f = api.benchFormula(c); if(f !== api.LIB_EXPECT[n]) fails.push(n+': builds '+f+', should be '+api.LIB_EXPECT[n]); });
['pentan 2 ol', 'iron(iii) sulfate', 'n,n dimethylaniline', 'lauric acid', 'caffeine'].forEach(k=>{ if(!api.libLookup(k)) fails.push('name not found: '+k); });
fails.slice(0, 20).forEach(f=>console.log('FAIL', f));
console.log(fails.length ? fails.length+' problem(s)' : 'library ok: '+all.length+' entries, '+Object.keys(api.LIB_EXPECT).length+' formulas checked');
process.exit(fails.length ? 1 : 0);
