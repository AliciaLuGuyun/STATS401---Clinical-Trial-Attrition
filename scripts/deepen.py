"""Audit the frozen snapshot and build exploratory outputs; never mutate interim/raw data.
Run from repository root: .venv/bin/python scripts/deepen.py
"""
import collections, csv, datetime, json, math, pathlib, re, sys
import numpy as np
from process import load_snapshot, norm, count, write_csv
P=pathlib.Path('data/processed'); O=pathlib.Path('data/analysis'); O.mkdir(exist_ok=True)
def read(name): return list(csv.DictReader((P/(name+'.csv')).open()))
def numeric(x):
    try:
        v=float(x); return v if math.isfinite(v) else None
    except (ValueError,TypeError): return None
def date(x):
    try: return datetime.date.fromisoformat(x) if len(x)==10 else None
    except (ValueError,TypeError): return None
def save(name,rows):
    if rows:write_csv(O/(name+'.csv'),rows)
def stats(rows):
    a=np.array([t['attrition'] for t in rows]);s=sum(t['started'] for t in rows);c=sum(t['completed'] for t in rows)
    return dict(n=len(rows),started=s,completed=c,pooled_attrition=(s-c)/s if s else None,median=float(np.median(a)) if len(a) else None,q1=float(np.quantile(a,.25)) if len(a) else None,q3=float(np.quantile(a,.75)) if len(a) else None)
def ranks(values):
    vals=sorted(set(values));return np.array([sum(v<x for v in values)+(sum(v==x for v in values)+1)/2 for x in values])
def corr(rows,key):
    x=ranks([t[key] for t in rows]);y=ranks([t['attrition'] for t in rows])
    return float(np.corrcoef(x,y)[0,1]) if len(rows)>2 and x.std()>0 and y.std()>0 else None
studies,manifest=load_snapshot(pathlib.Path('data/raw/2026-09-13'))
raw={s['protocolSection']['identificationModule']['nctId']:s for s in studies}
old=read('trials');arms=read('arms');reasons=read('reasons');pairs=read('pairs')
armby=collections.defaultdict(list);reasonby=collections.defaultdict(list)
for a in arms:
    for k in ['started','completed','noncompleted','reason_sum']:a[k]=int(a[k]) if a[k] else None
    a['attrition']=numeric(a['attrition'])
    for k in ['count_valid','reason_reconciles']:a[k]={'True':True,'False':False,'':None}[a[k]]
    armby[a['nct_id']].append(a)
for r in reasons:
    r['count']=int(r['count']) if r['count'] else None;r['count_valid']=r['count_valid']=='True';reasonby[r['nct_id']].append(r)
primary=[];cells=[];trials=[];completeness=[];mapping=[]
for t in old:
    n=t['nct_id'];s=raw[n];p=s['protocolSection'];d=p['designModule'];di=d.get('designInfo',{});st=p['statusModule'];f=s.get('resultsSection',{}).get('participantFlowModule',{}); periods=f.get('periods',[])
    for k in ['started','completed','completion_year','period_count','flow_group_count']:t[k]=int(t[k]) if t[k] else None
    for k in ['usable','arm_mapping_complete']:t[k]=t[k]=='True'
    t['attrition']=numeric(t['attrition']);t['reported_zero_completions']=t['usable'] and t['completed']==0
    en=d.get('enrollmentInfo',{});ai=p.get('armsInterventionsModule',{});ints=ai.get('interventions',[])
    t.update(enrollment=count(en.get('count')),enrollment_type=en.get('type',''),allocation=di.get('allocation',''),protocol_arm_count=len(ai.get('armGroups',[])) or None,intervention_types=' + '.join(sorted({a.get('type','UNKNOWN') for a in ints})),interventions=' | '.join(a.get('name','') for a in ints),start_date=st.get('startDateStruct',{}).get('date',''),site_count=len(p.get('contactsLocationsModule',{}).get('locations',[])) or None)
    start,end=date(t['start_date']),date(t['completion_date']);days=(end-start).days if start and end else None
    t['calendar_span_days']=days if days is not None and days>=0 else None
    t['calendar_span_flag']='exact_dates' if t['calendar_span_days'] is not None else 'missing_partial_or_invalid_dates'
    t['phase_III_present']='PHASE3' in d.get('phases',[])
    t['enrollment_minus_started']=t['enrollment']-t['started'] if t['enrollment'] is not None and t['started'] is not None else None
    # STARTED is not renamed randomized: the registered period can be post-randomization.
    t['number_randomized']=None
    ms=[a for per in periods for m in per.get('milestones',[]) if m.get('type')=='COMPLETED' for a in m.get('achievements',[])]
    reason_entries=[a for per in periods for w in per.get('dropWithdraws',[]) for a in w.get('reasons',[])]
    outcomes=s.get('resultsSection',{}).get('outcomeMeasuresModule',{}).get('outcomeMeasures',[])
    nprimary=0;numeric_primary=False
    for oi,o in enumerate(outcomes):
        if o.get('type')!='PRIMARY':continue
        nprimary+=1;groups=o.get('groups',[]);ogs={g['id']:g.get('title','') for g in groups}
        measurements=[(ci,ki,mi,m) for ci,c in enumerate(o.get('classes',[])) for ki,k in enumerate(c.get('categories',[])) for mi,m in enumerate(k.get('measurements',[]))]
        vals=[numeric(m.get('value')) for _,_,_,m in measurements]
        numeric_primary=numeric_primary or any(v is not None for v in vals)
        text=o.get('title','');scale='MADRS' if re.search(r'madrs|montgomery',text,re.I) else 'HAM-D/HDRS' if re.search(r'ham.?d|hamilton|hdrs',text,re.I) else 'Other/unclear'
        matched=[]
        for g in groups:
            matches=[a for a in armby[n] if norm(a['flow_title'])==norm(g.get('title',''))]
            matched.append(matches[0]['group_id'] if len(matches)==1 else None)
        exact=len(groups)==len(armby[n])>0 and all(matched) and len(set(matched))==len(groups)
        row=dict(nct_id=n,outcome_index=oi,title=text,description=o.get('description',''),time_frame=o.get('timeFrame',''),population=o.get('populationDescription',''),parameter=o.get('paramType',''),dispersion=o.get('dispersionType',''),unit=o.get('unitOfMeasure',''),scale_title_screen=scale,change_title_screen=bool(re.search(r'change',text,re.I)),group_count=len(groups),numeric_cells=sum(v is not None for v in vals),cell_count=len(vals),exact_flow_group_link=exact,analysis_count=len(o.get('analyses',[])))
        primary.append(row)
        for ci,ki,mi,m in measurements:
            cells.append(dict(nct_id=n,outcome_index=oi,class_index=ci,category_index=ki,measurement_index=mi,group_id=m.get('groupId',''),group_title=ogs.get(m.get('groupId'),''),raw_value=m.get('value',''),numeric_value=numeric(m.get('value')),spread=m.get('spread',''),lower_limit=m.get('lowerLimit',''),upper_limit=m.get('upperLimit',''),class_title=o['classes'][ci].get('title',''),category_title=o['classes'][ci]['categories'][ki].get('title',''),denominators_json=json.dumps(o.get('denoms',[]),ensure_ascii=False,separators=(',',':'))))
    t['primary_outcome_count']=nprimary;t['numeric_primary_results']=numeric_primary
    comp=dict(nct_id=n,participant_flow=bool(periods and f.get('groups')),completion_counts_present=bool(periods and f.get('groups')) and all(len(v)==1 and count(v[0].get('numSubjects')) is not None and 'numUnits' not in v[0] for per in periods for g in f.get('groups',[]) for v in [[a for milestone in per.get('milestones',[]) if milestone.get('type')=='COMPLETED' for a in milestone.get('achievements',[]) if a.get('groupId')==g['id']]]),reason_table_present=any(per.get('dropWithdraws') for per in periods),reason_counts_present=bool(reason_entries) and all(count(a.get('numSubjects')) is not None and 'numUnits' not in a for a in reason_entries),outcome_module_present=bool(outcomes),numeric_primary_results=numeric_primary,single_period=len(periods)==1,exact_arm_mapping=t['arm_mapping_complete'],usable_attrition=t['usable'],qc_flags=t['qc_flags'])
    completeness.append(comp);t['reporting']=comp;t['arms']=armby[n];t['reasons']=reasonby[n];t['primary_outcomes']=[dict(o,measurements=[c for c in cells if c['nct_id']==n and c['outcome_index']==o['outcome_index']]) for o in primary if o['nct_id']==n]
    for g in f.get('groups',[]):
        matches=[a for a in ai.get('armGroups',[]) if norm(a.get('label',''))==norm(g.get('title',''))]
        mapping.append(dict(nct_id=n,flow_id=g['id'],flow_title=g.get('title',''),exact_match_count=len(matches),protocol_label=matches[0]['label'] if len(matches)==1 else '',protocol_type=matches[0].get('type','') if len(matches)==1 else '',trial_bijection=t['arm_mapping_complete'],period_count=len(periods)))
    trials.append(t)
valid=[t for t in trials if t['usable']];ids={t['nct_id'] for t in valid};paired_ids={p['nct_id'] for p in pairs}
for p in pairs:
    for k in ['experimental_started','experimental_completed','comparator_started','comparator_completed']:p[k]=int(p[k])
    for k in ['experimental_attrition','comparator_attrition','difference_pp']:p[k]=float(p[k])
    p['absolute_difference_pp']=abs(p['difference_pp'])
    p['direction']='experimental higher' if p['difference_pp']>1e-9 else 'comparator higher' if p['difference_pp'] < -1e-9 else 'equal'
    assert math.isclose(p['difference_pp'],100*((1-p['experimental_completed']/p['experimental_started'])-(1-p['comparator_completed']/p['comparator_started'])),abs_tol=1e-10)
for t in trials:
    t['pair']=next((p for p in pairs if p['nct_id']==t['nct_id']),None)
    t['pair_status']='eligible_pair' if t['pair'] else 'unusable_period_counts_or_mapping' if not t['usable'] else 'not_exactly_one_experimental_and_one_comparator_in_two_arms'
fields=['enrollment','started','completed','completion_year','calendar_span_days','intervention_types','sponsor_class','masking','allocation','protocol_arm_count','phase','site_count','number_randomized']
coverage=[];subgroups=[];associations=[]
for field in fields:
    for name,rows in [('eligible',trials),('usable',valid)]:
        present=[t for t in rows if t[field] is not None and t[field]!='']
        coverage.append(dict(variable=field,cohort=name,total=len(rows),present=len(present),missing=len(rows)-len(present),percent_present=100*len(present)/len(rows)))
for field in ['phase','sponsor_class','masking','intervention_types']:
    for value in sorted({t[field] or 'Missing' for t in trials}):
        members=[t for t in trials if (t[field] or 'Missing')==value];usable=[t for t in members if t['usable']]
        subgroups.append(dict(variable=field,level=value,eligible_n=len(members),usable_fraction=len(usable)/len(members),**stats(usable)))
for field in ['calendar_span_days','enrollment','started','completion_year','site_count']:
    for sensitivity in [False,True]:
        rows=[t for t in valid if t[field] is not None and not (sensitivity and t['reported_zero_completions'])]
        associations.append(dict(variable=field,omit_zero_completion_anomaly=sensitivity,n=len(rows),missing_or_excluded=len(valid)-len(rows),spearman_rho=corr(rows,field)))
# Small, explicit equal-trial OLS association model. No patient-level binomial independence assumption.
# No variable selection based on significance; three design/scale covariates, four coefficients.
models=[];modelrows=[];terms=['Intercept','log2_started','industry_vs_other','phase_III_present']
for sensitivity in [False,True]:
    rows=[t for t in valid if t['sponsor_class'] and t['phase'] and not (sensitivity and t['reported_zero_completions'])]
    X=np.array([[1,math.log2(t['started']),int(t['sponsor_class']=='INDUSTRY'),int(t['phase_III_present'])] for t in rows]);y=np.array([100*t['attrition'] for t in rows])
    beta=np.linalg.lstsq(X,y,rcond=None)[0];res=y-X@beta;inv=np.linalg.inv(X.T@X);h=np.sum((X@inv)*X,axis=1)
    vcov=inv@(X.T@(((res/(1-h))**2)[:,None]*X))@inv;se=np.sqrt(np.diag(vcov))
    rng=np.random.default_rng(401);boots=[]
    for _ in range(2000):
        ix=rng.integers(0,len(rows),len(rows));bx=X[ix]
        if np.linalg.matrix_rank(bx)==len(terms):boots.append(np.linalg.lstsq(bx,y[ix],rcond=None)[0])
    bounds=np.quantile(boots,[.025,.975],axis=0)
    for j,term in enumerate(terms):models.append(dict(sensitivity='omit_zero_completions' if sensitivity else 'all_usable',term=term,n=len(rows),estimate_pp=float(beta[j]),hc3_se=float(se[j]),bootstrap_low_pp=float(bounds[0,j]),bootstrap_high_pp=float(bounds[1,j]),bootstrap_replicates=len(boots),seed=401))
    for j,t in enumerate(rows):modelrows.append(dict(nct_id=t['nct_id'],sensitivity=sensitivity,observed_pp=float(y[j]),fitted_pp=float(X[j]@beta),residual_pp=float(res[j]),leverage=float(h[j])))
# Strictly a screen for future review, NOT harmonized treatment effects.
outcome_candidates=[o for o in primary if o['nct_id'] in paired_ids and o['scale_title_screen']=='MADRS' and o['change_title_screen'] and o['parameter'] in {'MEAN','LEAST_SQUARES_MEAN'} and o['exact_flow_group_link'] and o['numeric_cells']==o['cell_count']==o['group_count']==2]
# A numeric pair must contain one cell for EACH declared group, not two cells for one group.
outcome_candidates=[o for o in outcome_candidates if collections.Counter(c['group_id'] for c in cells if c['nct_id']==o['nct_id'] and c['outcome_index']==o['outcome_index'])==collections.Counter(g['id'] for g in raw[o['nct_id']]['resultsSection']['outcomeMeasuresModule']['outcomeMeasures'][o['outcome_index']]['groups'])]
summary=dict(candidate_count=len(studies),eligible_trials=len(trials),usable=stats(valid),sensitivity_without_zero=stats([t for t in valid if not t['reported_zero_completions']]),usable_arms=sum(len(t['arms']) for t in valid),single_period_arms=len(arms),reason_rows=len(reasons),paired_trials=len(pairs),pair_median_difference_pp=float(np.median([p['difference_pp'] for p in pairs])),pair_median_absolute_pp=float(np.median([p['absolute_difference_pp'] for p in pairs])),pair_min_pp=min(p['difference_pp'] for p in pairs),pair_max_pp=max(p['difference_pp'] for p in pairs),pair_directions=dict(collections.Counter(p['direction'] for p in pairs)),enrollment_differs_from_started=sum(t['enrollment_minus_started'] not in (0,None) for t in valid),zero_completion_anomalies=[t['nct_id'] for t in valid if t['reported_zero_completions']],reporting_counts={k:sum(c[k] for c in completeness) for k in completeness[0] if k not in {'nct_id','qc_flags'}},primary_outcome_rows=len(primary),unique_primary_titles=len({o['title'] for o in primary}),primary_scale_counts=dict(collections.Counter(o['scale_title_screen'] for o in primary)),paired_numeric_primary_trials=sum(t['numeric_primary_results'] for t in valid if t['nct_id'] in paired_ids),candidate_madrs_trials=len({o['nct_id'] for o in outcome_candidates}),candidate_madrs_outcomes=len(outcome_candidates),candidate_timeframes=dict(collections.Counter(o['time_frame'] for o in outcome_candidates)),reconciled_reason_arms=sum(a['reason_reconciles'] is True for t in valid for a in t['arms']),raw_snapshot='2026-09-13',source_processing_date='2026-09-11',python=sys.version.split()[0],numpy=np.__version__)
flat=[{k:v for k,v in t.items() if k not in {'reporting','arms','reasons','pair','primary_outcomes'}} for t in trials]
year_rows=[]
for year in sorted({t['completion_year'] for t in trials if t['completion_year'] is not None})+[None]:
    members=[t for t in trials if t['completion_year']==year]
    year_rows.append(dict(completion_year=year,eligible_n=len(members),usable_n=sum(t['usable'] for t in members),paired_n=sum(t['pair'] is not None for t in members),reason_entries_n=sum(t['reporting']['reason_counts_present'] for t in members),numeric_primary_n=sum(t['numeric_primary_results'] for t in members)))
save('reporting_by_year',year_rows)
save('trial_metrics',flat);save('arm_metrics',arms);save('differential_attrition',pairs);save('reporting_completeness',completeness);save('variable_coverage',coverage);save('subgroup_summary',subgroups);save('rank_associations',associations);save('arm_mapping_audit',mapping);save('primary_outcomes',primary);save('primary_outcome_cells',cells);save('outcome_review_candidates',outcome_candidates);save('model_coefficients',models);save('model_diagnostics',modelrows)
(O/'summary.json').write_text(json.dumps(summary,indent=2,allow_nan=False)+'\n')
payload=dict(summary=summary,trials=trials,pairs=pairs,coverage=coverage,subgroups=subgroups,associations=associations,model=models)
(pathlib.Path('final')/'data.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n')
print(json.dumps(summary,indent=2))
