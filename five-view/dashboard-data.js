/* Pure view transformations. No new cohort, denominator, imputation or analysis. */
(function(root){
  const value=(t,key,mode='absolute')=>key==='started'?t.started:key==='attrition'?100*t.attrition:key==='gap'?(mode==='signed'?t.pair.difference_pp:t.pair.absolute_difference_pp):t.completion_year;
  function subset(rows,state){return new Set(rows.filter(t=>(state.phase==='all'||t.phase===state.phase)&&(state.sponsor==='all'||t.sponsor_class===state.sponsor)&&Object.entries(state.activeBrushes).every(([key,[lo,hi]])=>{const v=value(t,key,state.gapMode);return v!=null&&v>=lo-1e-9&&v<=hi+1e-9;})).map(t=>t.nct_id));}
  function flow(t){
    if(!t.pair)return null;
    const arms=['experimental','comparator'].map(role=>{const p=t.pair,started=p[role+'_started'],completed=p[role+'_completed'];if(!(started>0&&completed>=0&&completed<=started))throw Error('Invalid paired flow counts');return {id:t.nct_id+':'+p[role+'_group_id'],role,label:p[role+'_label'],started,completed,notCompleted:started-completed};});
    const started=arms.reduce((s,a)=>s+a.started,0);if(started!==t.started||arms.reduce((s,a)=>s+a.completed,0)!==t.completed)throw Error('Trial/arm totals disagree');
    return {id:t.nct_id,started,arms};
  }
  const api={value,subset,flow};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DashboardData=api;
})(typeof window!=='undefined'?window:globalThis);
