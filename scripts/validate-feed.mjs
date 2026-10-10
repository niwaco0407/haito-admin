import fs from 'node:fs';
const feed=JSON.parse(fs.readFileSync('data/dividend_master.json','utf8'));
const fail=(m)=>{throw new Error(m)};
if(feed.schemaVersion!==1||typeof feed.publishedAt!=='string'||!Array.isArray(feed.records)||feed.records.length>10000)fail('Invalid feed header');
const seen=new Set();
for(const r of feed.records){
 if(!/^[0-9]{4}[A-Z]?$/.test(r.ticker)||seen.has(r.ticker))fail('Invalid or duplicate ticker');
 seen.add(r.ticker);
 if(typeof r.annualDividendPerShare!=='number'||!Number.isFinite(r.annualDividendPerShare)||r.annualDividendPerShare<0||r.annualDividendPerShare>=1000000)fail('Invalid dividend');
 if(typeof r.fiscalYear!=='string'||!r.fiscalYear||!/^\d{4}-\d{2}-\d{2}$/.test(r.disclosureDate))fail('Invalid dates');
 try{if(new URL(r.sourceURL).protocol!=='https:')fail('Invalid source URL')}catch{fail('Invalid source URL')}
}
console.log('HAITO feed validated:',feed.records.length,'records');