/* Local D3 7.9.0; one coordinated state, no external network calls. */
'use strict';
(async function () {
  const $ = id => document.getElementById(id), d3 = window.d3;
  const pct = v => v == null ? 'Unavailable' : d3.format('.1%')(v);
  const num = v => v == null ? 'Unavailable' : d3.format(',')(v);
  const pp = v => d3.format('+.1f')(v) + ' pp';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data, lineage;
  try {[data,lineage] = await Promise.all([d3.json('data.json'),d3.json('eligibility.json')]);} catch (error) {$('headline').textContent = 'Could not load data. Serve the repository with python3 -m http.server 8000 and open /five-view/.'; return;}
  const all = data.trials, byId = new Map(all.map(t => [t.nct_id,t]));
  const state = {selectedTrial:localStorage.getItem('stats401-selected') || 'NCT04019704', activeBrushes:{}, activeSubset:new Set(), search:'', phase:'all', sponsor:'all', gapMode:'absolute', dumbbellSort:'absolute', reportStatus:'all', reportSort:'id'};
  const paired=all.filter(t=>t.pair), D=window.DashboardData;
  let axisScales={}, brushHandles={}, syncingBrushes=false, tooltipDismissed=false;
  if (!byId.has(state.selectedTrial)) state.selectedTrial = all[0].nct_id;
  const teal='#536d77', rust='#b44d31', light='#e0e8e3';
  function eligible() {return all;}
  function pairRows() {return [...data.pairs];}
  function usable() {return eligible().filter(t=>t.usable);}
  function select(id) {
    if(!byId.has(id))return;
    state.selectedTrial=id;localStorage.setItem('stats401-selected',id);
    // A searched selection must be revealable even when the matrix's local filter excluded it.
    if(!$('matrix').querySelector(`[data-trial="${id}"]`)){state.reportStatus='all';$('report-status').value='all';matrix();}
    spotlight();sankey();highlight();status();revealRows();
  }
  function status() {
    const t=byId.get(state.selectedTrial),n=state.activeSubset.size;
    $('subset-status').textContent=`${n} / 38 pairs`;
    $('filter-status').textContent=Object.keys(state.activeBrushes).length||state.phase!=='all'||state.sponsor!=='all'?'Filters active':'Full paired cohort';
    $('selection-status').textContent=t.pair?`${t.nct_id} selected${state.activeSubset.has(t.nct_id)?'':' · outside current subset'}.`:`${t.nct_id}: not in the reliable paired cohort; no map point or paired flow.`;
    $('record-id').textContent=t.nct_id;
    $('flow-status').textContent=t.pair?`Widths = registered-period participant counts. ${state.activeSubset.has(t.nct_id)?'':'Selection is outside the subset; counts stay visible.'}`:'No reliable paired flow. Inspect source details; missing is not zero.';
  }
  function highlight() {
    d3.selectAll('[data-trial]').classed('selected',function(){return this.dataset.trial===state.selectedTrial;}).classed('outside-subset',function(){const filtering=Object.keys(state.activeBrushes).length||state.phase!=='all'||state.sponsor!=='all';return !state.activeSubset.has(this.dataset.trial)&&(!this.closest('#matrix')||filtering);});
    d3.selectAll('#attrition-map .selected, #parallel .trial-lines .selected').raise();
  }
  function revealRows() {
    for(const id of ['dumbbell','matrix']){const box=$(id),row=box.querySelector(`[data-trial="${state.selectedTrial}"]`);if(row){const a=row.getBoundingClientRect(),b=box.getBoundingClientRect();if(a.top<b.top||a.bottom>b.bottom)box.scrollTop+=a.top-b.top-box.clientHeight/2;}}
  }
  function updateSubset() {
    state.activeSubset=D.subset(paired,state);
    if(state.reportStatus==='subset')matrix();
    highlight();status();syncRangeInputs();
  }
  function searchTrials() {
    state.search=$('search').value;const query=state.search.trim().toLowerCase(),box=$('search-results');box.replaceChildren();
    if(!query){box.hidden=true;$('search').setAttribute('aria-expanded','false');return;}
    const exact=all.find(t=>t.nct_id.toLowerCase()===query);
    if(exact){select(exact.nct_id);box.hidden=true;$('search').setAttribute('aria-expanded','false');return;}
    const matches=all.filter(t=>(t.nct_id+' '+t.title+' '+t.interventions).toLowerCase().includes(query)).sort((a,b)=>Number(!!b.pair)-Number(!!a.pair)||a.nct_id.localeCompare(b.nct_id)).slice(0,8);
    box.hidden=false;$('search').setAttribute('aria-expanded','true');
    if(!matches.length){const li=document.createElement('li');li.className='no-result';li.textContent='No matching trials. Try an NCT ID or intervention.';box.append(li);return;}
    matches.forEach(t=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.setAttribute('role','option');button.dataset.nct=t.nct_id;button.innerHTML=`${esc(t.nct_id)} · ${t.pair?'paired':'not paired'}<small>${esc(t.title)}</small>`;button.onclick=()=>{select(t.nct_id);$('search').value=t.nct_id;state.search=t.nct_id;box.hidden=true;$('search').setAttribute('aria-expanded','false');$('search').focus();};button.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const bs=[...box.querySelectorAll('button')],i=bs.indexOf(button);bs[(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length].focus();}};li.append(button);box.append(li);});
  }
  function tooltip(e,text) {if(tooltipDismissed)return;const box=$('tooltip');box.textContent=text;box.hidden=false;const rect=box.getBoundingClientRect();box.style.left=Math.max(8,Math.min((e.clientX||20)+14,innerWidth-rect.width-12))+'px';box.style.top=Math.max(8,Math.min((e.clientY||20)+14,innerHeight-rect.height-12))+'px';}
  function bind(sel,id=d=>d.nct_id,description=d=>`${d.nct_id} · ${d.title}\n${pct(d.attrition)} non-completion; ${num(d.completed)} / ${num(d.started)} completed. ${d.period_title}`) {
    return sel.attr('data-trial',id).attr('tabindex',0).attr('role','button').attr('aria-label',d=>description(d)+' Select trial.').classed('trial-mark',true)
      .on('click',(e,d)=>select(id(d))).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id(d));}if(e.key==='Escape')$('tooltip').hidden=true;})
      .on('pointerenter',(e,d)=>tooltip(e,description(d))).on('pointermove',(e,d)=>{if(e.movementX||e.movementY)tooltipDismissed=false;tooltip(e,description(d));}).on('pointerleave',()=>$('tooltip').hidden=true)
      .on('focus',(e,d)=>{tooltipDismissed=false;const r=e.target.getBoundingClientRect();tooltip({clientX:r.x,clientY:r.y},description(d));}).on('blur',()=>$('tooltip').hidden=true);
  }
  function svg(id,h,label,width=960) {const s=d3.select('#'+id).selectAll('svg').data([0]).join('svg').attr('viewBox',`0 0 ${width} ${h}`).attr('role','group').attr('aria-label',label);s.selectAll('*').remove();s.append('title').text(label);return s;}
  function axis(s,x,y,label) {s.append('g').attr('transform',`translate(0,${y})`).call(d3.axisBottom(x).ticks(5).tickFormat(d=>pct(d)));s.append('text').attr('x',(x.range()[0]+x.range()[1])/2).attr('y',y+42).attr('text-anchor','middle').text(label);}
  function empty(s,text) {s.append('text').attr('x',40).attr('y',60).text(text);}
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
  function dumbbell() {
    const rows=pairRows(),mode=state.dumbbellSort;
    rows.sort((a,b)=>mode==='id'?a.nct_id.localeCompare(b.nct_id):(mode==='absolute'?b.absolute_difference_pp-a.absolute_difference_pp:b.difference_pp-a.difference_pp)||a.nct_id.localeCompare(b.nct_id));
    const compact=$('dumbbell').clientWidth<800,width=compact?Math.max(420,$('dumbbell').clientWidth):960,left=compact?112:168,right=compact?width-105:755,deltaX=compact?width-82:797;
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
  function matrix() {
    let rows=[...all];const mode=state.reportStatus;if(mode==='subset')rows=rows.filter(t=>state.activeSubset.has(t.nct_id));else if(mode!=='all')rows=rows.filter(t=>mode==='usable'?t.usable:!t.usable);
    rows.sort((a,b)=>state.reportSort==='year'?(a.completion_year??9999)-(b.completion_year??9999)||a.nct_id.localeCompare(b.nct_id):a.nct_id.localeCompare(b.nct_id));
    const keys=['participant_flow','completion_counts_present','reason_counts_present','numeric_primary_results','single_period','exact_arm_mapping','usable_attrition'],labels=['Flow','Complete','Reasons','Primary','One period','Arm link','Usable rate'];
    const width=Math.max(610,$('matrix').clientWidth),s=svg('matrix',Math.max(160,rows.length*25+100),'Source availability as circles; extraction eligibility as squares or review triangles',width);const x=d3.scaleBand().domain(keys).range([100,width-5]).padding(.12);
    s.append('text').attr('x',105).attr('y',18).style('font-weight',600).text('SOURCE AVAILABILITY');s.append('text').attr('x',x('single_period')).attr('y',18).style('font-weight',600).text('OUR EXTRACTION RULES');
    keys.forEach((k,i)=>s.append('text').attr('x',x(k)+x.bandwidth()/2).attr('y',42).attr('text-anchor','middle').text(labels[i]));
    s.append('line').attr('x1',x('single_period')-9).attr('x2',x('single_period')-9).attr('y1',6).attr('y2',rows.length*25+85).attr('stroke','#c2cbc7');
    const row=bind(s.selectAll('g.row').data(rows,d=>d.nct_id).join('g').attr('class','row').attr('transform',(d,i)=>`translate(0,${70+i*25})`),d=>d.nct_id,d=>`${d.nct_id}: ${keys.map((k,i)=>labels[i]+': '+(i<4?(d.reporting[k]?'available':'not available for this check'):(d.reporting[k]?'passes':'does not pass / needs review'))).join('; ')}. ${d.qc_flags.replaceAll('_',' ').replaceAll(';','; ')||'All attrition checks passed'}`);
    row.append('rect').attr('class','row-background').attr('width',width).attr('height',23).attr('y',-11).attr('fill','transparent');row.append('text').attr('x',4).attr('y',4).text(d=>d.nct_id);
    row.each(function(t){const g=d3.select(this);keys.forEach((k,i)=>{
      const yes=t.reporting[k],cx=x(k)+x.bandwidth()/2,cell=g.append('g').attr('data-field',k).attr('data-status',i<4?(yes?'available':'not-available'):(yes?'passes':'review'));
      if(i<4)cell.append('circle').attr('class','source-status').attr('cx',cx).attr('cy',0).attr('r',4.6).attr('fill',yes?teal:'none').attr('stroke',teal).attr('stroke-width',1);
      else cell.append('path').attr('class','rule-status').attr('d',d3.symbol().type(yes?d3.symbolSquare:d3.symbolTriangle).size(yes?65:75)).attr('transform',`translate(${cx},0)`).attr('fill',yes?teal:'none').attr('stroke',yes?teal:rust).attr('stroke-width',1.4);
    });});
    $('report-note').textContent=`${rows.length} trials shown. ${rows.filter(t=>t.reporting.reason_counts_present).length} have numeric reason entries; ${rows.filter(t=>t.usable).length} pass all attrition rules.`;
  }
  function spotlight() {
    const t=byId.get(state.selectedTrial),a=t.arms;
    const short=t.pair?`${t.pair.experimental_label} / ${t.pair.comparator_label}`:t.title;
    $('trial-detail').dataset.nct=t.nct_id;
    $('trial-detail').innerHTML=`<h3><a target="_blank" rel="noopener" href="https://clinicaltrials.gov/study/${t.nct_id}?tab=results">${t.nct_id} ↗</a></h3><p class="trial-label">${esc(short)}</p><div class="design-line">${esc(t.phase)} · ${esc(t.sponsor_class)}</div><dl class="trial-metrics"><div><dt>Overall attrition</dt><dd data-metric="overall">${pct(t.attrition)}</dd></div><div><dt>Experimental − comparator</dt><dd data-metric="signed">${t.pair?pp(t.pair.difference_pp):'Not paired'}</dd></div></dl>${t.reported_zero_completions?'<p class="warning">Flagged: source reports zero completions; interpretation unresolved.</p>':''}${!t.usable?'<p class="warning">No validated overall rate: period/counts or mapping needs review.</p>':''}`;
    const meta=[['Phase',t.phase],['Sponsor',t.sponsor_class],['Masking',t.masking],['Allocation',t.allocation],['Enrollment',`${num(t.enrollment)} (${t.enrollment_type})`],['Flow period',t.period_title||`${t.period_count} periods`],['Completion',t.completion_year??'Unavailable'],['QC',t.qc_flags||'All attrition checks pass']];
    $('trial-metadata-content').innerHTML=`<p>${esc(t.title)}</p><dl>${meta.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p>Counts describe the registered period; enrollment is not the attrition denominator.</p>`;
    const r=[];for(const arm of a){const reasons=t.reasons.filter(r=>r.group_id===arm.group_id);for(const reason of reasons){let value=num(reason.count);if($('reason-mode').value==='share')value=arm.reason_reconciles&&arm.noncompleted>0?pct(reason.count/arm.noncompleted):'Not defined';r.push(`<tr><td>${esc(arm.flow_title)}</td><td>${esc(reason.reason_label)}</td><td>${value}</td><td>${arm.reason_reconciles===true?'Reconciles':arm.reason_reconciles===false?'Does not reconcile':'Unavailable'}</td></tr>`);}}
    $('reason-detail').innerHTML=`<p class="small">Original reason labels below are not merged. Shares require reasons to reconcile and a positive non-completion denominator.</p>${r.length?`<table><thead><tr><th>Arm</th><th>Original reason</th><th>${$('reason-mode').value==='share'?'Share of non-completions':'Reported participants'}</th><th>Reason sum vs non-completion</th></tr></thead><tbody>${r.join('')}</tbody></table>`:'<p>No extracted single-period reason entries. This does not mean no participants left; multi-period data remain in the raw record.</p>'}`;
    $('outcome-detail').innerHTML=t.primary_outcomes.map(o=>`<h3>${esc(o.title)}</h3><p>${esc(o.time_frame)} · ${esc(o.parameter)} · ${esc(o.unit)}</p><p class="small">Population: ${esc(o.population)||'Not stated'}. ${o.numeric_cells} numeric cells; outcome-to-flow group link: ${o.exact_flow_group_link?'exact':'not established'}. ${esc(o.description)}</p><table><thead><tr><th>Outcome group</th><th>Reported value</th><th>Reported dispersion (${esc(o.dispersion)||'unspecified'})</th><th>Class / category</th></tr></thead><tbody>${o.measurements.map(m=>`<tr><td>${esc(m.group_title)}</td><td>${esc(m.raw_value)}</td><td>${esc(m.spread)||'Not stated'}</td><td>${esc(m.class_title)} / ${esc(m.category_title)}</td></tr>`).join('')}</tbody></table><p class="small">Values are reported in ${esc(o.unit)} using ${esc(o.parameter)}. They are not harmonized effect estimates; analysis denominators are in the downloadable outcome-cell table.</p>`).join('')||'<p>No structured primary outcome identified.</p>';
  }
  function dimensions(){
    return [
      {key:'started',label:'Participants STARTED',unit:'log₂ scale · 38/38',domain:[8,1024],log:true,ticks:[8,32,128,512,1024],format:d3.format(',')},
      {key:'attrition',label:'Overall attrition',unit:'percent · 38/38',domain:[0,100],format:v=>v+'%'},
      {key:'gap',label:state.gapMode==='signed'?'Experimental − comparator':'Absolute arm gap',unit:'percentage points · 38/38',domain:state.gapMode==='signed'?[-25,25]:[0,30],format:v=>v+' pp'},
      {key:'year',label:'Completion year',unit:'37/38 · 1 unavailable',domain:d3.extent(paired.filter(t=>t.completion_year!=null),t=>t.completion_year),format:d3.format('d')}
    ];
  }
  function parallel(){
    const width=Math.max(760,$('parallel').clientWidth),height=345,top=57,bottom=280,dims=dimensions(),x=d3.scalePoint().domain(dims.map(d=>d.key)).range([80,width-90]);
    const s=svg('parallel',height,'Parallel coordinates: started count, overall attrition, arm gap and year; 38 reliable pairs',width);
    axisScales={};brushHandles={};
    dims.forEach(d=>{axisScales[d.key]=(d.log?d3.scaleLog().base(2):d3.scaleLinear()).domain(d.domain).range([bottom,top]);});
    const line=d3.line().defined(d=>d[1]!=null);
    const path=t=>line(dims.map(d=>{const v=D.value(t,d.key,state.gapMode);return [x(d.key),v==null?null:axisScales[d.key](v)];}));
    const g=s.append('g').attr('class','trial-lines');
    bind(g.selectAll('path').data(paired,t=>t.nct_id).join('path').attr('class','parallel-line').attr('d',path),t=>t.nct_id,t=>`${t.nct_id} · ${t.title}\n${num(t.started)} STARTED · ${pct(t.attrition)} overall attrition\nGap: ${state.gapMode==='signed'?pp(t.pair.difference_pp):d3.format('.2f')(t.pair.absolute_difference_pp)+' pp'}\nCompletion year: ${t.completion_year??'Unavailable'}\nSelect trial; drag over an axis to filter.`);
    dims.forEach(d=>{
      const y=axisScales[d.key],axis=s.append('g').attr('class','pc-axis').attr('data-axis',d.key).attr('transform',`translate(${x(d.key)},0)`);
      axis.append('g').call(d3.axisLeft(y).tickValues(d.ticks||y.ticks(5)).tickFormat(d.format).tickSize(4));
      axis.append('text').attr('class','axis-name').attr('y',18).attr('text-anchor','middle').text(d.label);
      axis.append('text').attr('class','axis-unit').attr('y',36).attr('text-anchor','middle').text(d.unit);
      const brush=d3.brushY().extent([[-12,top],[12,bottom]]).on('brush end',event=>{
        if(syncingBrushes)return;
        if(event.selection)state.activeBrushes[d.key]=event.selection.map(y.invert).sort((a,b)=>a-b);else delete state.activeBrushes[d.key];
        updateSubset();
      });
      const bg=axis.append('g').attr('class','axis-brush').call(brush);
      bg.selectAll('.overlay').attr('aria-label',`Drag ${d.label} range; keyboard alternative below`);
      brushHandles[d.key]={brush,group:bg};
    });
    const missing=paired.filter(t=>t.completion_year==null);
    bind(s.append('g').selectAll('path').data(missing).join('path').attr('class','missing-year').attr('d',d3.symbol().type(d3.symbolDiamond).size(55)).attr('transform',`translate(${x('year')},311)`),t=>t.nct_id,t=>`${t.nct_id}: completion year unavailable; no year coordinate or imputation.`);
    s.append('text').attr('x',x('year')-12).attr('y',315).attr('text-anchor','end').text('Year unavailable');
    syncBrushes();highlight();
  }
  function syncBrushes(){
    syncingBrushes=true;
    for(const [key,b] of Object.entries(brushHandles)){const range=state.activeBrushes[key];b.group.call(b.brush.move,range?range.map(axisScales[key]).sort((a,b)=>a-b):null);}
    syncingBrushes=false;
  }
  function rangeForm(){
    $('range-inputs').innerHTML=dimensions().map(d=>`<fieldset><legend>${esc(d.label)}</legend><label>Minimum<input type="number" step="any" id="range-${d.key}-min" aria-label="${esc(d.label)} minimum" placeholder="${d.domain[0]}"></label><label>Maximum<input type="number" step="any" id="range-${d.key}-max" aria-label="${esc(d.label)} maximum" placeholder="${d.domain[1]}"></label></fieldset>`).join('');
    syncRangeInputs();
  }
  function syncRangeInputs(){for(const d of dimensions()){const r=state.activeBrushes[d.key];for(const [i,side] of ['min','max'].entries()){const el=$(`range-${d.key}-${side}`);if(el)el.value=r?+r[i].toFixed(6):'';}}}
  function sankey(){
    const t=byId.get(state.selectedTrial),f=D.flow(t);$('sankey').replaceChildren();
    if(!f){$('sankey').innerHTML='<p class="empty-flow">Paired flow unavailable for this record.</p>';return;}
    const w=440,h=360,s=svg('sankey',h,`${t.nct_id}: STARTED participants divide into registered arms and completion status`,w),k=210/f.started,top=65,gap=58,node=9,x0=8,x1=132,x2=287,sourceY=top+gap/2;
    s.attr('data-trial',t.nct_id).attr('data-total',f.started).attr('data-count-scale',k);
    const ribbon=(xa,ya,xb,yb,count,color,label,role,status)=>{
      const thick=count*k,m=(xa+xb)/2;
      if(count>0)s.append('path').attr('class','flow-link').attr('data-role',role).attr('data-status',status).attr('data-count',count).attr('data-width',thick).attr('d',`M${xa},${ya} C${m},${ya} ${m},${yb} ${xb},${yb} L${xb},${yb+thick} C${m},${yb+thick} ${m},${ya+thick} ${xa},${ya+thick}Z`).attr('fill',color).attr('tabindex',0).attr('role','img').attr('aria-label',label).on('pointerenter',e=>tooltip(e,label)).on('pointermove',e=>{if(e.movementX||e.movementY)tooltipDismissed=false;tooltip(e,label);}).on('pointerleave',()=>$('tooltip').hidden=true).on('focus',e=>{tooltipDismissed=false;const r=e.target.getBoundingClientRect();tooltip({clientX:r.x,clientY:r.y},label);}).on('blur',()=>$('tooltip').hidden=true);
    };
    const label=(x,y,text,cls='')=>s.append('text').attr('class',cls).attr('x',x).attr('y',y).text(text);
    label(x0,18,'STARTED','flow-heading');label(x0,40,num(f.started),'flow-total');
    label(x1,18,'REGISTERED ARM','flow-heading');label(x2,18,'COMPLETION','flow-heading');
    s.append('rect').attr('x',x0).attr('y',sourceY).attr('width',node).attr('height',f.started*k).attr('fill',teal);
    let offset=0;
    f.arms.forEach((a,i)=>{
      const y=top+offset*k+i*gap,completedY=y,notY=y+a.completed*k+14;
      ribbon(x0+node,sourceY+offset*k,x1,y,a.started,'#96aaa9',`${a.role}: ${a.started} STARTED`,a.role,'started');
      s.append('rect').attr('x',x1).attr('y',y).attr('width',node).attr('height',a.started*k).attr('fill',teal);
      label(x1,y-23,a.role==='experimental'?'Experimental':'Comparator','flow-role');label(x1,y-8,`${num(a.started)} started · ${pct(a.notCompleted/a.started)} attrition`);
      ribbon(x1+node,y,x2,completedY,a.completed,teal,`${a.role}: ${a.completed} completed of ${a.started} started`,a.role,'completed');
      ribbon(x1+node,y+a.completed*k,x2,notY,a.notCompleted,'#a9b8ac',`${a.role}: ${a.notCompleted} not completed of ${a.started} started`,a.role,'not-completed');
      for(const [status,count,yy,color] of [['completed',a.completed,completedY,teal],['not-completed',a.notCompleted,notY,'#a9b8ac']]){
        s.append('rect').attr('class','flow-terminal').attr('data-role',a.role).attr('data-status',status).attr('data-count',count).attr('x',x2).attr('y',yy).attr('width',node).attr('height',count*k).attr('fill',color);
        label(x2+15,yy+Math.max(5,count*k/2),`${num(count)} ${status==='completed'?'complete':'not complete'}`,'flow-count');
      }
      offset+=a.started;
    });
    label(x0,h-3,'STARTED ≠ enrollment or a verified randomized count.','flow-footnote');
  }
  function clearFilters(){state.activeBrushes={};state.phase='all';state.sponsor='all';$('phase-filter').value='all';$('sponsor-filter').value='all';$('range-error').textContent='';syncBrushes();updateSubset();}
  function render(){attritionMap();parallel();dumbbell();matrix();spotlight();sankey();status();highlight();}
  for(const [id,key] of [['phase-filter','phase'],['sponsor-filter','sponsor_class']]){
    [...new Set(paired.map(t=>t[key]))].sort().forEach(v=>$(id).add(new Option(v.replaceAll('_',' '),v)));
  }
  $('search').addEventListener('input',searchTrials);
  $('search').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();$('search-results').querySelector('button')?.focus();}if(e.key==='Enter'){e.preventDefault();$('search-results').querySelector('button')?.click();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap')){$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');}});
  $('phase-filter').addEventListener('change',()=>{state.phase=$('phase-filter').value;updateSubset();});
  $('sponsor-filter').addEventListener('change',()=>{state.sponsor=$('sponsor-filter').value;updateSubset();});
  $('gap-mode').addEventListener('change',()=>{state.gapMode=$('gap-mode').value;delete state.activeBrushes.gap;parallel();rangeForm();updateSubset();});
  $('pair-sort').addEventListener('change',()=>{state.dumbbellSort=$('pair-sort').value;dumbbell();highlight();revealRows();});
  for(const [id,key] of [['report-status','reportStatus'],['report-sort','reportSort']])$(id).addEventListener('change',()=>{state[key]=$(id).value;matrix();highlight();revealRows();});
  $('reason-mode').addEventListener('change',spotlight);
  $('clear-filters').addEventListener('click',clearFilters);
  $('range-form').addEventListener('submit',e=>{
    e.preventDefault();const next={};
    for(const d of dimensions()){
      const lo=$(`range-${d.key}-min`).value,hi=$(`range-${d.key}-max`).value;
      if(lo===''&&hi==='')continue;
      const a=lo===''?d.domain[0]:Number(lo),b=hi===''?d.domain[1]:Number(hi);
      if(!Number.isFinite(a)||!Number.isFinite(b)||a>b||a<d.domain[0]||b>d.domain[1]){$('range-error').textContent=`${d.label}: enter minimum ≤ maximum within ${d.domain[0]}–${d.domain[1]}.`;return;}
      next[d.key]=[a,b];
    }
    $('range-error').textContent='';state.activeBrushes=next;syncBrushes();updateSubset();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){tooltipDismissed=true;$('tooltip').hidden=true;$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');}});
  $('reset').addEventListener('click',()=>{
    state.search='';state.gapMode='absolute';state.dumbbellSort='absolute';state.reportStatus='all';state.reportSort='id';
    $('search').value='';$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');$('gap-mode').value='absolute';$('pair-sort').value='absolute';$('report-status').value='all';$('report-sort').value='id';$('reason-mode').value='count';
    clearFilters();parallel();rangeForm();select('NCT04019704');dumbbell();matrix();highlight();revealRows();
  });
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{attritionMap();parallel();dumbbell();highlight();},120);});
  state.activeSubset=D.subset(paired,state);rangeForm();render();
  // Read-only state snapshot supports transparent browser validation, not a second state store.
  window.dashboardSnapshot=()=>({selectedTrial:state.selectedTrial,activeBrushes:structuredClone(state.activeBrushes),activeSubset:[...state.activeSubset],phase:state.phase,sponsor:state.sponsor,gapMode:state.gapMode,dumbbellSort:state.dumbbellSort,search:state.search,reportStatus:state.reportStatus,reportSort:state.reportSort});
  document.documentElement.dataset.ready='true';
})();
