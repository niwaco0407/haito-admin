import fs from 'node:fs';
const feed=JSON.parse(fs.readFileSync('data/dividend_master.json','utf8'));
const approvals=JSON.parse(fs.readFileSync('data/approvals.json','utf8'));
const fail=m=>{throw new Error(m)};
if(feed.schemaVersion!==1||!/^\d{4}-\d{2}-\d{2}$/.test(feed.publishedAt)||!Array.isArray(feed.records)||feed.records.length>10000)fail('Invalid feed header');
if(!Array.isArray(approvals))fail('Invalid approvals');
const checked=new Map();
for(const a of approvals){
 if(!a||typeof a.ticker!=='string'||checked.has(a.ticker)||a.status!=='approved'||!a.reviewedAt?.match(/^\d{4}-\d{2}-\d{2}$/))fail('Invalid approval');
 checked.set(a.ticker,a);
}
const seen=new Set();
for(const r of feed.records){
 if(!/^[0-9][0-9ACDFGHJKLMNPRSTUWXY][0-9][0-9ACDFGHJKLMNPRSTUWXY]$/.test(r.ticker)||seen.has(r.ticker))fail('Invalid or duplicate ticker');
 seen.add(r.ticker);
 if(typeof r.annualDividendPerShare!=='number'||!Number.isFinite(r.annualDividendPerShare)||r.annualDividendPerShare<0||r.annualDividendPerShare>=1000000)fail('Invalid dividend');
 if(typeof r.fiscalYear!=='string'||!r.fiscalYear)fail('Invalid dates');

 const a=checked.get(r.ticker);
 if(!a||a.annualDividendPerShare!==r.annualDividendPerShare||a.fiscalYear!==r.fiscalYear)fail('Missing or outdated approval for '+r.ticker);
}
console.log('HAITO feed validated:',feed.records.length,'records');