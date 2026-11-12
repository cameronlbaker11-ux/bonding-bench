/* Realism: the 3D bench against measured data. Bond lengths and angles of thirty
   small molecules (gas-phase structures), and dipole moments of twelve. Fails if the
   averages drift past what v143 achieved with a margin, or any one value is far out.
   Run: node tests/realism.js */
const src = require('./harness.js');
const api = new Function(src+';return {L3,EL,l3Step,l3Clear,l3BuildAny,l3Bonds,l3Find,l3Other,l3Dipole,setSlider,crsK};')();
api.L3.on = true; const S = a=>api.EL[a.e].sym, fails = [];
const GEOM = [
 ['water',{'O-H':95.8},{'H-O-H':104.5}],['ammonia',{'N-H':101.2},{'H-N-H':106.7}],['methane',{'C-H':108.7},{'H-C-H':109.5}],['hydrogen sulfide',{'S-H':133.6},{'H-S-H':92.1}],
 ['phosphine',{'P-H':142},{'H-P-H':93.3}],['carbon dioxide',{'C-O':116},{'O-C-O':180}],['boron trifluoride',{'B-F':130.7},{'F-B-F':120}],['sulfur hexafluoride',{'S-F':156.1},{}],
 ['sulfur dioxide',{'S-O':143.1},{'O-S-O':119.3}],['ozone',{'O-O':127.8},{'O-O-O':116.8}],['ethene',{'C-C':133.9},{'H-C-H':117.4}],['ethyne',{'C-C':120.3,'C-H':106.3},{}],
 ['ethane',{'C-C':153.5},{'H-C-H':107.5}],['benzene',{'C-C':139.7},{'C-C-C':120}],['formaldehyde',{'C-O':120.8},{'H-C-H':116.5}],['methanol',{'C-O':142.5},{'C-O-H':108.5}],
 ['hydrogen cyanide',{'C-N':115.3},{}],['hydrogen peroxide',{'O-O':147.5},{}],['hydrogen fluoride',{'F-H':91.7},{}],['hydrogen chloride',{'Cl-H':127.5},{}],['nitrogen',{'N-N':109.8},{}],
 ['oxygen',{'O-O':120.8},{}],['chlorine',{'Cl-Cl':198.8},{}],['carbon tetrachloride',{'C-Cl':176.7},{'Cl-C-Cl':109.5}],['dimethyl ether',{'C-O':141},{'C-O-C':111.7}],
 ['carbon monoxide',{'C-O':112.8},{}],['silane',{'H-Si':148},{'H-Si-H':109.5}],['hydrazine',{'N-N':144.9},{}],['nitrogen dioxide',{'N-O':119.3},{'O-N-O':134.1}],['phosphorus pentachloride',{'Cl-P':206},{}]];
const DIP = {water:1.85,'hydrogen chloride':1.08,ammonia:1.47,'hydrogen fluoride':1.82,formaldehyde:2.33,methanol:1.70,'hydrogen cyanide':2.98,'carbon monoxide':0.11,'carbon dioxide':0,methane:0,'hydrogen sulfide':0.97,'sulfur dioxide':1.63};
const key = (a, b)=>[a, b].sort().join('-'), avg = l=>l.reduce((t, x)=>t + x, 0)/l.length;
api.setSlider('temp', api.crsK(10)); let sb = 0, nb = 0, sa = 0, na = 0;
for(const [name, BL, AN] of GEOM){
  api.l3Clear(); api.L3.box = api.L3.boxTo = 540; api.l3BuildAny(name);
  if(!api.L3.atoms.length){ fails.push(name+': not built'); continue; }
  for(let i=0;i<150;i++) api.l3Step(1/60);
  const bl = {}, an = {};
  for(let k=0;k<40;k++){ api.l3Step(1/60);
    for(const b of api.L3.bonds){ const p = api.l3Find(b.a), q = api.l3Find(b.b); (bl[key(S(p), S(q))] = bl[key(S(p), S(q))] || []).push(Math.hypot(p.x-q.x, p.y-q.y, p.z-q.z)); }
    for(const c of api.L3.atoms){ const ns = api.l3Bonds(c).map(b=>api.l3Find(api.l3Other(b, c.id)));
      for(let i=0;i<ns.length;i++) for(let j=i+1;j<ns.length;j++){ const u = ns[i], v = ns[j], kk = [S(u), S(v)].sort().join('-'+S(c)+'-');
        const ux = u.x-c.x, uy = u.y-c.y, uz = u.z-c.z, vx = v.x-c.x, vy = v.y-c.y, vz = v.z-c.z;
        (an[kk] = an[kk] || []).push(Math.acos(Math.max(-1, Math.min(1, (ux*vx+uy*vy+uz*vz)/(Math.hypot(ux,uy,uz)*Math.hypot(vx,vy,vz)))))*180/Math.PI); } } }
  for(const k of Object.keys(BL)){ const l = bl[k.split('-').sort().join('-')]; if(!l){ fails.push(name+': no '+k+' bond'); continue; } const d = avg(l) - BL[k]; sb += Math.abs(d); nb++; if(Math.abs(d) > 7) fails.push(name+' '+k+' '+avg(l).toFixed(0)+' pm, measured '+BL[k]); }
  for(const k of Object.keys(AN)){ const [x, c, y] = k.split('-'), l = an[[x, y].sort().join('-'+c+'-')]; if(!l){ fails.push(name+': no '+k+' angle'); continue; } const d = avg(l) - AN[k]; sa += Math.abs(d); na++; if(Math.abs(d) > 5) fails.push(name+' angle '+k+' '+avg(l).toFixed(1)+', measured '+AN[k]); }
}
if(sb/nb > 2.5) fails.push('mean bond-length error '+(sb/nb).toFixed(1)+' pm (limit 2.5)');
if(sa/na > 1.6) fails.push('mean angle error '+(sa/na).toFixed(1)+' degrees (limit 1.6)');
let sd = 0, nd = 0;
for(const [name, mu] of Object.entries(DIP)){ api.l3Clear(); api.L3.box = api.L3.boxTo = 540; api.l3BuildAny(name); for(let i=0;i<150;i++) api.l3Step(1/60);
  const d = api.l3Dipole(api.L3.atoms); sd += Math.abs(d - mu); nd++; if(Math.abs(d - mu) > 0.45) fails.push(name+' dipole '+d.toFixed(2)+' D, measured '+mu); }
if(sd/nd > 0.2) fails.push('mean dipole error '+(sd/nd).toFixed(2)+' D (limit 0.2)');
fails.forEach(f=>console.log('FAIL', f));
console.log(fails.length ? fails.length+' problem(s)' : 'realism ok: bonds within '+(sb/nb).toFixed(1)+' pm, angles within '+(sa/na).toFixed(1)+'°, dipoles within '+(sd/nd).toFixed(2)+' D of measured, on average');
process.exit(fails.length ? 1 : 0);
