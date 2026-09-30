// Synthetic malicious public metadata must render as text, never markup.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

async function render(file, selectors, payload, rackId) {
  const hosts = Object.fromEntries(selectors.map(selector => [selector, {innerHTML: ''}]));
  const document = {
    documentElement: {dataset: {}},
    body: {dataset: {rackId}},
    querySelector: selector => hosts[selector] || null,
    querySelectorAll: () => []
  };
  const context = {
    document,
    fetch: async () => ({ok: true, json: async () => payload}),
    console
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, {filename: file});
  await new Promise(resolve => setImmediate(resolve));
  return Object.values(hosts).map(h => h.innerHTML).join('\n');
}

(async () => {
  const probe = '<img src=x onerror=alert(1)>';
  const rack = {
    id: 'javascript:alert(1)', name: probe, purpose: probe, status: probe,
    continuity: {inventoried: probe}, services: [probe]
  };
  const data = {racks: [rack], components: [{
    id: 'test', name: probe, purpose: probe, status: probe,
    located_in: rack.id, owned_by_role: [probe], public_detail: probe,
    relationships: {provides: [probe], depends_on: [probe]}
  }]};
  const infrastructure = await render('assets/js/infrastructure.js',
    ['[data-infrastructure-dashboard]', '[data-component-dashboard]'], data);
  const continuity = await render('assets/js/continuity.js',
    ['[data-continuity-matrix]', '[data-continuity-defects]'], data);
  for (const html of [infrastructure, continuity]) {
    assert(!html.includes(probe), 'raw executable markup rendered');
    assert(html.includes('&lt;img'), 'synthetic text was not rendered');
    assert(!html.includes('href="javascript:'), 'untrusted navigation rendered');
  }
  console.log('synthetic rendering safety passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
