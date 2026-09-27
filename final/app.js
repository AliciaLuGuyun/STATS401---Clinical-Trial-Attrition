/* Local D3 7.9.0; one coordinated state, no external network calls. */
'use strict';
(async function () {
  const $ = id => document.getElementById(id), d3 = window.d3;
  const pct = v => v == null ? 'Unavailable' : d3.format('.1%')(v);
  const num = v => v == null ? 'Unavailable' : d3.format(',')(v);
  const pp = v => d3.format('+.1f')(v) + ' pp';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data, lineage;
  try {[data,lineage] = await Promise.all([d3.json('data.json'),d3.json('eligibility.json')]);} catch (error) {$('headline').textContent = 'Could not load data. Serve the repository with python3 -m http.server 8000 and open /final/.'; return;}
  const all = data.trials, byId = new Map(all.map(t => [t.nct_id,t]));
  const state = {selected:localStorage.getItem('stats401-selected') || 'NCT04019704'};
  if (!byId.has(state.selected)) state.selected = all[0].nct_id;
  const teal='#536d77', rust='#b44d31', light='#e0e8e3';
  function eligible() {return all;}
  function pairRows() {return [...data.pairs];}
  function usable() {return eligible().filter(t=>t.usable);}
  function select(id) {
    if(!byId.has(id))return;
    state.selected=id;localStorage.setItem('stats401-selected',id);
    highlight();spotlight();status();
  }
  function status() {
    const t=byId.get(state.selected);
    $('selection-status').textContent=t.pair?`${t.nct_id} selected · click a point to compare another trial.`:`${t.nct_id} has no reliable paired comparison; it is not plotted on the map.`;
    $('distribution-note').textContent=`Median 13.66% · selected: ${t.usable?pct(t.attrition):'no validated overall rate'}.`;
    $('gap-note').textContent=`Median 3.52 pp · selected: ${t.pair?d3.format('.2f')(t.pair.absolute_difference_pp)+' pp':'no reliable pair'}.`;
    $('record-id').textContent=t.nct_id;
  }
  function highlight() {
    d3.selectAll('[data-trial]').classed('selected',function(){return this.dataset.trial===state.selected;});
    d3.selectAll('#attrition-map .selected, .mini-chart .selected').raise();
    d3.selectAll('.eligibility-step').each(function(d){const yes=d.nct_ids.includes(state.selected);d3.select(this).select('.stage-inclusion').text(yes?'✓':'').attr('aria-label',yes?'Selected trial included':'Selected trial not included');});
  }
  function searchTrials() {
    const query=$('search').value.trim().toLowerCase(),box=$('search-results');box.replaceChildren();
    if(!query){box.hidden=true;$('search').setAttribute('aria-expanded','false');return;}
    const exact=all.find(t=>t.nct_id.toLowerCase()===query);
    if(exact){select(exact.nct_id);box.hidden=true;$('search').setAttribute('aria-expanded','false');return;}
    const matches=all.filter(t=>(t.nct_id+' '+t.title+' '+t.interventions).toLowerCase().includes(query)).sort((a,b)=>Number(!!b.pair)-Number(!!a.pair)||a.nct_id.localeCompare(b.nct_id)).slice(0,8);
    box.hidden=false;$('search').setAttribute('aria-expanded','true');
    if(!matches.length){const li=document.createElement('li');li.className='no-result';li.textContent='No matching trials. Try an NCT ID or intervention.';box.append(li);return;}
    matches.forEach(t=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.setAttribute('role','option');button.dataset.nct=t.nct_id;button.innerHTML=`${esc(t.nct_id)} · ${t.pair?'paired':'not paired'}<small>${esc(t.title)}</small>`;button.onclick=()=>{select(t.nct_id);$('search').value=t.nct_id;box.hidden=true;$('search').setAttribute('aria-expanded','false');$('search').focus();};button.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const bs=[...box.querySelectorAll('button')],i=bs.indexOf(button);bs[(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length].focus();}};li.append(button);box.append(li);});
  }
  function tooltip(e,text) {const box=$('tooltip');box.textContent=text;box.hidden=false;const rect=box.getBoundingClientRect();box.style.left=Math.max(8,Math.min((e.clientX||20)+14,innerWidth-rect.width-12))+'px';box.style.top=Math.max(8,Math.min((e.clientY||20)+14,innerHeight-rect.height-12))+'px';}
  function bind(sel,id=d=>d.nct_id,description=d=>`${d.nct_id} · ${d.title}\n${pct(d.attrition)} non-completion; ${num(d.completed)} / ${num(d.started)} completed. ${d.period_title}`) {
    return sel.attr('data-trial',id).attr('tabindex',0).attr('role','button').attr('aria-label',d=>description(d)+' Select trial.').classed('trial-mark',true)
      .on('click',(e,d)=>select(id(d))).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id(d));}if(e.key==='Escape')$('tooltip').hidden=true;})
      .on('pointerenter',(e,d)=>tooltip(e,description(d))).on('pointermove',(e,d)=>tooltip(e,description(d))).on('pointerleave',()=>$('tooltip').hidden=true)
      .on('focus',(e,d)=>{const r=e.target.getBoundingClientRect();tooltip({clientX:r.x,clientY:r.y},description(d));}).on('blur',()=>$('tooltip').hidden=true);
  }
  function svg(id,h,label,width=960) {const s=d3.select('#'+id).selectAll('svg').data([0]).join('svg').attr('viewBox',`0 0 ${width} ${h}`).attr('role','group').attr('aria-label',label);s.selectAll('*').remove();s.append('title').text(label);return s;}
  function axis(s,x,y,label) {s.append('g').attr('transform',`translate(0,${y})`).call(d3.axisBottom(x).ticks(5).tickFormat(d=>pct(d)));s.append('text').attr('x',(x.range()[0]+x.range()[1])/2).attr('y',y+42).attr('text-anchor','middle').text(label);}
  function empty(s,text) {s.append('text').attr('x',40).attr('y',60).text(text);}
  // Deterministic collision layout: x encodes rate; y carries no quantitative meaning.
  function swarm(rows,x,center,step=11) {const placed=[];return [...rows].sort((a,b)=>a.attrition-b.attrition||a.nct_id.localeCompare(b.nct_id)).map(t=>{let y=center;for(let k=0;k<rows.length*2+1;k++){const offset=k===0?0:(k%2?1:-1)*Math.ceil(k/2)*step;y=center+offset;if(placed.every(p=>(p.x-x(t.attrition))**2+(p.y-y)**2>=step**2))break;}const p={...t,x:x(t.attrition),y};placed.push(p);return p;});}
  function attritionMap() {
    const rows=data.pairs.map(p=>byId.get(p.nct_id));
    const width=Math.max(300,Math.round($('attrition-map').clientWidth)),height=width<500?410:500;
    const margin={left:60,right:24,top:34,bottom:69},bottom=height-margin.bottom;
    const x=d3.scaleLinear().domain([0,30]).range([margin.left,width-margin.right]);
    const y=d3.scaleLinear().domain([0,1]).range([bottom,margin.top]);
    const s=svg('attrition-map',height,'Attrition Map: overall trial attrition versus absolute between-arm gap; 38 trials',width);
    s.attr('data-x-domain','0,30').attr('data-y-domain','0,1');
    s.append('g').attr('transform',`translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')).tickSize(-(width-margin.left-margin.right))).call(g=>g.selectAll('.tick line').attr('stroke-dasharray','2 5'));
    s.append('g').attr('transform',`translate(0,${bottom})`).call(d3.axisBottom(x).ticks(6).tickSize(0).tickPadding(10));
    const median=data.summary.pair_median_absolute_pp;
    s.append('line').attr('class','median-reference').attr('data-value',median).attr('x1',x(median)).attr('x2',x(median)).attr('y1',margin.top).attr('y2',bottom).attr('stroke','#829799').attr('stroke-dasharray','4 5');
    s.append('text').attr('class','annotation').attr('x',x(median)+5).attr('y',22).text('Median gap · 3.52 pp');
    s.append('text').attr('class','axis-title').attr('transform',`translate(15,${(margin.top+bottom)/2}) rotate(-90)`).attr('text-anchor','middle').text('Overall trial attrition');
    s.append('text').attr('class','axis-title').attr('x',(margin.left+width-margin.right)/2).attr('y',height-24).attr('text-anchor','middle').text('Unevenness between arms');
    s.append('text').attr('x',(margin.left+width-margin.right)/2).attr('y',height-7).attr('text-anchor','middle').style('font-size','11px').text('Absolute attrition difference (percentage points)');
    bind(s.selectAll('circle.trial-point').data(rows,d=>d.nct_id).join('circle').attr('class','trial-point').attr('cx',t=>x(t.pair.absolute_difference_pp)).attr('cy',t=>y(t.attrition)).attr('r',6),t=>t.nct_id,t=>`${t.nct_id} · ${t.title}
Overall attrition: ${pct(t.attrition)}
Absolute arm gap: ${d3.format('.2f')(t.pair.absolute_difference_pp)} pp
Experimental − comparator: ${pp(t.pair.difference_pp)}
${num(t.completed)} completed / ${num(t.started)} started.`);
    const examples=[{t:d3.greatest(rows,t=>t.attrition),label:'Highest overall rate',dy:-19},{t:d3.greatest(rows,t=>t.pair.absolute_difference_pp),label:'Largest arm gap',dy:24}];
    examples.forEach(({t,label,dy})=>{const px=x(t.pair.absolute_difference_pp),py=y(t.attrition),right=t.pair.absolute_difference_pp>20,tx=px+(right?-10:10);s.append('line').attr('x1',px).attr('y1',py).attr('x2',tx).attr('y2',py+dy).attr('stroke','#94a3a3').attr('stroke-width',.8).attr('pointer-events','none');const text=s.append('text').attr('class','annotation').attr('x',tx).attr('y',py+dy).attr('text-anchor',right?'end':'start').attr('pointer-events','none');text.append('tspan').text(label);text.append('tspan').attr('x',tx).attr('dy',14).style('font-size','10px').text(t.nct_id);});
  }
  function miniDistribution(id,rows,value,domain,format,label) {
    const width=Math.max(250,Math.round($(id).clientWidth)),x=d3.scaleLinear().domain(domain).range([17,width-17]);
    const placed=[];const dots=[...rows].sort((a,b)=>value(a)-value(b)||a.nct_id.localeCompare(b.nct_id)).map(t=>{let cy=0;for(let k=0;k<rows.length*2+1;k++){cy=k===0?0:(k%2?1:-1)*Math.ceil(k/2)*7;if(placed.every(p=>(p.cx-x(value(t)))**2+(p.cy-cy)**2>=49))break;}const p={...t,cx:x(value(t)),cy};placed.push(p);return p;});
    const low=d3.min(dots,d=>d.cy)||0,high=d3.max(dots,d=>d.cy)||0,height=Math.max(170,high-low+67),offset=24-low,bottom=height-29;
    const s=svg(id,height,label,width);
    s.append('g').attr('transform',`translate(0,${bottom})`).call(d3.axisBottom(x).ticks(4).tickFormat(format).tickSize(0).tickPadding(7));
    bind(s.selectAll('circle').data(dots,d=>d.nct_id).join('circle').attr('cx',d=>d.cx).attr('cy',d=>d.cy+offset).attr('r',3).attr('fill',teal).attr('opacity',.75),d=>d.nct_id,d=>`${d.nct_id}
${label}: ${format(value(d))}
Click to inspect this trial.`);
  }
  function distribution() {
    miniDistribution('distribution',usable(),t=>t.attrition,[0,1],d3.format('.0%'),'Overall attrition');
    miniDistribution('gap-distribution',data.pairs,p=>p.absolute_difference_pp,[0,30],v=>v+' pp','Absolute arm gap');
  }
  function groups() {const field=$('group-by').value,e=eligible(),u=usable(),keys=[...new Set(e.map(t=>t[field]))].sort(),x=d3.scaleLinear().domain([0,1]).range([310,915]);$('group-note').textContent=field==='sponsor_class'?'In the full snapshot, strict extraction retains 52/155 industry-sponsored trials versus 28/43 in OTHER. This selection difference limits interpretation of attrition contrasts.':field==='intervention_types'?'Drug-only records dominate: 66 of 82 usable trials. Every other intervention-type combination has four or fewer usable trials; compare individual records, not supposed treatment rankings.':'Distributions overlap. Inspect sample sizes and the usable/eligible fraction before interpreting a category difference.';const layouts=keys.map(k=>{const r=u.filter(t=>t[field]===k),points=swarm(r,x,0,10),ex=d3.extent(points,d=>d.y);return {key:k,rows:r,points,lo:ex[0]||0,hi:ex[1]||0};});let cursor=20;layouts.forEach(g=>{g.center=cursor-g.lo+18;cursor+=Math.max(55,g.hi-g.lo+42);});const s=svg('subgroups',cursor+70,'Attrition distributions by '+field);if(!keys.length){empty(s,'No trials in this selection.');return;}
    layouts.forEach(g=>{const n=e.filter(t=>t[field]===g.key).length;s.append('text').attr('x',8).attr('y',g.center+4).text(g.key.replaceAll('_',' ')+' · '+g.rows.length+'/'+n);s.append('line').attr('x1',310).attr('x2',915).attr('y1',g.center).attr('y2',g.center).attr('stroke','#e4e7e3');bind(s.selectAll('circle.g-'+g.center).data(g.points).enter().append('circle').attr('cx',d=>d.x).attr('cy',d=>d.y+g.center).attr('r',4).attr('fill',teal).attr('opacity',.8));if(g.rows.length>=5){const m=x(d3.median(g.rows,t=>t.attrition));s.append('line').attr('x1',m).attr('x2',m).attr('y1',g.center-15).attr('y2',g.center+15).attr('stroke',rust).attr('stroke-width',2);}});axis(s,x,cursor,'Non-completion · orange tick = median when n ≥ 5');
  }
  function dumbbell() {
    const rows=pairRows(),mode=$('pair-sort').value;
    rows.sort((a,b)=>mode==='id'?a.nct_id.localeCompare(b.nct_id):(mode==='absolute'?b.absolute_difference_pp-a.absolute_difference_pp:b.difference_pp-a.difference_pp)||a.nct_id.localeCompare(b.nct_id));
    const compact=window.matchMedia('(max-width:600px)').matches,width=compact?360:960,left=compact?105:168,right=compact?265:755,deltaX=compact?284:797;
    const h=Math.max(165,rows.length*34+90),s=svg('dumbbell',h,'Within-trial attrition: comparator and experimental arms, sorted by gap',width);
    const x=d3.scaleLinear().domain([0,1]).range([left,right]);
    const grid=s.append('g').attr('aria-hidden','true');
    [0,.2,.4,.6,.8,1].forEach(v=>grid.append('line').attr('x1',x(v)).attr('x2',x(v)).attr('y1',49).attr('y2',h-15).attr('stroke','#e0e5e1').attr('stroke-width',.6));
    s.append('text').attr('x',left).attr('y',15).text(compact?'Non-completion':'Non-completion in each arm');
    s.append('g').attr('transform','translate(0,42)').call(d3.axisTop(x).tickValues([0,.2,.4,.6,.8,1]).tickFormat(d3.format('.0%')).tickSize(0));
    s.append('text').attr('x',deltaX).attr('y',15).text(compact?'Δ (pp)':'Δ (percentage points)');
    s.append('text').attr('x',deltaX).attr('y',39).text('0 = equal');
    $('pair-note').textContent=rows.length===38?'All 38 pairs · larger absolute gaps first by default. Read direction from the two endpoints and signed Δ.':`${rows.length} filtered pairs. The 38-trial headline remains the full-cohort result.`;
    if(!rows.length){empty(s,'No reliable pairs match this search/filter.');return;}
    const r=bind(s.selectAll('g.pair').data(rows,d=>d.nct_id).join('g').attr('class','pair').attr('transform',(d,i)=>`translate(0,${70+i*34})`),d=>d.nct_id,d=>`${d.nct_id}: ${d.experimental_label} ${pct(d.experimental_attrition)} (${d.experimental_started-d.experimental_completed}/${d.experimental_started} did not complete); ${d.comparator_label} ${pct(d.comparator_attrition)} (${d.comparator_started-d.comparator_completed}/${d.comparator_started} did not complete); gap ${pp(d.difference_pp)}.`);
    r.append('rect').attr('class','row-background').attr('x',0).attr('y',-13).attr('width',width).attr('height',29).attr('fill','transparent');
    r.append('text').attr('x',2).attr('y',4).text(d=>d.nct_id);
    r.append('line').attr('x1',d=>x(d.experimental_attrition)).attr('x2',d=>x(d.comparator_attrition)).attr('stroke','#9aa7a7').attr('stroke-width',2.2);
    r.append('path').attr('d',d3.symbol().type(d3.symbolDiamond).size(65)).attr('transform',d=>`translate(${x(d.comparator_attrition)},0)`).attr('fill',teal);
    r.append('circle').attr('cx',d=>x(d.experimental_attrition)).attr('r',5).attr('fill',rust);
    r.append('text').attr('x',deltaX).attr('y',4).style('font-size',compact?'12px':'14px').style('font-weight',550).text(d=>compact?d3.format('+.1f')(d.difference_pp):pp(d.difference_pp));
  }
  function model() {const rows=data.model.filter(m=>m.sensitivity===$('model-version').value&&m.term!=='Intercept');const s=svg('coefficients',240,'Adjusted attrition associations with bootstrap intervals');const extent=d3.extent(data.model.filter(m=>m.term!=='Intercept').flatMap(m=>[m.bootstrap_low_pp,m.bootstrap_high_pp]));const x=d3.scaleLinear().domain([Math.floor(extent[0]/5)*5,Math.ceil(extent[1]/5)*5]).range([330,900]);s.append('line').attr('x1',x(0)).attr('x2',x(0)).attr('y1',15).attr('y2',175).attr('stroke','#899');const labels={log2_started:'Per doubling of participants started',industry_vs_other:'Industry vs other sponsor classes',phase_III_present:'Any Phase III vs no Phase III'};rows.forEach((m,i)=>{const y=40+i*52;s.append('text').attr('x',5).attr('y',y+4).text(labels[m.term]);s.append('line').attr('x1',x(m.bootstrap_low_pp)).attr('x2',x(m.bootstrap_high_pp)).attr('y1',y).attr('y2',y).attr('stroke',teal).attr('stroke-width',3);s.append('circle').attr('cx',x(m.estimate_pp)).attr('cy',y).attr('r',6).attr('fill',rust).append('title').text(`${pp(m.estimate_pp)}; 95% interval ${pp(m.bootstrap_low_pp)} to ${pp(m.bootstrap_high_pp)}`);});s.append('g').attr('transform','translate(0,185)').call(d3.axisBottom(x).ticks(7));s.append('text').attr('x',630).attr('y',230).attr('text-anchor','middle').text('Adjusted difference in non-completion (percentage points)');$('model-note').textContent=`Overall trial attrition · n=${rows[0].n}. Dots show adjusted percentage-point associations; lines show 95% trial-bootstrap intervals. Every interval crosses zero. This model does not analyze paired-arm gaps.`;}
  function evidence() {
    if(!lineage.strictly_nested)throw new Error('Analytical cohort nesting was not verified.');
    const labels=['Eligible trials','Usable attrition','Reliable arm pairs','Outcome candidates'];
    d3.select('#eligibility-stages').selectAll('li').data(lineage.stages).join('li').attr('class','eligibility-step').attr('data-stage',d=>d.key).each(function(d,i){
      const el=d3.select(this);el.selectAll('*').remove();el.append('span').attr('class','stage-number').text(d.count);const content=el.append('div');content.append('span').attr('class','stage-label').text(labels[i]);content.append('div').attr('class','stage-track').attr('aria-hidden','true').append('div').attr('class','stage-bar').style('width',100*d.count/201+'%');el.append('span').attr('class','stage-inclusion');
    });
    $('lineage-note').textContent='NCT ID membership verifies 14 ⊂ 38 ⊂ 82 ⊂ 201, with no exceptions. Bar lengths use 201 trials as their shared denominator. All 38 paired trials have numeric primary results; the 14 candidates remain heterogeneous in timing, analysis population, adjustment, missing-data handling and direction.';
  }
  function matrix() {
    let rows=[...all];const mode=$('report-status').value;if(mode!=='all')rows=rows.filter(t=>mode==='usable'?t.usable:!t.usable);
    rows.sort((a,b)=>$('report-sort').value==='year'?(a.completion_year??9999)-(b.completion_year??9999)||a.nct_id.localeCompare(b.nct_id):a.nct_id.localeCompare(b.nct_id));
    const keys=['participant_flow','completion_counts_present','reason_counts_present','numeric_primary_results','single_period','exact_arm_mapping','usable_attrition'],labels=['Flow','Completion','Reasons','Primary numbers','One period','Arm link','Usable rate'];
    const s=svg('matrix',Math.max(160,rows.length*25+100),'Source availability as circles; extraction eligibility as squares or review triangles');const x=d3.scaleBand().domain(keys).range([165,940]).padding(.12);
    s.append('text').attr('x',170).attr('y',18).style('font-weight',600).text('SOURCE AVAILABILITY');s.append('text').attr('x',x('single_period')).attr('y',18).style('font-weight',600).text('OUR EXTRACTION RULES');
    keys.forEach((k,i)=>s.append('text').attr('x',x(k)+x.bandwidth()/2).attr('y',42).attr('text-anchor','middle').text(labels[i]));
    s.append('line').attr('x1',x('single_period')-9).attr('x2',x('single_period')-9).attr('y1',6).attr('y2',rows.length*25+85).attr('stroke','#c2cbc7');
    const row=bind(s.selectAll('g.row').data(rows,d=>d.nct_id).join('g').attr('class','row').attr('transform',(d,i)=>`translate(0,${70+i*25})`),d=>d.nct_id,d=>`${d.nct_id}: ${keys.map((k,i)=>labels[i]+': '+(i<4?(d.reporting[k]?'available':'not available for this check'):(d.reporting[k]?'passes':'does not pass / needs review'))).join('; ')}. ${d.qc_flags.replaceAll('_',' ').replaceAll(';','; ')||'All attrition checks passed'}`);
    row.append('rect').attr('class','row-background').attr('width',950).attr('height',23).attr('y',-11).attr('fill','transparent');row.append('text').attr('x',4).attr('y',4).text(d=>d.nct_id);
    row.each(function(t){const g=d3.select(this);keys.forEach((k,i)=>{
      const yes=t.reporting[k],cx=x(k)+x.bandwidth()/2,cell=g.append('g').attr('data-field',k).attr('data-status',i<4?(yes?'available':'not-available'):(yes?'passes':'review'));
      if(i<4)cell.append('circle').attr('class','source-status').attr('cx',cx).attr('cy',0).attr('r',4.6).attr('fill',yes?teal:'none').attr('stroke',teal).attr('stroke-width',1);
      else cell.append('path').attr('class','rule-status').attr('d',d3.symbol().type(yes?d3.symbolSquare:d3.symbolTriangle).size(yes?65:75)).attr('transform',`translate(${cx},0)`).attr('fill',yes?teal:'none').attr('stroke',yes?teal:rust).attr('stroke-width',1.4);
    });});
    $('report-note').textContent=`${rows.length} trials shown. ${rows.filter(t=>t.reporting.reason_counts_present).length} have numeric reason entries; ${rows.filter(t=>t.usable).length} pass all attrition rules.`;
  }
  function spotlight() {
    const t=byId.get(state.selected),a=t.arms;
    const short=t.pair?`${t.pair.experimental_label} / ${t.pair.comparator_label}`:t.title;
    $('trial-detail').dataset.nct=t.nct_id;
    $('trial-detail').innerHTML=`<h3><a target="_blank" rel="noopener" href="https://clinicaltrials.gov/study/${t.nct_id}?tab=results">${t.nct_id} ↗</a></h3><p class="trial-label">${esc(short)}</p><div class="design-line">${esc(t.phase)} · ${esc(t.sponsor_class)}</div><dl class="trial-metrics"><div><dt>Overall attrition</dt><dd data-metric="overall">${pct(t.attrition)}</dd></div><div><dt>Experimental − comparator</dt><dd data-metric="signed">${t.pair?pp(t.pair.difference_pp):'Not paired'}</dd></div></dl>${t.reported_zero_completions?'<p class="warning">Flagged: source reports zero completions; interpretation unresolved.</p>':''}${!t.usable?'<p class="warning">No validated overall rate: period/counts or mapping needs review.</p>':''}`;
    const arms=t.usable?(t.pair?[a.find(a=>a.group_id===t.pair.experimental_group_id),a.find(a=>a.group_id===t.pair.comparator_group_id)]:a):[];
    $('participant-bars').innerHTML=arms.map(arm=>{const role=t.pair?(arm.group_id===t.pair.experimental_group_id?'Experimental':'Comparator'):arm.arm_type.replaceAll('_',' ');return `<div class="arm-block" data-group="${esc(arm.group_id)}"><div class="arm-label"><strong>${esc(role)}</strong><span>${pct(arm.attrition)} attrition</span></div><div class="arm-name">${esc(arm.flow_title)}</div><div class="completion-track" role="img" aria-label="${esc(arm.flow_title)}: ${arm.completed} completed of ${arm.started} started"><span class="completed-segment" style="width:${100*arm.completed/arm.started}%"></span><span class="left-segment" style="width:${100*arm.attrition}%"></span></div><div class="arm-counts"><span>${num(arm.completed)} completed / ${num(arm.started)} started</span><span>${num(arm.noncompleted)} not complete</span></div></div>`;}).join('');
    const meta=[['Phase',t.phase],['Sponsor',t.sponsor_class],['Masking',t.masking],['Allocation',t.allocation],['Enrollment',`${num(t.enrollment)} (${t.enrollment_type})`],['Flow period',t.period_title||`${t.period_count} periods`],['Completion',t.completion_year??'Unavailable'],['QC',t.qc_flags||'All attrition checks pass']];
    $('trial-metadata-content').innerHTML=`<p>${esc(t.title)}</p><dl>${meta.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p>Counts describe the registered period; enrollment is not the attrition denominator.</p>`;
    const r=[];for(const arm of a){const reasons=t.reasons.filter(r=>r.group_id===arm.group_id);for(const reason of reasons){let value=num(reason.count);if($('reason-mode').value==='share')value=arm.reason_reconciles&&arm.noncompleted>0?pct(reason.count/arm.noncompleted):'Not defined';r.push(`<tr><td>${esc(arm.flow_title)}</td><td>${esc(reason.reason_label)}</td><td>${value}</td><td>${arm.reason_reconciles===true?'Reconciles':arm.reason_reconciles===false?'Does not reconcile':'Unavailable'}</td></tr>`);}}
    $('reason-detail').innerHTML=`<p class="small">Original reason labels below are not merged. Shares require reasons to reconcile and a positive non-completion denominator.</p>${r.length?`<table><thead><tr><th>Arm</th><th>Original reason</th><th>${$('reason-mode').value==='share'?'Share of non-completions':'Reported participants'}</th><th>Reason sum vs non-completion</th></tr></thead><tbody>${r.join('')}</tbody></table>`:'<p>No extracted single-period reason entries. This does not mean no participants left; multi-period data remain in the raw record.</p>'}`;
    $('outcome-detail').innerHTML=t.primary_outcomes.map(o=>`<h3>${esc(o.title)}</h3><p>${esc(o.time_frame)} · ${esc(o.parameter)} · ${esc(o.unit)}</p><p class="small">Population: ${esc(o.population)||'Not stated'}. ${o.numeric_cells} numeric cells; outcome-to-flow group link: ${o.exact_flow_group_link?'exact':'not established'}. ${esc(o.description)}</p><table><thead><tr><th>Outcome group</th><th>Reported value</th><th>Reported dispersion (${esc(o.dispersion)||'unspecified'})</th><th>Class / category</th></tr></thead><tbody>${o.measurements.map(m=>`<tr><td>${esc(m.group_title)}</td><td>${esc(m.raw_value)}</td><td>${esc(m.spread)||'Not stated'}</td><td>${esc(m.class_title)} / ${esc(m.category_title)}</td></tr>`).join('')}</tbody></table><p class="small">Values are reported in ${esc(o.unit)} using ${esc(o.parameter)}. They are not harmonized effect estimates; analysis denominators are in the downloadable outcome-cell table.</p>`).join('')||'<p>No structured primary outcome identified.</p>';
  }
  function render(){attritionMap();distribution();groups();dumbbell();matrix();model();evidence();spotlight();status();highlight();}
  $('search').addEventListener('input',searchTrials);
  $('search').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();$('search-results').querySelector('button')?.focus();}if(e.key==='Enter'){e.preventDefault();$('search-results').querySelector('button')?.click();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap')){$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');}});
  for(const [id,fn] of [['group-by',groups],['pair-sort',dumbbell],['report-status',matrix],['report-sort',matrix]])$(id).addEventListener('change',()=>{fn();highlight();});
  $('model-version').addEventListener('change',model);$('reason-mode').addEventListener('change',spotlight);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('tooltip').hidden=true;$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');}});
  $('reset').addEventListener('click',()=>{$('search').value='';$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');$('pair-sort').value='absolute';select('NCT04019704');dumbbell();highlight();});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{attritionMap();distribution();dumbbell();highlight();},120);});
  render();document.documentElement.dataset.ready='true';
})();
