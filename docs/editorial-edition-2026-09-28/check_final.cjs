/* Editorial browser regression checks. Requires Playwright + installed Chrome.
   Serve repository on localhost:8000; optional SITE_URL override. Screenshots in /private/tmp. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],failed=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failed.push([r.status(),r.url()]);});
const base=process.env.SITE_URL||'http://127.0.0.1:8000/final/',data=JSON.parse(fs.readFileSync('final/data.json')),lineage=JSON.parse(fs.readFileSync('final/eligibility.json'));
const count=s=>page.locator(s).count();
await page.goto(base);await page.waitForSelector('html[data-ready="true"]');
assert.equal(await count('#distribution circle'),82);assert.equal(await count('#dumbbell g.pair'),38);assert.equal(await count('#matrix g.row'),201);
assert.deepEqual(await page.locator('main>section').evaluateAll(es=>es.map(e=>e.id)),['landscape','pairs','groups','evidence','reporting','spotlight','conclusion']);
assert.equal(await count('#relationship'),0);assert.equal(await count('#sponsor'),0);assert.equal(await count('#headline>*'),0);
assert.equal(await page.locator('#context-evidence').getAttribute('open'),null);assert.equal(await page.locator('#methods').getAttribute('open'),null);
assert.equal(await page.locator('[data-claim="median"]').innerText(),(100*data.summary.usable.median).toFixed(2)+'%');
assert.match(await page.locator('[data-claim="pooled"]').innerText(),/3,275 of 20,949 did not complete \(15.63%\)/);
assert.equal(await page.locator('[data-claim="gap"]').innerText(),data.summary.pair_median_absolute_pp.toFixed(2)+' percentage points');
assert.match(await page.locator('.scope-note').innerText(),/overall trial rate.*not the experimental–comparator gap/s);
const stages=await page.locator('.eligibility-step').evaluateAll(es=>es.map(e=>({count:+e.querySelector('.stage-number').textContent,ratio:e.querySelector('.stage-bar').getBoundingClientRect().width/e.querySelector('.stage-track').getBoundingClientRect().width})));
assert.deepEqual(stages.map(s=>s.count),[201,82,38,14]);stages.forEach((s,i)=>assert.ok(Math.abs(s.ratio-lineage.stages[i].count/201)<.002));
assert.match(await page.locator('.evidence-stop').innerText(),/candidates for review/);assert.equal(stages.length,4);
assert.equal(await count('#matrix .source-status'),201*4);assert.equal(await count('#matrix .rule-status'),201*3);
assert.equal(await count('#matrix [data-status="not-available"]'),43);
assert.equal(await count('#matrix [data-field="usable_attrition"][data-status="review"]'),119);
// Click/keyboard selection updates the spotlight and other trial views.
await page.locator('#distribution [data-trial="NCT02176291"]').focus();await page.keyboard.press('Enter');
assert.equal(await page.locator('#trial-select').inputValue(),'NCT02176291');assert.ok(await count('#dumbbell [data-trial="NCT02176291"].selected'));assert.match(await page.locator('#trial-detail').innerText(),/25.0 pp/);
await page.keyboard.press('Escape');assert.equal(await page.locator('#tooltip').isVisible(),false);
await page.locator('#pair-filters>summary').click();await page.selectOption('#phase','PHASE3');
const expected=data.pairs.filter(p=>data.trials.find(t=>t.nct_id===p.nct_id).phase==='PHASE3').length;
assert.equal(await count('#dumbbell g.pair'),expected);assert.equal(await count('#distribution circle'),82);assert.equal(await count('#matrix g.row'),201);
await page.selectOption('#comparator','PLACEBO_COMPARATOR');assert.ok((await page.locator('#dumbbell g.pair').evaluateAll(es=>es.map(e=>e.__data__.comparator_type))).every(v=>v==='PLACEBO_COMPARATOR'));
await page.fill('#search','no matching trial xyz');assert.equal(await count('#dumbbell g.pair'),0);assert.equal(await count('#distribution circle'),82);
await page.click('#reset');assert.equal(await count('#dumbbell g.pair'),38);
for(const mode of ['signed','absolute','id']){await page.selectOption('#pair-sort',mode);const rows=await page.locator('#dumbbell g.pair').evaluateAll(es=>es.map(e=>e.__data__));assert.ok(rows.every((r,i)=>i===0||(mode==='signed'?rows[i-1].difference_pp>=r.difference_pp:mode==='absolute'?rows[i-1].absolute_difference_pp>=r.absolute_difference_pp:rows[i-1].nct_id<=r.nct_id)));}
await page.click('[data-select-trial="NCT03433339"]');assert.equal(await page.locator('#trial-select').inputValue(),'NCT03433339');
await page.selectOption('#report-status','review');assert.equal(await count('#matrix g.row'),119);await page.selectOption('#report-status','usable');assert.equal(await count('#matrix g.row'),82);await page.selectOption('#report-status','all');await page.selectOption('#report-sort','year');
const years=await page.locator('#matrix g.row').evaluateAll(es=>es.map(e=>e.__data__.completion_year??9999));assert.ok(years.every((v,i)=>i===0||years[i-1]<=v));
await page.locator('#model-evidence>summary').click();await page.selectOption('#model-version','omit_zero_completions');assert.match(await page.locator('#model-note').innerText(),/n=81/);await page.selectOption('#model-version','all_usable');
await page.locator('#context-evidence>summary').click();await page.selectOption('#group-by','sponsor_class');assert.ok(await count('#subgroups circle'));await page.selectOption('#group-by','phase');
await page.selectOption('#trial-select','NCT00149643');assert.match(await page.locator('#trial-detail').innerText(),/Reporting anomaly/);await page.reload();await page.waitForSelector('html[data-ready="true"]');assert.equal(await page.locator('#trial-select').inputValue(),'NCT00149643');
await page.selectOption('#trial-select','NCT02176291');await page.locator('#reason-details>summary').click();await page.selectOption('#reason-mode','share');assert.match(await page.locator('#reason-detail').innerText(),/20.0%/);
await page.click('#reset');await page.reload();await page.waitForSelector('html[data-ready="true"]');
await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'/private/tmp/stats401-story-opening.png'});
for(const id of ['landscape','pairs','groups','evidence','reporting','spotlight','conclusion']){await page.mouse.move(2,2);await page.locator('#'+id).screenshot({path:`/private/tmp/stats401-story-${id}.png`});}
assert.ok(await page.locator('#dumbbell').evaluate(el=>el.clientHeight>=el.querySelector('svg').getBoundingClientRect().height-2),'Hero rows should not be trapped in a vertical scrolling panel');
for(const width of [390,768]){await page.setViewportSize({width,height:844});await page.goto(base);await page.waitForSelector('html[data-ready="true"]');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page horizontal overflow');if(width===390)assert.ok(await page.locator('#dumbbell svg').evaluate(el=>el.getBoundingClientRect().width<400),'Phone hero should keep endpoints and difference together');for(const id of ['pairs','evidence']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.screenshot({path:`/private/tmp/stats401-story-mobile-${width}-${id}.png`});}}
// The preserved edition remains independently usable.
await page.goto(new URL('../research-2026-09-27/',base).href);await page.waitForSelector('html[data-ready="true"]');assert.equal(await count('#distribution circle'),82);assert.equal(await count('#dumbbell g.pair'),38);assert.equal(await count('#matrix g.row'),201);
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
const result={result:'PASS',edition:'editorial-2026-09-28',browser_version:await browser.version(),source_sha256:Object.fromEntries(['final/index.html','final/app.js','final/style.css','final/data.json','final/eligibility.json'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),narrative_order:true,displayed_claims_match_exports:true,nested_membership_verified:true,stage_widths_match_counts:true,unresolved_endpoint_not_zero:true,model_scope_explicit:true,distinct_reporting_rule_encodings:true,keyboard_and_linked_selection:true,pair_filter_scope:true,signed_absolute_id_sort:true,search_empty_reset:true,reporting_filters_sort:true,persistent_selection:true,sensitivity_and_reason_controls:true,backup_loads:true,mobile_widths:[390,768],mobile_page_overflow:false,javascript_errors:errors,failed_assets:failed};
fs.writeFileSync('/private/tmp/stats401-browser-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
