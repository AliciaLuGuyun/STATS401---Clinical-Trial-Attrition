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
  const state = {phase:'',search:'',selected:localStorage.getItem('stats401-selected') || 'NCT04019704'};
  if (!byId.has(state.selected)) state.selected = all[0].nct_id;
  const teal='#495f69', rust='#aa482f', light='#e0e8e3';
  function options(id, values) { d3.select('#'+id).selectAll('option.value').data(values).join('option').attr('class','value').attr('value',d=>d).text(d=>d); }
  options('phase',[...new Set(data.pairs.map(p=>byId.get(p.nct_id).phase))].sort());
  options('comparator',[...new Set(data.pairs.map(t=>t.comparator_type))].sort());
  d3.select('#trial-select').selectAll('option').data(all).join('option').attr('value',t=>t.nct_id).text(t=>t.nct_id+' · '+t.title);
  function eligible() {return all;}
  function pairRows() {return data.pairs.filter(p=>{const t=byId.get(p.nct_id);return (!state.phase||t.phase===state.phase)&&(!state.search||(t.nct_id+' '+t.title).toLowerCase().includes(state.search.toLowerCase()))&&(!$('comparator').value||p.comparator_type===$('comparator').value);});}
  function usable() {return eligible().filter(t=>t.usable);}
  function select(id) {state.selected=id;localStorage.setItem('stats401-selected',id);$('trial-select').value=id;highlight();spotlight();status();}
  function status() {
    const rows=pairRows(),t=byId.get(state.selected);
    $('filter-status').textContent=rows.length===data.pairs.length?'Showing all 38 reliable pairs. Other chapters retain their full audited samples.':`${rows.length} / 38 pairs match the comparison controls. Other chapters retain their full audited samples.`;
    $('selection-status').textContent=`Selected: ${t.nct_id}${rows.some(p=>p.nct_id===t.nct_id)?'':' (not in the current paired view)'}.`;
  }
  function highlight() {d3.selectAll('[data-trial]').classed('selected',function(){return this.dataset.trial===state.selected;});}
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
  function distribution() {const rows=usable(),x=d3.scaleLinear().domain([0,1]).range([45,915]);const points=swarm(rows,x,0),extent=d3.extent(points,d=>d.y),low=extent[0]||0,high=extent[1]||0,offset=40-low,h=Math.max(245,high-low+145),base=h-60;const s=svg('distribution',h,'Distribution of trial non-completion rates');
    if(!rows.length){empty(s,'No usable trials match these filters.');$('distribution-note').textContent='No usable trial rates in this selection.';return;}
    const sorted=rows.map(t=>t.attrition).sort(d3.ascending),q1=d3.quantile(sorted,.25),q3=d3.quantile(sorted,.75),med=d3.median(sorted),S=d3.sum(rows,t=>t.started),C=d3.sum(rows,t=>t.completed);
    s.append('rect').attr('x',x(q1)).attr('y',20).attr('width',x(q3)-x(q1)).attr('height',base-20).attr('fill',light).attr('opacity',.55);
    s.append('line').attr('x1',x(med)).attr('x2',x(med)).attr('y1',30).attr('y2',base).attr('stroke',teal).attr('stroke-dasharray','4 4');
    s.append('text').attr('x',x(med)).attr('y',14).attr('text-anchor','middle').text(`Median ${d3.format('.2%')(med)}`);
    if(rows.some(t=>t.reported_zero_completions))s.append('text').attr('x',x(1)).attr('y',15).attr('text-anchor','end').text('Zero completions reported ↓');
    bind(s.selectAll('circle').data(points).join('circle').attr('cx',d=>d.x).attr('cy',d=>d.y+offset).attr('r',4.8).attr('fill',d=>d.reported_zero_completions?rust:teal).attr('opacity',.85));axis(s,x,base,'Non-completion in the registered period');
    $('distribution-note').textContent=`${rows.length} trial rates. Median ${d3.format('.2%')(med)}; middle half ${d3.format('.2%')(q1)}–${d3.format('.2%')(q3)}. Full 0–100% scale; two trials without completion years remain included.`;
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
    const questions=['Which trials meet our cohort definition?','Can we calculate a defensible overall rate?','Can we compare experimental and comparator arms?','Is there a potentially common outcome to review?'];
    const rules=['Completed, randomized, parallel depression studies meeting the original eligibility screen.','Single reported period, valid counts and exact protocol-to-flow arm links.','Exactly one explicit experimental arm and one explicit comparator in a two-arm trial.','Initial MADRS-change screen with two numeric cells and independently verified outcome-group links.'];
    d3.select('#eligibility-stages').selectAll('li').data(lineage.stages).join('li').attr('class','eligibility-step').attr('data-stage',d=>d.key).each(function(d,i){
      const el=d3.select(this);el.selectAll('*').remove();el.append('div').attr('class','stage-number').text(d.count);
      const content=el.append('div');content.append('p').attr('class','stage-question').text(questions[i]);content.append('h3').attr('class','stage-label').text(d.label);content.append('p').attr('class','stage-rule').text(rules[i]);content.append('div').attr('class','stage-track').attr('aria-hidden','true').append('div').attr('class','stage-bar').style('width',100*d.count/lineage.stages[0].count+'%');
    });
    $('lineage-note').textContent='Unique NCT IDs were compared directly in trial_metrics.csv, differential_attrition.csv and outcome_review_candidates.csv: all 82 belong to the 201; all 38 belong to the 82; all 14 belong to the 38. No membership exceptions. The final stage is a review set, not a validated effect-analysis sample.';
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
  function spotlight() {const t=byId.get(state.selected);$('trial-select').value=t.nct_id;const a=t.arms;
    $('trial-detail').innerHTML=`<h3>${esc(t.title)}</h3><p><a target="_blank" rel="noopener" href="https://clinicaltrials.gov/study/${t.nct_id}?tab=results">${t.nct_id} · registry record ↗</a></p><p>${esc(t.phase)} · ${esc(t.sponsor_class)} · ${esc(t.masking)} masking · ${esc(t.allocation)} · ${num(t.protocol_arm_count)} protocol arms</p><p class="small">${esc(t.interventions)}<br>Enrollment: ${num(t.enrollment)} (${esc(t.enrollment_type)}); participants started: ${num(t.started)}; completed: ${num(t.completed)}. Completion year: ${t.completion_year??'unavailable'}; listed locations: ${num(t.site_count)}.</p><p>${t.usable?`Reported-period non-completion: <strong>${pct(t.attrition)}</strong>. Period: ${esc(t.period_title)}.`:`Attrition not calculated: ${esc(t.qc_flags.replaceAll(';','; '))}.`}</p>${t.reported_zero_completions?'<p class="warning">Reporting anomaly: this source reports zero completions in every arm. Arithmetic is valid; real-world interpretation is unresolved.</p>':''}<p>${t.pair?`Experimental: ${pct(t.pair.experimental_attrition)}; comparator: ${pct(t.pair.comparator_attrition)}; Δ ${pp(t.pair.difference_pp)}.`:`No defensible two-arm treatment–comparator contrast: ${esc(t.pair_status.replaceAll('_',' '))}.`}</p>`;
    const s=svg('flow',Math.max(160,a.length*80+60),'Selected-trial participant completion by arm');if(!t.usable){empty(s,'Flow comparison deferred: period, counts or mapping requires review.');}else {const x=d3.scaleLinear().domain([0,1]).range([10,930]);a.forEach((arm,i)=>{const y=35+i*80;s.append('text').attr('x',10).attr('y',y-12).text(arm.flow_title+' · '+arm.arm_type);const complete=arm.completed/arm.started;s.append('rect').attr('x',10).attr('y',y).attr('width',x(complete)-10).attr('height',21).attr('fill',teal);s.append('rect').attr('x',x(complete)).attr('y',y).attr('width',x(1)-x(complete)).attr('height',21).attr('fill',rust);s.append('text').attr('x',10).attr('y',y+42).text(`${num(arm.completed)} completed / ${num(arm.started)} started · ${num(arm.noncompleted)} not completed (${pct(arm.attrition)})`);});}
    const r=[];for(const arm of a){const reasons=t.reasons.filter(r=>r.group_id===arm.group_id);for(const reason of reasons){let value=num(reason.count);if($('reason-mode').value==='share')value=arm.reason_reconciles&&arm.noncompleted>0?pct(reason.count/arm.noncompleted):'Not defined';r.push(`<tr><td>${esc(arm.flow_title)}</td><td>${esc(reason.reason_label)}</td><td>${value}</td><td>${arm.reason_reconciles===true?'Reconciles':arm.reason_reconciles===false?'Does not reconcile':'Unavailable'}</td></tr>`);}}
    $('reason-detail').innerHTML=`<p class="small">Original reason labels below are not merged. Shares require reasons to reconcile and a positive non-completion denominator.</p>${r.length?`<table><thead><tr><th>Arm</th><th>Original reason</th><th>${$('reason-mode').value==='share'?'Share of non-completions':'Reported participants'}</th><th>Reason sum vs non-completion</th></tr></thead><tbody>${r.join('')}</tbody></table>`:'<p>No extracted single-period reason entries. This does not mean no participants left; multi-period data remain in the raw record.</p>'}`;
    $('outcome-detail').innerHTML=t.primary_outcomes.map(o=>`<h3>${esc(o.title)}</h3><p>${esc(o.time_frame)} · ${esc(o.parameter)} · ${esc(o.unit)}</p><p class="small">Population: ${esc(o.population)||'Not stated'}. ${o.numeric_cells} numeric cells; outcome-to-flow group link: ${o.exact_flow_group_link?'exact':'not established'}. ${esc(o.description)}</p><table><thead><tr><th>Outcome group</th><th>Reported value</th><th>Reported dispersion (${esc(o.dispersion)||'unspecified'})</th><th>Class / category</th></tr></thead><tbody>${o.measurements.map(m=>`<tr><td>${esc(m.group_title)}</td><td>${esc(m.raw_value)}</td><td>${esc(m.spread)||'Not stated'}</td><td>${esc(m.class_title)} / ${esc(m.category_title)}</td></tr>`).join('')}</tbody></table><p class="small">Values are reported in ${esc(o.unit)} using ${esc(o.parameter)}. They are not harmonized effect estimates; analysis denominators are in the downloadable outcome-cell table.</p>`).join('')||'<p>No structured primary outcome identified.</p>';
  }
  function render(){distribution();groups();dumbbell();matrix();status();highlight();}
  for(const [id,key] of [['phase','phase'],['search','search']])$(id).addEventListener(id==='search'?'input':'change',e=>{state[key]=e.target.value;dumbbell();status();highlight();});
  for(const [id,fn] of [['group-by',groups],['pair-sort',dumbbell],['comparator',dumbbell],['report-status',matrix],['report-sort',matrix]])$(id).addEventListener('change',()=>{fn();status();highlight();});
  $('model-version').addEventListener('change',model);$('trial-select').addEventListener('change',e=>select(e.target.value));$('reason-mode').addEventListener('change',spotlight);
  document.querySelectorAll('[data-select-trial]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.selectTrial)));
  window.matchMedia('(max-width:600px)').addEventListener('change',()=>{dumbbell();highlight();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('tooltip').hidden=true;});
  $('reset').addEventListener('click',()=>{state.phase=state.search='';['phase','search','comparator'].forEach(id=>$(id).value='');$('pair-sort').value='absolute';select('NCT04019704');dumbbell();status();highlight();});
  $('headline').textContent='ClinicalTrials.gov · September 2026 research snapshot';
  render();model();evidence();spotlight();document.documentElement.dataset.ready='true';
})();
