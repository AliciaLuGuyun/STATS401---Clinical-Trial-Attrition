"""Deterministic conservative interim cohort and participant-flow extraction."""
import argparse, collections, csv, hashlib, json, pathlib, re

def norm(s): return ' '.join(s.casefold().split())
def count(v):
    return int(v) if isinstance(v,(int,str)) and not isinstance(v,bool) and re.fullmatch(r'\d+',str(v)) else None

def write_csv(path, rows, fields=None):
    fields=fields or list(rows[0])
    with path.open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=fields,lineterminator="\n");w.writeheader();w.writerows(rows)

def load_snapshot(folder):
    m=json.loads((folder/'manifest.json').read_text()); studies=[]
    for page in m['pages']:
        b=(folder/page['file']).read_bytes()
        assert hashlib.sha256(b).hexdigest()==page['sha256'],'Raw hash changed'
        studies+=json.loads(b)['studies']
    assert len(studies)==m['candidate_count']
    ids=[s['protocolSection']['identificationModule']['nctId'] for s in studies]
    assert len(set(ids))==len(ids),'Duplicate NCT IDs'
    return sorted(studies,key=lambda s:s['protocolSection']['identificationModule']['nctId']),m

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--raw',default='data/raw/2026-09-13');ap.add_argument('--out',default='data/processed');args=ap.parse_args()
    raw=pathlib.Path(args.raw);out=pathlib.Path(args.out);out.mkdir(parents=True,exist_ok=True)
    studies,manifest=load_snapshot(raw)
    candidates=[];trials=[];arms=[];reasons=[];pairs=[]; stages=collections.Counter()
    for study in studies:
        p=study['protocolSection']; ident=p['identificationModule']; nct=ident['nctId'];d=p.get('designModule',{});di=d.get('designInfo',{});status=p.get('statusModule',{})
        conditions=p.get('conditionsModule',{}).get('conditions',[])
        f=study.get('resultsSection',{}).get('participantFlowModule',{});periods=f.get('periods',[]);groups=f.get('groups',[])
        checks=[('completed',status.get('overallStatus')=='COMPLETED'),('interventional',d.get('studyType')=='INTERVENTIONAL'),('phase_II_or_III',bool(set(d.get('phases',[])) & {'PHASE2','PHASE3'})),('randomized',di.get('allocation')=='RANDOMIZED'),('parallel',di.get('interventionModel')=='PARALLEL'),('has_results',bool(study.get('hasResults'))),('explicit_major_depression',any(re.search(r'major depress|depressive disorder, major|^mdd$',norm(c)) for c in conditions)),('no_mixed_bipolar_schizophrenia',not any(re.search(r'bipolar|schizo',norm(c)) for c in conditions))]
        failed=[name for name,ok in checks if not ok];alive=True
        stages['candidates']+=1
        for name,ok in checks:
            alive=alive and ok
            if alive: stages[name]+=1
        candidates.append({'nct_id':nct,'title':ident['briefTitle'],'conditions':' | '.join(conditions),'eligible':not failed,'exclusion_flags':';'.join(failed),'period_count':len(periods)})
        if failed: continue
        pg=p.get('armsInterventionsModule',{}).get('armGroups',[])
        flags=[]
        if len(periods)!=1:flags.append('missing_period' if not periods else 'multiple_periods_review_needed')
        if f.get('typeUnits'):flags.append('nonparticipant_units')
        if not groups: flags.append('missing_flow_groups')
        gids=[g['id'] for g in groups]
        if len(set(gids))!=len(gids):flags.append('duplicate_flow_group_ids')
        mapping={}
        for g in groups:
            matches=[a for a in pg if norm(a['label'])==norm(g['title'])]
            if len(matches)==1:mapping[g['id']]=matches[0]
        mapped_labels=[a['label'] for a in mapping.values()]
        map_ok=len(mapping)==len(groups)==len(pg) and len(set(mapped_labels))==len(groups)
        if not map_ok:flags.append('arm_mapping_review_needed')
        t={'nct_id':nct,'title':ident['briefTitle'],'conditions':' | '.join(conditions),'phase':' / '.join(d.get('phases',[])), 'sponsor':p.get('sponsorCollaboratorsModule',{}).get('leadSponsor',{}).get('name',''), 'sponsor_class':p.get('sponsorCollaboratorsModule',{}).get('leadSponsor',{}).get('class',''),'masking':di.get('maskingInfo',{}).get('masking',''),'completion_date':status.get('completionDateStruct',{}).get('date',''),'completion_year':None,'period_count':len(periods),'period_title':periods[0].get('title','') if len(periods)==1 else '', 'flow_group_count':len(groups),'arm_mapping_complete':map_ok,'started':None,'completed':None,'attrition':None,'qc_flags':'','usable':False}
        if re.match(r'^\d{4}',t['completion_date']):t['completion_year']=int(t['completion_date'][:4])
        local=[]
        if len(periods)==1:
            period=periods[0]
            all_entries=[a for m in period.get('milestones',[]) for a in m.get('achievements',[])]+[a for w in period.get('dropWithdraws',[]) for a in w.get('reasons',[])]
            if any(a.get('groupId') not in gids for a in all_entries):flags.append('unknown_group_reference')
            for g in groups:
                gid=g['id'];af=[];nums={}
                for kind in ['STARTED','COMPLETED']:
                    vals=[a for m in period.get('milestones',[]) if m.get('type')==kind for a in m.get('achievements',[]) if a.get('groupId')==gid]
                    nums[kind]=count(vals[0].get('numSubjects')) if len(vals)==1 else None
                    if nums[kind] is None:af.append('missing_or_ambiguous_'+kind.lower())
                    if any('numUnits' in v for v in vals):af.append('nonparticipant_units')
                S,C=nums['STARTED'],nums['COMPLETED']
                if S is not None and S<=0:af.append('nonpositive_started')
                if S is not None and C is not None and C>S:af.append('completed_exceeds_started')
                valid=not af
                rs=[]
                for ri,w in enumerate(period.get('dropWithdraws',[])):
                    for ei,a in enumerate(w.get('reasons',[])):
                        if a.get('groupId')!=gid: continue
                        val=count(a.get('numSubjects'))
                        rr={'nct_id':nct,'group_id':gid,'period_index':0,'period_title':period.get('title',''),'reason_index':ri,'entry_index':ei,'reason_label':w.get('type',''),'count':val,'count_valid':val is not None and 'numUnits' not in a}
                        reasons.append(rr);rs.append(rr)
                rsum=sum(r['count'] for r in rs) if rs and all(r['count_valid'] for r in rs) else None
                a={'nct_id':nct,'group_id':gid,'period_index':0,'period_title':period.get('title',''),'flow_title':g['title'],'protocol_label':mapping.get(gid,{}).get('label',''),'arm_type':mapping.get(gid,{}).get('type',''),'started':S,'completed':C,'noncompleted':S-C if valid else None,'attrition':1-C/S if valid else None,'count_valid':valid,'reason_sum':rsum,'reason_reconciles':rsum==S-C if valid and rsum is not None else None,'qc_flags':';'.join(af)}
                local.append(a)
            if not local or not all(a['count_valid'] for a in local):flags.append('invalid_flow_counts')
        if not flags:
            t['started']=sum(a['started'] for a in local);t['completed']=sum(a['completed'] for a in local);t['attrition']=1-t['completed']/t['started'];t['usable']=True
        t['qc_flags']=';'.join(flags); trials.append(t);arms+=local
        if t['usable'] and len(local)==2:
            exp=[a for a in local if a['arm_type']=='EXPERIMENTAL']; comp=[a for a in local if a['arm_type'] in {'PLACEBO_COMPARATOR','ACTIVE_COMPARATOR','SHAM_COMPARATOR','NO_INTERVENTION'}]
            if len(exp)==len(comp)==1:
                e,c=exp[0],comp[0]
                pairs.append({'nct_id':nct,'experimental_group_id':e['group_id'],'comparator_group_id':c['group_id'],'experimental_label':e['flow_title'],'comparator_label':c['flow_title'],'comparator_type':c['arm_type'],'experimental_started':e['started'],'experimental_completed':e['completed'],'comparator_started':c['started'],'comparator_completed':c['completed'],'experimental_attrition':e['attrition'],'comparator_attrition':c['attrition'],'difference_pp':100*(e['attrition']-c['attrition'])})
    for name,rows in [('candidates',candidates),('trials',trials),('arms',arms),('reasons',reasons),('pairs',pairs)]:
        assert rows, name+' unexpectedly empty';write_csv(out/(name+'.csv'),rows)
    usable=[t for t in trials if t['usable']]
    ids={t['nct_id'] for t in usable}
    summary={'source_processing_dates':sorted({s.get('derivedSection',{}).get('miscInfoModule',{}).get('versionHolder','UNKNOWN') for s in studies}), 'raw_snapshot':args.raw,'retrieved_start_utc':manifest['retrieved_start_utc'],'candidate_count':len(studies),'sequential_filters':dict(stages),'eligible_trials':len(trials),'single_period_arm_rows':len(arms),'single_period_reason_rows':len(reasons),'usable_trials':len(usable),'usable_arms':sum(a['nct_id'] in ids for a in arms),'paired_trials':len(pairs),'qc_flags':dict(collections.Counter(flag for t in trials for flag in t['qc_flags'].split(';') if flag)),'reason_reconciliation':dict(collections.Counter(str(a['reason_reconciles']) for a in arms if a['nct_id'] in ids))}
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    (out/'source_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
