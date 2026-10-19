import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('worker/index.js', 'utf8');
const adminData = JSON.parse(fs.readFileSync('data/admin_records.json', 'utf8'));
const pos = source.indexOf('const ADMIN_HTML=');
assert(pos > 0, 'ADMIN_HTML not found');
const workerJS = source.slice(0, pos).replace('export default', 'const worker =');
const { validate, validatePaymentDates } = new Function(workerJS + ';return {validate,validatePaymentDates};')();
const html = JSON.parse(source.slice(pos + 'const ADMIN_HTML='.length).trim().replace(/;$/, ''));
const start = html.indexOf('<script>'), end = html.lastIndexOf('</script>');
assert(start >= 0 && end > start, 'Admin script not found');
new Function(html.slice(start + 8, end));
assert(html.includes('name="interimPaymentStartDate"'));
assert(html.includes('name="finalPaymentStartDate"'));
assert(html.includes('const paymentStartDates=dates.length?'), 'Empty CSV columns must not erase old dates');
assert(html.includes('<script>function validatePaymentDates'), 'Browser-side date validation missing');

const oldRecords = adminData.records;
assert(Array.isArray(oldRecords) && oldRecords.length > 0);
validate(oldRecords);
const example = {
  kind: 'interim',
  date: '2026-12-01',
  dividendPerShare: 15,
  sourceURL: 'https://example.com/official-ir.pdf',
};
const updated = oldRecords.map((r, index) => index === 0 ? {...r, paymentStartDates: [example]} : r);
validate(updated);
assert.equal(updated.length, oldRecords.length);
assert.equal(updated[1].ticker, oldRecords[1].ticker);
assert.deepEqual(updated[0].paymentStartDates[0], example);

for (const date of ['2026-02-29','2026-13-01','2026-00-01','2026-2-01','invalid']) {
  assert.throws(() => validatePaymentDates({paymentStartDates: [{...example,date}]}), date);
}
assert.throws(() => validatePaymentDates({paymentStartDates: [{...example,sourceURL:''}]}));
assert.throws(() => validatePaymentDates({paymentStartDates: [{...example,sourceURL:'http://example.com'}]}));

const feed = {
  schemaVersion: 1,
  publishedAt: '2026-10-20',
  records: updated.map(r => ({
    ticker: r.ticker, name: r.name, annualDividendPerShare: r.annualDividendPerShare,
    fiscalYear: r.fiscalYear, paymentStartDates: r.paymentStartDates || []
  }))
};
assert(feed.records.length === oldRecords.length);
assert(Buffer.byteLength(JSON.stringify(feed), 'utf8') < 3_000_000,
  'Feed exceeds HAITO iOS 3 MB size limit');
console.log('HAITO ADMIN payment dates smoke test passed:',oldRecords.length,'records');
