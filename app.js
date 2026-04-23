require('./instrument');

const Sentry = require('@sentry/node');
const http = require('http');

const SETS = [
  {
    label: 'set-1-primitive-only',
    attrs: {
      'test.set': '1',
      'test.primitive': 'hello-world',
    },
  },
  {
    label: 'set-2-primitive-plus-homogeneous',
    attrs: {
      'test.set': '2',
      'test.primitive': 'hello-world',
      'test.array.homogeneous': ['alpha', 'beta', 'gamma'],
    },
  },
  {
    label: 'set-3-all-three',
    attrs: {
      'test.set': '3',
      'test.primitive': 'hello-world',
      'test.array.homogeneous': ['alpha', 'beta', 'gamma'],
      'test.array.complex': [{ id: 1 }, { id: 2 }],
    },
  },
];

async function sendSet(set) {
  console.log(`\n=== sending ${set.label} ===`);
  console.log('[input attrs]', JSON.stringify(set.attrs, null, 2));

  console.log(`[start span] ${set.label}`);
  await Sentry.startSpan({ name: `test-span-${set.label}`, op: 'test', attributes: set.attrs }, async () => {
    console.log(`[emit log] ${set.label}`);
    Sentry.logger.info(`test log ${set.label}`, set.attrs);
    console.log(`[emit metric] ${set.label}`);
    Sentry.metrics.count('test.metric', 1, { attributes: set.attrs });
  });
  console.log(`[end span] ${set.label}`);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    for (const set of SETS) {
      await sendSet(set);
    }
    console.log('\n=== all three sets dispatched — waiting for envelope flush ===\n');

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(3000, () => console.log('listening on http://localhost:3000'));
