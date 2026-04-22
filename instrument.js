const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://bdfe4617e02f355d61de4275a4d27c62@o447951.ingest.us.sentry.io/4511263587368960',
  tracesSampleRate: 1.0,
  enableLogs: true,
  sendDefaultPii: true,
  traceLifecycle: 'stream',
  integrations: [Sentry.spanStreamingIntegration()],
});

Sentry.getClient().on('beforeEnvelope', envelope => {
  for (const [header, payload] of envelope[1]) {
    if (header.type === 'span') {
      for (const span of payload.items || []) {
        const attrs = pickTestAttrs(span.attributes);
        if (hasKeys(attrs)) {
          console.log('[envelope span]', span.name, stringify(attrs));
        }
      }
    } else if (header.type === 'log') {
      for (const log of payload.items || []) {
        const attrs = pickTestAttrs(log.attributes);
        if (hasKeys(attrs)) {
          console.log('[envelope log]', log.body, stringify(attrs));
        }
      }
    } else if (header.type === 'trace_metric') {
      for (const metric of payload.items || []) {
        const attrs = pickTestAttrs(metric.attributes);
        if (hasKeys(attrs)) {
          console.log(
            '[envelope metric]',
            `${metric.type}:${metric.name}=${metric.value}`,
            stringify(attrs),
          );
        }
      }
    }
  }
});

function pickTestAttrs(attrs) {
  const out = {};
  if (!attrs) return out;
  for (const [k, v] of Object.entries(attrs)) if (k.startsWith('test.')) out[k] = v;
  return out;
}

function hasKeys(obj) {
  return Object.keys(obj).length > 0;
}

function stringify(obj) {
  return JSON.stringify(obj, null, 2);
}
