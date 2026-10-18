'use strict';
(async()=>{
const $=id=>document.getElementById(id),fmt=d3.format(','),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{
const data=await d3.json('../five-view/data.json'),all=data.trials,lookup=new Map(all.map(t=>[t.nct_id,t])),edges=[],missing=new Set(),eligible=new Set();
for(const t of all.filter(t=>t.usable)){
 const arms=new Map(t.arms.filter(a=>a.count_valid&&a.reason_reconciles===true).map(a=>[a.group_id,a]));
 const sums=new Map();for(const r of t.reasons){if(!arms.has(r.group_id)||!r.count_valid||!(r.count>0))continue;sums.set(r.reason_label,(sums.get(r.reason_label)||0)+r.count);}
 if(!sums.size)continue;eligible.add(t.nct_id);if(t.completion_year==null){missing.add(t.nct_id);continue;}
 for(const [label,count]of sums)edges.push({source:t.nct_id,target:'reason:'+label,label,count,year:t.completion_year});
}
const frequency=d3.rollup(edges,v=>v.length,e=>e.label),years=d3.extent(edges,e=>e.year),cache=new Map();let selection=null,timer=null,sim=null,currentNodes=[],currentEdges=[];
$('year').min=years[0];$('year').max=years[1];$('year').value=years[1];
const svg=d3.select('#network'),world=svg.append('g'),edgeLayer=world.append('g'),nodeLayer=world.append('g');const zoom=d3.zoom().scaleExtent([.3,5]).on('zoom',e=>world.attr('transform',e.transform));svg.call(zoom);
const color=d3.scaleSequential(d3.interpolateRgbBasis(['#dce5e1','#536d77','#26383e'])).domain([0,1]);
function pause(){if(timer)clearInterval(timer);timer=null;$('play').textContent='▶ Play';}
function render(){
 const year=+$('year').value;$('year-label').textContent=year;
 const filtered=edges.filter(e=>($('time-mode').value==='annual'?e.year===year:e.year<=year)&&($('scope').value==='all'||frequency.get(e.label)>=2));
 currentEdges=filtered.map(e=>({...e}));const ids=new Set(filtered.flatMap(e=>[e.source,e.target]));
 currentNodes=[...ids].map(id=>{let n=cache.get(id);if(!n){const reason=id.startsWith('reason:');n={id,reason,label:reason?id.slice(7):id,x:reason?650:350,y:150+(cache.size*73)%420};cache.set(id,n);}n.total=d3.sum(filtered.filter(e=>e.source===id||e.target===id),e=>e.count);return n;});
 if(selection&&!ids.has(selection))selection=null;
 $('trials').textContent=currentNodes.filter(n=>!n.reason).length;$('reasons').textContent=currentNodes.filter(n=>n.reason).length;$('links').textContent=filtered.length;$('counts').textContent=fmt(d3.sum(filtered,e=>e.count));$('empty').hidden=filtered.length>0;
 $('coverage').textContent=`Source: ${all.length} eligible trials · ${eligible.size} usable trials with positive reconciled reason counts · ${missing.size} of those excluded for missing completion year. Shared-label scope is fixed across all years. Timeline = completion year; displayed counts are not individual event histories.`;
 const radius=d3.scaleSqrt().domain([0,d3.max(d3.rollup(edges,v=>d3.sum(v,e=>e.count),e=>e.target).values())||1]).range([5,23]);
 const lines=edgeLayer.selectAll('line').data(currentEdges,e=>e.source+'|'+e.target).join('line').attr('class','edge').attr('stroke-width',e=>1+Math.sqrt(e.count)*.55);lines.selectAll('title').data(e=>[e]).join('title').text(e=>`${e.source} → ${e.label}: ${e.count}`);
 const nodes=nodeLayer.selectAll('g').data(currentNodes,n=>n.id).join(enter=>{const g=enter.append('g').attr('class','node').attr('tabindex',0).attr('role','button');g.append('path').attr('class','shape');g.append('text');g.append('title');return g;}).attr('aria-label',n=>`${n.label}; ${n.total} reported counts; select for neighbors`).on('click',(e,n)=>{selection=n.id;highlight();}).on('keydown',(e,n)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selection=n.id;highlight();}}).on('dblclick',(e,n)=>{e.stopPropagation();n.fx=null;n.fy=null;sim.alpha(.3).restart();});
 nodes.select('.shape').attr('d',n=>d3.symbol().type(n.reason?d3.symbolSquare:d3.symbolCircle).size(Math.PI*radius(n.total)**2)()).attr('fill',n=>n.reason?'#b44d31':color(lookup.get(n.id).attrition)).attr('stroke','white').attr('stroke-width',1.5);
 nodes.select('text').text(n=>n.reason?(n.label.length>29?n.label.slice(0,27)+'…':n.label):n.id).attr('x',n=>radius(n.total)+5).attr('y',4);
 nodes.select('title').text(n=>`${n.label}\n${fmt(n.total)} reported non-completions on displayed links${n.reason?'':'\n'+lookup.get(n.id).title}`);
 if(sim)sim.stop();sim=d3.forceSimulation(currentNodes).force('link',d3.forceLink(currentEdges).id(n=>n.id).distance(100).strength(.15)).force('charge',d3.forceManyBody().strength(-180)).force('x',d3.forceX(n=>n.reason?650:350).strength(.08)).force('y',d3.forceY(345).strength(.045)).force('collision',d3.forceCollide(n=>radius(n.total)+14)).on('tick',()=>{lines.attr('x1',e=>e.source.x).attr('y1',e=>e.source.y).attr('x2',e=>e.target.x).attr('y2',e=>e.target.y);nodes.attr('transform',n=>{n.x=Math.max(35,Math.min(865,n.x));n.y=Math.max(30,Math.min(650,n.y));return `translate(${n.x},${n.y})`;});});
 nodes.call(d3.drag().on('start',(e,n)=>{if(!e.active)sim.alphaTarget(.2).restart();n.fx=n.x;n.fy=n.y;}).on('drag',(e,n)=>{n.fx=e.x;n.fy=e.y;}).on('end',e=>{if(!e.active)sim.alphaTarget(0);}));highlight();
}
function highlight(){
 const neighbors=new Set([selection]);for(const e of currentEdges){if(e.source.id===selection||e.target.id===selection){neighbors.add(e.source.id);neighbors.add(e.target.id);}}
 nodeLayer.selectAll('.node text').style('display',n=>selection?(neighbors.has(n.id)?null:'none'):(n.reason&&n.total>=30?null:'none'));
 nodeLayer.selectAll('.node').classed('dim',n=>!!selection&&!neighbors.has(n.id)).classed('active',n=>n.id===selection);edgeLayer.selectAll('.edge').classed('dim',e=>!!selection&&e.source.id!==selection&&e.target.id!==selection).attr('stroke-opacity',e=>selection&&(e.source.id===selection||e.target.id===selection)?.85:.4);
 if(!selection){$('detail-title').textContent='Explore a connection';$('detail').innerHTML='<p>Select a circle or square to inspect its neighbors. Drag to rearrange; double-click a pinned node to release it.</p><p>Try comparing an early year with the latest year, then select a shared reason to see which trials contribute.</p>';return;}
 const n=cache.get(selection),related=currentEdges.filter(e=>e.source.id===selection||e.target.id===selection).sort((a,b)=>b.count-a.count);$('detail-title').textContent=n.label;
 let html=`<p><strong>${fmt(n.total)}</strong> reported non-completions across <strong>${related.length}</strong> displayed relationships.</p>`;
 if(!n.reason){const t=lookup.get(n.id);html+=`<p>${esc(t.title)}</p><p>Completed: ${t.completion_year}<br>Overall attrition: ${d3.format('.1%')(t.attrition)}<br>${fmt(t.started)} started; ${fmt(t.completed)} completed.</p><p><a href="https://clinicaltrials.gov/study/${n.id}?tab=results" target="_blank" rel="noopener">Inspect registry record ↗</a></p>`;}
 html+='<p>Connected nodes · click to explore</p>';for(const e of related){const other=n.reason?e.source:e.target;html+=`<button data-neighbor="${esc(other.id)}">${esc(other.label)} · ${fmt(e.count)}</button>`;}$('detail').innerHTML=html;for(const b of $('detail').querySelectorAll('button'))b.onclick=()=>{selection=b.dataset.neighbor;highlight();};
}
$('year').oninput=()=>{pause();render();};for(const id of ['scope','time-mode'])$(id).onchange=()=>{pause();render();};$('clear').onclick=()=>{selection=null;highlight();};$('fit').onclick=()=>svg.call(zoom.transform,d3.zoomIdentity);
$('reset').onclick=()=>{pause();selection=null;$('year').value=years[0];svg.call(zoom.transform,d3.zoomIdentity);render();};$('play').onclick=()=>{if(timer){pause();return;}if(+$('year').value>=years[1]){$('year').value=years[0];render();}$('play').textContent='Ⅱ Pause';timer=setInterval(()=>{if(+$('year').value>=years[1]){pause();return;}$('year').value=+$('year').value+1;render();},1400);};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});render();
}catch(error){$('detail-title').textContent='Could not load network';$('detail').textContent=error.message;console.error(error);}
})();
