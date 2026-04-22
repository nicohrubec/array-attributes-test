require('./instrument');

const Sentry = require('@sentry/node');
const http = require('http');

const TEST_ATTRS = {
  'test.primitive': 'hello-world',
  'test.array.homogeneous': ['alpha', 'beta', 'gamma'],
  'test.array.complex': [{ id: 1 }, { id: 2 }],
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    await Sentry.startSpan(
      { name: 'test-span', op: 'test', attributes: TEST_ATTRS },
      async () => {
        Sentry.logger.info('test log message', TEST_ATTRS);
        Sentry.metrics.count('test.metric', 1, { attributes: TEST_ATTRS });
      },
    );
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(3000, () => console.log('listening on http://localhost:3000'));
